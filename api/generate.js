export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.7 }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });

    let resultText = data.candidates[0].content.parts[0].text;
    
    // MEMBERSIHKAN TEKS DARI MARKDOWN ```json ... ```
    const cleanJsonText = resultText.replace(/```json|```/gi, "").trim();
    
    try {
      const finalData = JSON.parse(cleanJsonText);
      res.status(200).json(finalData);
    } catch (e) {
      // Jika AI kirim teks tambahan, kita kirim mentahannya saja sebagai error biar ketahuan
      res.status(500).json({ error: "AI kirim format rusak", raw: cleanJsonText });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
