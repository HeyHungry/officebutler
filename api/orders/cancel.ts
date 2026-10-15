import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

async function cancelBiteberryOrder(biteberryOrderId: string, reason?: string) {
  const apiKey = process.env.BITEBERRY_API_KEY || "ob_live_8f3a9e2b7c4d1f5e0a6b";
  try {
    const res = await fetch(`https://api-core.biteberry.com/api/v1/orders/${biteberryOrderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify({
        cancellation_note: reason || "Geannuleerd door klant via Office Butler portaal",
        cancellation_code: "C-000"
      })
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, data };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
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
      reason, 
      companyId,
      companyName, 
      customerName, 
      customerEmail, 
      items, 
      totalPrice, 
      deliveryDate, 
      deliveryTime, 
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
      await supabaseAdmin
        .from('ob_orders')
        .update({ status: 'cancelled' })
        .in('id', orderIds);
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
      const cancelRes = await cancelBiteberryOrder(targetBiteberryId, reason);
      biteberrySuccess = cancelRes.success;
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
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #991b1b; margin-top: 0; margin-bottom: 6px;">Bestelling Geannuleerd</h3>
              <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
                Er is zojuist een bestelling geannuleerd via het Office Butler portaal voor <strong>${companyName || customerName || 'Klant'}</strong>.
              </p>
            </div>
            <p><strong>Geannuleerde items:</strong></p>
            <ul>${itemsListHtml}</ul>
            <p><strong>Totaalbedrag:</strong> €${Number(totalPrice || 0).toFixed(2)}</p>
            <p><strong>Geplande bezorging:</strong> ${deliveryDate || 'N.v.t.'} om ${deliveryTime || 'N.v.t.'}</p>
            <p><strong>Reden van annulering:</strong> ${reason || 'Geen specifieke reden opgegeven'}</p>
          </div>
        `;

        await resend.emails.send({
          from: 'Office Butler <info@office-butler.com>',
          to: recipientList,
          subject: `❌ Bestelling Geannuleerd - ${companyName || customerName}`,
          html: emailHtml
        });
      } catch (e) {}
    }

    res.status(200).json({ success: true, biteberrySuccess });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
