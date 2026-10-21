// Tugas: daftar, baris guru, dan penilaian jawaban
const gRow = t => `<div class="row"><div><b>${esc(t.judul)}</b><br><small>${esc(t.mapel)} · Tenggat ${wita(t.batas)}</small></div>
  <div class="act"><button class="btn" onclick="penilaian('${esc(t.id)}')">Nilai</button><button class="btn sec" onclick="fTugas('${esc(t.mapelId)}','${esc(t.id)}')">Ubah</button>
  <button class="btn sec dng" onclick="hapus(this,'tugasDel','${esc(t.id)}','${esc(t.mapelId)}')">Hapus</button></div></div>`;
const rowFor = t => isGuru() ? gRow(t) : tRow(t);
function rTugas(d) {
  view(`<h1>Daftar Tugas</h1>${isGuru() ? '<p class="mu">Untuk menambah tugas baru, buka Mata Pelajaran lalu pilih “+ Tugas”.</p>' : ''}<div class="card">${d.tugas.map(rowFor).join('') || '<p class="mu">Belum ada tugas.</p>'}</div>`);
}
async function penilaian(id) {
  sub(); view('<div class="sk"></div>');
  const r = await api('jawabanList', App.token, id);
  if (!r.success) { if (r.message === 'SESI') return expired(); toast(r.message); return go('tugas'); }
  const { judul, maks, list } = r.data;
  view(`${back("go('tugas')", '← Daftar tugas')}<h1>Penilaian: ${esc(judul)}</h1><p class="mu">${list.length} jawaban masuk · nilai maksimal ${maks}</p>
  ${list.map(j => `<div class="card" style="margin-bottom:1rem"><b>${esc(j.siswa)}</b> <small>${wita(j.waktu)}</small><div class="isi">${linkify(j.jawaban)}</div>
  <div class="nl"><input id="n_${esc(j.id)}" type="number" min="0" max="${maks}" inputmode="decimal" placeholder="Nilai" value="${esc(j.nilai)}"><input id="c_${esc(j.id)}" placeholder="Catatan untuk siswa" value="${esc(j.catatan)}">
  <button class="btn" onclick="act(this,'beriNilai',['${esc(j.id)}',$('n_${esc(j.id)}').value,$('c_${esc(j.id)}').value])">Simpan</button></div></div>`).join('') || '<p class="mu">Belum ada jawaban masuk.</p>'}`);
}
