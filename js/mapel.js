// Mata Pelajaran: daftar semua mapel yang boleh dilihat + halaman detail (materi, tugas, kuis)
const cnt = (a, f) => a.filter(f).length;
function rMapel(d) {
  const cards = d.mapel.map(m => `<div class="card mp" role="button" tabindex="0" onclick="mapelDetail('${esc(m.id)}')" onkeydown="if(event.key==='Enter')mapelDetail('${esc(m.id)}')">
    <span class="badge b-pr">${esc(m.kelas)}</span><h2 style="margin-top:.5rem">${esc(m.nama)}</h2><small>${esc(m.guru || 'Belum ada guru')}</small>
    <div class="meta"><span>${cnt(d.materi, x => x.mapelId === m.id)} Materi</span><span>${cnt(d.tugas, x => x.mapelId === m.id)} Tugas</span><span>${cnt(d.kuis, x => x.mapelId === m.id)} Kuis</span></div></div>`).join('');
  view(`<h1>Mata Pelajaran</h1><p class="mu">${d.mapel.length} mata pelajaran. Ketuk untuk membuka materi, tugas, dan kuis.</p>
  <div class="grid g1">${cards || '<p class="mu">Belum ada mata pelajaran.' + (App.user.peran === 'admin' ? ' Tambahkan di menu Kelola.' : '') + '</p>'}</div>`);
}
function mapelDetail(id) {
  sub(); const d = App.data, m = d.mapel.find(x => x.id === id); if (!m) return go('mapel');
  const g = isGuru(), i = esc(id), add = (l, fn) => g ? `<button class="btn sec" onclick="${fn}">+ ${l}</button>` : '';
  const mt = d.materi.filter(x => x.mapelId === id), tg = d.tugas.filter(x => x.mapelId === id), kz = d.kuis.filter(x => x.mapelId === id);
  view(`${back("go('mapel')", '← Semua mata pelajaran')}<h1>${esc(m.nama)}</h1><p class="mu">${esc(m.kelas)} · ${esc(m.guru || '-')}</p>
  <div class="sec"><h2>Materi</h2>${add('Materi', `fMateri('${i}')`)}</div>
  ${mt.map(x => `<details class="card"><summary><b>${esc(x.judul)}</b> <small>${wita(x.tanggal)}</small></summary><div class="isi">${linkify(x.isi)}</div>
  ${g ? `<div class="act" style="margin-top:.75rem"><button class="btn sec" onclick="fMateri('${i}','${esc(x.id)}')">Ubah</button><button class="btn sec dng" onclick="hapus(this,'materiDel','${esc(x.id)}','${i}')">Hapus</button></div>` : ''}</details>`).join('') || '<p class="mu">Belum ada materi.</p>'}
  <div class="sec"><h2>Tugas</h2>${add('Tugas', `fTugas('${i}')`)}</div><div class="card">${tg.map(rowFor).join('') || '<p class="mu">Belum ada tugas.</p>'}</div>
  <div class="sec"><h2>Kuis</h2>${add('Kuis', `fKuis('${i}')`)}</div><div class="card">${kz.map(kRow).join('') || '<p class="mu">Belum ada kuis.</p>'}</div>`);
}
