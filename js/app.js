// LMS SMPN 2 Walea — SPA statis. Token hanya di memori/sessionStorage, bukan di URL.
const App = { token: null, user: null, page: null, data: null };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const $ = id => document.getElementById(id);
const IC = { dashboard:'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z', mapel:'M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z',
  tugas:'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9', nilai:'M4 20V10M10 20V4M16 20v-7M22 20H2' };
const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[n]}"/></svg>`;
const MENU = { siswa:['dashboard','mapel','tugas','nilai'], guru:['dashboard','mapel','tugas'], wali_kelas:['dashboard','mapel','tugas'], kepsek:['dashboard','mapel','tugas'] };
const LBL = { dashboard:'Dashboard', mapel:'Mata Pelajaran', tugas:'Tugas', nilai:'Nilai Saya' };

function toast(m) { const t = $('toast'); t.textContent = m; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 3500); }
const wita = i => new Date(i).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short', timeZone:'Asia/Makassar' }) + ' WITA';
const view = h => { $('app-container').innerHTML = h; };

function renderLogin(msg) {
  document.body.classList.add('out');
  view(`<form class="card login" onsubmit="doLoginUI(event)">
    <h1>LMS SMPN 2 Walea Kepulauan</h1><p class="mu">Masuk dengan NIS/NIP dan PIN 6 digit.</p>
    <label for="nis">NIS / NIP</label><input id="nis" inputmode="numeric" autocomplete="username" required>
    <label for="pin">PIN</label><input id="pin" type="password" inputmode="numeric" maxlength="6" pattern="\\d{6}" autocomplete="current-password" required>
    ${msg ? `<div class="err" role="alert">${esc(msg)}</div>` : ''}
    <button class="btn" id="lb" style="width:100%;margin-top:1.5rem">Masuk ke Pembelajaran</button></form>`);
}
const stat = (n, l) => `<div class="card stat"><b>${esc(n)}</b><small>${l}</small></div>`;
const bdg = t => ({ belum:['b-bd','Belum dikerjakan'], dikirim:['b-wr','Menunggu nilai'], dinilai:['b-ok','Sudah dinilai'], guru:['b-pr','Aktif'] }[t.status]);
const tRow = t => { const [c, l] = bdg(t); return `<div class="row"><div><b>${esc(t.judul)}</b><br><small>${esc(t.mapel)} · Tenggat ${wita(t.batas)}</small></div>
  <div><span class="badge ${c}">${l}</span> ${t.status === 'belum' ? `<button class="btn" onclick="kerjakan('${esc(t.id)}')">Kerjakan</button>` : t.nilai !== null ? `<b>${esc(t.nilai)}</b>/${esc(t.nilaiMaks)}` : ''}</div></div>`; };

