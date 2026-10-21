// Kuis: daftar dan pengerjaan siswa (timer, kirim otomatis saat waktu habis)
let KT = null;
const kRow = k => {
  const sis = App.user.peran === 'siswa', tutup = new Date(k.batas) < new Date();
  const aksi = sis ? (k.skor !== null ? `<span class="badge b-ok">Skor ${k.skor}</span>` : tutup ? '<span class="badge b-bd">Ditutup</span>' : `<button class="btn" onclick="mulaiKuis('${esc(k.id)}')">Kerjakan</button>`)
    : isGuru() ? `<button class="btn sec dng" onclick="hapus(this,'kuisDel','${esc(k.id)}','${esc(k.mapelId)}')">Hapus</button>` : '';
  return `<div class="row"><div><b>${esc(k.judul)}</b><br><small>${k.jumlah} soal · ${k.durasi} menit · Tutup ${wita(k.batas)}</small></div><div class="act">${aksi}</div></div>`;
};
function rKuis(d) { view(`<h1>Kuis</h1>${isGuru() ? '<p class="mu">Untuk membuat kuis baru, buka Mata Pelajaran lalu pilih “+ Kuis”.</p>' : ''}<div class="card">${d.kuis.map(kRow).join('') || '<p class="mu">Belum ada kuis.</p>'}</div>`); }
async function mulaiKuis(id) {
  if (!confirm('Waktu kuis langsung berjalan setelah dimulai. Mulai sekarang?')) return;
  const r = await api('kuisMulai', App.token, id);
  if (!r.success) { if (r.message === 'SESI') return expired(); return toast(r.message); }
  sub(); const { judul, soal } = r.data; let sisa = r.data.sisa;
  view(`<div class="qbar"><b>${esc(judul)}</b><span id="qt" class="badge b-pr"></span></div>
  ${soal.map((q, n) => `<div class="card" style="margin-bottom:1rem"><b>${n + 1}. ${esc(q.p)}</b>${q.o.map((o, i) => `<label class="opt"><input type="radio" name="q_${esc(q.id)}" value="${'ABCD'[i]}"><span>${'ABCD'[i]}. ${esc(o)}</span></label>`).join('')}</div>`).join('')}
  <button class="btn" id="qk" style="width:100%">Kirim Jawaban</button>`);
  const kirim = async () => {
    clearInterval(KT); $('qk').disabled = true; const jw = {};
    soal.forEach(q => { const c = document.querySelector(`input[name="q_${q.id}"]:checked`); if (c) jw[q.id] = c.value; });
    const h = await api('kuisKirim', App.token, id, jw);
    if (!h.success) { toast(h.message); return go('kuis'); }
    await refresh();
    view(`<div class="card login"><h1>Kuis Selesai</h1><div class="stat"><b>${h.data.skor}</b><small>Skor akhir · ${h.data.benar} dari ${h.data.total} soal benar</small></div><button class="btn" style="width:100%;margin-top:1rem" onclick="go('kuis')">Kembali ke Kuis</button></div>`);
  };
  $('qk').onclick = () => { if (confirm('Kirim jawaban sekarang?')) kirim(); };
  const tick = () => { $('qt').textContent = `${Math.floor(sisa / 60)}:${String(sisa % 60).padStart(2, '0')}`; if (sisa-- <= 0) kirim(); };
  tick(); KT = setInterval(tick, 1000);
}
