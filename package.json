export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.body.prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7
        }
      })
    });

    const data = await response.json();
    
    // Pastikan data yang dikirim balik ke HTML adalah JSON murni
    const resultText = data.candidates[0].content.parts[0].text;
    res.status(200).json(JSON.parse(resultText));

  } catch (err) {
    res.status(500).json({ error: "Gagal memproses AI", detail: err.message });
  }
}
