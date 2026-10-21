// Pembantu UI bersama: formulir, tombol aksi, ubah PIN
const dtl = v => { const d = v ? new Date(v) : new Date(Date.now() + 7 * 864e5), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const toIso = v => v ? new Date(v).toISOString() : '';
const field = (id, t, v = '', x = '') => `<label for="${id}">${t}</label><input id="${id}" value="${esc(v)}" ${x}>`;
const area = (id, t, v = '', r = 5) => `<label for="${id}">${t}</label><textarea id="${id}" rows="${r}">${esc(v)}</textarea>`;
const selc = (id, t, opts, cur) => `<label for="${id}">${t}</label><select id="${id}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const back = (fn, l = '← Kembali') => `<a class="back" role="link" tabindex="0" onclick="${fn}">${l}</a>`;
const sub = () => { App.page = 'kerjakan'; }; // halaman non-menu: jangan ditimpa sinkron latar belakang
const isGuru = () => ['guru', 'wali_kelas'].includes(App.user.peran);
const linkify = s => esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g, '<br>');
async function act(btn, name, args, after) {
  const o = btn.textContent; btn.disabled = true; btn.textContent = 'Memproses...';
  const r = await api(name, App.token, ...args);
  btn.disabled = false; btn.textContent = o;
  if (!r.success) { if (r.message === 'SESI') expired(); else toast(r.message); return r; }
  if (r.message) toast(r.message);
  await refresh(); if (after) after(r); return r;
}
function hapus(btn, fn, id, mid) { if (confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) act(btn, fn, [id], () => mapelDetail(mid)); }
function rPin() {
  sub(); view(`${back("go('dashboard')")}<div class="card login"><h1>Ubah PIN</h1>
  ${field('p0', 'PIN lama', '', 'type="password" inputmode="numeric" maxlength="6" autocomplete="current-password"')}
  ${field('p1', 'PIN baru (6 angka)', '', 'type="password" inputmode="numeric" maxlength="6" autocomplete="new-password"')}
  <button class="btn" style="width:100%;margin-top:1.5rem" onclick="act(this,'ubahPin',[$('p0').value,$('p1').value],()=>go('dashboard'))">Simpan PIN</button></div>`);
}
