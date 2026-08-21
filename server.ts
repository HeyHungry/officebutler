import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import cors from "cors";

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
        // We still return success to the frontend so it doesn't break the user flow
        // if the admin hasn't configured the key yet.
        return res.status(200).json({ success: false, message: "Resend key missing" });
      }

      const resend = new Resend(apiKey);
      
      const { data, error } = await resend.emails.send({
        from: 'Office Butler <info@office-butler.com>', // Use the verified domain!
        to: ['info@office-butler.com'], // Send TO the admin
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
