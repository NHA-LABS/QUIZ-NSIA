const nodemailer = require("nodemailer");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { nom, tel, email, score, profile, emoji, cochees, nonCochees, date } = data;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { ciphers: "SSLv3" },
  });

  const scoreColor =
    score >= 10 ? "#2ECC87" : score >= 6 ? "#F5A623" : "#E05252";

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f4f4;padding:20px;border-radius:12px;">
      <div style="background:#001E60;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px;">
        <h1 style="color:#D29F13;font-size:22px;margin:0;">🚗 Nouveau Lead – Quiz Assurance Auto</h1>
        <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">NSIA Holding Assurances · Côte d'Ivoire</p>
      </div>

      <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:16px;">
        <h2 style="color:#001E60;font-size:16px;margin:0 0 14px;border-bottom:2px solid #D29F13;padding-bottom:8px;">👤 Coordonnées</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:7px 0;color:#666;font-size:13px;width:140px;">Nom</td><td style="padding:7px 0;font-weight:600;color:#001E60;font-size:14px;">${nom}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:7px 4px;color:#666;font-size:13px;">Téléphone</td><td style="padding:7px 4px;font-weight:600;color:#001E60;font-size:14px;">${tel}</td></tr>
          <tr><td style="padding:7px 0;color:#666;font-size:13px;">Email</td><td style="padding:7px 0;font-weight:600;color:#001E60;font-size:14px;">${email || "—"}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:7px 4px;color:#666;font-size:13px;">Date</td><td style="padding:7px 4px;font-weight:600;color:#001E60;font-size:14px;">${date}</td></tr>
        </table>
      </div>

      <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:16px;text-align:center;">
        <h2 style="color:#001E60;font-size:16px;margin:0 0 14px;">🎯 Résultat du Quiz</h2>
        <div style="font-size:48px;margin-bottom:8px;">${emoji}</div>
        <div style="font-size:40px;font-weight:900;color:${scoreColor};">${score}/12</div>
        <div style="display:inline-block;background:#001E60;color:#D29F13;font-weight:700;font-size:14px;padding:8px 20px;border-radius:20px;margin-top:8px;">${profile}</div>
      </div>

      <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:16px;">
        <h2 style="color:#2ECC87;font-size:14px;margin:0 0 10px;">✔ Cases cochées</h2>
        <pre style="font-size:12px;color:#333;white-space:pre-wrap;margin:0;line-height:1.7;">${cochees}</pre>
      </div>

      <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:16px;">
        <h2 style="color:#E05252;font-size:14px;margin:0 0 10px;">✗ Cases non cochées</h2>
        <pre style="font-size:12px;color:#333;white-space:pre-wrap;margin:0;line-height:1.7;">${nonCochees}</pre>
      </div>

      <div style="text-align:center;font-size:11px;color:#999;margin-top:16px;">
        Quiz Assurance Auto · NSIA Holding Assurances · Côte d'Ivoire
      </div>
    </div>`;

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_DEST,
      replyTo: 'josselin.brou@groupensia.com',
      subject: `🚗 Nouveau lead Quiz NSIA – ${nom} (${score}/12 – ${profile})`,
      html: htmlBody,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("SMTP error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
