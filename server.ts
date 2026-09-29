import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { checkActionAllowed, DEFAULT_MODIFICATION_RULES } from "./src/lib/orderDeadlines";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({}) : null;
  const translationCache = new Map<string, string>();

  // API Routes
  app.post("/api/translate", async (req, res) => {
    try {
      const { texts, targetLang = "en" } = req.body;
      if (!texts || typeof texts !== "object") {
        return res.status(400).json({ error: "Invalid texts payload" });
      }

      if (targetLang === "nl") {
        return res.status(200).json({ translations: texts });
      }

      if (!ai) {
        return res.status(200).json({ translations: texts });
      }

      const results: Record<string, string> = {};
      const toTranslate: Record<string, string> = {};

      for (const [key, val] of Object.entries(texts)) {
        if (typeof val !== "string" || !val.trim()) {
          results[key] = String(val || "");
          continue;
        }
        const cacheKey = `${val.trim()}_${targetLang}`;
        if (translationCache.has(cacheKey)) {
          results[key] = translationCache.get(cacheKey)!;
        } else {
          toTranslate[key] = val;
        }
      }

      if (Object.keys(toTranslate).length > 0) {
        try {
          const prompt = `You are the bilingual translator for Office Butler, a premium B2B office catering brand in Amsterdam.
Translate the following JSON map of Dutch texts into natural, elegant English for a high-end corporate audience.
Rules:
- Keep brand names unchanged: "Office Butler", "Canal Butler", "Mokum Local Kitchen".
- Keep Dutch snack names recognizable: e.g. "Bitterballen", "Vlammetjes", "Kalfskroketjes" (you may add a short description if helpful).
- Preserve all numbers, currency signs (€), URLs, and punctuation.
- Return ONLY a valid JSON object where keys match the input keys and values are the English translations.

Input:
${JSON.stringify(toTranslate, null, 2)}
`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          const responseText = response.text?.trim() || "{}";
          const parsed = JSON.parse(responseText);
          for (const [key, transVal] of Object.entries(parsed)) {
            if (typeof transVal === "string") {
              results[key] = transVal;
              const originalVal = toTranslate[key];
              if (originalVal) {
                translationCache.set(`${originalVal.trim()}_${targetLang}`, transVal);
              }
            }
          }
        } catch (apiErr: any) {
          // Gracefully fallback to original text without throwing or breaking client
          if (apiErr?.status === 'RESOURCE_EXHAUSTED' || apiErr?.message?.includes('429')) {
            console.warn("[/api/translate] Rate limit reached. Using fallback text.");
          } else {
            console.warn("[/api/translate] Translation service notice:", apiErr?.message || apiErr);
          }
          for (const [k, v] of Object.entries(toTranslate)) {
            results[k] = v;
          }
        }
      }

      res.status(200).json({ translations: results });
    } catch (err: any) {
      console.warn("[/api/translate] Catch block fallback triggered");
      res.status(200).json({ translations: req.body?.texts || {} });
    }
  });
  app.post("/api/notify-admin", async (req, res) => {
    try {
      const { companyName, contactPerson, email, phone, wishes } = req.body;
      const apiKey = process.env.RESEND_API_KEY;

      if (!apiKey) {
        console.error("RESEND_API_KEY is not configured.");
        return res.status(200).json({ success: false, message: "Resend key missing" });
      }

      const resend = new Resend(apiKey);
      
      const { data, error } = await resend.emails.send({
        from: 'Office Butler <info@office-butler.com>',
        to: ['info@office-butler.com'],
        subject: `Nieuwe aanvraag Kantoor: ${companyName}`,
        html: `
          <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; color: #333;">
            <h2 style="color: #05053D;">Nieuwe aanvraag via Office Butler</h2>
            <p>Er is zojuist een nieuw bedrijf aangemeld dat wacht op contact of goedkeuring.</p>
            <div style="background-color: #f4f6f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <ul style="list-style: none; padding-left: 0;">
                <li style="margin-bottom: 8px;"><strong>Kantoornaam:</strong> ${companyName}</li>
                <li style="margin-bottom: 8px;"><strong>Contactpersoon:</strong> ${contactPerson || 'Niet opgegeven'}</li>
                <li style="margin-bottom: 8px;"><strong>E-mailadres:</strong> ${email}</li>
                <li style="margin-bottom: 8px;"><strong>Telefoonnummer:</strong> ${phone || 'Niet opgegeven'}</li>
              </ul>
              ${wishes ? `<p><strong>Wensen / Notities:</strong><br/>${wishes.replace(/\n/g, '<br/>')}</p>` : ''}
            </div>
            <p style="margin-top: 20px;">Log in op het Office Butler Moderator Panel om deze gegevens te bekijken in de database.</p>
          </div>
        `
      });

      if (error) {
        console.error("Error sending admin email:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ success: true, data });
    } catch (err: any) {
      console.error("Server error sending email:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Create Employee Route (requires SUPABASE_SERVICE_ROLE_KEY)
  app.post("/api/create-employee", async (req, res) => {
    try {
      const { email, password, companyId } = req.body;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      
      if (!serviceKey || !supabaseUrl) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL");
        return res.status(500).json({ error: "Server configuratie ontbreekt (Service Role Key)" });
      }
      
      const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true // bypasses the email confirmation requirement
      });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      if (data.user) {
        // Also save the email inside the user profile so we can list it easily in the dashboard
        await supabaseAdmin.from('ob_user_profiles').insert({
          id: data.user.id,
          company_id: companyId,
          role: 'employee',
          first_name: email // Store email here as a hack since we can't fetch auth.users on client
        });
      }
      
      res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("Error creating employee:", err);
      res.status(500).json({ error: err.message });
    }
  });

  
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

  // 100% Fail-Safe function to format and send orders to BiteBerry
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
  }) {
    try {
      const apiKey = process.env.BITEBERRY_API_KEY?.trim() || "ob_live_8f3a9e2b7c4d1f5e0a6b";
      // Storefront ID for Office Butler API connection:
      const storefrontId = process.env.BITEBERRY_STOREFRONT_ID?.trim() || "7b306068-28af-4c7d-a170-0f2cc3192e11";

      if (!apiKey) {
        console.warn("[BiteBerry] Geen API key gevonden, bestelling wordt overgeslagen.");
        return { success: false, reason: "No API key configured" };
      }

      // 1. Process items / order lines
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

      // 2. Ensure delivery method is ALWAYS included as an explicit item on BiteBerry so operator/kitchen tablet sees it clearly:
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
        price: Math.round(line.price * 100), // In cents
        tax_rate: line.taxRate || 9, // Delivery service VAT 21%, Food 9%
        order_item_type: "standalone" as const,
        external_id: `OB-ITEM-${idx + 1}`
      }));

      // Charges: empty because delivery fee is cleanly included in items for full tablet & ticket visibility
      const charges: any[] = [];

      // 3. Discounts
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

      // 4. Contact details & Address
      // Live mode: Only mark as test order if explicitly called with isTest === true (e.g. via dev test endpoint)
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

      // Sanitize phone number so Biteberry contact_details.phone.number is ALWAYS filled
      let rawPhone = String(params.phone || '').trim();
      let digitsOnly = rawPhone.replace(/[^0-9]/g, '');
      if (digitsOnly.startsWith('31') && digitsOnly.length >= 10) {
        digitsOnly = '0' + digitsOnly.slice(2);
      }
      const cleanPhone = (digitsOnly && digitsOnly.length >= 6) ? digitsOnly : "0612345678";
      const address = parseDutchAddress(params.rawAddress, params.addressLabel, params.notes);
      const scheduleInfo = parseDeliverySchedule(params.deliveryDate, params.deliveryTime);

      // 5. Notes
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
          charges: charges.length > 0 ? charges : undefined,
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
      // 100% fail-safe: catch any unexpected network or parsing error
      console.error("[BiteBerry] Fout bij doorsturen naar BiteBerry (veilige fallback):", err?.message || err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  app.post("/api/send-invoice", async (req, res) => {
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
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.VITE_SUPABASE_URL;

      const supabaseAdmin = (serviceKey && supabaseUrl)
        ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
        : null;

      // Fetch company details to get billing_email
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
          isTest: false
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
                <h3 style="margin-top: 0; color: #0d47a1;">Interne Notitie (Office Butler)</h3>
                <p style="margin: 5px 0;">Er is zojuist een nieuwe bestelling geplaatst door <strong>${effectiveCompanyName}</strong>.</p>
                <p style="margin: 5px 0;">Controleer deze factuur en stuur deze vervolgens handmatig door naar: <a href="mailto:${emailRecipient}">${emailRecipient}</a></p>
              </div>

              <h2 style="color: #05053D;">Bevestiging Bestelling & Factuur</h2>
              <p>Beste ${effectiveCompanyName},</p>
              <p>Bedankt voor uw bestelling via Office Butler. Hieronder vindt u het overzicht van uw bestelling.</p>
              
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
              
              <p style="margin-top: 20px; font-size: 12px; color: #888;">Dit is een automatisch gegenereerd bericht van Office Butler.</p>
            </div>
          `;

          await resend.emails.send({
            from: 'Office Butler <info@office-butler.com>',
            to: ['info@office-butler.com'],
            subject: `Nieuwe Bestelling & Factuur - ${effectiveCompanyName}`,
            html: emailHtml
          });
          emailSent = true;
        } catch (mailErr) {
          console.error("Error sending invoice email (non-blocking):", mailErr);
        }
      }

      res.status(200).json({ success: true, emailSent, biteberry: biteberryResult });
    } catch (err: any) {
      console.error("Server error sending invoice:", err);
      res.status(500).json({ error: err.message });
    }
  });

  
  app.post("/api/send-guest-invoice", async (req, res) => {
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
          isTest: false
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
  });

  
  app.post("/api/resend-invoice", async (req, res) => {
    try {
      const { customerName, items, totalPrice, deliveryDate, deliveryTime, address, phone, notes } = req.body;
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ success: false, message: "Resend key missing" });
      }
      
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      
      let itemsHtml = items.map((item: any) => {
        return `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (${item.size} stuks)</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${Number(item.price).toFixed(2)}</td>
        </tr>`;
      }).join('');

      const emailHtml = `
        <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; color: #333;">
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
            <h3 style="margin-top: 0; color: #0d47a1;">HERVERZENDING: Factuur / Bestelling (Office Butler)</h3>
            <p style="margin: 5px 0;">Deze factuur is handmatig opnieuw verzonden vanuit het Moderator Paneel voor <strong>${customerName}</strong>.</p>
          </div>

          <h2 style="color: #05053D;">Overzicht Bestelling & Factuur</h2>
          <p>Beste Beheerder,</p>
          <p>Hierbij de herverzonden factuurgegevens van de bestelling van ${customerName}.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f4f6f9;">
                <th style="padding: 8px; text-align: left;">Product</th>
                <th style="padding: 8px; text-align: right;">Prijs</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td style="padding: 8px; font-weight: bold; text-align: right;">Totaal</td>
                <td style="padding: 8px; font-weight: bold; text-align: right;">€${Number(totalPrice).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f4f6f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #05053D;">Aflevergegevens & Notities</h3>
            <p style="margin: 5px 0; padding: 10px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; font-weight: bold; color: #e65100;">
              📅 Bezorgmoment: ${deliveryDate} om ${deliveryTime}
            </p>
            <p style="margin: 5px 0;"><strong>Bezorgadres:</strong> ${address || 'Onbekend'}</p>
            <p style="margin: 5px 0;"><strong>Contactnummer:</strong> ${phone || 'Onbekend'}</p>
            ${notes ? `<p style="margin: 5px 0;"><strong>Extra Notities / KVK:</strong><br/><pre style="white-space: pre-wrap; font-family: inherit;">${notes}</pre></p>` : ''}
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #888;">Dit is een automatisch gegenereerd bericht van Office Butler (Herverzending).</p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: 'Office Butler <info@office-butler.com>',
        to: ['info@office-butler.com'],
        subject: `[HERVERZONDEN] Factuur - ${customerName}`,
        html: emailHtml
      });

      if (error) {
        console.error("Error resending invoice email:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ success: true, data });
    } catch (err: any) {
      console.error("Server error resending invoice:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // BiteBerry Integration: Safe Read-Only Endpoints for Step 1
  app.get("/api/biteberry/stores", async (req, res) => {
    try {
      const apiKey = process.env.BITEBERRY_API_KEY || "ob_live_8f3a9e2b7c4d1f5e0a6b";
      const response = await fetch("https://api-core.biteberry.com/api/v1/stores", {
        headers: {
          "X-API-Key": apiKey
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err: any) {
      console.error("Error fetching BiteBerry stores:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/biteberry/storefronts", async (req, res) => {
    try {
      const apiKey = process.env.BITEBERRY_API_KEY || "ob_live_8f3a9e2b7c4d1f5e0a6b";
      const response = await fetch("https://api-core.biteberry.com/api/v1/storefronts", {
        headers: {
          "X-API-Key": apiKey
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err: any) {
      console.error("Error fetching BiteBerry storefronts:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // BiteBerry Integration: Dedicated safe test order endpoint
  app.post("/api/biteberry/test-order", async (req, res) => {
    try {
      const result = await sendOrderToBiteberry({
        isTest: true,
        customerName: req.body.customerName || "FAKE TEST - NIET BEREIDEN",
        email: req.body.email || "info@office-butler.com",
        phone: req.body.phone || "0612345678",
        rawAddress: req.body.address || "Muiderstraat 18, 1011 RB Amsterdam",
        orderLines: req.body.orderLines || [
          { product_name: "Bitterballen (10 stuks) [+ Mosterd]", portion_size: 10, price: 12.50, qty: 1 }
        ],
        deliveryDate: req.body.deliveryDate || new Date().toISOString().split('T')[0],
        deliveryTime: req.body.deliveryTime || "12:00",
        deliveryMethod: req.body.deliveryMethod || "Standaard Bezorging",
        deliveryMethodPrice: req.body.deliveryMethodPrice || 0,
        notes: req.body.notes || "FAKE TEST BESTELLING - NIET MAKEN OF BEZORGEN"
      });
      res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Helper to cancel an order in BiteBerry
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
      console.log(`[BiteBerry] Cancel order ${biteberryOrderId} response:`, res.status, data);
      return { success: res.ok, data };
    } catch (err: any) {
      console.error(`[BiteBerry] Fout bij annuleren order ${biteberryOrderId}:`, err?.message || err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  // Helper to find a matching BiteBerry order ID if not stored in extra_notes
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
      console.error("[BiteBerry] Lookup error:", e);
      return null;
    }
  }

  // API Endpoint: Order Cancel (Klant annulering)
  app.post("/api/orders/cancel", async (req, res) => {
    try {
      const {
        orderIds,
        reason,
        customerEmail,
        customerName,
        companyName,
        deliveryDate,
        deliveryTime,
        items,
        totalPrice,
        biteberryOrderId
      } = req.body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({ error: "Geen bestelling IDs opgegeven" });
      }

      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const apiKey = process.env.RESEND_API_KEY;

      if (!serviceKey || !supabaseUrl) {
        return res.status(500).json({ error: "Server configuratie ontbreekt (Supabase)" });
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // 0. Preparation Cutoff Check
      const { data: storeSetting } = await supabaseAdmin
        .from('store_settings')
        .select('page_content')
        .eq('id', 1)
        .maybeSingle();

      const minHours = Number(storeSetting?.page_content?.min_order_modify_hours ?? 2);

      // Haal regels op: controleer of er bedrijfsspecifieke regels zijn
      let effectiveRules = storeSetting?.page_content?.modification_rules;
      const targetCompanyId = req.body.companyId;
      if (targetCompanyId) {
        const { data: compData } = await supabaseAdmin
          .from('ob_companies')
          .select('custom_deadlines')
          .eq('id', targetCompanyId)
          .maybeSingle();
        if (compData?.custom_deadlines?.use_custom) {
          effectiveRules = compData.custom_deadlines;
        }
      }

      if (deliveryDate) {
        const cancelCheck = checkActionAllowed(
          'cancel',
          deliveryDate,
          deliveryTime,
          Number(totalPrice) || 0,
          effectiveRules,
          minHours
        );
        if (!cancelCheck.allowed) {
          return res.status(400).json({
            error: cancelCheck.message || `Bestellingen kunnen niet meer worden geannuleerd binnen ${cancelCheck.requiredHours} uur voor de gewenste bezorgtijd wegens voorbereidingstijd in de keuken.`
          });
        }
      }

      // 1. Update status to 'cancelled' in ob_orders
      const { error: dbError } = await supabaseAdmin
        .from('ob_orders')
        .update({
          status: 'cancelled',
          notes: reason ? `[GEANNULEERD: ${reason}]` : '[GEANNULEERD]'
        })
        .in('id', orderIds);

      if (dbError) {
        console.error("Fout bij bijwerken status in ob_orders:", dbError);
      }

      // 2. BiteBerry cancellation
      let biteberrySuccess = false;
      let targetBiteberryId = biteberryOrderId;

      if (!targetBiteberryId) {
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
            companyName: companyName,
            customerName: customerName
          });
        }
      }

      if (targetBiteberryId) {
        const cancelRes = await cancelBiteberryOrder(targetBiteberryId, reason);
        biteberrySuccess = cancelRes.success;
      }

      // 3. Send cancellation email via Resend
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
              <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Bestelling Geannuleerd</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Office Butler Order Beheer</p>
              </div>
              <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
                <p style="font-size: 16px;">Beste <strong>${companyName || customerName || 'Klant'}</strong>,</p>
                <p>De onderstaande bestelling is succesvol <strong>geannuleerd</strong>. Er wordt geen bereiding of bezorging meer uitgevoerd.</p>
                
                <div style="background-color: #fce4ec; border-left: 4px solid #d32f2f; padding: 14px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-weight: bold; color: #c2185b;">Status: Geannuleerd</p>
                  ${deliveryDate ? `<p style="margin: 4px 0 0 0; color: #555;">Oorspronkelijke bezorging: <strong>${deliveryDate} ${deliveryTime ? 'om ' + deliveryTime : ''}</strong></p>` : ''}
                  ${reason ? `<p style="margin: 4px 0 0 0; color: #555;">Opgegeven reden: <em>${reason}</em></p>` : ''}
                  ${targetBiteberryId ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">Biteberry Referentie: ${targetBiteberryId}</p>` : ''}
                </div>

                ${itemsListHtml ? `
                  <h3 style="font-size: 15px; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 6px;">Geannuleerde Producten:</h3>
                  <ul style="padding-left: 20px; color: #555;">${itemsListHtml}</ul>
                ` : ''}

                ${totalPrice ? `<p style="font-weight: bold; margin-top: 15px;">Oorspronkelijk Totaalbedrag: €${Number(totalPrice).toFixed(2)}</p>` : ''}

                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
                <p style="font-size: 13px; color: #777;">Heeft u vragen of wilt u op een ander moment bestellen? Neem gerust contact op via <a href="mailto:info@office-butler.com" style="color: #1a2a47;">info@office-butler.com</a> of via WhatsApp.</p>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: 'Office Butler <info@office-butler.com>',
            to: recipientList,
            subject: `❌ Bestelling Geannuleerd - ${companyName || customerName || 'Klant'}`,
            html: emailHtml
          });
        } catch (emailErr) {
          console.error("Fout bij verzenden annuleringsmail:", emailErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Bestelling succesvol geannuleerd.",
        biteberrySuccess
      });
    } catch (err: any) {
      console.error("Fout in /api/orders/cancel:", err);
      return res.status(500).json({ error: err?.message || "Interne fout bij annuleren" });
    }
  });

  // API Endpoint: Order Modify (Klant bestelling wijzigen)
  app.post("/api/orders/modify", async (req, res) => {
    try {
      const {
        orderIds,
        newDeliveryDate,
        newDeliveryTime,
        newAddressId,
        newNotes,
        newPhone,
        customerEmail,
        customerName,
        companyName,
        oldDeliveryDate,
        oldDeliveryTime,
        items,
        totalPrice,
        biteberryOrderId
      } = req.body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({ error: "Geen bestelling IDs opgegeven" });
      }

      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const apiKey = process.env.RESEND_API_KEY;

      if (!serviceKey || !supabaseUrl) {
        return res.status(500).json({ error: "Server configuratie ontbreekt (Supabase)" });
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // 1. Fetch base row for metadata inheritance
      const { data: existingRows } = await supabaseAdmin
        .from('ob_orders')
        .select('*')
        .in('id', orderIds);

      const baseRow = (existingRows && existingRows.length > 0) ? existingRows[0] : null;

      // 0. Preparation Cutoff Check using granular deadlines
      const { data: storeSetting } = await supabaseAdmin
        .from('store_settings')
        .select('page_content')
        .eq('id', 1)
        .maybeSingle();

      const minHours = Number(storeSetting?.page_content?.min_order_modify_hours ?? 2);

      // Check for company specific deadlines
      let effectiveRules = storeSetting?.page_content?.modification_rules;
      const targetCompanyId = req.body.companyId || baseRow?.company_id;
      if (targetCompanyId) {
        const { data: compData } = await supabaseAdmin
          .from('ob_companies')
          .select('custom_deadlines')
          .eq('id', targetCompanyId)
          .maybeSingle();
        if (compData?.custom_deadlines?.use_custom) {
          effectiveRules = compData.custom_deadlines;
        }
      }

      if (oldDeliveryDate) {
        const checkDate = oldDeliveryDate;
        const checkTime = oldDeliveryTime;
        const orderAmount = Number(totalPrice) || 0;

        // Check A: Datum of tijdstip gewijzigd?
        const isTimeChanged = (newDeliveryDate && newDeliveryDate !== oldDeliveryDate) || 
                              (newDeliveryTime && newDeliveryTime !== oldDeliveryTime);
        if (isTimeChanged) {
          const timeCheck = checkActionAllowed('change_time', checkDate, checkTime, orderAmount, effectiveRules, minHours);
          if (!timeCheck.allowed) {
            return res.status(400).json({
              error: timeCheck.message || `Het bezorgmoment kan niet meer worden gewijzigd binnen ${timeCheck.requiredHours} uur voor de levering.`
            });
          }
        }

        // Check B: Locatie gewijzigd?
        const isLocationChanged = Boolean(newAddressId && baseRow?.address_id && newAddressId !== baseRow.address_id);
        if (isLocationChanged) {
          const locCheck = checkActionAllowed('change_location', checkDate, checkTime, orderAmount, effectiveRules, minHours);
          if (!locCheck.allowed) {
            return res.status(400).json({
              error: locCheck.message || `De bezorglocatie kan niet meer worden gewijzigd binnen ${locCheck.requiredHours} uur voor de levering.`
            });
          }
        }

        // Check C: Producten toegevoegd of verwijderd?
        if (items && Array.isArray(items)) {
          const keptItemIds = items.filter((it: any) => it.id && orderIds.includes(it.id)).map((it: any) => it.id);
          const hasRemoved = orderIds.some((id: string) => !keptItemIds.includes(id));
          const hasAdded = items.some((it: any) => !it.id || it.is_new || !orderIds.includes(it.id));

          if (hasRemoved) {
            const remCheck = checkActionAllowed('remove_products', checkDate, checkTime, orderAmount, effectiveRules, minHours);
            if (!remCheck.allowed) {
              return res.status(400).json({
                error: remCheck.message || `Producten kunnen niet meer worden verwijderd binnen ${remCheck.requiredHours} uur voor de levering.`
              });
            }
          }

          if (hasAdded) {
            const addCheck = checkActionAllowed('add_products', checkDate, checkTime, orderAmount, effectiveRules, minHours);
            if (!addCheck.allowed) {
              return res.status(400).json({
                error: addCheck.message || `Extra producten kunnen niet meer worden toegevoegd binnen ${addCheck.requiredHours} uur voor de levering.`
              });
            }
          }
        } else if (!isTimeChanged && !isLocationChanged) {
          // Algemene wijzigingscontrole
          const genCheck = checkActionAllowed('change_time', checkDate, checkTime, orderAmount, effectiveRules, minHours);
          if (!genCheck.allowed) {
            return res.status(400).json({
              error: genCheck.message || `Bestellingen kunnen niet meer worden aangepast binnen ${genCheck.requiredHours} uur voor bezorging.`
            });
          }
        }
      }

      // 2. Synchronize products in ob_orders
      const updateData: any = {};
      if (newDeliveryDate) updateData.delivery_date = newDeliveryDate;
      if (newDeliveryTime) updateData.delivery_time = newDeliveryTime;
      if (newAddressId) updateData.address_id = newAddressId;
      if (newNotes !== undefined) updateData.notes = newNotes;
      if (newPhone) updateData.phone = newPhone;

      if (items && Array.isArray(items) && items.length > 0) {
        // A. Identify kept items
        const keptItemIds = items
          .filter((it: any) => it.id && orderIds.includes(it.id))
          .map((it: any) => it.id);

        // B. Identify and delete removed items
        const removedItemIds = orderIds.filter((id: string) => !keptItemIds.includes(id));
        if (removedItemIds.length > 0) {
          await supabaseAdmin
            .from('ob_orders')
            .delete()
            .in('id', removedItemIds);
        }

        // C. Update kept items
        if (keptItemIds.length > 0) {
          await supabaseAdmin
            .from('ob_orders')
            .update(updateData)
            .in('id', keptItemIds);
        }

        // D. Insert newly added items
        const newItems = items.filter((it: any) => !it.id || it.is_new || !orderIds.includes(it.id));
        if (newItems.length > 0 && baseRow) {
          const rowsToInsert = newItems.map((it: any) => ({
            company_id: baseRow.company_id,
            user_id: baseRow.user_id,
            address_id: newAddressId || baseRow.address_id,
            delivery_date: newDeliveryDate || baseRow.delivery_date,
            delivery_time: newDeliveryTime || baseRow.delivery_time,
            notes: newNotes !== undefined ? newNotes : baseRow.notes,
            phone: newPhone || baseRow.phone,
            product_name: it.product_name,
            portion_size: Number(it.portion_size) || 1,
            price: Number(it.price) || 0,
            total_price: Number(it.total_price || it.price) || 0,
            status: baseRow.status || 'pending',
            extra_notes: baseRow.extra_notes,
            created_at: baseRow.created_at
          }));

          const { error: insertErr } = await supabaseAdmin.from('ob_orders').insert(rowsToInsert);
          if (insertErr) {
            console.error("Fout bij toevoegen nieuwe producten aan ob_orders:", insertErr);
          }
        }
      } else {
        const { error: dbError } = await supabaseAdmin
          .from('ob_orders')
          .update(updateData)
          .in('id', orderIds);

        if (dbError) {
          console.error("Fout bij bijwerken bestelling in ob_orders:", dbError);
        }
      }

      // 2. Update / Reschedule in Biteberry
      let biteberrySuccess = false;
      let targetBiteberryId = biteberryOrderId;

      if (!targetBiteberryId) {
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
            phone: orderRow?.phone || newPhone,
            companyName: companyName,
            customerName: customerName
          });
        }
      }

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
              if (reschData.duplicated_order?.id) {
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

          // Also PATCH notes on the order for kitchen & operator
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
        } catch (bbErr) {
          console.error("[BiteBerry] Fout bij wijzigen in Biteberry:", bbErr);
        }
      }

      // 3. Send email confirmation via Resend
      if (apiKey) {
        try {
          const resend = new Resend(apiKey);
          const recipientList = ['info@office-butler.com'];
          if (customerEmail && customerEmail.includes('@') && !recipientList.includes(customerEmail)) {
            recipientList.push(customerEmail);
          }

          const itemsListHtml = (items && Array.isArray(items)) 
            ? items.map((it: any) => `<li>${it.product_name} (${it.portion_size} stuks)</li>`).join('')
            : '';

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
              <div style="background-color: #1a2a47; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Bestelling Gewijzigd</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Office Butler Order Beheer</p>
              </div>
              <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
                <p style="font-size: 16px;">Beste <strong>${companyName || customerName || 'Klant'}</strong>,</p>
                <p>De gegevens van uw bestelling zijn succesvol <strong>aangepast</strong>.</p>
                
                <div style="background-color: #e8f5e9; border-left: 4px solid #2e7d32; padding: 14px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-weight: bold; color: #2e7d32; font-size: 15px;">
                    ✨ Nieuw Bezorgmoment: ${newDeliveryDate} om ${newDeliveryTime}
                  </p>
                  ${(oldDeliveryDate || oldDeliveryTime) ? `
                    <p style="margin: 4px 0 0 0; color: #777; font-size: 13px; text-decoration: line-through;">
                      Oud bezorgmoment: ${oldDeliveryDate || ''} ${oldDeliveryTime ? 'om ' + oldDeliveryTime : ''}
                    </p>
                  ` : ''}
                  ${newNotes ? `<p style="margin: 8px 0 0 0; color: #333;"><strong>Nieuwe instructies:</strong> ${newNotes}</p>` : ''}
                  ${newPhone ? `<p style="margin: 4px 0 0 0; color: #555;">Telefoonnummer: ${newPhone}</p>` : ''}
                  ${targetBiteberryId ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">Biteberry Referentie: ${targetBiteberryId}</p>` : ''}
                </div>

                ${itemsListHtml ? `
                  <h3 style="font-size: 15px; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 6px;">Producten in deze bestelling:</h3>
                  <ul style="padding-left: 20px; color: #555;">${itemsListHtml}</ul>
                ` : ''}

                ${totalPrice ? `<p style="font-weight: bold; margin-top: 15px;">Totaalbedrag: €${Number(totalPrice).toFixed(2)}</p>` : ''}

                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
                <p style="font-size: 13px; color: #777;">Heeft u nog verdere vragen? Neem gerust contact met ons op via <a href="mailto:info@office-butler.com" style="color: #1a2a47;">info@office-butler.com</a>.</p>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: 'Office Butler <info@office-butler.com>',
            to: recipientList,
            subject: `✏️ Bestelling Gewijzigd - ${companyName || customerName || 'Klant'}`,
            html: emailHtml
          });
        } catch (emailErr) {
          console.error("Fout bij verzenden wijzigingsmail:", emailErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Bestelling succesvol gewijzigd.",
        biteberrySuccess
      });
    } catch (err: any) {
      console.error("Fout in /api/orders/modify:", err);
      return res.status(500).json({ error: err?.message || "Interne fout bij wijzigen" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
