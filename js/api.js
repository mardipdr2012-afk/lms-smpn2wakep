// POST wajib text/plain agar tidak memicu CORS preflight yang diblok GAS.
async function api(action, ...args) {
  try {
    const r = await fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, args }) });
    return await r.json();
  } catch (e) { return { success: false, message: 'Tidak ada koneksi ke server. Coba lagi.' }; }
}
