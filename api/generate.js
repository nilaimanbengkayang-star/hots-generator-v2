export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    // Kita pakai v1beta agar fitur-fitur terbaru tetap aktif, tapi dengan URL yang benar
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + " (Hasilkan hanya dalam format JSON murni tanpa kata-kata pembuka)" }] }],
        generationConfig: {
          // Menghapus response_mime_type agar tidak bentrok di beberapa versi
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Error API" });
    }

    let resultText = data.candidates[0].content.parts[0].text;
    
    // JURUS ANTI-Gagal: Bersihkan blok ```json jika AI bandel tetap kasih markdown
    const cleanJson = resultText.replace(/```json|```/gi, "").trim();
    
    try {
      const finalJson = JSON.parse(cleanJson);
      res.status(200).json(finalJson);
    } catch (parseError) {
      // Jika masih bukan JSON, kirim teks mentahannya biar Bos bisa baca errornya
      res.status(200).json({ 
        soal: [{ no: 1, pertanyaan: "AI gagal kirim JSON. Ini teksnya: " + resultText, kunci: "-" }] 
      });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
