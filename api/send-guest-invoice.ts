import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Helper to parse Dutch address strings into BiteBerry address components
function parseDutchAddress(rawAddress: string, label?: string, notes?: string) {
  const text = (rawAddress || "").trim();
  const postalCodeMatch = text.match(/\b([1-9][0-9]{3}\s?[A-Za-z]{2})\b/);
  const zipcode = postalCodeMatch ? postalCodeMatch[1].toUpperCase() : "1011 RB";
  
  let city = "Amsterdam";
  if (postalCodeMatch) {
    const afterZip = text.slice(text.indexOf(postalCodeMatch[0]) + postalCodeMatch[0].length).trim();
    const cityWord = afterZip.split(/[,;\n]/)[0].trim();
    if (cityWord) city = cityWord;
  }

  const line1 = text || "Keizersgracht 123";
  const noteParts: string[] = [];
  if (label) noteParts.push(`Locatie: ${label}`);
  if (notes) noteParts.push(notes);

  return {
    line1,
    city: city || "Amsterdam",
    zipcode: zipcode || "1011 RB",
    country: "Netherlands",
    country_code: "nl",
    note: noteParts.length > 0 ? noteParts.join(" | ") : undefined
  };
}

// Helper to parse deliveryDate and deliveryTime into BiteBerry ISO scheduled date-times
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
  let offsetHours = 2; // Default summer (CEST) in NL
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

  const readyAt = new Date(finishedAt.getTime() - 30 * 60 * 1000); // 30 minutes before delivery for kitchen prep
  const isFuture = finishedAt.getTime() > (Date.now() + 15 * 60 * 1000);

  return {
    scheduled_order: isFuture,
    estimated_finished_at: finishedAt.toISOString(),
    estimated_ready_at: readyAt.toISOString()
  };
}

