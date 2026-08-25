import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API Routes
  app.post("/api/notify-admin", async (req, res) => {
    try {
      const { companyName, email, phone } = req.body;
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
          <h2>Nieuwe aanvraag via Office Butler</h2>
          <p>Er is zojuist een nieuw kantoor geregistreerd dat wacht op goedkeuring.</p>
          <ul>
            <li><strong>Kantoornaam:</strong> ${companyName}</li>
            <li><strong>E-mailadres:</strong> ${email}</li>
            <li><strong>Telefoonnummer:</strong> ${phone}</li>
          </ul>
          <p>Log in op het Office Butler Moderator Panel om deze aanvraag goed te keuren.</p>
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
        const price = prices[`${prod}_${size}`] || 0;
        return `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${prod} (${size} stuks)</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${price.toFixed(2)}</td>
        </tr>`;
      }).join('');

      const emailHtml = `
        <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; color: #333;">
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
            <h3 style="margin-top: 0; color: #0d47a1;">Interne Notitie (Office Butler)</h3>
            <p style="margin: 5px 0;">Er is zojuist een nieuwe bestelling geplaatst door <strong>${company.name}</strong>.</p>
            <p style="margin: 5px 0;">Controleer deze factuur en stuur deze vervolgens handmatig door naar: <a href="mailto:${company.billing_email}">${company.billing_email}</a></p>
          </div>

          <h2 style="color: #05053D;">Bevestiging Bestelling & Factuur</h2>
          <p>Beste ${company.name},</p>
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
              <tr>
                <td style="padding: 8px; font-weight: bold; text-align: right;">Totaal</td>
                <td style="padding: 8px; font-weight: bold; text-align: right;">€${totalOrderPrice.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f4f6f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #05053D;">Aflevergegevens</h3>
            <p style="margin: 5px 0;"><strong>Locatie:</strong> ${address?.label} (${address?.address_line})</p>
            <p style="margin: 5px 0;"><strong>Contactnummer:</strong> ${phone}</p>
            ${notes ? `<p style="margin: 5px 0;"><strong>Notities:</strong> ${notes}</p>` : ''}
            ${company.billing_info ? `<br/><p style="margin: 5px 0;"><strong>Factuurgegevens:</strong><br/>${company.billing_info}</p>` : ''}
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #888;">Dit is een automatisch gegenereerd bericht van Office Butler.</p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: 'Office Butler <info@office-butler.com>',
        to: ['info@office-butler.com'],
        subject: `Nieuwe Bestelling & Factuur - ${company.name}`,
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
