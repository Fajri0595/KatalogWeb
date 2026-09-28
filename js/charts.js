/* ============================================================
   charts.js — grafik SVG profesional & ringan tanpa pustaka
   ============================================================ */
function labelKunci(k, mode) {
  if (mode === 'bulan') { const p = String(k).split('-'); return BLN[+p[1] - 1] + ' ' + String(p[0]).slice(2); }
  const p = String(k).split('-'); return +p[2] + ' ' + BLN[+p[1] - 1];
}
function singkatRp(n) {
  n = Math.round(Number(n) || 0);
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.0', '') + ' M';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + ' jt';
  if (n >= 1e3) return Math.round(n / 1e3) + ' rb';
  return String(n);
}

// Bantuan kurva spline Bezier halus
function jalurKurva(pts) {
  if (pts.length <= 1) return pts.map((p) => (p ? 'M ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) : '')).join(' ');
  let d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ' C ' + cp1x.toFixed(1) + ' ' + cp1y.toFixed(1) + ', ' + cp2x.toFixed(1) + ' ' + cp2y.toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d;
}

// Grafik area/garis: penjualan (garis kurva tebal + gradient area) & kunjungan (garis putus-putus)
function grafikTren(deret, mode) {
  const n = deret.length;
  if (!n) return '<div class="empty" style="padding:32px">Belum ada data pada periode ini.</div>';
  const W = 740, H = 260, pl = 58, pr = 16, pt = 20, pb = 32;
  const maxP = Math.max(1, ...deret.map((d) => d.pendapatan));
  const maxK = Math.max(1, ...deret.map((d) => d.kunjungan));

  const x = (i) => (n === 1 ? (pl + (W - pl - pr) / 2) : pl + i * (W - pl - pr) / (n - 1));
  const yP = (v) => pt + (H - pt - pb) * (1 - v / maxP);
  const yK = (v) => pt + (H - pt - pb) * (1 - v / maxK * 0.85);

  // Sumbu Y & Garis Grid Horizontal
  let grid = '';
  let yAxisLabels = '';
  const ySteps = 3;
  for (let i = 0; i <= ySteps; i++) {
    const yVal = pt + (H - pt - pb) * i / ySteps;
    const nominal = maxP * (1 - i / ySteps);
    const teksNominal = i === ySteps ? '0' : singkatRp(nominal);
    grid += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yVal.toFixed(1) + '" y2="' + yVal.toFixed(1) + '" stroke="' + (i === ySteps ? '#CBD5E1' : 'rgba(226, 232, 240, 0.85)') + '" stroke-width="1"' + (i === ySteps ? '' : ' stroke-dasharray="3 3"') + '/>';
    yAxisLabels += '<text x="' + (pl - 10) + '" y="' + (yVal + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="#94A3B8" font-family="JetBrains Mono, monospace">' + esc(teksNominal) + '</text>';
  }

  // Kurva data
  const ptsP = deret.map((d, i) => [x(i), yP(d.pendapatan)]);
  const ptsK = deret.map((d, i) => [x(i), yK(d.kunjungan)]);
  const kurvaP = jalurKurva(ptsP);
  const kurvaK = jalurKurva(ptsK);
  const areaP = kurvaP + ' L ' + x(n - 1).toFixed(1) + ' ' + (H - pb) + ' L ' + x(0).toFixed(1) + ' ' + (H - pb) + ' Z';

  // Label Sumbu X dengan pencegahan tabrakan pintar
  const labelIndices = [];
  const minGap = 68; // Jarak pixel minimal antar label tanggal
  let lastX = -999;
  for (let i = 0; i < n; i++) {
    const curX = x(i);
    const distFromEnd = x(n - 1) - curX;
    if (i === 0) {
      labelIndices.push(i);
      lastX = curX;
    } else if (i === n - 1) {
      if (curX - lastX >= minGap * 0.72) {
        labelIndices.push(i);
      } else if (labelIndices.length > 1) {
        labelIndices[labelIndices.length - 1] = i; // Gantikan label sebelum terakhir jika terlalu mepet
      }
    } else if (curX - lastX >= minGap && distFromEnd >= minGap) {
      labelIndices.push(i);
      lastX = curX;
    }
  }

  let lab = '';
  labelIndices.forEach((i) => {
    const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
    lab += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="' + anchor + '" font-size="11" font-weight="500" fill="#64748B" font-family="JetBrains Mono, monospace">' + esc(labelKunci(deret[i].kunci, mode)) + '</text>';
  });

  // Titik data (data dots) dengan tooltip informatif
  let titik = '';
  deret.forEach((d, i) => {
    const akhir = i === n - 1;
    const adaPenjualan = d.pendapatan > 0;
    if (adaPenjualan || akhir) {
      const cx = x(i).toFixed(1);
      const cy = yP(d.pendapatan).toFixed(1);
      titik += '<g class="chart-pt" style="cursor:pointer">';
      if (adaPenjualan) {
        titik += '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="rgba(79, 70, 229, 0.15)"/>';
      }
      titik += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (akhir ? 5 : 4) + '" fill="' + (adaPenjualan || akhir ? '#4F46E5' : '#fff') + '" stroke="#fff" stroke-width="2"/>';
      titik += '<title>' + esc(labelKunci(d.kunci, mode) + '\nPenjualan: ' + rupiah(d.pendapatan) + '\nKunjungan: ' + d.kunjungan + ' kali') + '</title></g>';
    }
  });

  const id = 'g' + Math.random().toString(36).slice(2, 7);
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik tren penjualan dan kunjungan" style="width:100%;height:auto;overflow:visible">' +
    '<defs>' +
      '<linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1">' +
        '<stop offset="0%" stop-color="#4F46E5" stop-opacity="0.22"/>' +
        '<stop offset="85%" stop-color="#4F46E5" stop-opacity="0.02"/>' +
        '<stop offset="100%" stop-color="#4F46E5" stop-opacity="0"/>' +
      '</linearGradient>' +
    '</defs>' +
    grid + yAxisLabels +
    '<path d="' + kurvaK + '" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4 4" stroke-linejoin="round" opacity="0.85"/>' +
    '<path d="' + areaP + '" fill="url(#' + id + ')"/>' +
    '<path d="' + kurvaP + '" fill="none" stroke="#4F46E5" stroke-width="2.75" stroke-linejoin="round" stroke-linecap="round"/>' +
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
