export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    let jsonString = text.substring(start, end + 1);

    try {
      const parsed = JSON.parse(jsonString);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({
        soal: [{
          no: 1,
          pertanyaan: "AI gagal, coba generate lagi",
          opsi: [],
          kunci: "-"
        }]
      });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
