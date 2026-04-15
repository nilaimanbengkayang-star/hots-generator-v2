export default function handler(req, res) {
  res.status(200).json({
    soal: [
      {
        pertanyaan: "Soal test muncul",
        opsi: ["A. Satu","B. Dua","C. Tiga","D. Empat","E. Lima"],
        kunci: "A"
      }
    ]
  });
}