async function sendOrderToBiteberry(params: {
  customerName: string;
  email?: string;
  phone: string;
  rawAddress: string;
  addressLabel?: string;
  companyName?: string;
  orderLines?: any[];
  selections?: any;
  prices?: any;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryMethod?: string;
  deliveryMethodPrice?: number;
  notes?: string;
  billingInfo?: string;
  discountCode?: string;
  discountAmount?: number;
  freeProductInfo?: string;
  isTest?: boolean;
  supabaseAdmin?: any;
}) {
  try {
    let apiKey = process.env.BITEBERRY_API_KEY?.trim() || "ob_live_8f3a9e2b7c4d1f5e0a6b";
    let storefrontId = process.env.BITEBERRY_STOREFRONT_ID?.trim() || "322e275f-c3d3-44bd-876c-f30ecf713227";
    if (storefrontId === "4f6adec7-55d6-4bdb-b719-a37f44a3fc19") {
      storefrontId = "322e275f-c3d3-44bd-876c-f30ecf713227";
    }

    if (params.supabaseAdmin) {
      try {
        const { data: storeRow } = await params.supabaseAdmin
          .from('store_settings')
          .select('page_content')
          .eq('id', 1)
          .single();
        if (storeRow?.page_content?.biteberry_storefront_id?.trim() && storeRow.page_content.biteberry_storefront_id.trim() !== "4f6adec7-55d6-4bdb-b719-a37f44a3fc19") {
          storefrontId = storeRow.page_content.biteberry_storefront_id.trim();
        }
        if (storeRow?.page_content?.biteberry_api_key?.trim()) {
          apiKey = storeRow.page_content.biteberry_api_key.trim();
        }
      } catch (e) {
        // Fallback to env
      }
    }

    if (!apiKey) {
      console.warn("[BiteBerry] Geen API key gevonden, bestelling wordt overgeslagen.");
      return { success: false, reason: "No API key configured" };
    }

    const parsedLines: { name: string; qty: number; price: number; taxRate?: number }[] = [];
    if (params.orderLines && Array.isArray(params.orderLines) && params.orderLines.length > 0) {
      for (const line of params.orderLines) {
        const isDelivery = Boolean(line.product_name && line.product_name.startsWith("Bezorging:"));
        const portionSuffix = (!isDelivery && line.portion_size) ? ` (${line.portion_size} stuks)` : "";
        parsedLines.push({
          name: `${line.product_name}${portionSuffix}`,
          qty: Math.max(1, Number(line.qty) || 1),
          price: Math.max(0, Number(line.price) || 0),
          taxRate: isDelivery ? 21 : 9
        });
      }
    } else if (params.selections && typeof params.selections === "object") {
      const prices = params.prices || {};
      for (const [prod, sizes] of Object.entries(params.selections)) {
        for (const [sizeStr, qty] of Object.entries(sizes as any)) {
          const parts = String(sizeStr).split('_');
          const size = Number(parts[0]);
          const variant = parts[1] || '';
          const finalProd = variant ? `${prod} (${variant})` : prod;
          const cleanProd = (prod || '').trim();
          const price = prices[`${cleanProd}_${sizeStr}`] || prices[`${cleanProd}_${size}`] || prices[`${prod}_${sizeStr}`] || prices[`${prod}_${size}`] || 0;
          parsedLines.push({
            name: `${finalProd} (${size} stuks)`,
            qty: Math.max(1, Number(qty) || 1),
            price: Math.max(0, Number(price) || 0),
            taxRate: 9
          });
        }
      }
    }

    const deliveryPriceNum = params.deliveryMethodPrice && Number(params.deliveryMethodPrice) > 0
      ? Number(params.deliveryMethodPrice)
      : 0;

    if (deliveryPriceNum > 0 && !parsedLines.some(l => l.name.startsWith("Bezorging"))) {
      parsedLines.push({
        name: `Bezorging: ${params.deliveryMethod || "Standaard Bezorging"}`,
        qty: 1,
        price: deliveryPriceNum,
        taxRate: 21
      });
    }

    if (params.freeProductInfo && !parsedLines.some(l => l.name.includes(params.freeProductInfo!))) {
      parsedLines.push({
        name: `GRATIS: ${params.freeProductInfo}`,
        qty: 1,
        price: 0,
        taxRate: 9
      });
    }

    const items = parsedLines.map((line, idx) => ({
      name: line.name,
      quantity: line.qty,
      price: Math.round(line.price * 100),
      tax_rate: line.taxRate || 9,
      order_item_type: "standalone" as const,
      external_id: `OB-ITEM-${idx + 1}`
    }));

    const discounts: any[] = [];
    const discountCents = params.discountAmount && Number(params.discountAmount) > 0
      ? Math.round(Number(params.discountAmount) * 100)
      : 0;

    if (discountCents > 0) {
      discounts.push({
        discount_type: "all",
        amount: discountCents,
        name: params.discountCode ? `Korting (${params.discountCode})` : "Korting",
        external_id: `OB-DISCOUNT-${params.discountCode || "CODE"}`
      });
    }

    const activeItems = items.length > 0 ? items : [
      {
        name: "Office Butler Catering",
        quantity: 1,
        price: 100,
        tax_rate: 9,
        order_item_type: "standalone" as const,
        external_id: "OB-ITEM-1"
      }
    ];

    const subTotalCents = activeItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const grandTotalCents = Math.max(0, subTotalCents - discountCents);

    const isTestOrder = Boolean(params.isTest === true);
    let effectiveCustomerName = (params.customerName || "Klant").trim();
    let firstName = "";
    let lastName = "";

    if (isTestOrder) {
      firstName = "[TEST]";
      const cleanName = effectiveCustomerName.replace(/\[TEST.*?\]/gi, '').trim();
      lastName = cleanName ? `${cleanName}` : "Klant";
    } else {
      const nameParts = effectiveCustomerName.split(" ");
      firstName = nameParts[0] || "Klant";
      lastName = nameParts.slice(1).join(" ") || (params.companyName ? `(${params.companyName})` : "");
    }

    let rawPhone = String(params.phone || '').trim();
    let digitsOnly = rawPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.startsWith('31') && digitsOnly.length >= 10) {
      digitsOnly = '0' + digitsOnly.slice(2);
    }
    const cleanPhone = (digitsOnly && digitsOnly.length >= 6) ? digitsOnly : "0612345678";
    const address = parseDutchAddress(params.rawAddress, params.addressLabel, params.notes);
    const scheduleInfo = parseDeliverySchedule(params.deliveryDate, params.deliveryTime);

    const kitchenNoteParts = [
      isTestOrder ? "🚨 FAKE TEST BESTELLING - NIET MAKEN OF BEZORGEN! 🚨" : "🏢 KANAAL: OFFICE BUTLER",
      `📅 Bezorging: ${params.deliveryDate || 'Z.s.m.'} om ${params.deliveryTime || 'Z.s.m.'}`,
      params.deliveryMethod ? `🚚 Methode: ${params.deliveryMethod}` : null,
      params.notes ? `📝 Notitie: ${params.notes}` : null,
      params.discountCode ? `🎟️ Code: ${params.discountCode}` : null
    ].filter(Boolean);

    const operatorNoteParts = [
      isTestOrder ? "🚨 FAKE TEST - GEEN ACTIE VEREIST 🚨" : "🏢 KANAAL: OFFICE BUTLER",
      params.companyName ? `Bedrijf: ${params.companyName}` : `Particulier: ${params.customerName}`,
      params.email ? `Email: ${params.email}` : null,
      `Tel: ${cleanPhone}`,
      params.billingInfo ? `Factuurinfo: ${params.billingInfo.replace(/\n/g, ' ')}` : null
    ].filter(Boolean);

    const orderPayload = {
      order: {
        storefront_id: storefrontId,
        order_type: "delivery",
        delivery_type: "own_fleet",
        is_test: isTestOrder,
        scheduled_order: scheduleInfo.scheduled_order,
        estimated_finished_at: scheduleInfo.estimated_finished_at,
        estimated_ready_at: scheduleInfo.estimated_ready_at,
        external_id: `OB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        kitchen_note: kitchenNoteParts.join(" | "),
        operator_note: operatorNoteParts.join(" | "),
        sub_total: subTotalCents,
        grand_total: grandTotalCents,
        contact_details: {
          first_name: firstName,
          last_name: lastName,
          email: (params.email && params.email.includes('@')) ? params.email.trim() : "info@office-butler.com",
          phone: {
            number: cleanPhone,
            country_code: "+31"
          },
          courier_note: `Office Butler levering voor ${params.companyName || params.customerName}`,
          address: {
            line1: address.line1 || "Keizersgracht 123",
            city: address.city || "Amsterdam",
            zipcode: address.zipcode || "1011 RB",
            country: address.country || "Netherlands",
            country_code: address.country_code || "nl",
            note: address.note
          }
        },
        items: activeItems,
        charges: undefined,
        discounts: discounts.length > 0 ? discounts : undefined,
        payments: [
          {
            amount: grandTotalCents,
            status: "paid",
            payment_type: "other",
            external_id: `OB-PAY-${Date.now()}`
          }
        ]
      }
    };

    const response = await fetch("https://api-core.biteberry.com/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[BiteBerry] API antwoordde met foutstatus:", response.status, JSON.stringify(data));
      return { success: false, status: response.status, error: data };
    }

    console.log("[BiteBerry] Order succesvol aangemaakt! Order ID:", data.order?.id || data.id, "Short Code:", data.order?.short_code || data.short_code);
    return { success: true, order: data.order || data };
  } catch (err: any) {
    console.error("[BiteBerry] Fout bij doorsturen naar BiteBerry:", err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
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
      discountCode,
      discountType,
      discountValue,
      discountAmount,
      freeProductInfo,
      finalTotal
    } = req.body;
    const apiKey = process.env.RESEND_API_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;

    const supabaseAdmin = (serviceKey && supabaseUrl)
      ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;

    // 1. BiteBerry Integration: ALWAYS forward order to BiteBerry via Office Butler integration
    let biteberryResult: any = null;
    try {
      biteberryResult = await sendOrderToBiteberry({
        customerName: guestName || "Gast Klant",
        email: guestEmail || undefined,
        phone,
        rawAddress: guestAddress || 'Adres op aanvraag',
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
            
            <p style="margin-top: 20px; font-size: 12px; color: #888;">Dit is een automatisch gegenereerd bericht van Office Butler.</p>
          </div>
        `;

        await resend.emails.send({
          from: 'Office Butler <info@office-butler.com>',
          to: ['info@office-butler.com'],
          subject: discountCode 
            ? `Nieuwe GAST Bestelling & Factuur [Korting: ${discountCode}] - ${guestName}`
            : `Nieuwe GAST Bestelling & Factuur - ${guestName}`,
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
