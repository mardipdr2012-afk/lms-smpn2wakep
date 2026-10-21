// Panel admin: pengguna, kelas, mata pelajaran
const PR = { siswa: 'Siswa', guru: 'Guru', wali_kelas: 'Wali Kelas', kepsek: 'Kepala Sekolah', admin: 'Admin' };
let AQ = { q: '', p: '' };
async function loadAdmin() {
  const r = await api('userList', App.token);
  if (!r.success) { if (r.message === 'SESI') expired(); else toast(r.message); return null; }
  return App.adm = r.data;
}
function rAdminHome(d) {
  view(`<h1>Halo, ${esc(d.s.nama)}</h1><p class="mu">Panel administrator: kelola akun, kelas, dan mata pelajaran.</p><div class="grid g1">
  <div class="card mp" role="button" tabindex="0" onclick="go('pengguna')"><h2>Pengguna</h2><small>Tambah akun, reset PIN, aktif/nonaktifkan</small></div>
  <div class="card mp" role="button" tabindex="0" onclick="go('kelola')"><h2>Kelas &amp; Mata Pelajaran</h2><small>Atur wali kelas dan guru pengampu</small></div>
  <div class="card stat"><b>${d.mapel.length}</b><small>Mata pelajaran terdaftar</small></div></div>`);
}
async function rPengguna() {
  view('<div class="sk"></div>'); if (!await loadAdmin()) return;
  view(`<div class="kp-head"><h1>Kelola Pengguna</h1><button class="btn" onclick="fUser()">+ Tambah Pengguna</button></div>
  <div class="kp-act" style="margin:.5rem 0"><input id="aq" type="search" placeholder="Cari nama / NIS / NIP" value="${esc(AQ.q)}" oninput="AQ.q=this.value;listUsers()">
  <select aria-label="Filter peran" onchange="AQ.p=this.value;listUsers()"><option value="">Semua peran</option>${Object.entries(PR).map(([k, v]) => `<option value="${k}" ${k === AQ.p ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div id="ul"></div>`);
  listUsers();
}
function listUsers() {
  const a = App.adm, q = AQ.q.toLowerCase(), l = a.users.filter(u => (!AQ.p || u.peran === AQ.p) && (u.nama + ' ' + u.nis).toLowerCase().includes(q));
  $('ul').innerHTML = `<p class="mu">${l.length} dari ${a.users.length} akun</p><div class="card">${l.map(u => `<div class="row"><div><b>${esc(u.nama)}</b> <span class="badge ${u.aktif ? 'b-ok' : 'b-bd'}">${u.aktif ? 'Aktif' : 'Nonaktif'}</span><br>
  <small>${PR[u.peran] || esc(u.peran)} · ${esc(u.nis)}${u.kelas ? ' · ' + esc(u.kelas) : ''}</small></div><div class="act"><button class="btn sec" onclick="fUser('${esc(u.id)}')">Ubah</button>
  <button class="btn sec" onclick="resetPin(this,'${esc(u.id)}')">Reset PIN</button><button class="btn sec" onclick="toggleU(this,'${esc(u.id)}')">${u.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button></div></div>`).join('') || '<p class="mu">Tidak ada akun.</p>'}</div>`;
}
function showPin(nama, pin) {
  sub(); view(`<div class="card login"><h1>PIN untuk ${esc(nama)}</h1><div class="stat"><b style="letter-spacing:.3em">${esc(pin)}</b><small>Catat dan berikan kepada pengguna. PIN ini tidak akan ditampilkan lagi.</small></div><button class="btn" style="width:100%;margin-top:1rem" onclick="go('pengguna')">Selesai</button></div>`);
}
function resetPin(b, id) { const u = App.adm.users.find(x => x.id === id); if (confirm('Buat PIN baru untuk ' + u.nama + '?')) act(b, 'userReset', [id], r => showPin(u.nama, r.data.pin)); }
function toggleU(b, id) { const u = App.adm.users.find(x => x.id === id); if (confirm((u.aktif ? 'Nonaktifkan ' : 'Aktifkan ') + u.nama + '?')) act(b, 'userToggle', [id], () => rPengguna()); }
function fUser(id) {
  sub(); const u = id ? App.adm.users.find(x => x.id === id) : { peran: 'siswa' };
  view(`${back("go('pengguna')")}<h1>${id ? 'Ubah' : 'Tambah'} Pengguna</h1><div class="card">${field('un', 'Nama lengkap *', u.nama || '', 'maxlength="80"')}
  ${selc('up', 'Peran *', Object.entries(PR), u.peran)}${field('us', 'NIS / NIP * (angka)', u.nis || '', 'inputmode="numeric" maxlength="30"')}
  ${selc('uk', 'Kelas (untuk siswa)', [['', '—']].concat(App.adm.kelas.map(k => [k.id_kelas, k.id_kelas])), u.kelas || '')}${field('ue', 'Email (untuk notifikasi)', u.email || '', 'type="email" maxlength="80"')}
  ${id ? '' : '<p class="mu">PIN awal dibuat otomatis dan ditampilkan sekali setelah disimpan.</p>'}
  <button class="btn" style="margin-top:1rem" onclick="act(this,'userSave',[{id:'${esc(id || '')}',nama:$('un').value,peran:$('up').value,nis:$('us').value,kelas:$('uk').value,email:$('ue').value}],r=>r.data.pin?showPin($('un').value,r.data.pin):rPengguna())">Simpan</button></div>`);
}
async function rKelola() {
  view('<div class="sk"></div>'); const a = await loadAdmin(); if (!a) return;
  const nm = {}; a.users.forEach(u => nm[u.id] = u.nama);
  view(`<h1>Kelas &amp; Mata Pelajaran</h1><div class="sec"><h2>Kelas</h2><button class="btn sec" onclick="fKelas()">+ Kelas</button></div><div class="card">
  ${a.kelas.map(k => `<div class="row"><div><b>${esc(k.id_kelas)}</b><br><small>Wali kelas: ${esc(nm[k.id_wali_kelas] || '-')}</small></div><button class="btn sec" onclick="fKelas('${esc(k.id_kelas)}')">Ubah</button></div>`).join('') || '<p class="mu">Belum ada kelas.</p>'}</div>
  <div class="sec"><h2>Mata Pelajaran</h2><button class="btn sec" onclick="fMapel()">+ Mata Pelajaran</button></div><div class="card">
  ${a.mapel.map(m => `<div class="row"><div><b>${esc(m.nama_mapel)}</b> <span class="badge b-pr">${esc(m.id_kelas)}</span><br><small>Guru: ${esc(nm[m.id_guru] || '-')}</small></div><button class="btn sec" onclick="fMapel('${esc(m.id_mapel)}')">Ubah</button></div>`).join('') || '<p class="mu">Belum ada mata pelajaran.</p>'}</div>`);
}
const guruOpts = () => [['', '— belum ada —']].concat(App.adm.users.filter(u => ['guru', 'wali_kelas'].includes(u.peran) && u.aktif).map(u => [u.id, u.nama]));
function fKelas(id) {
  sub(); const k = id ? App.adm.kelas.find(x => x.id_kelas === id) : {};
  view(`${back("go('kelola')")}<h1>${id ? 'Ubah' : 'Tambah'} Kelas</h1><div class="card">${field('kn', 'Nama kelas * (contoh: VIII-A)', k.id_kelas || '', id ? 'readonly' : 'maxlength="20"')}${selc('kw', 'Wali kelas', guruOpts(), k.id_wali_kelas || '')}
  <button class="btn" style="margin-top:1rem" onclick="act(this,'adminSave',['Kelas',{id_kelas:$('kn').value,id_wali_kelas:$('kw').value}],()=>rKelola())">Simpan</button></div>`);
}
function fMapel(id) {
  sub(); const m = id ? App.adm.mapel.find(x => x.id_mapel === id) : {};
  view(`${back("go('kelola')")}<h1>${id ? 'Ubah' : 'Tambah'} Mata Pelajaran</h1><div class="card">${field('mn', 'Nama mata pelajaran *', m.nama_mapel || '', 'maxlength="60"')}
  ${selc('mk', 'Kelas *', App.adm.kelas.map(k => [k.id_kelas, k.id_kelas]), m.id_kelas || '')}${selc('mg', 'Guru pengampu', guruOpts(), m.id_guru || '')}
  <button class="btn" style="margin-top:1rem" onclick="act(this,'adminSave',['Mapel',{id_mapel:'${esc(id || '')}',nama_mapel:$('mn').value,id_kelas:$('mk').value,id_guru:$('mg').value}],()=>rKelola())">Simpan</button></div>`);
}
