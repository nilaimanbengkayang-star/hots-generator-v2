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
        generationConfig: { temperature: 0.7 }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });

    let resultText = data.candidates[0].content.parts[0].text;
    
    // MEMBERSIHKAN TEKS DARI MARKDOWN ```json ... ```
    const cleanJson = resultText.replace(/```json|```/gi, "").trim();
    
    try {
      res.status(200).json(JSON.parse(cleanJson));
    } catch (e) {
      // Jika AI bandel tidak kasih JSON, kita paksa bungkus agar frontend tidak crash
      res.status(200).json({ soal: [{ pertanyaan: resultText, kunci: "Cek Manual" }] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
