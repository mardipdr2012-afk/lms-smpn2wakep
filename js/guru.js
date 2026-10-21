// Formulir guru: materi, tugas, kuis
function fMateri(mid, id) {
  sub(); const x = id ? App.data.materi.find(m => m.id === id) : {};
  view(`${back(`mapelDetail('${esc(mid)}')`)}<h1>${id ? 'Ubah' : 'Tambah'} Materi</h1><div class="card">${field('mj', 'Judul materi *', x.judul || '', 'maxlength="120"')}
  ${area('mi', 'Isi materi * (boleh menempel tautan https://...)', x.isi || '', 12)}
  <button class="btn" style="margin-top:1rem" onclick="act(this,'materiSave',[{id:'${esc(id || '')}',id_mapel:'${esc(mid)}',judul:$('mj').value,isi:$('mi').value}],()=>mapelDetail('${esc(mid)}'))">Simpan Materi</button></div>`);
}
function fTugas(mid, id) {
  sub(); const x = id ? App.data.tugas.find(t => t.id === id) : {};
  view(`${back(`mapelDetail('${esc(mid)}')`)}<h1>${id ? 'Ubah' : 'Tambah'} Tugas</h1><div class="card">${field('tj', 'Judul tugas *', x.judul || '', 'maxlength="120"')}
  ${area('ti', 'Instruksi *', x.instruksi || '', 6)}${field('tb', 'Batas pengumpulan *', dtl(x.batas), 'type="datetime-local"')}${field('tm', 'Nilai maksimal (1–100)', x.nilaiMaks || 100, 'type="number" min="1" max="100" inputmode="numeric"')}
  <button class="btn" style="margin-top:1rem" onclick="act(this,'tugasSave',[{id:'${esc(id || '')}',id_mapel:'${esc(mid)}',judul:$('tj').value,instruksi:$('ti').value,batas:toIso($('tb').value),maks:$('tm').value}],()=>mapelDetail('${esc(mid)}'))">Simpan Tugas</button></div>`);
}
const soalHtml = () => `<div class="card soal" style="margin-bottom:1rem"><label>Pertanyaan</label><textarea rows="2" class="sp"></textarea>${['A', 'B', 'C', 'D'].map(o => `<label>Opsi ${o}</label><input class="so">`).join('')}
  <label>Kunci jawaban</label><select class="sk"><option>A</option><option>B</option><option>C</option><option>D</option></select>
  <button class="btn sec dng" style="margin-top:.75rem" onclick="this.closest('.soal').remove()">Hapus soal</button></div>`;
const tambahSoal = () => $('sl').insertAdjacentHTML('beforeend', soalHtml());
function simpanKuis(b, mid) {
  const soal = [...document.querySelectorAll('.soal')].map(e => { const o = e.querySelectorAll('.so'); return { p: e.querySelector('.sp').value, a: o[0].value, b: o[1].value, c: o[2].value, d: o[3].value, k: e.querySelector('.sk').value }; });
  act(b, 'kuisSave', [{ id_mapel: mid, judul: $('kj').value, durasi: $('kd').value, batas: toIso($('kb').value), soal }], () => mapelDetail(mid));
}
function fKuis(mid) {
  sub();
  view(`${back(`mapelDetail('${esc(mid)}')`)}<h1>Buat Kuis (Pilihan Ganda)</h1><div class="card">${field('kj', 'Judul kuis *', '', 'maxlength="120"')}
  ${field('kd', 'Durasi (menit) *', 30, 'type="number" min="1" max="180" inputmode="numeric"')}${field('kb', 'Batas waktu pengerjaan *', dtl(), 'type="datetime-local"')}</div>
  <h2 style="margin-top:1.5rem">Soal</h2><div id="sl"></div><div class="act"><button class="btn sec" onclick="tambahSoal()">+ Tambah soal</button>
  <button class="btn" onclick="simpanKuis(this,'${esc(mid)}')">Simpan Kuis</button></div>`);
  tambahSoal();
}
