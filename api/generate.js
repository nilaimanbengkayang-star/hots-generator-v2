export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8 }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });

    let rawText = data.candidates[0].content.parts[0].text;
    
    // RADAR JSON: Mencari teks yang berada di antara kurung kurawal { ... }
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const cleanJson = JSON.parse(jsonMatch[0]);
        res.status(200).json(cleanJson);
      } catch (e) {
        res.status(500).json({ error: "Format JSON AI Rusak", raw: rawText });
      }
    } else {
      res.status(500).json({ error: "AI tidak mengirim format JSON", raw: rawText });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
