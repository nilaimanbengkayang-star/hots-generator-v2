export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API Key GEMINI_API_KEY tidak ditemukan di Vercel Settings' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    // Ambil teks mentah dari Gemini
    let resultText = data.candidates[0].content.parts[0].text;

    // MEMBERSIHKAN TEKS: Kadang AI ngasih ```json ... ```, kita buang itu biar jadi JSON murni
    const cleanJsonText = resultText.replace(/```json|```/gi, "").trim();
    
    // Kirim balik sebagai objek JSON ke browser
    res.status(200).json(JSON.parse(cleanJsonText));

  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({ error: "Gagal memproses AI", detail: err.message });
  }
}
