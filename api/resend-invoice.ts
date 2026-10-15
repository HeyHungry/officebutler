import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { customerName, items, totalPrice, deliveryDate, deliveryTime, address, phone, notes } = req.body;
    
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured.");
      return res.status(200).json({ success: false, message: "Resend key missing" });
    }
    
    const resend = new Resend(apiKey);
    
    let itemsHtml = items.map((item: any) => {
      return `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (${item.size} stuks)</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${item.price.toFixed(2)}</td>
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
              <td style="padding: 8px; font-weight: bold; text-align: right;">€${totalPrice.toFixed(2)}</td>
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
}
