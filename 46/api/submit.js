export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, company, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  const token = process.env.FORWARD_EMAIL_TOKEN;
  const fromAlias = process.env.FORWARD_EMAIL_ALIAS;
  const toEmail = process.env.RECEIVER_EMAIL;

  if (!token || !fromAlias || !toEmail) {
    console.error('Missing env vars: FORWARD_EMAIL_TOKEN, FORWARD_EMAIL_ALIAS, or RECEIVER_EMAIL');
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  try {
    const auth = Buffer.from(`${token}:`).toString('base64');

    const companyLine = company ? `<p><strong>Company:</strong> ${company}</p>` : '';

    const response = await fetch('https://api.forwardemail.net/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAlias,
        to: toEmail,
        subject: `New consultation request from ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          company ? `Company: ${company}` : null,
          `\nMessage:\n${message}`,
        ].filter(Boolean).join('\n'),
        html: `
          <h3>New Consultation Request</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${companyLine}
          <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
        `.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ForwardEmail API error:', response.status, errorData);
      return res.status(502).json({ message: 'Failed to send email. Please try again.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}
