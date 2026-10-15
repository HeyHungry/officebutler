import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { sendOrderToBiteberry } from "./biteberryShared";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    } else if (Buffer.isBuffer(body)) {
      try { body = JSON.parse(body.toString('utf8')); } catch (_) {}
    }
    body = body || {};

    const { 
      guestName, 
      guestEmail, 
      guestBillingInfo, 
      guestAddress, 
      phone, 
      notes, 
      selections, 
      prices, 
      orderLines, 
      totalOrderPrice, 
      deliveryDate, 
      deliveryTime, 
      deliveryMethod, 
      deliveryMethodPrice,
      packagingOption,
      packagingPrice,
      discountCode,
      discountType,
      discountValue,
      discountAmount,
      freeProductInfo,
      finalTotal
    } = body;
    const apiKey = process.env.RESEND_API_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

    const supabaseAdmin = (serviceKey && supabaseUrl)
      ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;

    const rawBrand = (body.brand || process.env.VITE_BRAND_ID || 'office_butler').trim().toLowerCase();
    const brandName = rawBrand.includes('canal') ? 'Canal Butler' : (rawBrand.includes('snack') ? 'Snack Butler' : 'Office Butler');
    const brandFromEmail = process.env.RESEND_FROM_EMAIL || (rawBrand.includes('canal') ? 'Canal Butler <info@office-butler.com>' : 'Office Butler <info@office-butler.com>');

    // 1. BiteBerry Integration: ALWAYS forward order to BiteBerry via Office Butler integration
    let biteberryResult: any = null;
    try {
      biteberryResult = await sendOrderToBiteberry({
        customerName: guestName || "Gast Klant",
        email: guestEmail || undefined,
        phone,
        rawAddress: guestAddress || 'Adres op aanvraag',
        brand: body.brand || (process.env.VITE_BRAND_ID as string) || 'office_butler',
        orderLines,
        selections,
        prices,
        deliveryDate,
        deliveryTime,
        deliveryMethod,
        deliveryMethodPrice,
        notes,
        billingInfo: guestBillingInfo,
        discountCode,
        discountAmount,
        freeProductInfo,
        isTest: false,
        supabaseAdmin
      });

      if (biteberryResult && biteberryResult.success && biteberryResult.order?.id && supabaseAdmin) {
        const { data: recentRows } = await supabaseAdmin
          .from('ob_orders')
          .select('id')
          .is('company_id', null)
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
      console.error("[BiteBerry] Fout bij verzenden naar BiteBerry in /api/send-guest-invoice:", bbErr);
    }

    // 2. Resend Email (if configured)
    let emailSent = false;
    if (apiKey && guestEmail) {
      try {
        const resend = new Resend(apiKey);
        
        let itemsHtml = '';
        if (orderLines && Array.isArray(orderLines)) {
          for (const line of orderLines) {
            itemsHtml += `<tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${line.qty}x ${line.product_name} (${line.portion_size} stuks)</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${line.price === 0 ? '<strong style="color: #16a34a;">GRATIS</strong>' : `€${line.lineTotal.toFixed(2)}`}</td>
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

        const calculatedFinalTotal = finalTotal != null 
          ? Number(finalTotal) 
          : Math.max(0, (totalOrderPrice - (Number(discountAmount) || 0))) + (Number(deliveryMethodPrice) || 0);

        const emailHtml = `
          <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; color: #333;">
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
              <h3 style="margin-top: 0; color: #0d47a1;">Interne Notitie (Office Butler) - GAST BESTELLING</h3>
              <p style="margin: 5px 0;">Er is zojuist een <strong>particuliere/eenmalige</strong> bestelling geplaatst door <strong>${guestName}</strong>.</p>
              <p style="margin: 5px 0;">Controleer deze factuur en stuur deze vervolgens handmatig door naar: <a href="mailto:${guestEmail}">${guestEmail}</a></p>
              ${discountCode ? `
              <div style="margin-top: 10px; padding: 8px 12px; background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 6px; color: #1b5e20;">
                <strong>🎟️ Toegepaste Kortingscode:</strong> <span style="font-family: monospace; font-weight: bold; background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #81c784;">${discountCode}</span>
                ${discountType === 'percentage' ? ` &mdash; <strong>${discountValue}% korting</strong> (-€${Number(discountAmount || 0).toFixed(2)})` : ''}
                ${discountType === 'free_product' ? ` &mdash; <strong>Gratis product: ${freeProductInfo || 'Gratis item'}</strong>` : ''}
              </div>
              ` : ''}
            </div>

            <h2 style="color: #05053D;">Bevestiging Bestelling & Factuur (Eenmalig)</h2>
            <p>Beste ${guestName},</p>
            <p>Bedankt voor uw eenmalige bestelling via Office Butler. Hieronder vindt u het overzicht van uw bestelling.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f4f6f9;">
                  <th style="padding: 8px; text-align: left;">Product</th>
                  <th style="padding: 8px; text-align: right;">Prijs</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                ${(freeProductInfo && (!orderLines || !orderLines.some((l: any) => l.product_name && l.product_name.includes(discountCode)))) ? `
                <tr style="background-color: #f0fdf4; color: #166534;">
                  <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">
                    🎁 <strong>GRATIS PRODUCT:</strong> ${freeProductInfo} <br/>
                    <span style="font-size: 11px; color: #15803d;">Toegevoegd via kortingscode: <strong>${discountCode}</strong></span>
                  </td>
                  <td style="padding: 8px; border-bottom: 1px solid #bbf7d0; text-align: right; font-weight: bold; color: #16a34a;">
                    GRATIS (€0,00)
                  </td>
                </tr>
                ` : ''}
                ${(deliveryMethod && Number(deliveryMethodPrice) > 0 && (!orderLines || !orderLines.some((l: any) => l.product_name && l.product_name.startsWith('Bezorging:')))) ? `<tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">Bezorging (${deliveryMethod})</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${Number(deliveryMethodPrice).toFixed(2)}</td>
                </tr>` : ''}
                ${(discountAmount && Number(discountAmount) > 0) ? `
                <tr style="background-color: #f0fdf4; color: #166534;">
                  <td style="padding: 8px; border-bottom: 1px solid #bbf7d0; font-weight: 500;">
                    🏷️ Korting via code <strong>${discountCode}</strong> (-${discountValue}%):
                  </td>
                  <td style="padding: 8px; border-bottom: 1px solid #bbf7d0; text-align: right; font-weight: bold; color: #16a34a;">
                    -€${Number(discountAmount).toFixed(2)}
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px; font-weight: bold; text-align: right;">Totaal</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right;">€${calculatedFinalTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="background-color: #f4f6f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h3 style="margin-top: 0; color: #05053D;">Aflevergegevens & Factuur</h3>
              <p style="margin: 5px 0; padding: 10px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; font-weight: bold; color: #e65100;">
                📅 Bezorgmoment: ${deliveryDate} om ${deliveryTime}
              </p>
              <p style="margin: 5px 0;"><strong>Bezorgadres:</strong> ${guestAddress}</p>
              <p style="margin: 5px 0;"><strong>Contactnummer:</strong> ${phone}</p>
              <p style="margin: 5px 0;"><strong>Factuurgegevens (Naam/KVK/etc):</strong><br/>${guestBillingInfo}</p>
              ${discountCode ? `<p style="margin: 5px 0;"><strong>Kortingscode:</strong> ${discountCode}</p>` : ''}
              ${notes ? `<p style="margin: 5px 0;"><strong>Extra Notities:</strong> ${notes}</p>` : ''}
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #888;">Dit is een automatisch gegenereerd bericht van ${brandName}.</p>
          </div>
        `;

        const recipientList: string[] = ['info@office-butler.com'];
        if (guestEmail && guestEmail.includes('@') && !recipientList.includes(guestEmail.trim())) {
          recipientList.push(guestEmail.trim());
        }

        await resend.emails.send({
          from: brandFromEmail,
          to: recipientList,
          subject: discountCode 
            ? `[${brandName}] Nieuwe GAST Bestelling & Factuur [Korting: ${discountCode}] - ${guestName}`
            : `[${brandName}] Nieuwe GAST Bestelling & Factuur - ${guestName}`,
          html: emailHtml
        });
        emailSent = true;
      } catch (mailErr) {
        console.error("Error sending guest invoice email (non-blocking):", mailErr);
      }
    }

    res.status(200).json({ success: true, emailSent, biteberry: biteberryResult });
  } catch (err: any) {
    console.error("Server error sending guest invoice:", err);
    res.status(500).json({ error: err.message });
  }
}
