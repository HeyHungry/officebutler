import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
  app.post("/api/send-invoice", async (req, res) => {
    try {
      const { companyId, selections, prices, addressId, phone, notes, totalOrderPrice } = req.body;
      const apiKey = process.env.RESEND_API_KEY;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.VITE_SUPABASE_URL;

      if (!apiKey) {
        console.error("RESEND_API_KEY is not configured.");
        return res.status(200).json({ success: false, message: "Resend key missing" });
      }

      if (!serviceKey || !supabaseUrl) {
        return res.status(500).json({ error: "Server configuratie ontbreekt (Service Role Key)" });
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // Fetch company details to get billing_email
      const { data: company } = await supabaseAdmin.from('ob_companies').select('*').eq('id', companyId).single();
      if (!company || !company.billing_email) {
        return res.status(400).json({ error: "Company or billing email not found" });
      }

      // Fetch address details
      const { data: address } = await supabaseAdmin.from('ob_company_addresses').select('*').eq('id', addressId).single();

      const resend = new Resend(apiKey);
      
      let itemsHtml = Object.entries(selections).map(([prod, size]) => {
        const price = prices[\`\${prod}_\${size}\`] || 0;
        return \`<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">\${prod} (\${size} stuks)</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${price.toFixed(2)}</td>
        </tr>\`;
      }).join('');

      const emailHtml = \`
        <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; color: #333;">
          <h2 style="color: #05053D;">Bevestiging Bestelling & Factuur</h2>
          <p>Beste \${company.name},</p>
          <p>Bedankt voor uw bestelling via Office Butler. Hieronder vindt u het overzicht van uw bestelling.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f4f6f9;">
                <th style="padding: 8px; text-align: left;">Product</th>
                <th style="padding: 8px; text-align: right;">Prijs</th>
              </tr>
            </thead>
            <tbody>
              \${itemsHtml}
              <tr>
                <td style="padding: 8px; font-weight: bold; text-align: right;">Totaal</td>
                <td style="padding: 8px; font-weight: bold; text-align: right;">€\${totalOrderPrice.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f4f6f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #05053D;">Aflevergegevens</h3>
            <p style="margin: 5px 0;"><strong>Locatie:</strong> \${address?.label} (\${address?.address_line})</p>
            <p style="margin: 5px 0;"><strong>Contactnummer:</strong> \${phone}</p>
            \${notes ? \`<p style="margin: 5px 0;"><strong>Notities:</strong> \${notes}</p>\` : ''}
            \${company.billing_info ? \`<br/><p style="margin: 5px 0;"><strong>Factuurgegevens:</strong><br/>\${company.billing_info}</p>\` : ''}
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #888;">Dit is een automatisch gegenereerd bericht van Office Butler.</p>
        </div>
      \`;

      const { data, error } = await resend.emails.send({
        from: 'Office Butler <info@office-butler.com>',
        to: [company.billing_email],
        subject: \`Factuur/Bevestiging Bestelling - \${company.name}\`,
        html: emailHtml
      });

      if (error) {
        console.error("Error sending invoice email:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("Server error sending invoice:", err);
      res.status(500).json({ error: err.message });
    }
  });
`;

code = code.replace('// Vite middleware for development', newRoute + '\n  // Vite middleware for development');
fs.writeFileSync('server.ts', code);
