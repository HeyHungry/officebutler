import { createClient } from "@supabase/supabase-js";

// Helper to parse Dutch address strings into BiteBerry address components
export function parseDutchAddress(rawAddress: string, label?: string, notes?: string) {
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
export function parseDeliverySchedule(deliveryDate?: string, deliveryTime?: string) {
  const now = new Date();
  if (!deliveryDate || !deliveryTime || deliveryTime.toLowerCase().includes("snel") || deliveryTime.toLowerCase().includes("zsm")) {
    const defaultFinished = new Date(now.getTime() + 45 * 60 * 1000); // +45 min estimated delivery
    const defaultReady = new Date(now.getTime() + 20 * 60 * 1000); // +20 min kitchen ready
    return {
      scheduled_order: false,
      estimated_finished_at: defaultFinished.toISOString(),
      estimated_ready_at: defaultReady.toISOString()
    };
  }

  const timeMatch = deliveryTime.match(/(\d{1,2}):(\d{2})/);
  const dateMatch = deliveryDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!timeMatch || !dateMatch) {
    const defaultFinished = new Date(now.getTime() + 45 * 60 * 1000);
    const defaultReady = new Date(now.getTime() + 20 * 60 * 1000);
    return {
      scheduled_order: false,
      estimated_finished_at: defaultFinished.toISOString(),
      estimated_ready_at: defaultReady.toISOString()
    };
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
    const defaultFinished = new Date(now.getTime() + 45 * 60 * 1000);
    const defaultReady = new Date(now.getTime() + 20 * 60 * 1000);
    return {
      scheduled_order: false,
      estimated_finished_at: defaultFinished.toISOString(),
      estimated_ready_at: defaultReady.toISOString()
    };
  }

  const readyAt = new Date(finishedAt.getTime() - 30 * 60 * 1000); // 30 minutes before delivery for kitchen prep
  const isFuture = finishedAt.getTime() > (Date.now() + 15 * 60 * 1000);

  return {
    scheduled_order: isFuture,
    is_future: isFuture,
    estimated_finished_at: finishedAt.toISOString(),
    estimated_ready_at: readyAt.toISOString()
  };
}

