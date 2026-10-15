import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { 
  sendOrderToBiteberry, 
  adminClient, 
  parseDutchAddress, 
  parseDeliverySchedule 
} from "./biteberryShared";

export { parseDutchAddress, parseDeliverySchedule };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { 
      companyId, 
      companyName: reqCompanyName, 
      customerName: reqCustomerName,
      rawAddress: reqRawAddress, 
      addressLabel: reqAddressLabel, 
      email: reqEmail,
      selections, 
      prices, 
      orderLines, 
      addressId, 
      phone, 
      notes, 
      totalOrderPrice, 
      deliveryDate, 
      deliveryTime, 
      deliveryMethod, 
      deliveryMethodPrice 
    } = req.body;
    const apiKey = process.env.RESEND_API_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rqqotumbdsghvkkmquqo.supabase.co";

    const supabaseAdmin = (serviceKey && supabaseUrl)
      ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : adminClient;

    let company: any = null;
    let address: any = null;

    if (supabaseAdmin && companyId) {
      try {
        const { data: compData } = await supabaseAdmin.from('ob_companies').select('*').eq('id', companyId).maybeSingle();
        company = compData;
        if (addressId) {
          const { data: addrData } = await supabaseAdmin.from('ob_company_addresses').select('*').eq('id', addressId).maybeSingle();
          address = addrData;
        }
      } catch (dbErr) {
        console.warn("[/api/send-invoice] Warning fetching company/address from Supabase:", dbErr);
      }
    }

    const effectiveCompanyName = reqCompanyName || company?.name || "Zakelijke Klant";
    const effectiveCustomerName = reqCustomerName || effectiveCompanyName;
    const effectiveEmail = reqEmail || company?.billing_email || "info@office-butler.com";
    const effectiveRawAddress = reqRawAddress || address?.address_line || address?.label || 'Adres op aanvraag';
    const effectiveAddressLabel = reqAddressLabel || address?.label;

    // 1. BiteBerry Integration: ALWAYS forward order to BiteBerry via Office Butler integration
    let biteberryResult: any = null;
    try {
      biteberryResult = await sendOrderToBiteberry({
        brand: 'canal_butler',
        brandPlatform: 'canal',
        customerName: effectiveCustomerName,
        companyName: effectiveCompanyName,
        email: effectiveEmail,
        phone,
        rawAddress: effectiveRawAddress,
        addressLabel: effectiveAddressLabel,
        orderLines,
        selections,
        prices,
        deliveryDate,
        deliveryTime,
        deliveryMethod,
        deliveryMethodPrice,
        notes,
        billingInfo: company?.billing_info,
        isTest: false,
        supabaseAdmin
      });

      if (biteberryResult && biteberryResult.success && biteberryResult.order?.id && supabaseAdmin) {
        const { data: recentRows } = await supabaseAdmin
          .from('ob_orders')
          .select('id')
          .eq('company_id', companyId)
          .eq('delivery_date', deliveryDate)
          .order('created_at', { ascending: false })
          .limit(30);

        if (recentRows && recentRows.length > 0) {
          await supabaseAdmin
            .from('ob_orders')
            .update({
              extra_notes: JSON.stringify({
                biteberry_order_id: biteberryResult.order.id,
                biteberry_short_code: biteberryResult.order.short_code
              })
            })
            .in('id', recentRows.map(r => r.id));
        }
      }
    } catch (bbErr) {
      console.error("[BiteBerry] Fout bij verzenden naar BiteBerry in /api/send-invoice:", bbErr);
    }

    // 2. Resend Email (if configured)
    let emailSent = false;
    const emailRecipient = company?.billing_email || reqEmail;
    if (apiKey && emailRecipient) {
      try {
        const resend = new Resend(apiKey);
        
        let itemsHtml = '';
        if (orderLines && Array.isArray(orderLines)) {
          for (const line of orderLines) {
            itemsHtml += `<tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${line.qty}x ${line.product_name} (${line.portion_size} stuks)</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${line.lineTotal.toFixed(2)}</td>
            </tr>`;
          }
        } else if (selections) {
          for (const [prod, sizes] of Object.entries(selections)) {
            for (const [sizeStr, qty] of Object.entries(sizes as any)) {
              const parts = String(sizeStr).split('_');
              const size = Number(parts[0]);
              const variant = parts[1] || '';
              const finalProd = variant ? `${prod} (${variant})` : prod;
              const cleanProd = (prod || '').trim();
              const price = (prices && (prices[`${cleanProd}_${sizeStr}`] || prices[`${cleanProd}_${size}`] || prices[`${prod}_${sizeStr}`] || prices[`${prod}_${size}`])) || 0;
              const lineTotal = price * (qty as number);
              itemsHtml += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${qty}x ${finalProd} (${size} stuks)</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${lineTotal.toFixed(2)}</td>
              </tr>`;
            }
          }
        }

        const hasDeliveryInLines = Boolean(orderLines && Array.isArray(orderLines) && orderLines.some((l: any) => l.product_name && l.product_name.startsWith('Bezorging:')));
        const grandInvoiceTotal = totalOrderPrice != null && Number(totalOrderPrice) > 0
          ? (hasDeliveryInLines ? Number(totalOrderPrice) : (Number(totalOrderPrice) + (Number(deliveryMethodPrice) || 0)))
          : (orderLines && Array.isArray(orderLines) ? orderLines.reduce((s: number, l: any) => s + (Number(l.lineTotal) || 0), 0) : (Number(deliveryMethodPrice) || 0));

        const emailHtml = `
          <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; color: #333;">
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
              <h3 style="margin-top: 0; color: #0d47a1;">Interne Notitie (Canal Butler)</h3>
              <p style="margin: 5px 0;">Er is zojuist een nieuwe bestelling geplaatst via Canal Butler door <strong>${effectiveCompanyName}</strong>.</p>
              <p style="margin: 5px 0;">Controleer deze factuur en stuur deze vervolgens handmatig door naar: <a href="mailto:${emailRecipient}">${emailRecipient}</a></p>
            </div>

            <h2 style="color: #05053D;">Bevestiging Bestelling & Factuur (Canal Butler)</h2>
            <p>Beste ${effectiveCompanyName},</p>
            <p>Bedankt voor uw bestelling via Canal Butler. Hieronder vindt u het overzicht van uw bestelling.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f4f6f9;">
                  <th style="padding: 8px; text-align: left;">Product</th>
                  <th style="padding: 8px; text-align: right;">Prijs</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                ${(!hasDeliveryInLines && deliveryMethod && Number(deliveryMethodPrice) > 0) ? `<tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">Bezorging (${deliveryMethod})</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${Number(deliveryMethodPrice).toFixed(2)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px; font-weight: bold; text-align: right;">Totaal</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right;">€${grandInvoiceTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="background-color: #f4f6f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h3 style="margin-top: 0; color: #05053D;">Aflevergegevens</h3>
              <p style="margin: 5px 0; padding: 10px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; font-weight: bold; color: #e65100;">
                📅 Bezorgmoment: ${deliveryDate} om ${deliveryTime}
              </p>
              <p style="margin: 5px 0;"><strong>Locatie:</strong> ${effectiveAddressLabel || ''} (${effectiveRawAddress || ''})</p>
              <p style="margin: 5px 0;"><strong>Contactnummer:</strong> ${phone}</p>
              ${notes ? `<p style="margin: 5px 0;"><strong>Notities:</strong> ${notes}</p>` : ''}
              ${company?.billing_info ? `<br/><p style="margin: 5px 0;"><strong>Factuurgegevens:</strong><br/>${company.billing_info}</p>` : ''}
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #888;">Dit is een automatisch gegenereerd bericht van Canal Butler.</p>
          </div>
        `;

        const fromAddress = process.env.RESEND_FROM?.trim() || 'Canal Butler <info@office-butler.com>';

        const recipients = ['info@office-butler.com', 'info@canal-butler.com'];

        let sendRes = await resend.emails.send({
          from: fromAddress,
          replyTo: 'info@canal-butler.com',
          to: recipients,
          subject: `[Canal Butler] Nieuwe Bestelling & Factuur - ${effectiveCompanyName}`,
          html: emailHtml
        });

        if (sendRes.error && (sendRes.error.name === 'validation_error' || sendRes.error.message?.includes('not verified') || (sendRes.error as any).statusCode === 403)) {
          if (fromAddress !== 'Canal Butler <info@office-butler.com>') {
            sendRes = await resend.emails.send({
              from: 'Canal Butler <info@office-butler.com>',
              replyTo: 'info@canal-butler.com',
              to: recipients,
              subject: `[Canal Butler] Nieuwe Bestelling & Factuur - ${effectiveCompanyName}`,
              html: emailHtml
            });
          }
          if (sendRes.error && (sendRes.error.name === 'validation_error' || sendRes.error.message?.includes('not verified') || (sendRes.error as any).statusCode === 403)) {
            sendRes = await resend.emails.send({
              from: 'Canal Butler <onboarding@resend.dev>',
              replyTo: 'info@canal-butler.com',
              to: recipients,
              subject: `[Canal Butler] Nieuwe Bestelling & Factuur - ${effectiveCompanyName}`,
              html: emailHtml
            });
          }
        }
        emailSent = !sendRes.error;
      } catch (mailErr) {
        console.error("Error sending invoice email (non-blocking):", mailErr);
      }
    }

    res.status(200).json({ success: true, emailSent, biteberry: biteberryResult });
  } catch (err: any) {
    console.error("Server error sending invoice:", err);
    res.status(500).json({ error: err.message });
  }
}
