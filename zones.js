/* Cảnh nền động theo khu vực (vẽ bằng mã, không dùng ảnh ngoài).
   Mỗi khu: lớp tĩnh vẽ sẵn 1 lần vào bộ đệm + lớp chuyển động mỗi khung hình.
   Toạ độ logic: rộng 360, mặt sàn chiến đấu ở y = 470 (đã được dịch theo chiều cao máy). */
'use strict';
const ZONES = {
  'nui-lua':   { n: 'Núi Lửa',     sky: ['#2a0a06', '#7a1d08', '#e0561a'], ground: '#2b1a17', floor: '#3d2620' },
  'rung':      { n: 'Rừng Cổ Thụ', sky: ['#0d2a1c', '#1f5a36', '#7fc48a'], ground: '#28402a', floor: '#3a5a32' },
  'dam-doc':   { n: 'Đầm Độc',     sky: ['#0f1a10', '#2a4a1c', '#7ab03a'], ground: '#2a3320', floor: '#3a4a26' },
  'sa-mac':    { n: 'Sa Mạc',      sky: ['#3a1e4a', '#d9673a', '#ffd27a'], ground: '#c08a4a', floor: '#d9a35a' },
  'bang':      { n: 'Băng Nguyên', sky: ['#0a1a3a', '#2a5a9a', '#bfe6ff'], ground: '#cfe4f2', floor: '#e6f3fb' },
  'bien':      { n: 'Bờ Biển',     sky: ['#0a2a4a', '#2a7ab0', '#a6e6ff'], ground: '#c9b07a', floor: '#e0c890' },
  'bao':       { n: 'Đỉnh Bão',    sky: ['#0a0e1e', '#2a3150', '#5a6688'], ground: '#3a3f4a', floor: '#4a505c' },
  'ham-am':    { n: 'Hắc Ám Thành', sky: ['#07040f', '#2a1048', '#6a2a8a'], ground: '#1e1828', floor: '#2c2238' },
  'thanh-dia': { n: 'Thánh Địa',   sky: ['#4a3a1a', '#d9a845', '#fff2c0'], ground: '#d8c9a0', floor: '#efe2bd' },
  'lau-dai':   { n: 'Lâu Đài',     sky: ['#2a4a8a', '#6a8fd8', '#cfe2ff'], ground: '#6b5236', floor: '#8a6a44' },
  'dau-truong':{ n: 'Đấu Trường',  sky: ['#140c2a', '#3a2260', '#c8603a'], ground: '#b98a52', floor: '#d6a868' },
};
const ZONE_OF_ELEM = { hoa: 'nui-lua', moc: 'rung', doc: 'dam-doc', tho: 'sa-mac', bang: 'bang', thuy: 'bien', loi: 'bao', phong: 'bao', am: 'ham-am', quang: 'thanh-dia', vo: 'lau-dai' };
const ZONE_LIST = Object.keys(ZONES).filter(k => k !== 'dau-truong'); // đấu trường chỉ dùng cho Đấu Hạng / Giải Vô Địch

