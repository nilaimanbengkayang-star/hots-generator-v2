<script>
let levelAktif = "C4";

function pilihLevel(v) {
    levelAktif = v;
    document.querySelectorAll('.bloom-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(v).classList.add('selected');
}

function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    window.scrollTo(0,0);
}

async function gasKeServer() {
    const mapel = document.getElementById('mapel').value;
    const materi = document.getElementById('materi').value;
    const tp = document.getElementById('tp').value;
    const kelas = document.getElementById('kelas').value;
    const jumlah = document.getElementById('numSoal').value;
    const jenis = document.getElementById('jenisSoal').value;

    if(!mapel || !tp) return alert("Wajib isi Mapel & TP!");

    document.getElementById('loader').classList.add('show');
    const containerHasil = document.getElementById('hasil-box');
    containerHasil.innerHTML = "";

    const fullPrompt = `
Kamu adalah AI pembuat soal HOTS.

WAJIB:
- Output HARUS JSON VALID
- TANPA PENJELASAN
- TANPA BACKTICK
- HANYA JSON

FORMAT:
{
  "soal":[
    {
      "no":1,
      "stimulus":"...",
      "pertanyaan":"...",
      "opsi":["A. ...","B. ...","C. ...","D. ...","E. ..."],
      "kunci":"A"
    }
  ]
}

Buat ${jumlah} soal HOTS
Mapel: ${mapel}
Kelas: ${kelas}
Materi: ${materi}
Level: ${levelAktif}
Jenis: ${jenis}
TP: ${tp}
`;

    try {
        const res = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prompt: fullPrompt })
        });

        const data = await res.json();
        console.log("DATA:", data);

        let listSoal = [];

        if (Array.isArray(data)) {
            listSoal = data;
        } else if (Array.isArray(data.soal)) {
            listSoal = data.soal;
        }

        if (listSoal.length > 0) {
            let innerContent = "";

            listSoal.forEach((s, idx) => {
                const stim = s.stimulus || "";
                const q = s.pertanyaan || "Soal tidak tersedia";
                const k = s.kunci || "-";
                let o = s.opsi || [];

                if (!Array.isArray(o)) {
                    o = Object.entries(o).map(([key, val]) => `${key}. ${val}`);
                }

                innerContent += `
                <div class="soal-box">
                    <div style="color:var(--accent); font-weight:bold; margin-bottom:10px;">NO ${idx+1}</div>

                    ${stim ? `<div style="font-size:13px; opacity:0.7; margin-bottom:10px;">${stim}</div>` : ""}

                    <div style="line-height:1.7; margin-bottom:15px;">${q}</div>

                    <div style="display:grid; gap:8px;">
                        ${o.map(opt => `<div style="padding:10px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:6px;">${opt}</div>`).join('')}
                    </div>

                    <div style="margin-top:20px; color:#3ecf8e; font-weight:bold; border-top:1px dashed var(--border); padding-top:10px;">
                        Kunci: ${k}
                    </div>
                </div>`;
            });

            containerHasil.innerHTML = innerContent;
            document.getElementById('nav-hasil').style.display = 'block';
            setTimeout(() => showScreen('hasil'), 200);

        } else {
            alert("AI tidak mengembalikan data soal. Coba generate ulang.");
        }

    } catch(err) {
        alert("Error: " + err.message);
    } finally {
        document.getElementById('loader').classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => pilihLevel('C4'));
</script>
