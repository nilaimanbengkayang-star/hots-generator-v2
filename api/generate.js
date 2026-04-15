export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(500).json({ error: 'API Key belum dipasang di Vercel' });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json", // INI KUNCI AGAR KELUAR JSON
          temperature: 0.7
        }
      })
    });

    const data = await response.json();
    
    // Mengambil teks mentah dari Gemini
    const rawText = data.candidates[0].content.parts[0].text;
    
    // Mengirimkan hasil sebagai JSON asli ke Frontend
    res.status(200).json(JSON.parse(rawText));
  } catch (err) {
    res.status(500).json({ error: "Gagal memproses AI", detail: err.message });
  }
}