// số giả ngẫu nhiên ổn định (vẽ lớp tĩnh giống nhau mỗi lần)
function zrand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const ZCACHE = {};
function zoneStatic(id, dpr) {
  const key = id + '@' + dpr; if (ZCACHE[key]) return ZCACHE[key];
  const Z = ZONES[id], W = 360, H = 640, c = document.createElement('canvas');
  c.width = W * dpr; c.height = H * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  const r = zrand(id.length * 977 + id.charCodeAt(0) * 31);
  const g = x.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, Z.sky[0]); g.addColorStop(0.55, Z.sky[1]); g.addColorStop(1, Z.sky[2]);
  x.fillStyle = g; x.fillRect(0, 0, W, 480);
  const ridge = (y0, amp, col, seg, rough) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, 480); x.lineTo(0, y0); let px = 0; while (px < W) { px += seg * (0.6 + r() * 0.8); x.lineTo(px, y0 - r() * amp * (rough || 1)); } x.lineTo(W, 480); x.closePath(); x.fill(); };
  const tree = (tx, ty, s, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(tx, ty - 90 * s); x.lineTo(tx + 26 * s, ty); x.lineTo(tx - 26 * s, ty); x.fill(); x.fillRect(tx - 3 * s, ty, 6 * s, 14 * s); };
  switch (id) {
    case 'nui-lua':
      ridge(330, 40, '#3a0f0a', 40);
      x.fillStyle = '#1e0a08'; x.beginPath(); x.moveTo(60, 470); x.lineTo(150, 200); x.lineTo(170, 192); x.lineTo(190, 196); x.lineTo(210, 205); x.lineTo(300, 470); x.fill();
      x.fillStyle = '#ff7a1a'; x.beginPath(); x.ellipse(180, 198, 24, 7, 0, 0, Math.PI * 2); x.fill();
      for (let i = 0; i < 4; i++) { x.strokeStyle = 'rgba(255,120,30,.75)'; x.lineWidth = 3 + i; x.beginPath(); x.moveTo(170 + i * 6, 202); x.quadraticCurveTo(150 + i * 20, 300, 120 + i * 40, 470); x.stroke(); }
      ridge(410, 30, '#160806', 26, 1.2);
      break;
    case 'rung': case 'dam-doc':
      for (let L = 0; L < 3; L++) { const col = id === 'rung' ? ['#1a4a2c', '#143a22', '#0c2a18'][L] : ['#24401c', '#1a3214', '#10220c'][L]; for (let i = 0; i < 12; i++) tree(i * 34 - 10 + r() * 20, 380 + L * 40, 0.8 + L * 0.35 + r() * 0.3, col); }
      if (id === 'dam-doc') { x.fillStyle = 'rgba(90,160,40,.35)'; x.fillRect(0, 440, W, 40); }
      break;
    case 'sa-mac':
      x.fillStyle = 'rgba(255,240,180,.9)'; x.beginPath(); x.arc(270, 150, 34, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#a0603a'; x.beginPath(); x.moveTo(40, 400); x.lineTo(110, 300); x.lineTo(180, 400); x.fill();
      x.fillStyle = '#8a5030'; x.beginPath(); x.moveTo(170, 400); x.lineTo(220, 330); x.lineTo(270, 400); x.fill();
      x.fillStyle = '#c98a4a'; x.beginPath(); x.moveTo(0, 470); x.quadraticCurveTo(90, 380, 200, 440); x.quadraticCurveTo(280, 400, 360, 430); x.lineTo(360, 480); x.lineTo(0, 480); x.fill();
      break;
    case 'bang':
      ridge(300, 120, '#5a7fb0', 60, 1); ridge(360, 80, '#9cc0e0', 46, 1);
      x.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 6; i++) { const px = r() * W; x.beginPath(); x.moveTo(px - 30, 320); x.lineTo(px, 240 + r() * 40); x.lineTo(px + 30, 320); x.fill(); }
      ridge(420, 40, '#d8ecfa', 30);
      break;
    case 'bien':
      x.fillStyle = 'rgba(255,250,220,.9)'; x.beginPath(); x.arc(90, 130, 26, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#1e5a8a'; x.fillRect(0, 330, W, 120);
      x.fillStyle = '#123a5a'; x.beginPath(); x.moveTo(240, 330); x.lineTo(270, 250); x.lineTo(275, 330); x.fill(); x.fillRect(250, 300, 50, 30);
      break;
    case 'bao':
      ridge(360, 120, '#1e2236', 50, 1.2); ridge(420, 60, '#161a28', 30);
      break;
    case 'ham-am':
      x.fillStyle = 'rgba(230,220,255,.9)'; x.beginPath(); x.arc(280, 110, 30, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#120a1e'; const tw = (tx, w, h) => { x.fillRect(tx, 470 - h, w, h); x.beginPath(); x.moveTo(tx - 6, 470 - h); x.lineTo(tx + w / 2, 470 - h - 40); x.lineTo(tx + w + 6, 470 - h); x.fill(); };
      tw(20, 40, 220); tw(80, 30, 160); tw(140, 70, 280); tw(230, 36, 190); tw(290, 50, 240);
      x.fillStyle = 'rgba(255,200,90,.8)'; for (let i = 0; i < 10; i++) x.fillRect(30 + r() * 300, 260 + r() * 150, 4, 7);
      break;
    case 'thanh-dia':
      for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(255,250,230,.55)'; x.fillRect(20 + i * 60, 230, 22, 240); x.fillRect(14 + i * 60, 224, 34, 10); }
      x.fillStyle = 'rgba(255,245,210,.5)'; x.beginPath(); x.moveTo(0, 230); x.lineTo(180, 150); x.lineTo(360, 230); x.fill();
      break;
    case 'dau-truong': {
      // ba tầng khán đài vòng cung (tường đá), khán giả vẽ ở lớp động
      const tiers = [[150, '#4a3a52'], [230, '#5a4660'], [310, '#6a5470']];
      for (const [ty, col] of tiers) { x.fillStyle = col; x.beginPath(); x.moveTo(-20, ty + 60); x.quadraticCurveTo(180, ty - 40, 380, ty + 60); x.lineTo(380, ty + 90); x.quadraticCurveTo(180, ty - 10, -20, ty + 90); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(-20, ty + 90); x.quadraticCurveTo(180, ty - 10, 380, ty + 90); x.stroke(); }
      // tường chắn sân + cổng vòm
      x.fillStyle = '#3a2a30'; x.fillRect(0, 400, W, 70);
      x.fillStyle = '#21161c'; for (let i = 0; i < 7; i++) { const ax = 12 + i * 52; x.beginPath(); x.moveTo(ax, 470); x.lineTo(ax, 425); x.arc(ax + 16, 425, 16, Math.PI, 0); x.lineTo(ax + 32, 470); x.fill(); }
      x.fillStyle = '#c9a050'; x.fillRect(0, 398, W, 5);
      // băng rôn đỏ dọc tường
      for (let i = 0; i < 4; i++) { x.fillStyle = '#da251d'; x.fillRect(30 + i * 90, 404, 26, 28); x.fillStyle = '#ffde00'; x.font = 'bold 14px Arial'; x.fillText('★', 36 + i * 90, 423); }
      break;
    }
    default:
      x.fillStyle = '#7d86a0'; for (let i = 0; i < 5; i++) { const px = i * 80 - 10, h = 120 + (i % 2) * 50; x.fillRect(px, 470 - h, 50, h); for (let k = 0; k < 4; k++) x.fillRect(px + k * 14, 460 - h, 8, 12); }
      x.fillStyle = '#8a92aa'; x.fillRect(150, 230, 70, 240); x.fillStyle = '#c0392b'; x.beginPath(); x.moveTo(140, 232); x.lineTo(185, 160); x.lineTo(230, 232); x.fill();
  }
  // mặt sàn
  x.fillStyle = Z.ground; x.fillRect(0, 470, W, H - 470);
  const fg = x.createLinearGradient(0, 455, 0, 520); fg.addColorStop(0, Z.floor); fg.addColorStop(1, Z.ground);
  x.fillStyle = fg; x.beginPath(); x.ellipse(180, 478, 230, 34, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 16; i++) x.fillRect(r() * W, 500 + r() * 140, 20 + r() * 30, 4);
  if (id === 'dau-truong') { x.strokeStyle = 'rgba(255,240,200,.55)'; x.lineWidth = 3; x.beginPath(); x.ellipse(180, 482, 150, 26, 0, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.ellipse(180, 482, 40, 8, 0, 0, Math.PI * 2); x.stroke(); }
  ZCACHE[key] = c; return c;
}

// lớp chuyển động
function zoneAnim(x, id, t, st) {
  st.p = st.p || [];
  const P = st.p, spawn = (n, f) => { while (P.length < n) P.push(f()); };
  x.save();
  switch (id) {
    case 'nui-lua': {
      // dung nham chảy dưới chân hai bên + ánh sáng nhấp nháy
      const pulse = 0.55 + Math.sin(t * 2.2) * 0.2;
      x.globalCompositeOperation = 'lighter';
      for (const side of [-1, 1]) {
        const cx = side < 0 ? 30 : 330; const gr = x.createRadialGradient(cx, 520, 4, cx, 520, 120); gr.addColorStop(0, `rgba(255,120,20,${pulse})`); gr.addColorStop(1, 'rgba(255,60,0,0)');
        x.fillStyle = gr; x.fillRect(cx - 130, 400, 260, 240);
      }
      x.globalCompositeOperation = 'source-over';
      if (!st.img) for (let k = 0; k < 2; k++) { // dòng dung nham uốn lượn, cuộn sóng (ảnh nền AI đã có dung nham thì bỏ)
        const y0 = 560 + k * 46; x.beginPath(); x.moveTo(0, y0);
        for (let px = 0; px <= 360; px += 12) x.lineTo(px, y0 + Math.sin(px * 0.04 + t * 1.6 + k) * 6);
        x.lineTo(360, y0 + 22); for (let px = 360; px >= 0; px -= 12) x.lineTo(px, y0 + 22 + Math.sin(px * 0.05 - t * 1.3 + k) * 5); x.closePath();
        const lg = x.createLinearGradient(0, y0, 0, y0 + 24); lg.addColorStop(0, '#ffd04a'); lg.addColorStop(0.5, '#ff6a14'); lg.addColorStop(1, '#a8200a'); x.fillStyle = lg; x.fill();
        x.globalAlpha = 0.6; x.fillStyle = '#fff1a0'; for (let i = 0; i < 8; i++) { const px = ((i * 53 + t * 40 * (k ? -1 : 1)) % 400 + 400) % 400 - 20; x.beginPath(); x.ellipse(px, y0 + 10, 10, 2.4, 0, 0, Math.PI * 2); x.fill(); } x.globalAlpha = 1;
      }
      // khói bốc từ miệng núi lửa
      spawn(26, () => ({ k: 'smoke', x: 170 + Math.random() * 20, y: 196, vx: (Math.random() - 0.3) * 0.25, vy: -0.3 - Math.random() * 0.3, r: 8 + Math.random() * 10, a: 0, life: Math.random() }));
      spawn(60, () => ({ k: 'ember', x: Math.random() * 360, y: 470 + Math.random() * 170, vx: (Math.random() - 0.5) * 0.4, vy: -0.6 - Math.random() * 0.9, r: 1 + Math.random() * 2, life: Math.random() }));
      // vòi dung nham phun định kỳ
      const er = (t % 6) / 6; if (er < 0.25 && !st.img) { x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 7) * 0.09, d = er * 4 * 120 * (0.6 + (i % 3) * 0.2); x.fillStyle = 'rgba(255,140,30,.8)'; x.beginPath(); x.arc(180 + Math.cos(a) * d, 196 + Math.sin(a) * d + er * er * 600, 3, 0, Math.PI * 2); x.fill(); } x.globalCompositeOperation = 'source-over'; }
      break;
    }
    case 'rung':
      for (let i = 0; i < 3; i++) { x.globalAlpha = 0.08 + Math.sin(t * 0.6 + i) * 0.04; x.fillStyle = '#fff6b0'; x.beginPath(); x.moveTo(60 + i * 110, 0); x.lineTo(110 + i * 110, 0); x.lineTo(40 + i * 120, 470); x.lineTo(0 + i * 120, 470); x.fill(); }
      x.globalAlpha = 1;
      spawn(30, () => ({ k: 'fly', x: Math.random() * 360, y: 250 + Math.random() * 300, ph: Math.random() * 6, life: Math.random() }));
      spawn(14, () => ({ k: 'leaf', x: Math.random() * 360, y: -10 - Math.random() * 300, vx: 0.3, vy: 0.5 + Math.random() * 0.4, r: 3 + Math.random() * 2, ph: Math.random() * 6 }));
      break;
    case 'dam-doc':
      for (let k = 0; k < 3; k++) { x.globalAlpha = 0.18; x.fillStyle = '#8ad04a'; x.beginPath(); x.ellipse(((t * 12 * (k + 1)) % 520) - 80, 470 + k * 30, 140, 22, 0, 0, Math.PI * 2); x.fill(); }
      x.globalAlpha = 1;
      spawn(22, () => ({ k: 'bubble', x: Math.random() * 360, y: 480 + Math.random() * 150, vy: -0.3 - Math.random() * 0.3, r: 2 + Math.random() * 4, life: Math.random() }));
      break;
    case 'sa-mac':
      spawn(50, () => ({ k: 'sand', x: Math.random() * 360, y: 300 + Math.random() * 340, vx: 2 + Math.random() * 2, vy: (Math.random() - 0.5) * 0.3, life: Math.random() }));
      x.globalAlpha = 0.07 + Math.sin(t) * 0.03; x.fillStyle = '#fff2c0'; x.fillRect(0, 380 + Math.sin(t * 2) * 4, 360, 30); x.globalAlpha = 1;
      break;
    case 'bang':
      for (let k = 0; k < 3; k++) { x.globalAlpha = 0.22; x.strokeStyle = ['#6affc0', '#7ab8ff', '#c08aff'][k]; x.lineWidth = 14; x.beginPath(); for (let px = 0; px <= 360; px += 10) x.lineTo(px, 90 + k * 22 + Math.sin(px * 0.02 + t * 0.8 + k) * 18); x.stroke(); }
      x.globalAlpha = 1;
      spawn(80, () => ({ k: 'snow', x: Math.random() * 360, y: Math.random() * -640, vx: -0.3 + Math.random() * 0.2, vy: 0.6 + Math.random() * 1.2, r: 1 + Math.random() * 2.4, ph: Math.random() * 6 }));
      break;
    case 'bien':
      if (!st.img) for (let k = 0; k < 4; k++) { x.fillStyle = `rgba(${170 + k * 20},${225 + k * 8},255,${0.35 - k * 0.06})`; x.beginPath(); x.moveTo(0, 340 + k * 26); for (let px = 0; px <= 360; px += 10) x.lineTo(px, 340 + k * 26 + Math.sin(px * 0.05 + t * (1.2 + k * 0.3) + k) * 4); x.lineTo(360, 360 + k * 26); x.lineTo(0, 360 + k * 26); x.fill(); }
      x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 18; i++) { const px = (i * 41 + Math.sin(t + i) * 10) % 360, py = 340 + (i * 23) % 100; if (Math.sin(t * 3 + i * 2) > 0.7) x.fillRect(px, py, 3, 1.5); }
      break;
    case 'bao': {
      if (!st.img) for (let k = 0; k < 4; k++) { x.globalAlpha = 0.5; x.fillStyle = '#0c0f1c'; x.beginPath(); x.ellipse(((t * (8 + k * 4) + k * 140) % 560) - 100, 60 + k * 35, 150, 36, 0, 0, Math.PI * 2); x.fill(); }
      x.globalAlpha = 1;
      const fl = (t % 4.3) / 4.3; if (fl < 0.05 || (fl > 0.08 && fl < 0.11)) { x.fillStyle = 'rgba(220,230,255,.35)'; x.fillRect(0, 0, 360, 640); x.strokeStyle = '#e8f0ff'; x.lineWidth = 3; x.beginPath(); let px = 60 + (Math.floor(t / 4.3) * 97) % 240, py = 0; x.moveTo(px, py); while (py < 360) { py += 40; px += (Math.random() - 0.5) * 40; x.lineTo(px, py); } x.stroke(); }
      spawn(90, () => ({ k: 'rain', x: Math.random() * 400, y: Math.random() * -640, vx: -2, vy: 11 + Math.random() * 4 }));
      break;
    }
    case 'ham-am':
      for (let k = 0; k < 3; k++) { x.globalAlpha = 0.2; x.fillStyle = '#7a4aa8'; x.beginPath(); x.ellipse(((t * 10 * (k + 1) + k * 200) % 560) - 100, 440 + k * 28, 170, 26, 0, 0, Math.PI * 2); x.fill(); }
      x.globalAlpha = 1;
      spawn(16, () => ({ k: 'wisp', x: Math.random() * 360, y: 200 + Math.random() * 300, ph: Math.random() * 6, life: Math.random() }));
      break;
    case 'thanh-dia':
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) { x.globalAlpha = 0.07 + Math.sin(t * 0.9 + i) * 0.04; x.fillStyle = '#fff2b0'; x.beginPath(); x.moveTo(150 + i * 15, 0); x.lineTo(180 + i * 15, 0); x.lineTo(80 + i * 60, 470); x.lineTo(40 + i * 60, 470); x.fill(); }
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      spawn(36, () => ({ k: 'spark', x: Math.random() * 360, y: 150 + Math.random() * 400, ph: Math.random() * 6, life: Math.random() }));
      break;
    case 'dau-truong': {
      // đèn chiếu quét
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) { const a = Math.sin(t * 0.6 + i * 2) * 0.5; x.globalAlpha = 0.09; x.fillStyle = '#fff3c0'; x.beginPath(); x.moveTo(i ? 340 : 20, 0); x.lineTo(180 + a * 160 - 50, 480); x.lineTo(180 + a * 160 + 50, 480); x.fill(); }
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      // khán giả: mỗi người một đầu + vai, nhún theo nhịp riêng, thỉnh thoảng giơ tay
      if (!st.crowd) {
        st.crowd = []; const rr = zrand(4242);
        const SK = ['#f0c090', '#d9a070', '#b07850', '#f5d0a8'], SH = ['#da251d', '#ffde00', '#2a6fd0', '#f5f5f5', '#2aa84a', '#da251d', '#e07a1a'];
        for (const [ty, rows] of [[150, 2], [230, 2], [310, 2]]) for (let row = 0; row < rows; row++) for (let px = -10; px < 372; px += 11 + rr() * 3) {
          const u = px / 360 - 0.5, y = ty + 40 + row * 16 - (1 - 4 * u * u) * 50 + 10;
          st.crowd.push({ x: px, y, sk: SK[Math.floor(rr() * 4)], sh: SH[Math.floor(rr() * SH.length)], ph: rr() * 6.28, sp: 4 + rr() * 4, arm: rr() < 0.35, flag: rr() < 0.06 });
        }
      }
      if (!st.img) for (const c of st.crowd) { // ảnh nền AI đã có khán giả thì không vẽ người tí hon
        const hop = Math.max(0, Math.sin(t * c.sp + c.ph)) * 3.5;
        x.fillStyle = c.sh; x.beginPath(); x.ellipse(c.x, c.y + 6 - hop, 5.5, 5, 0, Math.PI, 0); x.fill();
        x.fillStyle = c.sk; x.beginPath(); x.arc(c.x, c.y - 1 - hop, 3.4, 0, Math.PI * 2); x.fill();
        if (c.arm && Math.sin(t * c.sp * 0.5 + c.ph) > 0.2) { x.strokeStyle = c.sk; x.lineWidth = 1.6; x.beginPath(); x.moveTo(c.x - 4, c.y + 3 - hop); x.lineTo(c.x - 6, c.y - 7 - hop); x.moveTo(c.x + 4, c.y + 3 - hop); x.lineTo(c.x + 6, c.y - 7 - hop); x.stroke(); }
        if (c.flag) vnFlag(x, c.x + 3, c.y - 14 - hop, 12, 8, t * 1.5 + c.ph, 0.6);
      }
      // cờ Việt Nam lớn trên nóc khán đài
      // ảnh nền AI: cờ cắm trên cột dọc vành mái khán đài (đặt theo đường mép tường của ảnh); vẽ tay: 3 cờ lớn như cũ
      const FL = st.img ? [[40, 186, 26, 32], [150, 206, 28, 34], [262, 190, 28, 34], [334, 158, 24, 30]] : [[40, 154, 44, 90], [180, 130, 60, 90], [320, 154, 44, 90]];
      for (const [fx, fb, w, ph] of FL) { const fy = fb - ph;
        x.fillStyle = '#cfc6b4'; x.fillRect(fx - 1.2, fy, 2.4, ph); x.fillStyle = '#ffd860'; x.beginPath(); x.arc(fx, fy, 2.2, 0, Math.PI * 2); x.fill();
        vnFlag(x, fx + 1.2, fy + 1.5, w, w * 2 / 3, t + fx * 0.02, 1);
      }
      // pháo giấy rơi
      spawn(40, () => ({ k: 'confetti', x: Math.random() * 360, y: -Math.random() * 640, vx: (Math.random() - 0.5) * 0.6, vy: 0.8 + Math.random() * 1.2, c: ['#da251d', '#ffde00', '#ffffff'][Math.floor(Math.random() * 3)], ph: Math.random() * 6 }));
      break;
    }
    default: // lâu đài: cờ bay
      if (!st.img) for (let i = 0; i < 3; i++) { const fx = 40 + i * 140, fy = 300 - (i % 2) * 50; x.fillStyle = '#5a3a22'; x.fillRect(fx, fy, 3, 40); x.fillStyle = '#c0392b'; x.beginPath(); x.moveTo(fx + 3, fy); for (let k = 0; k <= 6; k++) x.lineTo(fx + 3 + k * 5, fy + Math.sin(t * 5 + k * 0.8 + i) * 3); x.lineTo(fx + 33, fy + 14); for (let k = 6; k >= 0; k--) x.lineTo(fx + 3 + k * 5, fy + 14 + Math.sin(t * 5 + k * 0.8 + i) * 3); x.fill(); }
      if (!st.img) spawn(10, () => ({ k: 'cloud', x: Math.random() * 400, y: 40 + Math.random() * 120, vx: 0.15 + Math.random() * 0.2, r: 30 + Math.random() * 30 }));
  }
  // hạt
  for (const p of P) {
    switch (p.k) {
      case 'smoke': p.x += p.vx; p.y += p.vy; p.r += 0.12; p.life += 0.004; if (p.life > 1 || p.y < -40) Object.assign(p, { x: 170 + Math.random() * 20, y: 196, r: 8 + Math.random() * 6, life: 0 });
        x.globalAlpha = Math.sin(p.life * Math.PI) * 0.35; x.fillStyle = '#4a3a38'; x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2); x.fill(); break;
      case 'ember': p.x += p.vx + Math.sin(t * 3 + p.y * 0.05) * 0.2; p.y += p.vy; if (p.y < 150) { p.y = 640; p.x = Math.random() * 360; }
        x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.8; x.fillStyle = '#ffa030'; x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2); x.fill(); x.globalCompositeOperation = 'source-over'; break;
      case 'fly': x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.4 + Math.sin(t * 3 + p.ph) * 0.4; x.fillStyle = '#f4ff8a'; x.beginPath(); x.arc(p.x + Math.sin(t * 0.7 + p.ph) * 14, p.y + Math.cos(t * 0.9 + p.ph) * 10, 2, 0, Math.PI * 2); x.fill(); x.globalCompositeOperation = 'source-over'; break;
      case 'leaf': p.x += p.vx + Math.sin(t * 2 + p.ph) * 0.6; p.y += p.vy; if (p.y > 650) { p.y = -10; p.x = Math.random() * 360; }
        x.globalAlpha = 0.85; x.fillStyle = '#7fbf4a'; x.save(); x.translate(p.x, p.y); x.rotate(t * 2 + p.ph); x.beginPath(); x.ellipse(0, 0, p.r, p.r / 2, 0, 0, Math.PI * 2); x.fill(); x.restore(); break;
      case 'bubble': p.y += p.vy; p.life += 0.006; if (p.life > 1) Object.assign(p, { y: 480 + Math.random() * 150, x: Math.random() * 360, life: 0 });
        x.globalAlpha = 0.6 * (1 - p.life); x.strokeStyle = '#b6ff5a'; x.lineWidth = 1.2; x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2); x.stroke(); break;
      case 'sand': p.x += p.vx; p.y += p.vy; if (p.x > 370) { p.x = -10; p.y = 300 + Math.random() * 340; }
        x.globalAlpha = 0.35; x.fillStyle = '#ffe2a0'; x.fillRect(p.x, p.y, 6, 1.4); break;
      case 'snow': p.x += p.vx + Math.sin(t + p.ph) * 0.3; p.y += p.vy; if (p.y > 650) { p.y = -10; p.x = Math.random() * 360; }
        x.globalAlpha = 0.9; x.fillStyle = '#fff'; x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2); x.fill(); break;
      case 'rain': p.x += p.vx; p.y += p.vy; if (p.y > 650) { p.y = -20; p.x = Math.random() * 400; }
        x.globalAlpha = 0.35; x.strokeStyle = '#aab8e0'; x.lineWidth = 1; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + p.vx * 2, p.y + 14); x.stroke(); break;
      case 'wisp': x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.35 + Math.sin(t * 2 + p.ph) * 0.25; const wx = p.x + Math.sin(t * 0.5 + p.ph) * 30, wy = p.y + Math.cos(t * 0.7 + p.ph) * 20; const wg = x.createRadialGradient(wx, wy, 1, wx, wy, 12); wg.addColorStop(0, '#e0b0ff'); wg.addColorStop(1, 'rgba(160,80,255,0)'); x.fillStyle = wg; x.fillRect(wx - 12, wy - 12, 24, 24); x.globalCompositeOperation = 'source-over'; break;
      case 'spark': x.globalCompositeOperation = 'lighter'; x.globalAlpha = Math.max(0, Math.sin(t * 2.5 + p.ph)); x.fillStyle = '#fff4b0'; x.beginPath(); x.arc(p.x, p.y - (t * 6 + p.ph * 30) % 60, 1.8, 0, Math.PI * 2); x.fill(); x.globalCompositeOperation = 'source-over'; break;
      case 'confetti': p.x += p.vx + Math.sin(t * 2 + p.ph) * 0.4; p.y += p.vy; if (p.y > 470) { p.y = -10; p.x = Math.random() * 360; }
        x.globalAlpha = 0.9; x.fillStyle = p.c; x.save(); x.translate(p.x, p.y); x.rotate(t * 3 + p.ph); x.fillRect(-2.5, -1.2, 5, 2.4); x.restore(); break;
      case 'cloud': p.x += p.vx; if (p.x - p.r > 400) p.x = -p.r * 2; x.globalAlpha = 0.6; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(p.x, p.y, p.r, p.r * 0.35, 0, 0, Math.PI * 2); x.fill(); break;
    }
  }
  x.restore();
}
// Cờ Việt Nam tung bay: nền đỏ, sao vàng năm cánh, lượn sóng theo chiều ngang (gốc ở cán cờ)
function vnFlag(x, fx, fy, w, h, t, alpha) {
  const N = 14; x.save(); x.globalAlpha = alpha;
  const wave = (k) => Math.sin(t * 4 - k * 5) * h * 0.12 * k;
  for (let i = 0; i < N; i++) {
    const k0 = i / N, k1 = (i + 1) / N, shade = 0.86 + Math.sin(t * 4 - k0 * 5 + 1.2) * 0.14;
    x.fillStyle = `rgb(${Math.round(218 * shade)},${Math.round(37 * shade)},${Math.round(29 * shade)})`;
    x.beginPath(); x.moveTo(fx + w * k0, fy + wave(k0)); x.lineTo(fx + w * k1 + 0.6, fy + wave(k1)); x.lineTo(fx + w * k1 + 0.6, fy + h + wave(k1)); x.lineTo(fx + w * k0, fy + h + wave(k0)); x.fill();
  }
  const cx = fx + w * 0.5, cy = fy + h * 0.5 + wave(0.5), R = h * 0.3;
  x.fillStyle = '#ffde00'; x.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.382 : R; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  x.closePath(); x.fill(); x.restore();
}
// Vẽ cảnh: lớp tĩnh (lệch nhẹ theo thời gian tạo chiều sâu) + chuyển động
const ZBG = {};
function zoneBg(id) { if (!(id in ZBG)) { const im = new Image(); im.src = `bg-${id}.webp`; ZBG[id] = im; } const im = ZBG[id]; return im.complete && im.naturalWidth ? im : null; }
function drawZone(x, id, t, st, dpr) {
  const sway = Math.sin(t * 0.25) * 3, bg = zoneBg(id);
  st.img = !!bg;
  if (bg) { // ảnh nền vẽ bằng AI (Gemini) làm lớp đáy, hiệu ứng động phủ lên trên
    const h = 368 / bg.naturalWidth * bg.naturalHeight, y0 = 640 - h - 10, bx0 = -4 + sway * 0.3, iw = bg.naturalWidth, ih = bg.naturalHeight;
    x.drawImage(bg, 0, 0, iw, 4, bx0, y0 - 400, 368, 402); // kéo dải trên cùng lên che phần trời màn hình dài
    x.drawImage(bg, 0, ih - 4, iw, 4, bx0, y0 + h - 2, 368, 400); // kéo dải đáy xuống
    x.drawImage(bg, bx0, y0, 368, h);
    const g = x.createLinearGradient(0, 430, 0, 640); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = g; x.fillRect(-10, 430, 380, 230);
  } else { const S = zoneStatic(id, dpr); x.drawImage(S, 0, 0, S.width, S.height, -4 + sway * 0.3, 0, 368, 640); }
  zoneAnim(x, id, t, st);
}
