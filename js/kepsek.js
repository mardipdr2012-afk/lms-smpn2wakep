// Dashboard Kepala Sekolah — grafik murni CSS/SVG (tanpa library, hemat kuota)
const KKM = 75, KP = { f: '', q: '' };
const fmt = v => v == null ? '–' : String(v).replace('.', ',');
const bln = b => new Date(b + '-01T00:00:00').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
const kpSel = k => k.perKelas.filter(x => !KP.f || x.kelas === KP.f);
function rKepsek(d) {
  const k = d.kepsek, sel = kpSel(k), sis = sel.reduce((a, x) => a + x.siswa, 0);
  const rata = KP.f ? (sel[0] ? sel[0].rata : null) : k.rata;
  view(`<p class="eyebrow">MODUL EKSEKUTIF</p>
  <div class="kp-head"><div><h1>Dashboard Pemantauan Mutu Akademik — Kepala Sekolah</h1><p class="mu">SMP Negeri 2 Walea Kepulauan · Semester Ganjil</p></div>
  <div class="kp-act"><select aria-label="Filter kelas" onchange="KP.f=this.value;rKepsek(App.data)"><option value="">Semua Kelas</option>${k.perKelas.map(x => `<option ${x.kelas === KP.f ? 'selected' : ''}>${esc(x.kelas)}</option>`).join('')}</select>
  <button class="btn" onclick="window.print()">Cetak Laporan / PDF</button></div></div>
  <div class="grid">${stat(sis, 'Total siswa aktif')}${stat(k.guru, 'Total guru pengampu')}${stat(sel.length, 'Rombongan belajar')}${stat(fmt(rata), 'Rata-rata nilai (KKM ' + KKM + ')')}</div>
  <div class="kp-two"><div class="card"><h2>Rata-Rata Nilai per Kelas</h2>${barKelas(sel)}</div>
  <div class="card"><h2>Rata-Rata Nilai per Mata Pelajaran</h2>${barMapel(k.mapelBy[KP.f] || [])}</div></div>
  <div class="card" style="margin-top:1rem"><h2>Tren Nilai Rata-Rata Bulanan</h2><p class="mu">Seluruh sekolah, dari tugas yang sudah dinilai.</p>${tren(k.tren)}</div>
  <div class="card" style="margin-top:1rem"><div class="row"><h2>Rekapitulasi Capaian Akademik per Kelas</h2><div class="kp-act">
  <input id="kq" type="search" aria-label="Cari kelas atau wali" placeholder="Cari kelas / wali..." value="${esc(KP.q)}" oninput="KP.q=this.value;kpRows()">
  <button class="btn sec" onclick="kpCsv()">Ekspor CSV</button></div></div><div class="tw"><table id="kt"></table></div></div>
  <p class="mu">Sinkronisasi terakhir: ${wita(k.sync)}</p>`);
  kpRows();
}
function barKelas(sel) {
  if (!sel.length) return '<p class="mu">Belum ada data kelas.</p>';
  const mx = Math.max(...sel.map(x => x.rata ?? -1));
  return `<div class="plot"><i class="kkm" style="bottom:${KKM}%"><s>KKM ${KKM}</s></i>${sel.map(x => `<div class="vbar${x.rata != null && x.rata === mx ? ' hi' : x.rata != null && x.rata < KKM ? ' lo' : ''}" style="height:${x.rata || 0}%"><em>${fmt(x.rata)}</em></div>`).join('')}</div>
  <div class="plab">${sel.map(x => `<span>${esc(x.kelas)}<br><small>${x.siswa} siswa</small></span>`).join('')}</div>`;
}
function barMapel(l) {
  return l.map(m => `<div class="hb"><span>${esc(m.nama)}</span><b>${fmt(m.rata)}</b><div class="bar"><i style="width:${m.rata || 0}%"></i></div></div>`).join('') || '<p class="mu">Belum ada nilai.</p>';
}
function tren(t) {
  if (!t.length) return '<p class="mu">Belum ada nilai untuk ditampilkan.</p>';
  const W = 600, H = 190, X = i => t.length < 2 ? W / 2 : 40 + i * (W - 80) / (t.length - 1), Y = v => 160 - (Math.min(100, Math.max(50, v)) - 50) / 50 * 130;
  return `<svg viewBox="0 0 ${W} ${H}" class="trend" role="img" aria-label="Grafik tren nilai rata-rata bulanan"><line x1="0" x2="${W}" y1="${Y(KKM)}" y2="${Y(KKM)}" stroke="#F86F8F" stroke-dasharray="4 4"/>
  <text x="4" y="${Y(KKM) - 4}" font-size="11" fill="#9E1B3B">KKM ${KKM}</text><polyline points="${t.map((p, i) => X(i) + ',' + Y(p.rata)).join(' ')}" fill="none" stroke="#15803D" stroke-width="3"/>
  ${t.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.rata)}" r="5" fill="#fff" stroke="#15803D" stroke-width="3"/><text x="${X(i)}" y="${Y(p.rata) - 12}" text-anchor="middle" font-size="12" font-weight="600" fill="#14532D">${fmt(p.rata)}</text><text x="${X(i)}" y="${H - 6}" text-anchor="middle" font-size="12" fill="#5B6761">${bln(p.b)}</text>`).join('')}</svg>`;
}
function kpList() { const q = KP.q.toLowerCase(); return kpSel(App.data.kepsek).filter(x => (x.kelas + ' ' + x.wali).toLowerCase().includes(q)); }
const pb = v => v == null ? '<small class="mu">–</small>' : `<div class="bar"><i style="width:${v}%"></i></div><small>${v}%</small>`;
function kpRows() {
  $('kt').innerHTML = `<thead><tr><th>Kelas</th><th>Wali Kelas</th><th>Siswa</th><th>Rata-rata</th><th>Penyelesaian tugas</th><th>Kuis diikuti</th></tr></thead><tbody>${kpList().map(x => `<tr><td><b>${esc(x.kelas)}</b></td><td>${esc(x.wali)}<br><small>NIP ${esc(x.nip)}</small></td><td>${x.siswa}</td><td><b>${fmt(x.rata)}</b></td><td>${pb(x.tugas)}</td><td>${pb(x.kuis)}</td></tr>`).join('') || '<tr><td colspan="6" class="mu">Tidak ada data.</td></tr>'}</tbody>`;
}
function kpCsv() {
  const q = v => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }; // cegah formula injection
  const l = [['Kelas', 'Wali Kelas', 'Jumlah Siswa', 'Rata-rata', 'Tugas %', 'Kuis %'].map(q).join(',')].concat(kpList().map(x => [x.kelas, x.wali, x.siswa, x.rata, x.tugas, x.kuis].map(q).join(',')));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + l.join('\n')], { type: 'text/csv' })); a.download = 'rekap-kelas.csv'; a.click(); URL.revokeObjectURL(a.href);
}
