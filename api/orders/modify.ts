import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

function parseDeliverySchedule(deliveryDate?: string, deliveryTime?: string) {
  if (!deliveryDate || !deliveryTime || deliveryTime.toLowerCase().includes("snel") || deliveryTime.toLowerCase().includes("zsm")) {
    return { scheduled_order: false };
  }

  const timeMatch = deliveryTime.match(/(\d{1,2}):(\d{2})/);
  const dateMatch = deliveryDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!timeMatch || !dateMatch) {
    return { scheduled_order: false };
  }

  const [_, y, m, d] = dateMatch;
  const [__, hh, mm] = timeMatch;
  const pad = (n: number | string) => String(n).padStart(2, "0");

  const isoLocal = `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00`;
  let offsetHours = 2;
  try {
    const testUtc = new Date(`${isoLocal}Z`);
    const amsterdamStr = testUtc.toLocaleString("en-US", { timeZone: "Europe/Amsterdam", timeZoneName: "shortOffset" });
    const offsetMatch = amsterdamStr.match(/GMT([+-]\d+)/);
    if (offsetMatch) {
      offsetHours = parseInt(offsetMatch[1], 10);
    }
  } catch {
    offsetHours = 2;
  }

  const offsetSign = offsetHours >= 0 ? "+" : "-";
  const formattedOffset = `${offsetSign}${pad(Math.abs(offsetHours))}:00`;

  const finishedAt = new Date(`${isoLocal}${formattedOffset}`);
  if (isNaN(finishedAt.getTime())) {
    return { scheduled_order: false };
  }

  const readyAt = new Date(finishedAt.getTime() - 30 * 60 * 1000);
  const isFuture = finishedAt.getTime() > (Date.now() + 15 * 60 * 1000);

  return {
    scheduled_order: isFuture,
    estimated_finished_at: finishedAt.toISOString(),
    estimated_ready_at: readyAt.toISOString()
  };
}

