/* Hoạt cảnh mở rương (vẽ bằng canvas) + hình rương cho cửa hàng.
   Nạp SAU game.js: thay openChest() và gắn hình rương vào cửa hàng. */
'use strict';
const CHEST_LOOK = {
  wood:   { wood: ['#9a6a35', '#6b4220'], band: '#7d8088', lock: '#d4b04e', gem: null },
  silver: { wood: ['#3f6aa8', '#25406a'], band: '#dfe5ee', lock: '#f2f6fc', gem: '#7fd0ff' },
  gold:   { wood: ['#a32626', '#661414'], band: '#f2c14e', lock: '#ffe07a', gem: '#ff4a4a' },
  legend: { wood: ['#5a2a80', '#331650'], band: '#ffb02e', lock: '#ffd36a', gem: '#c46cff' },
  myth:   { wood: ['#7a1638', '#480a20'], band: '#ff7aa6', lock: '#ffe0ea', gem: '#ff3d6e' },
  super:  { wood: ['#2e130a', '#170804'], band: '#ffd700', lock: '#ff8a1a', gem: '#ffd700', fire: true },
};
function rr2(x, X, Y, W, H, R) { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); }
// Vẽ rương: tâm đáy (cx, cy), cỡ s; lid 0..1 = nắp mở; t giây
function drawChestArt(x, cx, cy, s, type, lid, t) {
  const L = CHEST_LOOK[type] || CHEST_LOOK.wood, W = 120 * s, H = 64 * s, LH = 46 * s;
  x.save(); x.translate(cx, cy);
  // bóng
  x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(0, 4 * s, W * 0.6, 12 * s, 0, 0, Math.PI * 2); x.fill();
  // lửa quanh rương Siêu Thần
  if (L.fire) { x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const k = (t * 1.3 + i / 12) % 1, px = (i / 11 - 0.5) * W * 1.1; x.globalAlpha = (1 - k) * 0.6; x.fillStyle = i % 2 ? '#ff7a1a' : '#ffd040'; x.beginPath(); x.ellipse(px, -k * H * 1.6, 7 * s * (1 - k * 0.5), 14 * s * (1 - k * 0.4), 0, 0, Math.PI * 2); x.fill(); } x.restore(); }
  // thân rương
  let g = x.createLinearGradient(0, -H, 0, 0); g.addColorStop(0, L.wood[0]); g.addColorStop(1, L.wood[1]);
  x.fillStyle = g; rr2(x, -W / 2, -H, W, H, 8 * s); x.fill();
  x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 2 * s; x.stroke();
  x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1.2 * s; for (let i = 1; i < 3; i++) { x.beginPath(); x.moveTo(-W / 2 + 6 * s, -H + i * H / 3); x.lineTo(W / 2 - 6 * s, -H + i * H / 3); x.stroke(); }
  // đai kim loại
  const band = (bx) => { const bg = x.createLinearGradient(bx - 7 * s, 0, bx + 7 * s, 0); bg.addColorStop(0, L.band); bg.addColorStop(0.5, '#ffffff'); bg.addColorStop(1, L.band); x.fillStyle = bg; x.fillRect(bx - 7 * s, -H, 14 * s, H); x.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(bx, -H + (k + 0.5) * H / 3, 1.8 * s, 0, Math.PI * 2); x.fill(); } };
  band(-W * 0.33); band(W * 0.33);
  // lòng rương phát sáng khi mở
  if (lid > 0.05) { x.save(); x.globalCompositeOperation = 'lighter'; const ig = x.createRadialGradient(0, -H, 2, 0, -H, W * 0.6); ig.addColorStop(0, `rgba(255,250,220,${0.9 * lid})`); ig.addColorStop(1, 'rgba(255,220,120,0)'); x.fillStyle = ig; x.beginPath(); x.ellipse(0, -H, W * 0.48, 12 * s, 0, 0, Math.PI * 2); x.fill(); x.restore(); }
  // nắp: xoay về sau quanh bản lề (giả 3D bằng co chiều cao + nâng lên)
  x.save(); x.translate(0, -H);
  const k = Math.cos(lid * Math.PI * 0.62), lh = LH * Math.max(0.08, k);
  x.translate(0, -lid * 10 * s);
  g = x.createLinearGradient(0, -lh, 0, 0); g.addColorStop(0, L.wood[0]); g.addColorStop(1, L.wood[1]);
  x.fillStyle = g; x.beginPath(); x.moveTo(-W / 2, 0); x.lineTo(-W / 2, -lh * 0.45); x.quadraticCurveTo(0, -lh * 1.35, W / 2, -lh * 0.45); x.lineTo(W / 2, 0); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 2 * s; x.stroke();
  for (const bx of [-W * 0.33, W * 0.33]) { x.fillStyle = L.band; x.beginPath(); x.moveTo(bx - 7 * s, 0); x.lineTo(bx - 7 * s, -lh * 0.62); x.quadraticCurveTo(bx, -lh * 0.75, bx + 7 * s, -lh * 0.62); x.lineTo(bx + 7 * s, 0); x.fill(); }
  x.fillStyle = L.band; x.fillRect(-W / 2, -3 * s, W, 6 * s);
  x.restore();
  // trang trí theo độ hiếm
  const orn = { wood: 0, silver: 1, gold: 2, legend: 3, myth: 4, super: 5 }[type] || 0;
  if (orn >= 1) { x.fillStyle = L.band; for (const [ox2, oy2] of [[-W / 2 + 5 * s, -H + 5 * s], [W / 2 - 5 * s, -H + 5 * s], [-W / 2 + 5 * s, -5 * s], [W / 2 - 5 * s, -5 * s]]) { x.beginPath(); x.arc(ox2, oy2, 3.2 * s, 0, Math.PI * 2); x.fill(); } }
  if (orn >= 3) { // đôi cánh hai bên
    for (const sd of [-1, 1]) { x.save(); x.translate(sd * W / 2, -H * 0.55); x.scale(sd, 1); x.rotate(Math.sin(t * 3) * 0.08);
      const wg = x.createLinearGradient(0, 0, 34 * s, 0); wg.addColorStop(0, L.band); wg.addColorStop(1, '#ffffff'); x.fillStyle = wg;
      for (let f = 0; f < 3; f++) { x.beginPath(); x.moveTo(0, -4 * s + f * 6 * s); x.quadraticCurveTo(22 * s, -22 * s + f * 10 * s, 34 * s - f * 6 * s, -10 * s + f * 12 * s); x.quadraticCurveTo(16 * s, f * 6 * s, 0, 4 * s + f * 6 * s); x.fill(); } x.restore(); } }
  if (orn >= 4) { // pha lê nhọn trên vai rương
    for (const sd of [-1, 1]) { x.save(); x.shadowColor = L.gem; x.shadowBlur = 10 * s; x.fillStyle = L.gem; x.beginPath(); x.moveTo(sd * W * 0.42, -H - 2 * s); x.lineTo(sd * W * 0.47, -H - 26 * s); x.lineTo(sd * W * 0.52, -H - 2 * s); x.fill(); x.fillStyle = '#ffffffaa'; x.beginPath(); x.moveTo(sd * W * 0.45, -H - 4 * s); x.lineTo(sd * W * 0.47, -H - 20 * s); x.lineTo(sd * W * 0.48, -H - 4 * s); x.fill(); x.restore(); } }
  if (orn >= 2 && lid < 0.3) { // vương miện / sừng rồng trên nắp
    const ty = -H - LH * 1.0;
    if (orn === 5) { x.fillStyle = '#e8d8b0'; for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * 22 * s, ty + 14 * s); x.quadraticCurveTo(sd * 40 * s, ty - 6 * s, sd * 30 * s, ty - 26 * s); x.quadraticCurveTo(sd * 30 * s, ty - 4 * s, sd * 14 * s, ty + 12 * s); x.fill(); } }
    x.save(); x.shadowColor = L.band; x.shadowBlur = 8 * s; x.fillStyle = L.band; x.beginPath(); x.moveTo(-16 * s, ty + 12 * s);
    for (let i = 0; i < 5; i++) { const px = -16 * s + i * 8 * s; x.lineTo(px + 4 * s, ty - (i % 2 ? 4 : 12) * s); x.lineTo(px + 8 * s, ty + 4 * s); }
    x.lineTo(16 * s, ty + 12 * s); x.closePath(); x.fill(); x.fillStyle = L.gem || '#fff'; x.beginPath(); x.arc(0, ty - 2 * s, 2.6 * s, 0, Math.PI * 2); x.fill(); x.restore(); }
  // khóa + đá quý
  if (lid < 0.3) {
    x.fillStyle = L.lock; rr2(x, -10 * s, -H - 8 * s, 20 * s, 22 * s, 4 * s); x.fill(); x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1.5 * s; x.stroke();
    if (L.gem) { x.save(); x.shadowColor = L.gem; x.shadowBlur = 10 * s * (0.7 + Math.sin(t * 5) * 0.3); x.fillStyle = L.gem; x.beginPath(); x.moveTo(0, -H - 4 * s); x.lineTo(5 * s, 1 * s - H + 2 * s); x.lineTo(0, -H + 9 * s); x.lineTo(-5 * s, -H + 3 * s); x.closePath(); x.fill(); x.restore(); }
    else { x.fillStyle = '#3a2a10'; x.beginPath(); x.arc(0, -H + 1 * s, 2.6 * s, 0, Math.PI * 2); x.fill(); }
  }
  x.restore();
}
// Ảnh món đồ (để bay lên khỏi rương)
function itemImage(it) {
  const wid = wearIconId(it); if (wid) return SPR[wid];
  if (it.slot === 'weapon') { const id = wpnTierId(it.wk, it.rar); if (id && ready(id)) return SPR[id]; }
  const tab = { shield: SHIELD_SPR, helmet: HELM_SPR, boots: BOOT_SPR, shoulder: PAUL_SPR, armor: BALD_SPR };
  if (tab[it.slot]) { const id = pickTier(tab[it.slot], Math.min(it.rar, 7)); if (ready(id)) return SPR[id]; }
  return null;
}
// Hoạt cảnh mở rương
openChest = function (type, ilvl) {
  const it = rollChest(type, ilvl || dropLevel());
  const C = CHESTS[type], col = RCOL[it.rar], R = it.rar;
  sfx('chest');
  modal(`<div class="chest-fx"><div class="chest-cap"><b>${C.n}</b><small id="chestHint">Chạm để mở</small></div><canvas id="chestCv"></canvas>
    <div class="chest-res hidden" id="chestRes"><div class="rr t${R}">${RAR[R].n}</div><div class="nm">${itemName(it)}</div>
    <button class="btn ok" id="bTake">Nhận đồ</button></div></div>`, root => {
    root.classList.add('chest-modal');
    const cv = root.querySelector('#chestCv'), CW = 320, CH = 360;
    cv.style.width = '100%'; cv.style.maxWidth = CW + 'px'; cv.style.aspectRatio = CW + '/' + CH;
    let opened = -1, done = false, t0 = performance.now(), parts = [];
    const open = () => { if (opened >= 0) return; opened = performance.now(); sfx('win'); if (R >= 5) setTimeout(() => sfx('skill'), 250);
      const n = 30 + R * 14; for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * (3 + R * 0.8); parts.push({ x: 160, y: 250, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, life: 1, c: Math.random() < 0.5 ? col : '#fff6c0', r: 1.5 + Math.random() * 2.5 }); }
      root.querySelector('#chestHint').textContent = ''; };
    const finish = () => { if (done) return; done = true; closeModal(); compareItem(it, true); };
    root.querySelector('.chest-fx').onclick = (e) => { if (e.target.id === 'bTake') return; if (opened < 0) open(); else if (performance.now() - opened > 900) finish(); };
    root.querySelector('#bTake').onclick = finish;
    setTimeout(open, 1500);
    const img = itemImage(it);
    const loop = (now) => {
      if (done || !document.body.contains(cv)) return;
      const x = hd(cv, CW, CH); x.clearRect(0, 0, CW, CH);
      const t = Math.max(0, (now - t0) / 1000), ot = opened >= 0 ? Math.max(0, (now - opened) / 1000) : -1;
      // nền: hào quang theo phẩm chất (đã gợi ý trước khi mở)
      const hint = ot < 0 ? Math.min(1, t / 1.4) * (0.25 + R * 0.06) : 1;
      x.save(); x.globalCompositeOperation = 'lighter';
      let g = x.createRadialGradient(160, 230, 10, 160, 230, 170); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.globalAlpha = 0.25 * hint + (ot >= 0 ? 0.25 : 0); x.fillStyle = g; x.fillRect(0, 0, CW, CH);
      // tia sáng xoay (từ Sử Thi trở lên, hoặc sau khi mở)
      if (ot >= 0 || R >= 3) { const rays = 10 + R * 2, a0 = t * (0.4 + R * 0.05), len = ot >= 0 ? 190 : 120 * hint;
        const rg = x.createRadialGradient(160, 220, 0, 160, 220, Math.max(1, len)); rg.addColorStop(0, col); rg.addColorStop(0.55, col + '66'); rg.addColorStop(1, 'rgba(0,0,0,0)');
        x.globalAlpha = (ot >= 0 ? 0.22 : 0.08 * hint); x.fillStyle = rg;
        for (let i = 0; i < rays; i++) { const a = a0 + i * Math.PI * 2 / rays, wd = 0.05 + (i % 2) * 0.03; x.beginPath(); x.moveTo(160, 220); x.lineTo(160 + Math.cos(a - wd) * len, 220 + Math.sin(a - wd) * len); x.lineTo(160 + Math.cos(a + wd) * len, 220 + Math.sin(a + wd) * len); x.fill(); } }
      x.restore();
      // rương: rung mạnh dần trước khi mở
      const shake = ot < 0 ? Math.sin(t * 40) * Math.min(1, t / 1.4) * (2 + R * 0.6) : 0;
      const lid = ot < 0 ? 0 : Math.min(1, ot / 0.35) * (1 + Math.sin(Math.min(1, ot / 0.35) * Math.PI) * 0.15);
      const bob = ot < 0 ? Math.sin(t * 3) * 2 : 0;
      x.save(); x.translate(shake, 0); x.rotate(shake * 0.004);
      drawChestArt(x, 160, 300 + bob, 1.15, type, lid, t); x.restore();
      if (ot >= 0) {
        // chớp trắng lúc bật nắp
        if (ot < 0.25) { x.fillStyle = `rgba(255,255,255,${(1 - ot / 0.25) * 0.8})`; x.fillRect(0, 0, CW, CH); }
        // cột sáng
        x.save(); x.globalCompositeOperation = 'lighter';
        const bh = Math.min(1, ot / 0.4) * 300, bw = 40 + R * 8 + Math.sin(ot * 8) * 4;
        g = x.createLinearGradient(0, 250 - bh, 0, 250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.4, col); g.addColorStop(1, '#ffffff');
        x.globalAlpha = 0.55; x.fillStyle = g; x.fillRect(160 - bw / 2, 250 - bh, bw, bh);
        x.globalAlpha = 0.9; x.fillRect(160 - bw / 6, 250 - bh, bw / 3, bh);
        // vòng sóng xung kích
        for (let k = 0; k < (R >= 5 ? 3 : 1); k++) { const rt = Math.max(0, ot - k * 0.18), rad = rt * 260; if (rt > 0 && rt < 0.9) { x.globalAlpha = (1 - rt / 0.9) * 0.8; x.strokeStyle = col; x.lineWidth = 4; x.beginPath(); x.ellipse(160, 250, rad, rad * 0.35, 0, 0, Math.PI * 2); x.stroke(); } }
        // hạt
        for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.life -= 0.012; if (p.life <= 0) continue; x.globalAlpha = p.life; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2); x.fill(); }
        x.restore();
        // món đồ bay lên, phóng to, lơ lửng
        const k2 = Math.min(1, Math.max(0, (ot - 0.2) / 0.6)), ease = 1 - Math.pow(1 - k2, 3);
        const iy = 250 - ease * 150 + Math.sin(ot * 2.5) * 4 * k2, isz = 40 + ease * 90;
        if (k2 > 0) {
          x.save(); x.globalCompositeOperation = 'lighter'; g = x.createRadialGradient(160, iy, 5, 160, iy, isz); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.globalAlpha = 0.8 * k2; x.fillStyle = g; x.fillRect(160 - isz, iy - isz, isz * 2, isz * 2); x.restore();
          x.save(); x.globalAlpha = k2; x.shadowColor = col; x.shadowBlur = 14 + R * 2;
          if (img) { const w = isz * img.naturalWidth / img.naturalHeight, h = isz; const sc2 = Math.min(1, (isz * 1.1) / w); x.drawImage(img, 160 - w * sc2 / 2, iy - h * sc2 / 2, w * sc2, h * sc2); }
          else { x.font = `${Math.round(isz * 0.8)}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(itemIcon(it), 160, iy); }
          x.restore();
          // lấp lánh quanh đồ hiếm
          if (R >= 3) { x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4 + R; i++) { const a = ot * 1.5 + i * 2.1, rad = isz * 0.75, sx = 160 + Math.cos(a) * rad, sy = iy + Math.sin(a) * rad * 0.8, tw = Math.max(0, Math.sin(ot * 6 + i)); x.globalAlpha = tw * k2; x.fillStyle = '#fff'; x.beginPath(); x.moveTo(sx, sy - 6); x.lineTo(sx + 1.5, sy); x.lineTo(sx, sy + 6); x.lineTo(sx - 1.5, sy); x.fill(); x.beginPath(); x.moveTo(sx - 6, sy); x.lineTo(sx, sy + 1.5); x.lineTo(sx + 6, sy); x.lineTo(sx, sy - 1.5); x.fill(); } x.restore(); }
        }
        if (ot > 0.85) root.querySelector('#chestRes').classList.remove('hidden');
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
};
// Hình rương vẽ sẵn cho cửa hàng
const CHEST_THUMBS = {};
function chestThumb(type) {
  if (CHEST_THUMBS[type]) return CHEST_THUMBS[type];
  const c = document.createElement('canvas'); const x = hd(c, 150, 120); drawChestArt(x, 75, 108, 0.7, type, 0, 0.3);
  return (CHEST_THUMBS[type] = c.toDataURL('image/png'));
}
(function hookShop() {
  const orig = renderShop;
  renderShop = function () {
    orig();
    document.querySelectorAll('#shop button[data-k]').forEach(b => { const big = b.parentElement.querySelector('.big'); if (big) big.innerHTML = `<img class="chest-img" src="${chestThumb(b.dataset.k)}" alt="">`; });
    const free = document.querySelector('#shop .chest .big'); if (free && !free.querySelector('img')) free.innerHTML = `<img class="chest-img" src="${chestThumb('wood')}" alt="">`;
  };
})();
