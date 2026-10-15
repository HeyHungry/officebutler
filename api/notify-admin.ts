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
    const fromAddress = process.env.RESEND_FROM?.trim() || 'Canal Butler <info@office-butler.com>';
    
    const recipients = ['info@office-butler.com', 'info@canal-butler.com'];
    
    let { data, error } = await resend.emails.send({
      from: fromAddress,
      replyTo: 'info@canal-butler.com',
      to: recipients,
      subject: `[Canal Butler / Office Butler] Nieuwe aanvraag: ${companyName}`,
      html: `
        <h2>Nieuwe aanvraag via Canal Butler</h2>
        <p>Er is zojuist een nieuw bedrijf of opstaplocatie geregistreerd dat wacht op goedkeuring.</p>
        <ul>
          <li><strong>Bedrijfsnaam / Locatie:</strong> ${companyName}</li>
          <li><strong>E-mailadres:</strong> ${email}</li>
          <li><strong>Telefoonnummer:</strong> ${phone}</li>
        </ul>
        <p>Dit is een automatisch gegenereerd bericht van Canal Butler.</p>
      `
    });

    if (error && (error.name === 'validation_error' || error.message?.includes('not verified') || (error as any).statusCode === 403)) {
      if (fromAddress !== 'Canal Butler <info@office-butler.com>') {
        const fallback = await resend.emails.send({
          from: 'Canal Butler <info@office-butler.com>',
          replyTo: 'info@canal-butler.com',
          to: recipients,
          subject: `[Canal Butler / Office Butler] Nieuwe aanvraag: ${companyName}`,
          html: `
            <h2>Nieuwe aanvraag via Canal Butler</h2>
            <p>Er is zojuist een nieuw bedrijf of opstaplocatie geregistreerd dat wacht op goedkeuring.</p>
            <ul>
              <li><strong>Bedrijfsnaam / Locatie:</strong> ${companyName}</li>
              <li><strong>E-mailadres:</strong> ${email}</li>
              <li><strong>Telefoonnummer:</strong> ${phone}</li>
            </ul>
            <p>Dit is een automatisch gegenereerd bericht van Canal Butler.</p>
          `
        });
        data = fallback.data;
        error = fallback.error;
      }
      if (error && (error.name === 'validation_error' || error.message?.includes('not verified') || (error as any).statusCode === 403)) {
        const fallbackDev = await resend.emails.send({
          from: 'Canal Butler <onboarding@resend.dev>',
          replyTo: 'info@canal-butler.com',
          to: recipients,
          subject: `[Canal Butler / Office Butler] Nieuwe aanvraag: ${companyName}`,
          html: `
            <h2>Nieuwe aanvraag via Canal Butler</h2>
            <p>Er is zojuist een nieuw bedrijf of opstaplocatie geregistreerd dat wacht op goedkeuring.</p>
            <ul>
              <li><strong>Bedrijfsnaam / Locatie:</strong> ${companyName}</li>
              <li><strong>E-mailadres:</strong> ${email}</li>
              <li><strong>Telefoonnummer:</strong> ${phone}</li>
            </ul>
            <p>Dit is een automatisch gegenereerd bericht van Canal Butler.</p>
          `
        });
        data = fallbackDev.data;
        error = fallbackDev.error;
      }
    }
    
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
