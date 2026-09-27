/* ============================================================
   charts.js — grafik SVG ringan tanpa pustaka
   ============================================================ */
function labelKunci(k, mode) {
  if (mode === 'bulan') { const p = String(k).split('-'); return BLN[+p[1] - 1] + ' ' + String(p[0]).slice(2); }
  const p = String(k).split('-'); return +p[2] + ' ' + BLN[+p[1] - 1];
}
function singkatRp(n) {
  if (n >= 1e6) return (Math.round(n / 1e5) / 10) + ' jt';
  if (n >= 1e3) return Math.round(n / 1e3) + ' rb';
  return String(n);
}
// Grafik area/garis: penjualan (garis tebal + area) & kunjungan (garis putus-putus)
function grafikTren(deret, mode) {
  const n = deret.length;
  if (!n) return '<div class="empty" style="padding:32px">Belum ada data pada periode ini.</div>';
  const W = 720, H = 250, pl = 12, pr = 12, pt = 16, pb = 30;
  const maxP = Math.max(1, ...deret.map((d) => d.pendapatan));
  const maxK = Math.max(1, ...deret.map((d) => d.kunjungan));
  const x = (i) => (n === 1 ? W / 2 : pl + i * (W - pl - pr) / (n - 1));
  const yP = (v) => pt + (H - pt - pb) * (1 - v / maxP);
  const yK = (v) => pt + (H - pt - pb) * (1 - v / maxK * 0.85);
  const garis = (f, key) => deret.map((d, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + f(d[key]).toFixed(1)).join(' ');
  const areaP = garis(yP, 'pendapatan') + ' L' + x(n - 1).toFixed(1) + ' ' + (H - pb) + ' L' + x(0).toFixed(1) + ' ' + (H - pb) + ' Z';
  let grid = '';
  for (let i = 0; i <= 3; i++) { const y = pt + (H - pt - pb) * i / 3; grid += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1"/>'; }
  const langkah = Math.max(1, Math.ceil(n / 6));
  let lab = '';
  deret.forEach((d, i) => { if (i % langkah === 0 || i === n - 1) lab += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle') + '" font-size="11" fill="#64748B" font-family="JetBrains Mono, monospace">' + esc(labelKunci(d.kunci, mode)) + '</text>'; });
  let titik = '';
  if (n <= 45) deret.forEach((d, i) => {
    const akhir = i === n - 1;
    if (d.pendapatan > 0 || akhir) titik += '<circle cx="' + x(i).toFixed(1) + '" cy="' + yP(d.pendapatan).toFixed(1) + '" r="' + (akhir ? 5 : 3.5) + '" fill="' + (akhir ? '#4F46E5' : '#fff') + '" stroke="#4F46E5" stroke-width="2"><title>' + esc(labelKunci(d.kunci, mode) + ' — ' + rupiah(d.pendapatan) + ' · ' + d.kunjungan + ' kunjungan') + '</title></circle>';
  });
  const id = 'g' + Math.random().toString(36).slice(2, 7);
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik tren penjualan dan kunjungan">' +
    '<defs><linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4F46E5" stop-opacity=".25"/><stop offset="1" stop-color="#4F46E5" stop-opacity="0"/></linearGradient></defs>' +
    grid +
    '<path d="' + garis(yK, 'kunjungan') + '" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4 4" stroke-linejoin="round"/>' +
    '<path d="' + areaP + '" fill="url(#' + id + ')"/>' +
    '<path d="' + garis(yP, 'pendapatan') + '" fill="none" stroke="#4F46E5" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
    titik + lab + '</svg>';
}
function barStatus(st) {
  const total = (st.Disetujui || 0) + (st['Menunggu Verifikasi'] || 0) + (st.Ditolak || 0);
  const p = (v) => (total ? v / total * 100 : 0);
  const pc = (v) => Math.round(p(v));
  return '<div class="stackbar">' +
    '<i style="width:' + p(st.Disetujui) + '%;background:#4F46E5"></i><i style="width:' + p(st['Menunggu Verifikasi']) + '%;background:#A5B4FC"></i><i style="width:' + p(st.Ditolak) + '%;background:#FCA5A5"></i></div>' +
    '<ul class="dist">' +
    '<li><i style="background:#4F46E5"></i>Disetujui &amp; Selesai<b>' + pc(st.Disetujui) + '% (' + (st.Disetujui || 0) + ')</b></li>' +
    '<li><i style="background:#A5B4FC"></i>Menunggu Verifikasi<b>' + pc(st['Menunggu Verifikasi']) + '% (' + (st['Menunggu Verifikasi'] || 0) + ')</b></li>' +
    '<li><i style="background:#FCA5A5"></i>Ditolak<b>' + pc(st.Ditolak) + '% (' + (st.Ditolak || 0) + ')</b></li></ul>';
}
function barTerlaris(list) {
  if (!list.length) return '<div class="empty" style="padding:24px">Belum ada penjualan pada periode ini.</div>';
  return '<div class="hbars">' + list.map((a, i) => '<div class="hb"><div class="top"><span>' + (i + 1) + '. ' + esc(a.nama) + '</span><b class="mono" style="font-size:12px">' + rupiah(a.omzet) + '</b></div>' +
    '<div class="track"><i style="width:' + Math.max(3, a.pangsa) + '%"></i></div><div class="sub"><span>' + a.pesanan + ' pesanan</span><span>' + a.pangsa + '% pangsa</span></div></div>').join('') + '</div>';
}
