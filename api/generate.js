export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    const data = await response.json();

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // bersihkan
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const first = rawText.indexOf('{');
    const last = rawText.lastIndexOf('}');
    let jsonString = rawText.substring(first, last + 1);

    let parsed;

    try {
      parsed = JSON.parse(jsonString);
    } catch {
      parsed = { soal: [] };
    }

    res.status(200).json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