async function findBiteberryOrderId(params: {
  phone?: string;
  customerName?: string;
  companyName?: string;
}) {
  const apiKey = process.env.BITEBERRY_API_KEY || "ob_live_8f3a9e2b7c4d1f5e0a6b";
  try {
    const res = await fetch("https://api-core.biteberry.com/api/v1/orders?per_page=30", {
      headers: { "X-API-Key": apiKey }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const orders = data.orders || [];
    const cleanPhone = (params.phone || '').replace(/[^0-9]/g, '');

    const matched = orders.find((o: any) => {
      if (o.status === 'cancelled' || o.status === 'rejected') return false;
      const bPhone = (o.contact_details?.phone?.number || '').replace(/[^0-9]/g, '');
      if (cleanPhone && bPhone && (cleanPhone.includes(bPhone) || bPhone.includes(cleanPhone))) return true;
      const displayName = (o.contact_details?.display_name || '').toLowerCase();
      if (params.companyName && displayName.includes(params.companyName.toLowerCase())) return true;
      if (params.customerName && displayName.includes(params.customerName.toLowerCase())) return true;
      return false;
    });
    return matched ? matched.id : null;
  } catch (e) {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { 
      orderIds, 
      companyId,
      companyName, 
      customerName, 
      customerEmail, 
      newDeliveryDate, 
      newDeliveryTime, 
      newAddressId, 
      newPhone, 
      newNotes, 
      items, 
      totalPrice, 
      biteberryOrderId 
    } = req.body;

    const apiKey = process.env.RESEND_API_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "Geen bestel-IDs meegegeven" });
    }

    const supabaseAdmin = (serviceKey && supabaseUrl)
      ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;

    if (supabaseAdmin) {
      const updateData: any = {
        delivery_date: newDeliveryDate,
        delivery_time: newDeliveryTime,
        address_id: newAddressId,
        phone: newPhone,
        notes: newNotes
      };
      await supabaseAdmin.from('ob_orders').update(updateData).in('id', orderIds);
    }

    let targetBiteberryId = biteberryOrderId;
    if (!targetBiteberryId && supabaseAdmin) {
      const { data: orderRow } = await supabaseAdmin
        .from('ob_orders')
        .select('extra_notes, phone')
        .eq('id', orderIds[0])
        .single();

      if (orderRow?.extra_notes) {
        try {
          const parsed = JSON.parse(orderRow.extra_notes);
          if (parsed.biteberry_order_id) {
            targetBiteberryId = parsed.biteberry_order_id;
          }
        } catch (e) {}
      }

      if (!targetBiteberryId) {
        targetBiteberryId = await findBiteberryOrderId({
          phone: orderRow?.phone,
          companyName,
          customerName
        });
      }
    }

    let biteberrySuccess = false;
    if (targetBiteberryId) {
      const scheduleInfo = parseDeliverySchedule(newDeliveryDate, newDeliveryTime);
      const bbApiKey = process.env.BITEBERRY_API_KEY || "ob_live_8f3a9e2b7c4d1f5e0a6b";

      try {
        if (scheduleInfo.scheduled_order && scheduleInfo.estimated_finished_at) {
          const reschRes = await fetch(`https://api-core.biteberry.com/api/v1/orders/${targetBiteberryId}/reschedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-API-Key": bbApiKey },
            body: JSON.stringify({
              scheduled_at: scheduleInfo.estimated_finished_at,
              cancellation_note: `Gewijzigd naar ${newDeliveryDate} ${newDeliveryTime}`
            })
          });
          if (reschRes.ok) {
            const reschData = await reschRes.json();
            if (reschData.duplicated_order?.id && supabaseAdmin) {
              targetBiteberryId = reschData.duplicated_order.id;
              await supabaseAdmin.from('ob_orders').update({
                extra_notes: JSON.stringify({
                  biteberry_order_id: targetBiteberryId,
                  biteberry_short_code: reschData.duplicated_order.short_code
                })
              }).in('id', orderIds);
            }
            biteberrySuccess = true;
          }
        }

        const itemsSummary = (items && Array.isArray(items))
          ? items.map((i: any) => `${i.product_name}${i.portion_size > 1 ? ` (${i.portion_size}st)` : ''}`).join(', ')
          : '';

        await fetch(`https://api-core.biteberry.com/api/v1/orders/${targetBiteberryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-API-Key": bbApiKey },
          body: JSON.stringify({
            order: {
              kitchen_note: `📅 GEWIJZIGDE BEZORGING: ${newDeliveryDate} om ${newDeliveryTime}${itemsSummary ? ' | Snacks: ' + itemsSummary : ''}${newNotes ? ' | Notitie: ' + newNotes : ''}`,
              operator_note: `Klant gewijzigd via portaal | Bedrijf: ${companyName || customerName} | Tel: ${newPhone || ''}`
            }
          })
        });
        biteberrySuccess = true;
      } catch (bbErr) {}
    }

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        const recipientList = ['info@office-butler.com'];
        if (customerEmail && customerEmail.includes('@') && !recipientList.includes(customerEmail)) {
          recipientList.push(customerEmail);
        }

        const itemsListHtml = (items && Array.isArray(items)) 
          ? items.map((it: any) => `<li>${it.product_name} (${it.portion_size} stuks) - €${Number(it.total_price || it.price || 0).toFixed(2)}</li>`).join('')
          : '';

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 6px;">Bestelling Gewijzigd</h3>
              <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                Er is zojuist een bestelling gewijzigd via het Office Butler portaal voor <strong>${companyName || customerName || 'Klant'}</strong>.
              </p>
            </div>
            <p><strong>Gewijzigd bezorgmoment:</strong> 📅 ${newDeliveryDate} om ${newDeliveryTime}</p>
            <p><strong>Contactnummer:</strong> ${newPhone || 'Onbekend'}</p>
            ${newNotes ? `<p><strong>Aangepaste notities:</strong> ${newNotes}</p>` : ''}
            <p><strong>Huidige items:</strong></p>
            <ul>${itemsListHtml}</ul>
            <p><strong>Totaalbedrag:</strong> €${Number(totalPrice || 0).toFixed(2)}</p>
          </div>
        `;

        await resend.emails.send({
          from: 'Office Butler <info@office-butler.com>',
          to: recipientList,
          subject: `✏️ Bestelling Gewijzigd - ${companyName || customerName}`,
          html: emailHtml
        });
      } catch (e) {}
    }

    res.status(200).json({ success: true, biteberrySuccess });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
