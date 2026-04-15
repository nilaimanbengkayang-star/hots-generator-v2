export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    // Menggunakan v1beta dengan endpoint yang benar-benar stabil
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + ". Balas hanya dengan JSON murni tanpa kata-kata lain." }] }],
        generationConfig: { temperature: 1.0 } // Dinaikkan sedikit agar lebih kreatif tapi tetap dalam format
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });

    let rawText = data.candidates[0].content.parts[0].text;
    
    // REGEX RADAR: Menangkap apa pun di dalam kurung kurawal { ... }
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        res.status(200).json(parsed);
      } catch (e) {
        res.status(500).json({ error: "JSON Corrupted", raw: rawText });
      }
    } else {
      res.status(500).json({ error: "No JSON found", raw: rawText });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
