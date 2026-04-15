export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API Key belum di-set di Vercel Dashboard' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
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
      return res.status(response.status).json({ error: data.error?.message || "Gagal dari Gemini API" });
    }

    // Mengambil teks mentah hasil generate dan parsing ke JSON
    const resultText = data.candidates[0].content.parts[0].text;
    const resultJson = JSON.parse(resultText);

    // Kirim hasil ke Frontend
    res.status(200).json(resultJson);

  } catch (error) {
    console.error("Error di Backend:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server", detail: error.message });
  }
}