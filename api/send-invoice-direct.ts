import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      recipientEmail,
      invoiceType = 'single', // 'single' | 'monthly'
      invoiceNumber,
      invoiceDate,
      dueDate,
      monthName,
      sellerDetails = {},
      clientDetails = {},
      items = [],
      subtotalExcl = 0,
      vatAmount = 0,
      totalAmount = 0,
      discountAmount = 0,
      discountCode = '',
      customSubject,
      customIntro,
      customOutro,
    } = req.body;

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ error: 'Geen geldig e-mailadres voor de klant opgegeven.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured.");
      return res.status(200).json({ 
        success: false, 
        message: "Resend API key ontbreekt in de serverconfiguratie (RESEND_API_KEY)." 
      });
    }

    const resend = new Resend(apiKey);

    const isMonthly = invoiceType === 'monthly';
    const brandName = sellerDetails.brandName || 'Office Butler';
    const logoUrl = sellerDetails.logoUrl || 'https://i.imgur.com/ymXR7tL.png';
    const sellerName = sellerDetails.name || 'Mokum Local Kitchen';
    const sellerKvk = sellerDetails.kvk || '99852667';
    const sellerVat = sellerDetails.vat || 'NL868877037B01';
    const sellerIban = sellerDetails.iban || 'NL16ABNA0153600063';
    const sellerBic = sellerDetails.bic || 'ABNANL2A';
    const sellerEmail = sellerDetails.email || 'info@office-butler.com';
    const sellerAddress = sellerDetails.address || 'Muiderstraat 18-s, 1011 RB Amsterdam';
    const paymentDays = sellerDetails.paymentTermsDays || 14;

    const clientName = clientDetails.name || (isMonthly ? 'Zakelijke Klant' : 'Klant');
    const clientPhone = clientDetails.phone || '';
    const clientAddress = clientDetails.address || '';
    const clientBillingInfo = clientDetails.billingInfo || '';

    // Build Subject
    let subject = customSubject;
    if (!subject) {
      subject = isMonthly
        ? `Verzamelfactuur ${monthName || ''} - ${invoiceNumber} - ${clientName}`
        : `Factuur ${invoiceNumber} - ${clientName} (${sellerName})`;
    }

    // Build Items Table HTML
    let tableRowsHtml = '';
    if (isMonthly) {
      tableRowsHtml = items.map((row: any, idx: number) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        const netPayable = Number(row.netPayable || row.gross || 0);
        const exclVat = Number(row.exclVat || netPayable / 1.09);
        return `
          <tr style="background-color: ${bg}; border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: 600; white-space: nowrap;">
              ${row.dateFormatted || row.date || ''}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #374151;">
              <div style="font-weight: 600; color: #05053D;">${row.summary || 'Catering & Hapjes'}</div>
              ${row.location ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">📍 ${row.location}</div>` : ''}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #374151; text-align: center;">
              ${row.itemsCount || 1} st.
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: right;">
              €${exclVat.toFixed(2)}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #111827; text-align: right; font-weight: 600;">
              €${netPayable.toFixed(2)}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #4b5563; text-align: center;">
              9%
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tableRowsHtml = items.map((item: any, idx: number) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        const lineTotal = Number(item.totalIncl || (item.unitPriceIncl * item.qty) || item.price || 0);
        const unitPrice = Number(item.unitPriceIncl || item.price || 0);
        const unitPriceExcl = unitPrice / 1.09;
        const lineTotalExcl = lineTotal / 1.09;
        return `
          <tr style="background-color: ${bg}; border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: 600; text-align: center;">
              ${item.qty || item.quantity || 1}x
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: 600;">
              ${item.name || item.product_name || 'Product'}
              ${item.portionSize ? `<span style="font-size: 11px; color: #6b7280; font-weight: normal; margin-left: 4px;">(${item.portionSize} stuks)</span>` : ''}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: right;">
              €${unitPriceExcl.toFixed(2)}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: right;">
              €${unitPrice.toFixed(2)}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: right;">
              €${lineTotalExcl.toFixed(2)}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #111827; text-align: right; font-weight: 600;">
              €${lineTotal.toFixed(2)}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #4b5563; text-align: center;">
              9%
            </td>
          </tr>
        `;
      }).join('');
    }

    // Intro & Outro text
    const defaultIntro = isMonthly
      ? `Beste ${clientName},<br/><br/>Hierbij ontvangt u de officiële verzamelfactuur voor alle geleverde cateringopdrachten in ${monthName || 'afgelopen periode'}. In onderstaand overzicht vindt u de details per levering.`
      : `Beste ${clientName},<br/><br/>Hartelijk dank voor uw bestelling. Hieronder vindt u de factuurspecificatie met alle details en betaalgegevens.`;

    const introHtml = customIntro 
      ? customIntro
          .replace(/\{klantnaam\}/g, clientName)
          .replace(/\{bedrijfsnaam\}/g, sellerName)
          .replace(/\{factuurnummer\}/g, invoiceNumber || '')
          .replace(/\{maand\}/g, monthName || '')
          .replace(/\{betaaltermijn\}/g, String(paymentDays))
          .replace(/\{email\}/g, sellerEmail)
          .replace(/\n/g, '<br/>')
      : defaultIntro;

    const defaultOutro = `Wij verzoeken u vriendelijk het totaalbedrag binnen <strong>${paymentDays} dagen</strong> over te maken naar ons rekeningnummer.<br/><br/>Heeft u vragen over deze factuur? Neem gerust contact met ons op via <a href="mailto:${sellerEmail}" style="color: #b58b4c; text-decoration: underline;">${sellerEmail}</a>.`;

    const outroHtml = customOutro
      ? customOutro
          .replace(/\{klantnaam\}/g, clientName)
          .replace(/\{bedrijfsnaam\}/g, sellerName)
          .replace(/\{factuurnummer\}/g, invoiceNumber || '')
          .replace(/\{maand\}/g, monthName || '')
          .replace(/\{betaaltermijn\}/g, String(paymentDays))
          .replace(/\{email\}/g, sellerEmail)
          .replace(/\n/g, '<br/>')
      : defaultOutro;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
        <div style="max-width: 660px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Header Bar -->
          <div style="background-color: #05053D; border-bottom: 3px solid #b58b4c; padding: 20px 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; width: 68px;">
                  <div style="background-color: #151f33; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; width: 56px; height: 56px; display: inline-flex; align-items: center; justify-content: center;">
                    <img src="${logoUrl}" alt="${brandName}" style="width: 100%; height: 100%; display: block; object-fit: cover;" />
                  </div>
                </td>
                <td style="vertical-align: middle; padding-left: 16px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">${brandName}</h1>
                  <p style="margin: 2px 0 0 0; color: #cbd5e1; font-size: 12px;">Catering &amp; Borrelservice &bull; Keuken ${sellerName}</p>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  <span style="display: inline-block; background-color: rgba(181, 139, 76, 0.2); border: 1px solid #b58b4c; color: #e2c185; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                    ${isMonthly ? 'Verzamelfactuur' : 'Factuur'}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body Container -->
          <div style="padding: 28px 30px;">
            
            <!-- Intro Text -->
            <div style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
              ${introHtml}
            </div>

            <!-- Invoice & Client Meta Box -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 12px; font-size: 12px; line-height: 1.5;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Factuurgegevens</div>
                    <div style="font-weight: 700; color: #05053D; font-size: 14px; margin-bottom: 2px;">${invoiceNumber}</div>
                    <div style="color: #475569;"><strong>Factuurdatum:</strong> ${invoiceDate || ''}</div>
                    <div style="color: #475569;"><strong>Vervaldatum:</strong> ${dueDate || ''} (${paymentDays} dagen)</div>
                    <div style="color: #475569;"><strong>Betalingskenmerk:</strong> <span style="font-family: monospace;">${invoiceNumber}</span></div>
                    ${isMonthly ? `<div style="color: #b58b4c; font-weight: 600; margin-top: 3px;">Periode: ${monthName}</div>` : ''}
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 12px; font-size: 12px; line-height: 1.5; border-left: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Geadresseerde</div>
                    <div style="font-weight: 700; color: #05053D; font-size: 14px; margin-bottom: 2px;">${clientName}</div>
                    ${clientAddress ? `<div style="color: #475569;">📍 ${clientAddress}</div>` : ''}
                    ${clientPhone ? `<div style="color: #475569;">📞 ${clientPhone}</div>` : ''}
                    <div style="color: #475569;">✉️ ${recipientEmail}</div>
                    ${clientBillingInfo ? `<div style="color: #64748b; font-size: 11px; margin-top: 4px; white-space: pre-wrap;">${clientBillingInfo}</div>` : ''}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Items Table -->
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f1f5f9; color: #1e293b; border-bottom: 2px solid #cbd5e1;">
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600;">
                      Aantal
                    </th>
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600;">
                      ${isMonthly ? 'Specificatie / Locatie' : 'Omschrijving'}
                    </th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600;">
                      Bedrag Excl. BTW
                    </th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600;">
                      Bedrag Inc. BTW
                    </th>
                    ${!isMonthly ? `
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600;">
                      Totaal Excl. BTW
                    </th>
                    ` : ''}
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600;">
                      Totaal Inc. BTW
                    </th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600;">
                      BTW
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRowsHtml}
                  ${discountAmount > 0 ? `
                    <tr style="background-color: #fef2f2; border-bottom: 1px solid #fee2e2;">
                      <td colspan="3" style="padding: 10px 12px; font-size: 13px; color: #991b1b; font-weight: 600;">
                        Korting ${discountCode ? `(${discountCode})` : ''}
                      </td>
                      <td style="padding: 10px 12px; font-size: 13px; color: #991b1b; text-align: right; font-weight: 700;">
                        -€${Number(discountAmount).toFixed(2)}
                      </td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <div style="background-color: #f8fafc; padding: 14px 16px; border-top: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="text-align: right; font-size: 12px; color: #64748b; padding: 2px 12px;">Subtotaal excl. BTW:</td>
                    <td style="text-align: right; font-size: 12px; color: #1e293b; width: 110px; padding: 2px 0;">€${Number(subtotalExcl).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align: right; font-size: 12px; color: #64748b; padding: 2px 12px;">BTW (9% catering & food):</td>
                    <td style="text-align: right; font-size: 12px; color: #1e293b; width: 110px; padding: 2px 0;">€${Number(vatAmount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align: right; font-size: 15px; font-weight: 700; color: #05053D; padding: 8px 12px 2px 12px; border-top: 2px solid #e2e8f0;">
                      Totaal te voldoen (incl. BTW):
                    </td>
                    <td style="text-align: right; font-size: 16px; font-weight: 800; color: #05053D; padding: 8px 0 2px 0; border-top: 2px solid #e2e8f0;">
                      €${Number(totalAmount).toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Payment Instructions Box (Gold Banner) -->
            <div style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-left: 4px solid #b58b4c; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e; margin-bottom: 4px;">
                💳 Betaalinstructies
              </div>
              <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.5;">
                Gelieve het totaalbedrag van <strong>€${Number(totalAmount).toFixed(2)}</strong> binnen <strong>${paymentDays} dagen</strong> over te maken naar:<br/>
                IBAN: <strong style="font-family: monospace; font-size: 14px; color: #05053D;">${sellerIban}</strong><br/>
                t.n.v. <strong>${sellerName}</strong> (BIC: <span style="font-family: monospace;">${sellerBic}</span>)<br/>
                onder vermelding van factuurnummer: <strong style="color: #05053D;">${invoiceNumber}</strong>.
              </p>
            </div>

            <!-- Outro & Contact -->
            <div style="font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 8px;">
              ${outroHtml}
            </div>

          </div>

          <!-- Footer Information -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td>
                  <strong>${sellerName}</strong> • ${sellerAddress}<br/>
                  KVK: ${sellerKvk} • BTW: ${sellerVat} • E-mail: ${sellerEmail}
                </td>
                <td style="text-align: right; vertical-align: top;">
                  Verzonden via <strong>Office Butler Platform</strong>
                </td>
              </tr>
            </table>
          </div>

        </div>
      </body>
      </html>
    `;

    // Send email to customer via Resend, and CC the administrator
    const ccList = [sellerEmail || 'info@office-butler.com'];

    const { data, error } = await resend.emails.send({
      from: `${sellerName} <info@office-butler.com>`,
      to: [recipientEmail],
      cc: ccList,
      subject: subject,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error sending direct invoice:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: `Factuur succesvol verzonden naar ${recipientEmail}`,
      resendId: data?.id,
    });
  } catch (err: any) {
    console.error("Server error in /api/send-invoice-direct:", err);
    return res.status(500).json({ error: err.message || 'Interne fout bij verzenden van factuur' });
  }
}