function rDash(d) {
  const sis = d.s.peran === 'siswa', belum = d.tugas.filter(t => t.status === 'belum').length;
  view(`<h1>Halo, ${esc(d.s.nama)}</h1><p class="mu">${sis ? 'Selamat belajar mandiri hari ini.' : 'Ringkasan pembelajaran Anda.'}</p>
  <div class="grid">${sis ? stat(belum, 'Tugas belum dikerjakan') : stat(d.perluNilai, 'Jawaban perlu dinilai')}${stat(d.rata ?? '–', sis ? 'Rata-rata nilai' : 'Rata-rata nilai tugas')}${stat(d.mapel.length, 'Mata pelajaran')}</div>
  <div class="card"><h2>Tugas Mendatang</h2>${d.tugas.slice(0, 5).map(tRow).join('') || '<p class="mu">Belum ada tugas.</p>'}</div>`);
}
function rMapel(d) {
  view(`<h1>Mata Pelajaran</h1><div class="grid">${d.mapel.map(m => `<div class="card"><span class="badge b-pr">${esc(m.kelas)}</span><h2 style="margin-top:.5rem">${esc(m.nama)}</h2>
  <div class="bar"><i style="width:${Math.min(100, d.tugas.filter(t => t.mapel === m.nama && t.status !== 'belum').length / Math.max(1, d.tugas.filter(t => t.mapel === m.nama).length) * 100)}%"></i></div></div>`).join('') || '<p class="mu">Belum ada mapel.</p>'}</div>`);
}
function rTugas(d) { view(`<h1>Daftar Tugas</h1><div class="card">${d.tugas.map(tRow).join('') || '<p class="mu">Belum ada tugas.</p>'}</div>`); }
function rNilai(d) {
  const g = d.tugas.filter(t => t.status === 'dinilai');
  view(`<h1>Nilai Saya</h1><div class="grid">${stat(d.rata ?? '–', 'Rata-rata nilai tugas')}</div><div class="card">${g.map(t => `<div class="row"><div><b>${esc(t.judul)}</b><br><small>${esc(t.mapel)}</small></div><b>${esc(t.nilai)}/${esc(t.nilaiMaks)}</b></div>`).join('') || '<p class="mu">Belum ada nilai yang keluar.</p>'}</div>`);
}
function kerjakan(id) {
  App.page = 'kerjakan';
  const t = App.data.tugas.find(x => x.id === id);
  view(`<a class="mu" onclick="go('tugas')" style="cursor:pointer">← Kembali ke daftar tugas</a><h1>${esc(t.judul)}</h1>
  <p>${esc(t.instruksi)}</p><small>Tenggat ${wita(t.batas)}</small>
  <label for="jw">Jawaban Anda</label><textarea id="jw" rows="10" maxlength="5000" oninput="draft('${esc(id)}',this.value)">${esc(localStorage.getItem('draft_'+id)||'')}</textarea>
  <button class="btn" id="kb" style="margin-top:1rem" onclick="kirim('${esc(id)}')">Kirim Jawaban</button>`);
}
// ---- Sesi & cache klien (sessionStorage: hilang saat tab ditutup, aman untuk HP/komputer bersama) ----
const KEY = 'lms_sess';
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ t: App.token, u: App.user, d: App.data })); } catch (e) {} };
const draft = (id, v) => { try { localStorage.setItem('draft_' + id, v); } catch (e) {} };
function shell() {
  $('who').textContent = `${App.user.nama}${App.user.kelas ? ' · ' + App.user.kelas : ''}`;
  const links = (MENU[App.user.peran] || MENU.guru).map(p => `<a data-p="${p}" onclick="go('${p}')" role="link" tabindex="0">${ic(p)}<span>${LBL[p]}</span></a>`).join('');
  $('nav').innerHTML = links; $('bnav').innerHTML = links; document.body.classList.remove('out');
}
async function doLoginUI(e) {
  e.preventDefault(); const b = $('lb'); b.disabled = true; b.textContent = 'Memproses...';
  const r = await api('login', $('nis').value, $('pin').value);
  if (!r.success) return renderLogin(r.message + (r.data && r.data.sisa > 0 ? ` Sisa percobaan: ${r.data.sisa}.` : ''));
  App.token = r.data.token; App.user = r.data;
  const d = await api('boot', App.token);
  if (!d.success) return renderLogin(d.message);
  App.data = d.data; shell(); save(); go('dashboard');
}
function expired() { sessionStorage.removeItem(KEY); App.token = App.user = App.data = null; renderLogin('Sesi berakhir, silakan masuk kembali.'); }
// Navigasi 0 ms: render dari data lokal, tanpa request.
function go(p) {
  App.page = p; document.querySelectorAll('[data-p]').forEach(a => a.classList.toggle('on', a.dataset.p === p));
  ({ dashboard: rDash, mapel: rMapel, tugas: rTugas, nilai: rNilai })[p](App.data);
}
// Sinkron latar belakang (jangan menimpa layar saat siswa sedang mengetik jawaban).
async function refresh() {
  if (!App.token) return;
  const d = await api('boot', App.token);
  if (d.success) { App.data = d.data; save(); if (App.page && App.page !== 'kerjakan') go(App.page); }
  else if (d.message === 'SESI') expired();
}
async function logout() { const t = App.token; sessionStorage.removeItem(KEY); App.token = App.user = App.data = null; renderLogin(); api('logout', t); }
// Optimistic UI: status langsung berubah, server menyusul; gagal -> dikembalikan, draf tetap aman.
async function kirim(id) {
  const v = $('jw').value.trim();
  if (!v) return toast('Jawaban masih kosong.');
  if (!confirm('Jawaban yang dikirim tidak dapat diubah. Kirim sekarang?')) return;
  const t = App.data.tugas.find(x => x.id === id), old = t.status;
  t.status = 'dikirim'; save(); go('tugas'); toast('Mengirim jawaban...');
  const r = await api('submit', App.token, id, v);
  if (r.success) { try { localStorage.removeItem('draft_' + id); } catch (e) {} toast('Jawaban terkirim.'); refresh(); }
  else { t.status = old; save(); go('tugas'); toast(r.message); if (r.message === 'SESI') expired(); }
}
(function () {
  let s = null; try { s = JSON.parse(sessionStorage.getItem(KEY)); } catch (e) {}
  if (s && s.t && s.d) { App.token = s.t; App.user = s.u; App.data = s.d; shell(); go('dashboard'); refresh(); } else renderLogin();
  setInterval(refresh, 120000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
