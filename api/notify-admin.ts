import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
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
}
