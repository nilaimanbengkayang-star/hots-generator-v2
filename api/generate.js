export default function handler(req, res) {
  res.status(200).json({
    soal: [
      {
        no: 1,
        pertanyaan: "INI TEST MUNCUL",
        opsi: ["A. OK", "B. OK", "C. OK", "D. OK", "E. OK"],
        kunci: "A"
      }
    ]
  });
}