// 100% Fail-Safe function to format and send orders to BiteBerry
export async function sendOrderToBiteberry(params: {
  customerName: string;
  email?: string;
  phone: string;
  rawAddress: string;
  addressLabel?: string;
  companyName?: string;
  brand?: string;
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

    let kitchenInfoMap: Record<string, { kitchen_name?: string; ingredients?: string; prep_instructions?: string; variant_kitchen_names?: Record<string, string> }> = {};
    let dbProducts: { id: string; name: string; variant_kitchen_names?: Record<string, string> }[] = [];
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

    // Use passed supabaseAdmin or create one if keys exist
    const adminClient = params.supabaseAdmin || ((serviceKey && supabaseUrl)
      ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null);

    if (adminClient) {
      try {
        const [storeRes, prodRes] = await Promise.all([
          adminClient.from('store_settings').select('page_content').eq('id', 1).maybeSingle(),
          adminClient.from('ob_products').select('id, name')
        ]);
        const storeRow = storeRes?.data;
        if (prodRes?.data) {
          dbProducts = prodRes.data;
        }
        if (storeRow?.page_content?.biteberry_storefront_id?.trim() && storeRow.page_content.biteberry_storefront_id.trim() !== "4f6adec7-55d6-4bdb-b719-a37f44a3fc19") {
          storefrontId = storeRow.page_content.biteberry_storefront_id.trim();
        }
        if (storeRow?.page_content?.biteberry_api_key?.trim()) {
          apiKey = storeRow.page_content.biteberry_api_key.trim();
        }
        if (storeRow?.page_content?.product_kitchen_info) {
          kitchenInfoMap = storeRow.page_content.product_kitchen_info;
        }
      } catch (e) {
        // Fallback to env / default
      }
    }

    if (!apiKey) {
      console.warn("[BiteBerry] Geen API key gevonden, bestelling wordt overgeslagen.");
      return { success: false, reason: "No API key configured" };
    }

    // Determine brand details (office, canal, snack)
    const rawBrand = (params.brand || process.env.VITE_BRAND_ID || 'office_butler').trim().toLowerCase();
    let brandCourier = "office butler";
    let brandPlatform = "office";
    let brandName = "Office Butler";
    let brandPrefix = "OB";

    if (rawBrand.includes('canal')) {
      brandCourier = "canal butler";
      brandPlatform = "canal";
      brandName = "Canal Butler";
      brandPrefix = "CB";
    } else if (rawBrand.includes('snack')) {
      brandCourier = "snack butler";
      brandPlatform = "snack";
      brandName = "Snack Butler";
      brandPrefix = "SB";
    }

    // 1. Process items / order lines
    const parsedLines: { name: string; qty: number; price: number; taxRate?: number; variant?: string }[] = [];
    if (params.orderLines && Array.isArray(params.orderLines) && params.orderLines.length > 0) {
      for (const line of params.orderLines) {
        const isDelivery = Boolean(line.product_name && (line.product_name.startsWith("Bezorging:") || line.product_name.toLowerCase().includes("levering:")));
        const alreadyHasPortion = Boolean(line.product_name && (line.product_name.toLowerCase().includes("stuks") || line.product_name.toLowerCase().includes("stuk")));
        const portionSuffix = (!isDelivery && !alreadyHasPortion && line.portion_size) ? ` (${line.portion_size} stuks)` : "";
        parsedLines.push({
          name: `${line.product_name}${portionSuffix}`,
          qty: Math.max(1, Number(line.qty) || 1),
          price: Math.max(0, Number(line.price) || 0),
          taxRate: isDelivery ? 21 : 9,
          variant: line.variant || undefined
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
            taxRate: 9,
            variant: variant || undefined
          });
        }
      }
    }

    // 2. Ensure delivery method is ALWAYS included as an explicit item on BiteBerry so operator/kitchen tablet sees it clearly:
    const deliveryPriceNum = params.deliveryMethodPrice && Number(params.deliveryMethodPrice) > 0
      ? Number(params.deliveryMethodPrice)
      : 0;

    if (deliveryPriceNum > 0 && !parsedLines.some(l => l.name.toLowerCase().includes("bezorging") || l.name.toLowerCase().includes("levering"))) {
      parsedLines.push({
        name: `${brandName} levering: ${params.deliveryMethod || "Standaard Bezorging"}`,
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

    const items = parsedLines.map((line, idx) => {
      return {
        name: line.name,
        quantity: line.qty,
        price: Math.round(line.price * 100), // In cents
        tax_rate: line.taxRate || 9,
        order_item_type: "standalone" as const,
        external_id: `${brandPrefix}-ITEM-${idx + 1}`
      };
    });

    const charges: any[] = [];
    const discounts: any[] = [];
    const discountCents = params.discountAmount && Number(params.discountAmount) > 0
      ? Math.round(Number(params.discountAmount) * 100)
      : 0;

    if (discountCents > 0) {
      discounts.push({
        discount_type: "all",
        amount: discountCents,
        name: params.discountCode ? `Korting (${params.discountCode})` : "Korting",
        external_id: `${brandPrefix}-DISCOUNT-${params.discountCode || "CODE"}`
      });
    }

    const activeItems = items.length > 0 ? items : [
      {
        name: `${brandName} Catering`,
        quantity: 1,
        price: 100,
        tax_rate: 9,
        order_item_type: "standalone" as const,
        external_id: `${brandPrefix}-ITEM-1`
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

    // English delivery method translation
    let engDeliveryMethod = "Standard Delivery";
    const rawDeliveryMethod = (params.deliveryMethod || "").trim().toLowerCase();
    if (rawDeliveryMethod) {
      if (rawDeliveryMethod.includes("uitpakken") || rawDeliveryMethod.includes("stallen") || rawDeliveryMethod.includes("setup")) {
        engDeliveryMethod = "Unpack & Setup";
      } else if (rawDeliveryMethod.includes("butler") || rawDeliveryMethod.includes("premium")) {
        engDeliveryMethod = "Butler Service";
      } else if (rawDeliveryMethod.includes("kade") || rawDeliveryMethod.includes("dock")) {
        engDeliveryMethod = "Dockside Delivery";
      } else if (rawDeliveryMethod.includes("afhaal") || rawDeliveryMethod.includes("pickup") || rawDeliveryMethod.includes("ophalen")) {
        engDeliveryMethod = "Pick-up";
      } else if (rawDeliveryMethod.includes("gratis") || rawDeliveryMethod.includes("standaard") || rawDeliveryMethod.includes("bezorging") || rawDeliveryMethod.includes("delivery")) {
        engDeliveryMethod = "Standard Delivery";
      } else {
        engDeliveryMethod = params.deliveryMethod ? params.deliveryMethod.trim() : "Standard Delivery";
      }
    }

    // Build product kitchen data (kitchen_name, ingredients, prep_instructions)
    const kitchenProducts: {
      qty: number;
      kitchenName: string;
      portionStr: string;
      ingredients?: string;
      prepInstructions?: string;
    }[] = [];

    for (const line of parsedLines) {
      if (line.name.startsWith("Bezorging:") || line.name.toLowerCase().includes("levering:") || line.name.startsWith("GRATIS:")) continue;
      const rawName = line.name || "";
      const cleanName = rawName.replace(/\s*\(\d+\s*stuks\)/i, "").replace(/\s*\[\+.*?\]/g, "").trim();

      // Extract variant from line.variant or parentheses (e.g. "Bitterballen (Vega)" -> variant "Vega", base "Bitterballen")
      const variantInParen = cleanName.match(/\(([^)]+)\)$/);
      const detectedVariant = (line.variant || (variantInParen ? variantInParen[1].trim() : "")).trim();
      const baseNameWithoutVariant = detectedVariant ? cleanName.replace(/\s*\([^)]+\)$/, "").trim() : cleanName;

      const prod = dbProducts.find((p: any) =>
        p.name?.trim().toLowerCase() === baseNameWithoutVariant.toLowerCase() ||
        p.name?.trim().toLowerCase() === cleanName.toLowerCase() ||
        cleanName.toLowerCase().includes(p.name?.trim().toLowerCase())
      );

      const match = (prod && kitchenInfoMap[prod.id]) ||
                    kitchenInfoMap[baseNameWithoutVariant] ||
                    kitchenInfoMap[cleanName] ||
                    kitchenInfoMap[rawName] ||
                    Object.entries(kitchenInfoMap).find(([key]) => {
                      const kClean = key.trim().toLowerCase();
                      return rawName.toLowerCase().includes(kClean) || cleanName.toLowerCase() === kClean;
                    })?.[1];

      const portionMatch = rawName.match(/\((\d+\s*stuks)\)/i);
      const portionStr = portionMatch ? ` (${portionMatch[1]})` : "";

      // Check for variant-specific kitchen name
      let kTitle = "";
      const variantMap = (match as any)?.variant_kitchen_names || (prod as any)?.variant_kitchen_names || {};
      if (detectedVariant && variantMap) {
        if (variantMap[detectedVariant]?.trim()) {
          kTitle = variantMap[detectedVariant].trim();
        } else {
          const foundKey = Object.keys(variantMap).find(k => k.trim().toLowerCase() === detectedVariant.toLowerCase());
          if (foundKey && variantMap[foundKey]?.trim()) {
            kTitle = variantMap[foundKey].trim();
          }
        }
      }

      // If no variant-specific kitchen name was configured:
      if (!kTitle) {
        const baseKName = match?.kitchen_name?.trim();
        if (baseKName) {
          if (detectedVariant && !baseKName.toLowerCase().includes(detectedVariant.toLowerCase())) {
            kTitle = `${baseKName} (${detectedVariant})`;
          } else {
            kTitle = baseKName;
          }
        } else {
          kTitle = cleanName;
        }
      }

      kitchenProducts.push({
        qty: line.qty,
        kitchenName: kTitle,
        portionStr,
        ingredients: match?.ingredients?.trim() || undefined,
        prepInstructions: match?.prep_instructions?.trim() || undefined
      });
    }

    // 1. Opmerking voor de koerier (courier_note):
    const courierAddress = [address.line1, address.zipcode, address.city].filter(Boolean).join(", ") || (params.rawAddress ? params.rawAddress.trim() : "Adres op aanvraag");
    const courierSections: string[] = [
      brandCourier,
      courierAddress,
      engDeliveryMethod
    ];

    if (params.notes && params.notes.trim()) {
      courierSections.push(params.notes.trim());
    }

    courierSections.push(`${cleanPhone} - ${effectiveCustomerName}`);

    if (kitchenProducts.length > 0) {
      const productLines = kitchenProducts.map(kp => `${kp.qty}x ${kp.kitchenName}${kp.portionStr}`).join("\n");
      courierSections.push(productLines);
    }

    const finalCourierNote = courierSections.filter(Boolean).join("\n\n");

    // 2. Opmerking voor de operator (operator_note):
    const effectiveEmail = (params.email && params.email.includes('@')) ? params.email.trim() : "info@office-butler.com";
    const companyDisplay = params.companyName?.trim() || "Geen bedrijf";
    const operatorSections: string[] = [
      effectiveCustomerName,
      companyDisplay,
      effectiveEmail,
      brandPlatform
    ];
    const finalOperatorNote = operatorSections.filter(Boolean).join("\n\n");

    // 3. Opmerking voor de keuken (kitchen_note):
    const kitchenSections: string[] = [
      brandPlatform
    ];

    if (kitchenProducts.length > 0) {
      const itemBlocks: string[] = [];
      for (const kp of kitchenProducts) {
        const itemParts = [`${kp.kitchenName} - ${kp.qty}x${kp.portionStr}`];
        if (kp.ingredients) {
          itemParts.push(`Ingrediënten: ${kp.ingredients}`);
        }
        itemBlocks.push(itemParts.join("\n"));
      }
      kitchenSections.push(itemBlocks.join("\n\n"));
    }

    const clientAndCompany = params.companyName?.trim()
      ? `${effectiveCustomerName} (${params.companyName.trim()})`
      : effectiveCustomerName;
    kitchenSections.push(clientAndCompany);

    if (params.notes && params.notes.trim()) {
      kitchenSections.push(`Extra opmerking: ${params.notes.trim()}`);
    }

    const finalKitchenNote = kitchenSections.filter(Boolean).join("\n\n").trim();

    const orderPayload = {
      order: {
        storefront_id: storefrontId,
        order_type: "delivery",
        delivery_type: "own_fleet",
        is_test: isTestOrder,
        scheduled_order: scheduleInfo.scheduled_order,
        estimated_finished_at: scheduleInfo.estimated_finished_at,
        estimated_ready_at: scheduleInfo.estimated_ready_at,
        external_id: `${brandPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        kitchen_note: finalKitchenNote,
        operator_note: finalOperatorNote,
        sub_total: subTotalCents,
        grand_total: grandTotalCents,
        contact_details: {
          first_name: firstName,
          last_name: lastName,
          email: effectiveEmail,
          phone: {
            number: cleanPhone,
            country_code: "+31"
          },
          courier_note: finalCourierNote,
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
            name: "Op factuur",
            description: "Op factuur",
            external_id: `${brandPrefix}-PAY-${Date.now()}`
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
    console.error("[BiteBerry] Fout bij doorsturen naar BiteBerry (veilige fallback):", err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}
