export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API Key tidak ditemukan di Vercel Settings' });
  }

  try {
    // Perbaikan URL: Menggunakan versi v1 (lebih stabil) dan format pemanggilan model yang benar
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
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
      // Menampilkan pesan error detail dari Google jika gagal
      console.error("Google API Error:", data);
      return res.status(response.status).json({ 
        error: data.error?.message || "Terjadi kesalahan pada API Google",
        details: data.error
      });
    }

    // Ambil hasil teks dari AI
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Kirim balik ke browser sebagai JSON
    res.status(200).json(JSON.parse(resultText));

  } catch (err) {
    console.error("Backend Crash:", err);
    res.status(500).json({ error: "Gagal memproses data", detail: err.message });
  }
}
