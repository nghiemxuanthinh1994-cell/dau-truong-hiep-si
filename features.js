/* Tính năng mở rộng: cấp nhân vật & kinh nghiệm, Thú Linh (5 hệ × 5 bậc, mở ở cấp 15),
   Boss Hẹn Giờ, Boss Liên Server, Bảng Xếp Hạng. Nạp SAU game.js và chest.js. */
'use strict';
// ================== CẤP NHÂN VẬT ==================
const LV_MAX = 100, PET_UNLOCK_LV = 15;
const xpNeed = (lv) => Math.round(60 * Math.pow(lv, 1.55));
function ensureFeat() {
  if (!S) return; if (!S.lv) S.lv = 1; if (S.xp == null) S.xp = 0; if (!S.pets) S.pets = []; if (S.eggs == null) S.eggs = 0; if (S.pstone == null) S.pstone = 0; if (!S.pb) S.pb = {};
  if (S.pet === undefined) S.pet = null; if (!S.tb) S.tb = {}; if (!S.wb) S.wb = {};
}
function applyBonuses(st) {
  ensureFeat(); if (!S) return st;
  const m = 1 + (S.lv - 1) * 0.02; st.atk = Math.round(st.atk * m); st.hp = Math.round(st.hp * m);
  const p = curPet(); if (p) { const b = PET_BONUS[p.r] * petLvMul(p); st.atk = Math.round(st.atk * (1 + b)); st.hp = Math.round(st.hp * (1 + b)); }
  return st;
}
function gainXP(n) {
  ensureFeat(); S.xp += n; const before = S.lv; const gift = { gold: 0, gems: 0, eggs: 0 };
  while (S.lv < LV_MAX && S.xp >= xpNeed(S.lv)) { S.xp -= xpNeed(S.lv); S.lv++; gift.gold += 80 * S.lv; gift.gems += 10; if (S.lv === PET_UNLOCK_LV || (S.lv > PET_UNLOCK_LV && S.lv % 5 === 0)) gift.eggs++; }
  S.gold += gift.gold; S.gems += gift.gems; S.eggs += gift.eggs; save();
  if (S.lv > before) setTimeout(() => queueLevelUp(before, S.lv, gift), 300);
}
let pendingLv = null;
function queueLevelUp(a, b, g) { pendingLv = { a, b, g }; if ($('modal').classList.contains('hidden')) showLevelUp(); }
function showLevelUp() {
  if (!pendingLv) return; const { b, g } = pendingLv; pendingLv = null; sfx('win');
  modal(`<div class="lvup"><div class="lv-ring">${b}</div><h3>LÊN CẤP ${b}!</h3>
    <div class="reward-line"><span>🪙 +${fmt(g.gold)}</span><span>💎 +${g.gems}</span>${g.eggs ? `<span>🥚 +${g.eggs}</span>` : ''}</div>
    <p class="hint">Mỗi cấp: +2% công và máu.${b >= PET_UNLOCK_LV && b - 1 < PET_UNLOCK_LV ? '<br><b style="color:#ffd040">Đã mở ô Thú Linh! Vào Trang bị → 🐾 Thú Linh để ấp trứng.</b>' : ''}</p>
    <div class="btns"><button class="btn ok" id="bOk">Tuyệt!</button></div></div>`, root => bindBtns(root, { '#bOk': () => { closeModal(); render(); afterChestHook(); } }));
}
// Thưởng kinh nghiệm sau mỗi trận + gắn thú linh vào trận
const _startBattle = startBattle;
startBattle = function (me, op, onEnd, arena, hpA) {
  const isMe = me && me.gear === S.gear;
  _startBattle(me, op, (win, hp, b) => {
    if (isMe) { const base = b && b.bossFight ? 60 : win ? 40 : 14; gainXP(Math.round(base * (1 + S.lv * 0.06))); }
    onEnd(win, hp, b);
  }, arena, hpA);
  if (isMe && B) { const p = curPet(); if (p) { B.A.pet = p; B.A.petN = 0; } }
  return B;
};

// ================== THÚ LINH ==================
const PET_ELEMS = ['hoa', 'bang', 'loi', 'moc', 'am'];
const PET_SPECIES = ['Linh Miêu', 'Thanh Ưng', 'Mãnh Hổ', 'Phượng Hoàng', 'Thần Long'];
const PET_RAR = ['Thường', 'Hiếm', 'Sử Thi', 'Huyền Thoại', 'Thần Thoại', 'Siêu Thần'];
const PET_RCOL = [RCOL[0], RCOL[2], RCOL[3], RCOL[4], RCOL[6], RCOL[7]];
const PET_BONUS = [0.03, 0.06, 0.1, 0.15, 0.22, 0.35], PET_DMG = [0.45, 0.65, 0.9, 1.2, 1.65, 2.4];
const PET_EGG_W = [52, 28, 13, 5, 2, 0.5]; // bậc 6 = Siêu Thần: chỉ 0,5%
// Hai thú linh cực hiếm (bậc Siêu Thần)
const PET_SUPER = {
  'sieu-than': { n: 'Siêu Thần Long Linh', e: 'quang', c: '#ffd700' },
  'dia-nguc': { n: 'Sứ Giả Địa Ngục', e: 'am', c: '#ff2a3a' },
};
const PET_LV_MAX = 10;
const petLvMul = (p) => 1 + 0.12 * ((p.lv || 1) - 1);
const petLvCost = (p) => (p.lv || 1) * (8 + p.r * 6);
const petName = (p) => p.sp ? PET_SUPER[p.sp].n : `${ELEM[p.e].n} ${PET_SPECIES[p.r]}`;
function curPet() { if (!S || !S.pets || (S.lv || 1) < PET_UNLOCK_LV) return null; return S.pets.find(p => p.id === S.pet) || null; }
// ảnh AI (pet-<hệ>-<bậc>.webp) nếu có, không thì vẽ bằng mã
for (const k in PET_SUPER) { const id = `pet-${k}`; if (!SPR[id]) { const im = new Image(); im.src = `${id}.webp`; SPR[id] = im; } }
for (const e of PET_ELEMS) for (let r = 0; r < 5; r++) { const id = `pet-${e}-${r}`; if (!SPR[id]) { const im = new Image(); im.src = `${id}.webp`; SPR[id] = im; } }
function drawPet(x, cx, cy, sz, p, t, face) {
  const col = p.sp ? PET_SUPER[p.sp].c : ELEM[p.e].c, r = p.r, bob = Math.sin(t * 2.2 + cx * 0.01) * sz * 0.09, img = SPR[p.sp ? `pet-${p.sp}` : `pet-${p.e}-${r}`];
  x.save(); x.translate(cx, cy + bob);
  // hào quang + hạt bay quanh theo quỹ đạo nghiêng (sau lưng)
  const orbit = (front) => { const n = r * 3; for (let i = 0; i < n; i++) { const a = t * (1.2 + r * 0.15) + i * Math.PI * 2 / n, z = Math.sin(a); if ((z > 0) !== front) continue;
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.5 + z * 0.4; x.fillStyle = i % 2 ? col : '#fff'; x.beginPath(); x.arc(Math.cos(a) * sz * 0.8, Math.sin(a) * sz * 0.22 + sz * 0.05, (1.4 + r * 0.35) * (1 + z * 0.4), 0, Math.PI * 2); x.fill(); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; } };
  const pulse = 0.55 + Math.sin(t * 3) * 0.2;
  x.save(); x.globalCompositeOperation = 'lighter'; const g = x.createRadialGradient(0, 0, 2, 0, 0, sz * (0.9 + r * 0.12)); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.globalAlpha = pulse * (0.12 + r * 0.11); x.fillStyle = g; x.beginPath(); x.arc(0, 0, sz * (0.9 + r * 0.12), 0, Math.PI * 2); x.fill(); x.restore();
  orbit(false);
  // thân: phồng-xẹp và nghiêng nhẹ như đang bay (giả 3D)
  const sq = Math.sin(t * 2.2) * 0.04; x.save(); x.scale(face * (1 + sq), 1 - sq); x.rotate(Math.sin(t * 1.3) * 0.06);
  if (img && img.complete && img.naturalWidth) {
    const h = sz * 1.7, w = h * img.naturalWidth / img.naturalHeight, GL = [3, 8, 13, 19, 26, 34][r] * DPR;
    x.shadowColor = r >= 3 ? PET_RCOL[r] : col; x.shadowBlur = GL * (0.8 + 0.2 * Math.sin(t * 3));
    x.scale(-1, 1); x.drawImage(img, -w / 2, -h * 0.62, w, h); // ảnh AI vẽ quay trái
    if (r >= 1) { // lớp phủ sáng nhấp nháy, càng hiếm càng mạnh
      x.shadowBlur = 0; x.globalCompositeOperation = 'lighter'; x.globalAlpha = (0.04 + r * 0.045) * (0.6 + 0.4 * Math.sin(t * 4)); x.drawImage(img, -w / 2, -h * 0.62, w, h);
      if (r >= 4) { x.globalAlpha = 0.25 + 0.15 * Math.sin(t * 2); x.shadowColor = PET_RCOL[r]; x.shadowBlur = GL * 1.6; x.drawImage(img, -w / 2, -h * 0.62, w, h); }
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.shadowBlur = 0;
    }
  } else if (p.sp) drawSuperPet(x, sz, p, t); else drawPetArt(x, sz, p, t, col);
  x.restore();
  orbit(true);
  x.restore();
}
// Thú linh Siêu Thần vẽ bằng mã: rồng vàng có bánh xe hào quang / sứ giả địa ngục có vòng lửa, sừng, lưỡi hái
function drawSuperPet(x, sz, p, t) {
  const S2 = PET_SUPER[p.sp], s = sz / 40, hell = p.sp === 'dia-nguc';
  x.lineJoin = 'round'; x.lineCap = 'round';
  x.save(); x.globalCompositeOperation = 'lighter'; x.rotate(t * (hell ? -0.8 : 0.6));
  for (let i = 0; i < 12; i++) { x.rotate(Math.PI / 6); x.globalAlpha = 0.35 + 0.25 * Math.sin(t * 4 + i); x.fillStyle = S2.c;
    x.beginPath(); x.moveTo(0, -26 * s); x.lineTo(4 * s, -(44 + (hell ? Math.sin(t * 9 + i) * 6 : 0)) * s); x.lineTo(-4 * s, -26 * s); x.fill(); }
  x.globalAlpha = 0.6; x.strokeStyle = S2.c; x.lineWidth = 2 * s; x.beginPath(); x.arc(0, 0, 27 * s, 0, Math.PI * 2); x.stroke(); x.restore();
  const flap = Math.sin(t * 4) * 0.35;
  for (const sd of [-1, 1]) { x.save(); x.translate(sd * 10 * s, -8 * s); x.rotate(sd * (0.3 + flap)); const wg = x.createLinearGradient(0, 0, sd * 40 * s, -20 * s); wg.addColorStop(0, hell ? '#3a0010' : '#fff6c0'); wg.addColorStop(1, S2.c);
    x.fillStyle = wg; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(sd * 20 * s, -40 * s, sd * 44 * s, -30 * s); x.lineTo(sd * 34 * s, -18 * s); x.lineTo(sd * 40 * s, -8 * s); x.lineTo(sd * 26 * s, -2 * s); x.lineTo(sd * 30 * s, 8 * s); x.quadraticCurveTo(sd * 14 * s, 8 * s, 0, 8 * s); x.fill();
    x.strokeStyle = hell ? '#ff5a3a' : '#b8860b'; x.lineWidth = 1.2 * s; x.stroke(); x.restore(); }
  x.save(); x.strokeStyle = S2.c; x.lineWidth = 6 * s; x.beginPath(); x.moveTo(-10 * s, 12 * s);
  for (let i = 1; i <= 6; i++) x.lineTo(-10 * s - i * 6 * s, 12 * s + Math.sin(t * 4 - i * 0.8) * 5 * s - i * 1.5 * s); x.stroke();
  x.fillStyle = hell ? '#ff2a3a' : '#fff'; x.beginPath(); const ex = -46 * s, ey = 12 * s + Math.sin(t * 4 - 4.8) * 5 * s - 9 * s; x.moveTo(ex, ey - 5 * s); x.lineTo(ex - 8 * s, ey); x.lineTo(ex, ey + 5 * s); x.fill(); x.restore();
  const bg = x.createRadialGradient(-5 * s, -8 * s, 2 * s, 0, 0, 24 * s); bg.addColorStop(0, hell ? '#ff6a4a' : '#fffbe0'); bg.addColorStop(1, hell ? '#5a0010' : '#e8a800');
  x.fillStyle = bg; x.beginPath(); x.ellipse(0, 0, 22 * s, 19 * s, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = hell ? '#1a0004' : '#8a5a00'; x.lineWidth = 1.6 * s; x.stroke();
  x.fillStyle = hell ? 'rgba(255,120,40,.55)' : 'rgba(255,255,255,.6)'; for (let i = 0; i < 3; i++) { x.beginPath(); x.ellipse(2 * s, (4 + i * 5) * s, (9 - i * 2) * s, 2.2 * s, 0, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = hell ? '#1a0004' : '#fff2b0';
  for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * 8 * s, -16 * s); x.quadraticCurveTo(sd * (hell ? 22 : 16) * s, -30 * s, sd * (hell ? 12 : 20) * s, -40 * s); x.quadraticCurveTo(sd * 12 * s, -26 * s, sd * 2 * s, -17 * s); x.fill(); }
  if (!hell) { x.fillStyle = '#ffd700'; x.beginPath(); x.moveTo(-9 * s, -19 * s); x.lineTo(-6 * s, -28 * s); x.lineTo(-2 * s, -21 * s); x.lineTo(1 * s, -31 * s); x.lineTo(4 * s, -21 * s); x.lineTo(8 * s, -28 * s); x.lineTo(10 * s, -19 * s); x.fill(); }
  x.save(); x.globalCompositeOperation = 'lighter'; x.shadowColor = hell ? '#ff2a2a' : '#7fe3ff'; x.shadowBlur = 8 * s; x.fillStyle = hell ? '#ff3030' : '#bff6ff';
  for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * 3 * s + 3 * s, -6 * s); x.lineTo(sd * 11 * s + 3 * s, -3 * s); x.lineTo(sd * 3 * s + 3 * s, -1 * s); x.fill(); } x.restore();
  if (hell) { x.save(); x.translate(20 * s, 0); x.rotate(-0.4 + Math.sin(t * 2) * 0.1); x.strokeStyle = '#2a1a1a'; x.lineWidth = 2.5 * s; x.beginPath(); x.moveTo(0, 22 * s); x.lineTo(0, -30 * s); x.stroke();
      x.fillStyle = '#c0c8d0'; x.beginPath(); x.moveTo(0, -30 * s); x.quadraticCurveTo(-26 * s, -34 * s, -30 * s, -14 * s); x.quadraticCurveTo(-20 * s, -26 * s, 0, -24 * s); x.fill(); x.restore();
    x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const k = (t * 1.6 + i / 8) % 1; x.globalAlpha = (1 - k) * 0.8; x.fillStyle = i % 2 ? '#ff2a1a' : '#ffa020'; x.beginPath(); x.arc(Math.sin(i * 2.1 + t) * 16 * s, 16 * s - k * 50 * s, (4 - k * 3) * s, 0, Math.PI * 2); x.fill(); } x.restore(); }
  else { const oy = 22 * s + Math.sin(t * 3) * 2 * s; x.save(); x.globalCompositeOperation = 'lighter'; const og = x.createRadialGradient(0, oy, 0, 0, oy, 9 * s); og.addColorStop(0, '#fff'); og.addColorStop(0.5, '#ffb020'); og.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = og; x.fillRect(-10 * s, oy - 10 * s, 20 * s, 20 * s); x.restore(); }
}
// Thú linh vẽ bằng mã: thân tròn, mắt to chớp, tai/cánh/sừng theo loài, đuôi đung đưa
function drawPetArt(x, sz, p, t, col) {
  const r = p.r, s = sz / 40, dark = shade(col, 0.55), light = shade(col, 1.35);
  x.lineJoin = 'round'; x.lineCap = 'round';
  const flap = Math.sin(t * (r === 1 ? 14 : 6)) * 0.5;
  if (r === 1 || r === 4) for (const sd of [-1, 1]) { x.save(); x.translate(sd * 14 * s, -6 * s); x.rotate(sd * (0.4 + flap * 0.5)); x.fillStyle = r === 4 ? dark : light; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(sd * 26 * s, -24 * s, sd * 30 * s, -2 * s); x.quadraticCurveTo(sd * 18 * s, 4 * s, 0, 6 * s); x.fill(); x.restore(); }
  if (r >= 2) { x.save(); x.rotate(Math.sin(t * 2.5) * 0.25); x.fillStyle = r === 4 ? dark : light; x.beginPath(); x.moveTo(-14 * s, 8 * s); x.quadraticCurveTo(-40 * s, 10 * s, -34 * s, -14 * s); x.quadraticCurveTo(-26 * s, 2 * s, -12 * s, 0); x.fill(); x.restore(); }
  const bg = x.createRadialGradient(-5 * s, -8 * s, 2 * s, 0, 0, 22 * s); bg.addColorStop(0, light); bg.addColorStop(1, col);
  x.fillStyle = bg; x.beginPath(); x.ellipse(0, 0, (18 + r * 2) * s, (16 + r * 1.5) * s, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = dark; x.lineWidth = 1.5 * s; x.stroke();
  x.fillStyle = col;
  if (r === 0) for (const sd of [-1, 1]) { x.beginPath(); x.arc(sd * 11 * s, -15 * s, 6 * s, 0, Math.PI * 2); x.fill(); x.stroke(); }
  if (r === 2 || r === 3) for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * 6 * s, -14 * s); x.lineTo(sd * 14 * s, -28 * s); x.lineTo(sd * 16 * s, -10 * s); x.fill(); x.stroke(); }
  if (r === 3) { x.fillStyle = '#fff2b0'; x.beginPath(); x.moveTo(-2 * s, -16 * s); x.lineTo(2 * s, -34 * s); x.lineTo(5 * s, -16 * s); x.fill(); }
  if (r === 4) { x.fillStyle = '#f0e0b0'; for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * 7 * s, -15 * s); x.quadraticCurveTo(sd * 18 * s, -30 * s, sd * 12 * s, -36 * s); x.quadraticCurveTo(sd * 12 * s, -24 * s, sd * 3 * s, -15 * s); x.fill(); } }
  if (r === 1) { x.fillStyle = '#ffb02e'; x.beginPath(); x.moveTo(14 * s, -2 * s); x.lineTo(24 * s, 1 * s); x.lineTo(14 * s, 4 * s); x.fill(); }
  const blink = (t % 3.6) < 0.12 ? 0.15 : 1;
  for (const sd of [-1, 1]) { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(sd * 6 * s + 3 * s, -3 * s, 4.6 * s, 5.4 * s * blink, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#1a1020'; x.beginPath(); x.ellipse(sd * 6 * s + 4.4 * s, -2.4 * s, 2.6 * s, 3.2 * s * blink, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(sd * 6 * s + 5.3 * s, -4 * s, 1 * s, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = 'rgba(255,120,150,.5)'; for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(sd * 11 * s + 3 * s, 4 * s, 3 * s, 2 * s, 0, 0, Math.PI * 2); x.fill(); }
  if (r >= 3) { x.fillStyle = '#ffd040'; x.beginPath(); x.moveTo(-7 * s, -17 * s); x.lineTo(-5 * s, -24 * s); x.lineTo(-2 * s, -19 * s); x.lineTo(0, -26 * s); x.lineTo(2 * s, -19 * s); x.lineTo(5 * s, -24 * s); x.lineTo(7 * s, -17 * s); x.fill(); }
}
// Thú linh đánh: cứ 3 lượt của chủ thì bắn một quả cầu năng lượng theo hệ
const _doAction = doAction;
doAction = function (actor, tgt, fast) {
  _doAction(actor, tgt, fast);
  if (!B || !actor.pet || actor.hp <= 0 || tgt.hp <= 0) return;
  actor.petN = (actor.petN || 0) + 1; if (actor.petN % 3) return;
  const p = actor.pet, PC = p.sp ? PET_SUPER[p.sp].c : ELEM[p.e].c, em = elemMult(p.e, tgt.elem), dmg = Math.round(actor.atk * PET_DMG[p.r] * petLvMul(p) * em * rnd(0.9, 1.1));
  const hit = () => {
    if (!B) return; tgt.hp -= dmg;
    if (p.e === 'hoa') tgt.burn = Math.max(tgt.burn, 2); if (p.e === 'bang') tgt.next += tgt.interval * 0.35; if (p.e === 'loi' && Math.random() < 0.3) tgt.stun = true;
    if (p.sp === 'sieu-than') actor.hp = Math.min(actor.maxHp, actor.hp + Math.round(actor.atk * 0.6)); if (p.sp === 'dia-nguc') tgt.burn = Math.max(tgt.burn, 3);
    if (p.e === 'moc') actor.hp = Math.min(actor.maxHp, actor.hp + Math.round(actor.atk * 0.4)); if (p.e === 'am') actor.hp = Math.min(actor.maxHp, actor.hp + Math.round(dmg * 0.3));
    tryRevive(tgt, !fast);
    if (!fast) { addText(tgt, (p.sp ? '✦ ' : em > 1 ? 'KHẮC HỆ ' : '') + '-' + dmg, PC, em > 1 || !!p.sp); burst(tgt, PC, p.sp ? 30 : 14); tgt.flash = 0.7; }
  };
  if (fast) { hit(); return; }
  B.petShots = B.petShots || []; B.petShots.push({ t: 0, from: actor.side, col: PC, big: !!p.sp, hit, done: false });
};
// Vẽ thú linh + cầu năng lượng trong trận
const _drawBattle = drawBattle;
drawBattle = function (now) {
  _drawBattle(now);
  if (!B) return; const A = B.A, ctx = bx, t = now / 1000;
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.translate(0, Math.round((BH - 640) * 0.62));
  const fsc = Math.pow(BH / 640, 0.7);
  if (A.pet && !A.dead) {
    const px = A.x - 38 * fsc + A.lunge * 20, py = 470 - 194 * fsc; // bay ngang vai → đầu (theo cỡ nhân vật mới)
    drawPet(ctx, px, py, 28 * fsc * (1 + Math.min(A.pet.r, 4) * 0.07), A.pet, t, 1);
    for (const s of (B.petShots || [])) {
      s.t += 16; const k = Math.min(1, s.t / 320), tx = B.O.x, ty = 470 - 110 * fsc;
      const sx = px + (tx - px) * k, sy = py + (ty - py) * k - Math.sin(k * Math.PI) * 40;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const R2 = s.big ? 28 : 16, g = ctx.createRadialGradient(sx, sy, 1, sx, sy, R2); g.addColorStop(0, '#fff'); g.addColorStop(0.4, s.col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(sx - R2, sy - R2, R2 * 2, R2 * 2); ctx.restore();
      if (k >= 1 && !s.done) { s.done = true; s.hit(); }
    }
    B.petShots = (B.petShots || []).filter(s => !s.done);
  }
  ctx.restore();
};
// Thú linh ở màn chính (vẽ sau nhân vật)
(function petHomeLoop(ts) {
  try { if (S && curTab === 'home' && $('battle').classList.contains('hidden')) { const p = curPet(); if (p) { const c = $('heroCanvas'), x = c.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0); drawPet(x, 72, 100, 30 * (1 + Math.min(p.r, 4) * 0.08), p, ts / 1000, 1); } } } catch (e) { }
  requestAnimationFrame(petHomeLoop);
})(0);
function petCard(p, owned, on) {
  return `<div class="pet ${owned ? '' : 'lock'} ${on ? 'on' : ''}" data-id="${owned ? owned.id : ''}" style="--pc:${PET_RCOL[p.r]}">
    <canvas class="petcv" data-e="${p.e}" data-r="${p.r}" data-sp="${p.sp || ''}" width="90" height="80"></canvas><b>${petName(p)}</b><small class="t${[0, 2, 3, 4, 6, 7][p.r]}">${PET_RAR[p.r]}</small></div>`;
}
function petModal() {
  ensureFeat();
  if (S.lv < PET_UNLOCK_LV) return modal(`<h3>🐾 Thú Linh</h3><p style="text-align:center;font-size:14px">Đạt <b>cấp ${PET_UNLOCK_LV}</b> để mở ô Thú Linh.<br>Hiện tại: cấp ${S.lv} (${fmt(S.xp)}/${fmt(xpNeed(S.lv))} KN).</p>
    <p class="hint">Thú linh tăng công và máu, tự bắn cầu năng lượng theo hệ trong trận. Có ${PET_ELEMS.length} hệ, mỗi hệ 5 bậc hiếm.</p><div class="btns"><button class="btn" id="bClose">Đóng</button></div>`, r => bindBtns(r, { '#bClose': closeModal }));
  const cur = curPet();
  let html = `<h3>🐾 Thú Linh</h3><div class="reward-line"><span>🥚 ${S.eggs} trứng</span><span>💠 ${fmt(S.pstone)} Linh Thạch</span></div>
    <div class="btns" style="margin-top:0"><button class="btn ok" id="bHatch" ${S.eggs ? '' : 'disabled'}>Ấp trứng</button><button class="btn" id="bBuyEgg">Mua trứng 💎200</button></div>
    ${cur ? `<div class="pet-cur"><p class="hint" style="margin:0">Đang theo: <b style="color:${PET_RCOL[cur.r]}">${petName(cur)}</b> · Cấp ${cur.lv || 1}/${PET_LV_MAX}<br>+${Math.round(PET_BONUS[cur.r] * petLvMul(cur) * 100)}% công/máu · sát thương ${Math.round(PET_DMG[cur.r] * petLvMul(cur) * 100)}% công</p>
      <button class="btn green" id="bPetUp" ${(cur.lv || 1) < PET_LV_MAX && S.pstone >= petLvCost(cur) ? '' : 'disabled'}>${(cur.lv || 1) >= PET_LV_MAX ? 'Tối đa' : `Nâng cấp 💠${petLvCost(cur)}`}</button></div>` : '<p class="hint">Chạm một thú linh đã có để cho theo bên mình.</p>'}
    <div class="btns" style="margin-top:4px"><button class="btn" id="bPetBoss">⚔ Ải Boss Thú Linh (trứng + 💠)</button></div>
    <div class="petgrid">`;
  for (const e of PET_ELEMS) for (let r = 0; r < 5; r++) { const own = S.pets.filter(p => p.e === e && p.r === r)[0]; html += petCard({ e, r }, own, own && cur && own.id === cur.id); }
  html += `</div><h4 class="pet-super-h">✦ Siêu Thần · cực hiếm (0,5% mỗi trứng) ✦</h4><div class="petgrid super">`;
  for (const k in PET_SUPER) { const own = S.pets.find(p => p.sp === k); html += petCard({ e: PET_SUPER[k].e, r: 5, sp: k }, own, own && cur && own.id === cur.id); }
  html += `</div><div class="btns"><button class="btn" id="bClose">Đóng</button></div>`;
  modal(html, root => {
    bindBtns(root, { '#bClose': closeModal, '#bHatch': () => hatchEgg(), '#bPetBoss': () => farmModal('pet'),
      '#bPetUp': () => { const c = curPet(); if (!c) return; const k = petLvCost(c); if (S.pstone < k || (c.lv || 1) >= PET_LV_MAX) return; S.pstone -= k; c.lv = (c.lv || 1) + 1; save(); sfx('win'); toast(`${petName(c)} lên cấp ${c.lv}!`); petModal(); render(); }, '#bBuyEgg': () => { if (S.gems < 200) return toast('Không đủ ngọc'); S.gems -= 200; S.eggs++; save(); refreshTop(); petModal(); } });
    root.querySelectorAll('.pet[data-id]').forEach(el => { if (!el.dataset.id) return; el.onclick = () => { S.pet = el.dataset.id; save(); sfx('tap'); toast('Thú linh đã theo bạn!'); petModal(); render(); }; });
    let alive = true; const t0 = performance.now();
    const loop = (now) => { if (!alive || !document.body.contains(root.querySelector('.petcv'))) return; root.querySelectorAll('.petcv').forEach(cv => { const x = hd(cv, 90, 80); x.clearRect(0, 0, 90, 80); drawPet(x, 45, 44, (cv.dataset.sp ? 13 : 17) + (+cv.dataset.r) * 1.6, { e: cv.dataset.e, r: +cv.dataset.r, sp: cv.dataset.sp || null }, (now - t0) / 1000 + (+cv.dataset.r), 1); }); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
}
function hatchEgg() {
  if (!S.eggs) return; S.eggs--; const r0 = weighted(PET_EGG_W), sp = r0 === 5 ? pick(Object.keys(PET_SUPER)) : null; const p = { id: uid(), e: sp ? PET_SUPER[sp].e : pick(PET_ELEMS), r: r0, sp, lv: 1 };
  const dup = S.pets.find(q => q.e === p.e && q.r === p.r && (q.sp || null) === (sp || null)), dupStone = (p.r + 1) * 15;
  if (dup) S.pstone += dupStone; else { S.pets.push(p); if (!S.pet) S.pet = p.id; } save();
  modal(`<div class="chest-fx"><div class="chest-cap"><b>Ấp Trứng Thú Linh</b><small>Chạm để bỏ qua</small></div><canvas id="eggCv"></canvas>
    <div class="chest-res hidden" id="eggRes"><div class="rr" style="color:${PET_RCOL[p.r]}">${PET_RAR[p.r]}</div><div class="nm">${petName(p)}</div>${dup ? `<p class="hint">Đã có thú linh này → đổi thành 💠${dupStone} Linh Thạch</p>` : ''}<button class="btn ok" id="bOk">Tuyệt vời!</button></div></div>`, root => {
    root.classList.add('chest-modal'); const cv = root.querySelector('#eggCv'); cv.style.width = '100%'; cv.style.maxWidth = '320px'; cv.style.aspectRatio = '320/320';
    let t0 = performance.now(), done = false, parts = []; sfx('chest');
    bindBtns(root, { '#bOk': () => { done = true; petModal(); } });
    const col = p.sp ? PET_SUPER[p.sp].c : ELEM[p.e].c;
    const loop = (now) => { if (done || !document.body.contains(cv)) return; const x = hd(cv, 320, 320), t = Math.max(0, (now - t0) / 1000); x.clearRect(0, 0, 320, 320);
      x.save(); x.globalCompositeOperation = 'lighter'; const g = x.createRadialGradient(160, 180, 5, 160, 180, 150); g.addColorStop(0, t > 1.4 ? PET_RCOL[p.r] : col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.globalAlpha = 0.4; x.fillStyle = g; x.fillRect(0, 0, 320, 320); x.restore();
      if (t < 1.4) { const sh = Math.sin(t * 30) * t * 4; x.save(); x.translate(160 + sh, 200); x.rotate(sh * 0.02);
        const eg = x.createRadialGradient(-12, -30, 4, 0, 0, 60); eg.addColorStop(0, '#fff'); eg.addColorStop(1, col); x.fillStyle = eg; x.beginPath(); x.ellipse(0, -10, 42, 54, 0, 0, Math.PI * 2); x.fill();
        x.strokeStyle = '#3a2a40'; x.lineWidth = 2; if (t > 0.6) { x.beginPath(); x.moveTo(-30, -20); x.lineTo(-12, -8); x.lineTo(0, -22); x.lineTo(14, -6); x.lineTo(30, -18); x.stroke(); } x.restore(); }
      else { if (!parts.length) { sfx('win'); for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, v = 2 + Math.random() * 5; parts.push({ x: 160, y: 190, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, l: 1 }); } }
        x.save(); x.globalCompositeOperation = 'lighter'; for (const q of parts) { q.x += q.vx; q.y += q.vy; q.vy += 0.08; q.l -= 0.012; if (q.l > 0) { x.globalAlpha = q.l; x.fillStyle = col; x.beginPath(); x.arc(q.x, q.y, 2.5, 0, 6.28); x.fill(); } } x.restore();
        const k = Math.min(1, (t - 1.4) / 0.6); drawPet(x, 160, 200 - k * 30, 30 + k * 26 + p.r * 4, p, t, 1); if (t > 2) root.querySelector('#eggRes').classList.remove('hidden'); }
      requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
}

// ================== BOSS ==================
const WORLD_BOSSES = [
  { id: 'wb-1', alt: 'ma-vuong', n: 'Hắc Long Vương', e: 'am', sk: [['leech', 18], ['thunder', 12]], ps: 'rage', zone: 'ham-am' },
  { id: 'wb-2', alt: 'quy-dung-nham', n: 'Titan Dung Nham', e: 'hoa', sk: [['fire', 22], ['guard', 10]], ps: 'thorns', zone: 'nui-lua' },
  { id: 'wb-3', alt: 'long-nhan-bang', n: 'Băng Hậu Kraken', e: 'bang', sk: [['ice', 22], ['whirl', 12]], ps: 'regen', zone: 'bang' },
];
for (const b of WORLD_BOSSES) if (!SPR[b.id]) { const im = new Image(); im.src = `${b.id}.webp`; SPR[b.id] = im; }
const WB_FACE_R = new Set(['wb-2', 'wb-3']); // ảnh trùm thế giới quay phải -> lật cho nhìn về nhân vật
function bossMon(b) { const useAi = ready(b.id), base = MONSTERS.find(m => m.id === b.alt) || {}; return { id: useAi ? b.id : b.alt, n: b.n, e: b.e, sk: b.sk, ps: b.ps, boss: true, giant: true, faceL: useAi ? !WB_FACE_R.has(b.id) : !!base.faceL }; }
const dayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
// Boss Hẹn Giờ: mở mỗi 3 giờ (0h, 3h, …, 21h), mỗi lần 30 phút, 3 lượt đánh
const TB_EVERY = 3, TB_LEN = 30;
function tbWindow() {
  const n = new Date(), h = n.getHours(), m = n.getMinutes(), slot = Math.floor(h / TB_EVERY) * TB_EVERY;
  const open = h === slot && m < TB_LEN, key = dayKey() + '@' + slot;
  let next = new Date(n); if (open) next.setHours(slot, TB_LEN, 0, 0); else { next.setHours(slot + TB_EVERY, 0, 0, 0); }
  return { open, key, slot, ms: next - n, boss: WORLD_BOSSES[(slot / TB_EVERY) % WORLD_BOSSES.length] };
}
// Boss Liên Server: máu chung cả ngày, người chơi từ các server cùng đánh (mô phỏng), thưởng theo hạng sát thương
const WB_SERVERS = 12;
function wbState() {
  ensureFeat(); const k = dayKey();
  if (S.wb.day !== k) { S.wb = { day: k, mine: 0, tries: 3, claimed: false, hpMax: Math.round(powerOf(myStats()) * 2600) }; save(); }
  const r = zrand(k.split('-').reduce((a, b) => a * 31 + +b, 7)), now = new Date(), frac = (now.getHours() * 60 + now.getMinutes()) / 1440;
  const bots = []; for (let i = 0; i < 40; i++) { const nm = NAMES[Math.floor(r() * NAMES.length)], sv = 1 + Math.floor(r() * WB_SERVERS), w = Math.pow(r(), 2.2); bots.push({ name: `S${sv}·${nm}`, dmg: Math.round(S.wb.hpMax * 0.06 * w * Math.pow(frac, 0.85)) }); }
  const total = bots.reduce((a, b) => a + b.dmg, 0) + S.wb.mine;
  const board = [...bots, { name: `S1·${S.name}`, dmg: S.wb.mine, me: true }].sort((a, b) => b.dmg - a.dmg);
  return { total, hp: Math.max(0, S.wb.hpMax - total), board, rank: board.findIndex(x => x.me) + 1, dead: total >= S.wb.hpMax, boss: WORLD_BOSSES[Math.abs(k.length + new Date().getDate()) % 3] };
}
const WB_REWARD = (rank) => rank === 1 ? { gems: 600, eggs: 2, chest: 'myth' } : rank <= 3 ? { gems: 350, eggs: 1, chest: 'legend' } : rank <= 10 ? { gems: 150, eggs: 1, chest: 'gold' } : rank <= 25 ? { gems: 60, chest: 'silver' } : { gems: 20, chest: 'wood' };
function bossFight(b, limitMs, hpMult, onDone) {
  const op = genOpponent(powerOf(myStats()) * 1.1, Math.round(avgIlvl()) + 2, { boss: true, mon: bossMon(b), rarW: [0, 0, 20, 40, 30, 10] });
  op.stats.hp = Math.round(op.stats.hp * hpMult); op.stats.atk = Math.round(op.stats.atk * 0.75);
  vsScreen(op, { title: `⏱ ${b.n}`, arena: b.zone, note: `Đánh trong ${limitMs / 1000} giây, gây càng nhiều sát thương càng nhiều thưởng.`, onEnd: (win, hp, bb) => onDone(bb ? Math.max(0, bb.O.maxHp - Math.max(0, bb.O.hp)) : 0, win) });
  // gắn giới hạn thời gian khi trận bắt đầu
  const iv = setInterval(() => { if (B && B.O && B.O.name === op.name) { B.limit = limitMs; B.bossFight = true; clearInterval(iv); } }, 100); setTimeout(() => clearInterval(iv), 60000);
}
function bossModal(tab) {
  ensureFeat(); tab = tab || 'tb';
  const tb = tbWindow(), wb = wbState(), st = S.tb[tb.key] || { tries: 3, best: 0 };
  let body = '';
  if (tab === 'tb') {
    body = `<div class="boss-card"><canvas id="bossCv" width="300" height="220"></canvas><b>${tb.boss.n}</b>
      <p class="hint">Mở mỗi 3 giờ (0h, 3h, 6h … 21h), mỗi lần 30 phút. Mỗi lần mở có 3 lượt đánh, 25 giây/lượt.</p>
      <div class="reward-line"><span>${tb.open ? '🟢 Đang mở · còn ' + fmtDur(tb.ms) : '⏳ Mở sau ' + fmtDur(tb.ms)}</span></div>
      <p class="hint">Lượt còn: ${st.tries}/3 · Sát thương cao nhất: ${fmt(st.best)}<br>Thưởng: vàng + kinh nghiệm theo sát thương, ≥ 30 lần máu bạn: thêm 💎 và cơ hội 🥚</p>
      <button class="btn ok" id="bTb" ${tb.open && st.tries > 0 ? '' : 'disabled'}>Khiêu chiến</button></div>`;
  } else {
    body = `<div class="boss-card"><canvas id="bossCv" width="300" height="220"></canvas><b>${wb.boss.n} · Liên Server</b>
      <div class="hpbar"><i style="width:${(wb.hp / S.wb.hpMax * 100).toFixed(1)}%"></i><span>${wb.dead ? 'ĐÃ BỊ HẠ' : fmt(wb.hp) + ' / ' + fmt(S.wb.hpMax)}</span></div>
      <p class="hint">Người chơi ${WB_SERVERS} server cùng đánh một boss trong ngày. Hạng của bạn: <b style="color:#ffd040">#${wb.rank}</b> · Sát thương: ${fmt(S.wb.mine)} · Lượt: ${S.wb.tries}/3</p>
      <div class="btns" style="margin-top:4px"><button class="btn ok" id="bWb" ${!wb.dead && S.wb.tries > 0 ? '' : 'disabled'}>Đánh boss</button>
      <button class="btn green" id="bWbClaim" ${wb.dead && !S.wb.claimed ? '' : 'disabled'}>${S.wb.claimed ? 'Đã nhận' : 'Nhận thưởng hạng'}</button></div>
      <div class="board" style="margin-top:8px">${wb.board.slice(0, 15).map((r, i) => `<div class="row ${r.me ? 'me' : ''}"><span class="rk">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span><span class="n">${r.name}</span><span class="p" style="width:auto">${fmt(r.dmg)}</span></div>`).join('')}
      ${wb.rank > 15 ? `<div class="row me"><span class="rk">${wb.rank}</span><span class="n">Bạn</span><span class="p" style="width:auto">${fmt(S.wb.mine)}</span></div>` : ''}</div>
      <p class="hint">Thưởng hạng: Top 1 💎600 + 🥚2 + Rương Thần Thoại · Top 3 💎350 + 🥚 · Top 10 💎150 + 🥚 · Top 25 💎60</p></div>`;
  }
  modal(`<h3>👹 Boss Thế Giới</h3><div class="tabs2"><button class="${tab === 'tb' ? 'on' : ''}" id="tTb">⏱ Boss Hẹn Giờ</button><button class="${tab === 'wb' ? 'on' : ''}" id="tWb">🌐 Liên Server</button></div>${body}
    <div class="btns"><button class="btn" id="bClose">Đóng</button></div>`, root => {
    bindBtns(root, {
      '#bClose': closeModal, '#tTb': () => bossModal('tb'), '#tWb': () => bossModal('wb'),
      '#bTb': () => { st.tries--; S.tb[tb.key] = st; save(); closeModal(); bossFight(tb.boss, 25000, 40, (dmg) => {
        st.best = Math.max(st.best, dmg); S.tb[tb.key] = st; const myHp = myStats().hp, g = Math.round(dmg * 0.06) + 100, gems = dmg >= myHp * 30 ? 40 : dmg >= myHp * 15 ? 15 : 0, egg = dmg >= myHp * 30 && Math.random() < 0.35;
        S.gold += g; S.gems += gems; if (egg) S.eggs++; save();
        resultModal(`<h3>⏱ Kết thúc lượt đánh</h3><div class="reward-line"><span>⚔ ${fmt(dmg)} sát thương</span></div><div class="reward-line"><span>🪙 +${fmt(g)}</span>${gems ? `<span>💎 +${gems}</span>` : ''}${egg ? '<span>🥚 +1</span>' : ''}</div>`);
      }); },
      '#bWb': () => { S.wb.tries--; save(); closeModal(); bossFight(wb.boss, 30000, 60, (dmg) => {
        S.wb.mine += dmg; const g = Math.round(dmg * 0.04) + 150; S.gold += g; save(); const w2 = wbState();
        resultModal(`<h3>🌐 Boss Liên Server</h3><div class="reward-line"><span>⚔ ${fmt(dmg)}</span><span>Hạng #${w2.rank}</span></div><div class="reward-line"><span>🪙 +${fmt(g)}</span></div>`);
      }); },
      '#bWbClaim': () => { const rw = WB_REWARD(wb.rank); S.wb.claimed = true; S.gems += rw.gems; S.pstone += Math.round(rw.gems / 4); if (wb.rank === 1 && Math.random() < 0.05) { const k = pick(Object.keys(PET_SUPER)); S.pets.push({ id: uid(), e: PET_SUPER[k].e, r: 5, sp: k }); toast('✦ Nhận thú linh ' + PET_SUPER[k].n + '!'); } S.eggs += rw.eggs || 0; queueChests([{ type: rw.chest }]); save();
        resultModal(`<h3>🏆 Thưởng hạng #${wb.rank}</h3><div class="reward-line"><span>💎 +${rw.gems}</span>${rw.eggs ? `<span>🥚 +${rw.eggs}</span>` : ''}<span>${CHESTS[rw.chest].n}</span></div>`); },
    });
    const cv = root.querySelector('#bossCv'); if (!cv) return; const b = tab === 'tb' ? tb.boss : wb.boss, mon = bossMon(b); const t0 = performance.now();
    const loop = (now) => { if (!document.body.contains(cv)) return; const x = hd(cv, 300, 220); x.clearRect(0, 0, 300, 220); drawFighter(x, 150, 212, 0.95, lookFromMonster(mon), -1, { t: (now - t0) / 1000, maxW: 200 }); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
}

// ================== ẢI BOSS (FARM ĐỒ) ==================
// Mỗi 10 ải chiến dịch (hoặc mỗi 10 cấp nhân vật) mở một boss. Đánh lại nhiều lần để farm đồ: mỗi lần thắng rơi chắc 1 món, boss càng cao đồ càng hiếm.
const FB_TRIES = 8;
const farmUnlocked = () => Math.max(S.camp.ch - 1, Math.floor((S.lv || 1) / 10));
function farmBosses() {
  const n = Math.min(MON_BOSS.length * 3, Math.max(1, farmUnlocked() + 1)), out = [];
  for (let i = 0; i < n; i++) { const m = MON_BOSS[i % MON_BOSS.length]; out.push({ i, lvl: (i + 1) * 10, mon: m, open: i < farmUnlocked(), name: (i >= MON_BOSS.length ? ['', 'Hung ', 'Cuồng '][Math.floor(i / MON_BOSS.length)] : '') + m.n }); }
  return out;
}
function farmRar(i) { const r = Math.min(7, Math.floor(i / 2)); const w = [0, 0, 0, 0, 0, 0, 0, 0]; w[Math.max(0, r - 1)] += 45; w[r] += 40; w[Math.min(7, r + 1)] += 13; w[Math.min(7, r + 2)] += 2; return w; }
function farmDrop(i, lvl) { const sl = pick(SLOTS).id; return makeItem(sl, lvl + 2, weighted(farmRar(i))); }
function farmFight(fb) {
  const k = dayKey(); if (!S.fb || S.fb.day !== k) S.fb = { day: k, tries: FB_TRIES, kills: {} };
  if (S.fb.tries <= 0) return toast('Hết lượt farm hôm nay');
  const op = genOpponent(campaignPower(fb.lvl) * (1 + fb.i * 0.04), fb.lvl, { boss: true, mon: Object.assign({}, fb.mon, { giant: true }), rarW: [20, 30, 25, 15, 10], fill: 1 });
  op.name = fb.name;
  vsScreen(op, { title: `💀 Ải Boss ${fb.lvl}`, arena: fb.mon.e ? ZONE_OF_ELEM[fb.mon.e] : undefined, note: `Thắng: chắc chắn rơi 1 món trang bị (cao nhất ${RAR[Math.min(7, Math.floor(fb.i / 2) + 2)].n}). Còn ${S.fb.tries}/${FB_TRIES} lượt hôm nay.`,
    onEnd: (win) => {
      S.fb.tries--; if (!win) { save(); return resultModal(`<h3 style="color:#ff6a5a">Boss quá mạnh!</h3><p class="hint">Cường hóa trang bị rồi quay lại farm.</p>`); }
      S.fb.kills[fb.i] = (S.fb.kills[fb.i] || 0) + 1; const g = 200 + fb.lvl * 25; S.gold += g;
      const it = farmDrop(fb.i, fb.lvl), list = [it]; if (Math.random() < 0.25) list.push(farmDrop(fb.i, fb.lvl));
      const egg = Math.random() < 0.08; if (egg) S.eggs++; save();
      resultModal(`<h3>💀 Hạ ${fb.name}!</h3><div class="reward-line"><span>🪙 +${fmt(g)}</span>${egg ? '<span>🥚 +1</span>' : ''}</div>
        <div class="farm-drops">${list.map(x => `<div class="fd r${x.rar}" style="border-color:${RCOL[x.rar]}"><span class="glowr r${x.rar}">${itemIconHTML(x)}</span><small style="color:${RCOL[x.rar]}">${RAR[x.rar].n}</small></div>`).join('')}</div>`);
      setTimeout(() => { const go = () => { const x = list.shift(); if (x) { compareItem(x, true); const iv = setInterval(() => { if ($('modal').classList.contains('hidden')) { clearInterval(iv); go(); } }, 300); } }; const iv0 = setInterval(() => { if ($('modal').classList.contains('hidden')) { clearInterval(iv0); go(); } }, 300); }, 50);
    } });
}
// ===== Ải Boss Thú Linh: mỗi hệ một chuỗi ải, boss là thú linh khổng lồ; rơi trứng + Linh Thạch để nâng cấp thú linh =====
const PB_TRIES = 6;
const PB_SK = { hoa: [['fire', 26]], bang: [['ice', 26]], loi: [['thunder', 26]], moc: [['heal', 18], ['poison', 12]], am: [['leech', 26]] };
const PB_PS = { hoa: 'rage', bang: 'thorns', loi: 'pierce', moc: 'regen', am: 'dodge' };
function petBossMon(e, st) { const r = Math.min(4, 2 + Math.floor((st - 1) / 5)); return { id: `pet-${e}-${r}`, n: `${PET_SPECIES[r]} ${ELEM[e].n} · Ải ${st}`, e, sk: PB_SK[e], ps: PB_PS[e], boss: true, giant: true, faceL: true }; }
const pbReward = (st) => ({ stone: 8 + st * 3, egg: st % 5 === 0 ? 1 : 0, eggCh: Math.min(0.45, 0.15 + st * 0.01) });
function pbFight(e, st, sweep) {
  ensureFeat(); const k = dayKey(); if (!S.fb || S.fb.day !== k) S.fb = { day: k, tries: FB_TRIES, kills: {} }; if (S.fb.pt == null) S.fb.pt = PB_TRIES;
  if (S.fb.pt <= 0) return toast('Hết lượt Ải Thú Linh hôm nay');
  const give = (first) => { const rw = pbReward(st), egg = (first ? rw.egg : 0) + (Math.random() < rw.eggCh ? 1 : 0); S.pstone += rw.stone; S.eggs += egg; save();
    resultModal(`<h3>🐾 ${sweep ? 'Càn quét' : 'Hạ boss'} Ải ${st} · ${ELEM[e].n}</h3><div class="reward-line"><span>💠 +${rw.stone}</span>${egg ? `<span>🥚 +${egg}</span>` : ''}</div>${first && st % 5 === 0 ? '<p class="hint">Thưởng vượt ải mốc: +1 trứng</p>' : ''}`); };
  if (sweep) { S.fb.pt--; return give(false); }
  const op = genOpponent(powerOf(myStats()) * (0.62 + st * 0.07), Math.round(avgIlvl()) + 1, { boss: true, mon: petBossMon(e, st), fill: 1 });
  vsScreen(op, { title: `🐾 Ải Thú Linh ${ELEM[e].ic} ${st}`, note: `Thắng: 💠${pbReward(st).stone} Linh Thạch, ${Math.round(pbReward(st).eggCh * 100)}% ra trứng${st % 5 === 0 ? ', lần đầu chắc chắn +1 trứng' : ''}. Còn ${S.fb.pt}/${PB_TRIES} lượt.`,
    onEnd: (win) => { S.fb.pt--; if (!win) { save(); return resultModal(`<h3 style="color:#ff6a5a">Thú linh boss quá mạnh!</h3><p class="hint">Nâng cấp trang bị hoặc thú linh rồi thử lại.</p>`); }
      const first = (S.pb[e] || 0) < st; if (first) S.pb[e] = st; give(first); } });
}
function petBossHTML() {
  if (S.fb.pt == null) S.fb.pt = PB_TRIES;
  if ((S.lv || 1) < PET_UNLOCK_LV) return `<p class="hint" style="text-align:center">Đạt cấp ${PET_UNLOCK_LV} để mở Ải Boss Thú Linh.</p>`;
  return `<p class="hint">Đánh boss thú linh từng hệ để nhận 💠 Linh Thạch (nâng cấp thú linh) và 🥚 trứng. Ải đã qua có thể càn quét. Lượt hôm nay: <b>${S.fb.pt}/${PB_TRIES}</b> · 💠 ${fmt(S.pstone)}</p>
    <div class="farm-list">${PET_ELEMS.map(e => { const done = S.pb[e] || 0, nx = done + 1; return `<div class="farm" data-e="${e}"><canvas width="74" height="74" data-e="${e}" data-st="${nx}"></canvas><div><b>${ELEM[e].ic} ${ELEM[e].n} · Ải ${nx}</b>
      <small>Đã qua ${done} ải · thưởng 💠${pbReward(nx).stone}${nx % 5 === 0 ? ' + 🥚' : ''}</small></div>
      <div style="display:flex;flex-direction:column;gap:3px"><button class="btn ok pbgo" ${S.fb.pt > 0 ? '' : 'disabled'}>Khiêu chiến</button>${done ? `<button class="btn pbsw" ${S.fb.pt > 0 ? '' : 'disabled'}>Quét ải ${done}</button>` : ''}</div></div>`; }).join('')}</div>`;
}
function farmModal(tab) {
  tab = tab || 'gear';
  if (tab === 'pet') { ensureFeat(); const k = dayKey(); if (!S.fb || S.fb.day !== k) { S.fb = { day: k, tries: FB_TRIES, kills: {} }; save(); }
    return modal(`<h3>💀 Ải Boss</h3><div class="tabs2"><button id="tG">⚔ Boss Trang Bị</button><button class="on" id="tP">🐾 Boss Thú Linh</button></div>${petBossHTML()}<div class="btns"><button class="btn" id="bClose">Đóng</button></div>`, root => {
      bindBtns(root, { '#bClose': closeModal, '#tG': () => farmModal('gear'), '#tP': () => farmModal('pet') });
      root.querySelectorAll('.farm[data-e]').forEach(el => { const e = el.dataset.e, done = S.pb[e] || 0;
        el.querySelector('.pbgo').onclick = () => { closeModal(); pbFight(e, done + 1, false); };
        const sw = el.querySelector('.pbsw'); if (sw) sw.onclick = () => { closeModal(); pbFight(e, done, true); }; });
      const t0 = performance.now(), cvs = [...root.querySelectorAll('canvas[data-e]')];
      const loop = (now) => { if (!cvs.length || !document.body.contains(cvs[0])) return; for (const cv of cvs) { const x = hd(cv, 74, 74); x.clearRect(0, 0, 74, 74); const st = +cv.dataset.st, r = Math.min(4, 2 + Math.floor((st - 1) / 5)); drawPet(x, 37, 40, 20, { e: cv.dataset.e, r }, (now - t0) / 1000 + r, -1); } requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    });
  }
  return farmModalGear();
}
function farmModalGear() {
  ensureFeat(); const k = dayKey(); if (!S.fb || S.fb.day !== k) { S.fb = { day: k, tries: FB_TRIES, kills: {} }; save(); }
  const list = farmBosses();
  modal(`<h3>💀 Ải Boss</h3><div class="tabs2"><button class="on" id="tG">⚔ Boss Trang Bị</button><button id="tP">🐾 Boss Thú Linh</button></div><p class="hint">Cứ 10 ải chiến dịch (hoặc 10 cấp) mở 1 boss. Đánh lại để farm đồ — boss càng cao rơi đồ càng hiếm. Lượt hôm nay: <b>${S.fb.tries}/${FB_TRIES}</b></p>
    <div class="farm-list">${list.map(fb => `<div class="farm ${fb.open ? '' : 'lock'}" data-i="${fb.i}"><canvas width="74" height="74" data-i="${fb.i}"></canvas><div><b>Ải ${fb.lvl} · ${fb.name}</b>
      <small>${fb.open ? `Rơi: <span style="color:${RCOL[Math.min(7, Math.floor(fb.i / 2))]}">${RAR[Math.min(7, Math.floor(fb.i / 2))].n}</span> ~ <span style="color:${RCOL[Math.min(7, Math.floor(fb.i / 2) + 2)]}">${RAR[Math.min(7, Math.floor(fb.i / 2) + 2)].n}</span> · đã hạ ${S.fb.kills[fb.i] || 0}` : `🔒 Vượt ải ${fb.lvl} chiến dịch hoặc đạt cấp ${fb.lvl}`}</small></div>
      <button class="btn ok" ${fb.open && S.fb.tries > 0 ? '' : 'disabled'}>Farm</button></div>`).join('')}</div>
    <div class="btns"><button class="btn" id="bClose">Đóng</button></div>`, root => {
    bindBtns(root, { '#bClose': closeModal, '#tG': () => farmModal('gear'), '#tP': () => farmModal('pet') });
    root.querySelectorAll('.farm').forEach(el => { const b = el.querySelector('button'); b.onclick = () => { const fb = list[+el.dataset.i]; if (!fb.open) return; closeModal(); farmFight(fb); }; });
    root.querySelectorAll('canvas[data-i]').forEach(cv => { const fb = list[+cv.dataset.i], x = hd(cv, 74, 74); drawFighter(x, 37, 72, 0.4, lookFromMonster(fb.mon), -1, { still: true, maxW: 70, key: 'fb' + fb.i }); });
  });
}

// ================== BẢNG XẾP HẠNG ==================
function lbModal(tab) {
  ensureFeat(); tab = tab || 'power';
  const me = { power: powerOf(myStats()), trophy: S.trophies, lv: S.lv, boss: S.wb.mine || 0 }[tab];
  const r = zrand(dayKey().length * 977 + tab.length * 131), rows = [];
  for (let i = 0; i < 49; i++) { const sv = 1 + Math.floor(r() * WB_SERVERS), nm = NAMES[Math.floor(r() * NAMES.length)] + (r() < 0.5 ? '' : ' ' + Math.floor(r() * 99)); const f = 0.35 + Math.pow(r(), 1.3) * 2.6;
    let v = Math.round(Math.max(1, me) * f); if (tab === 'lv') v = Math.min(LV_MAX, Math.max(1, Math.round((me + 5) * f * 0.8))); if (tab === 'trophy') v = Math.round(Math.max(150, me) * f); rows.push({ n: `S${sv}·${nm}`, v }); }
  rows.push({ n: `S1·${S.name}`, v: me, me: true }); rows.sort((a, b) => b.v - a.v);
  const rank = rows.findIndex(x => x.me) + 1, unit = { power: 'LC', trophy: '🏆', lv: 'Cấp', boss: '⚔' }[tab];
  modal(`<h3>🏅 Bảng Xếp Hạng</h3><div class="tabs2">${[['power', 'Lực chiến'], ['trophy', 'Cúp'], ['lv', 'Cấp'], ['boss', 'Sát thương Boss']].map(([k, n]) => `<button class="${tab === k ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}</div>
    <p class="hint" style="margin:4px 0 8px">Hạng của bạn: <b style="color:#ffd040">#${rank}</b> / ${rows.length} (toàn bộ ${WB_SERVERS} server)</p>
    <div class="board">${rows.slice(0, 30).map((x, i) => `<div class="row ${x.me ? 'me' : ''}"><span class="rk">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span><span class="n">${x.n}</span><span class="p" style="width:auto">${tab === 'lv' ? 'Cấp ' + x.v : fmt(x.v) + ' ' + (tab === 'lv' ? '' : unit)}</span></div>`).join('')}</div>
    <div class="btns"><button class="btn" id="bClose">Đóng</button></div>`, root => {
    bindBtns(root, { '#bClose': closeModal }); root.querySelectorAll('[data-t]').forEach(b => b.onclick = () => lbModal(b.dataset.t));
  });
}

// ================== GẮN VÀO GIAO DIỆN ==================
(function hookUI() {
  ensureFeat();
  const bar = document.createElement('div'); bar.className = 'modes2';
  bar.innerHTML = `<button class="mode sm" id="btnBoss"><span class="ic">👹</span><b>Boss</b><small id="bossInfo"></small></button>
    <button class="mode sm" id="btnLb"><span class="ic">🏅</span><b>Xếp Hạng</b><small>Liên server</small></button>
    <button class="mode sm" id="btnFarm"><span class="ic">💀</span><b>Ải Boss</b><small id="farmInfo"></small></button>
    <button class="mode sm" id="btnPet"><span class="ic">🐾</span><b>Thú Linh</b><small id="petInfo"></small></button>`;
  const modes = document.querySelector('#scr-home .modes'); modes.parentNode.insertBefore(bar, modes);
  $('btnBoss').onclick = () => { sfx('tap'); bossModal(); }; $('btnLb').onclick = () => { sfx('tap'); lbModal(); }; $('btnPet').onclick = () => { sfx('tap'); petModal(); }; $('btnFarm').onclick = () => { sfx('tap'); farmModal(); };
  const who = document.querySelector('#btnName > div:last-child'); const lvb = document.createElement('div'); lvb.className = 'lvbar'; lvb.innerHTML = '<span id="lvTxt"></span><i><b id="lvFill"></b></i>'; who.appendChild(lvb);
  const gb = document.createElement('button'); gb.id = 'btnPet2'; gb.className = 'mini'; gb.textContent = '🐾 Thú Linh'; gb.style.cssText = 'margin-left:4px;background:linear-gradient(#3fb5c9,#1a5a70)';
  const out = $('btnOutfit'); out.parentNode.insertBefore(gb, out.nextSibling); gb.onclick = () => { sfx('tap'); petModal(); };
  const _render = render;
  render = function () {
    _render(); ensureFeat(); if (!S) return;
    $('lvTxt').textContent = 'Cấp ' + S.lv; $('lvFill').style.width = Math.min(100, S.xp / xpNeed(S.lv) * 100) + '%';
    const tb = tbWindow(); const bi = $('bossInfo'); if (bi) bi.textContent = tb.open ? 'Đang mở!' : 'Sau ' + fmtDur(tb.ms);
    const fi = $('farmInfo'); if (fi) fi.textContent = `${farmUnlocked()} boss mở`;
    const pi = $('petInfo'); if (pi) { const p = curPet(); pi.textContent = S.lv < PET_UNLOCK_LV ? `Mở ở cấp ${PET_UNLOCK_LV}` : p ? petName(p) : (S.eggs ? `🥚 ${S.eggs} trứng` : 'Chưa có'); }
    if (pendingLv && $('modal').classList.contains('hidden')) showLevelUp();
  };
  // Trứng thú linh trong cửa hàng
  const _rs = renderShop;
  renderShop = function () { _rs(); const shop = $('shop'); if (!shop || shop.querySelector('#bEggShop')) return;
    const d = document.createElement('div'); d.className = 'chest'; d.innerHTML = `<span class="big">🥚</span><b>Trứng Thú Linh</b><small>5 hệ · Thần Thoại 2% · Siêu Thần 0,5% · cần cấp ${PET_UNLOCK_LV}</small><button id="bEggShop" ${S.gems >= 200 ? '' : 'disabled'}>💎200</button>`;
    shop.appendChild(d); d.querySelector('button').onclick = () => { if (S.gems < 200) return; S.gems -= 200; S.eggs++; save(); render(); toast('+1 Trứng Thú Linh'); }; };
  // Biểu tượng vẽ 3D cho các mục ở Đấu Trường (ui-*.webp); chưa có ảnh thì giữ emoji
  const UI_IC = { btnDungeon: 'ham-nguc', btnCampaign: 'chien-dich', btnChamp: 'giai', btnRanked: 'dau-hang', btnBoss: 'boss', btnLb: 'xep-hang', btnFarm: 'ai-boss', btnPet: 'thu-linh' };
  for (const id in UI_IC) { const el = $(id) && $(id).querySelector('.ic'); if (!el) continue; const im = new Image(); im.className = 'ic-img'; im.alt = ''; im.onload = () => { el.textContent = ''; el.appendChild(im); }; im.src = `ui-${UI_IC[id]}.webp`; }
  // ⚙ Cài đặt: đổi tên, bật/tắt âm thanh, xóa dữ liệu chơi lại, bản quyền
  const res = document.querySelector('#topbar .res'); const gs = document.createElement('button'); gs.id = 'btnSettings'; gs.className = 'gear-btn'; gs.setAttribute('aria-label', 'Cài đặt'); gs.textContent = '⚙'; res.appendChild(gs);
  gs.onclick = () => { sfx('tap'); settingsModal(); };
  render();
})();
// Mã quà tặng: mỗi mã dùng 1 lần (lưu trong S.codes). Thêm mã mới vào bảng này.
const GIFT_CODES = {
  HIEPSI2026: { gems: 500, gold: 5000, n: 'Quà ra mắt' },
  TANTHU: { gold: 3000, chests: ['silver', 'silver'], n: 'Quà tân thủ' },
  VIETNAM: { gems: 300, eggs: 1, n: 'Quà Việt Nam' },
  THULINH: { eggs: 2, stone: 100, n: 'Quà thú linh' },
  DAUTRUONG: { chests: ['gold'], gems: 150, n: 'Quà đấu trường' },
};
function redeemCode(code) {
  ensureFeat(); S.codes = S.codes || [];
  if (!code) return toast('Hãy nhập mã');
  const g = GIFT_CODES[code]; if (!g) { sfx('lose'); return toast('Mã không đúng'); }
  if (S.codes.includes(code)) return toast('Mã này bạn đã dùng rồi');
  S.codes.push(code); S.gems += g.gems || 0; S.gold += g.gold || 0; S.eggs += g.eggs || 0; S.pstone += g.stone || 0; if (g.chests) queueChests(g.chests.map(type => ({ type }))); save(); render(); sfx('win');
  const parts = [g.gold && `🪙 +${fmt(g.gold)}`, g.gems && `💎 +${g.gems}`, g.eggs && `🥚 +${g.eggs}`, g.stone && `💠 +${g.stone}`, g.chests && g.chests.map(c => CHESTS[c].n).join(', ')].filter(Boolean);
  resultModal(`<h3>🎁 ${g.n}</h3><div class="reward-line">${parts.map(p => `<span>${p}</span>`).join('')}</div>`);
}
function settingsModal() {
  modal(`<h3>⚙ Cài đặt</h3>
    <label class="set-row"><span>Tên hiệp sĩ</span><input class="name" id="sName" maxlength="14" value="${S.name.replace(/"/g, '')}"></label>
    <div class="btns" style="margin-top:4px"><button class="btn ok" id="sSaveName">Đổi tên</button></div>
    <div class="set-row"><span>Nhập code</span><input class="name" id="sCode" maxlength="24" placeholder="Nhập mã quà tặng" style="text-transform:uppercase"></div>
    <div class="btns" style="margin-top:4px"><button class="btn green" id="sRedeem">Nhận quà</button></div>
    <div class="set-row"><span>Âm thanh</span><button class="toggle ${S.muted ? '' : 'on'}" id="sSound"><i></i><b>${S.muted ? 'Tắt' : 'Bật'}</b></button></div>
    <div class="set-row"><span>Hiệu ứng động<br><small style="color:#a89cc8">pháo giấy, cờ bay, hạt, tia sét trang trí</small></span><button class="toggle ${S.noFx ? '' : 'on'}" id="sFx"><i></i><b>${S.noFx ? 'Tắt' : 'Bật'}</b></button></div>
    <div class="set-row"><span>Toàn màn hình<br><small style="color:#a89cc8">${IS_IOS ? 'iPhone: bấm Chia sẻ ⬆ → “Thêm vào MH chính”, mở game từ biểu tượng' : 'ẩn thanh địa chỉ và thanh dưới của trình duyệt'}</small></span><button class="btn" id="sFull" ${IS_IOS && !IS_STANDALONE ? 'disabled' : ''}>${isFull() ? 'Thoát' : 'Bật'}</button></div>
    <div class="set-row"><span>Dữ liệu</span><button class="btn red" id="sReset">Xóa dữ liệu & chơi lại</button></div>
    <p class="hint" id="sResetHint" style="display:none;color:#ff8a7a">Toàn bộ trang bị, thú linh, cấp độ sẽ mất và không khôi phục được. Bấm lần nữa để xác nhận.</p>
    <p class="copyright">Đấu Trường Hiệp Sĩ · phiên bản 2026<br>© 2026 Nghiêm Xuân Thịnh. Bản quyền thuộc về Nghiêm Xuân Thịnh.</p>
    <div class="btns"><button class="btn" id="sClose">Đóng</button></div>`, root => {
    bindBtns(root, {
      '#sClose': closeModal,
      '#sFull': () => { if (isFull()) { (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document); } else goFull(); setTimeout(settingsModal, 400); },
      '#sRedeem': () => { const code = root.querySelector('#sCode').value.trim().toUpperCase().replace(/\s+/g, ''); redeemCode(code); },
      '#sSaveName': () => { S.name = (root.querySelector('#sName').value.trim() || 'Hiệp Sĩ').slice(0, 14); save(); render(); toast('Đã đổi tên: ' + S.name); },
      '#sFx': () => { S.noFx = !S.noFx; save(); sfx('tap'); toast(S.noFx ? 'Đã tắt hiệu ứng động' : 'Đã bật hiệu ứng động'); settingsModal(); },
      '#sSound': () => { S.muted = !S.muted; save(); if (!S.muted) sfx('tap'); settingsModal(); },
      '#sReset': () => { const bt = root.querySelector('#sReset'); if (!bt.dataset.ok) { bt.dataset.ok = 1; bt.textContent = 'Bấm lần nữa để xóa hết'; root.querySelector('#sResetHint').style.display = 'block'; return; }
        try { localStorage.removeItem(SAVE_KEY); } catch (e) { } S = newSave(); ensureFeat(); save(); closeModal(); showTab('home'); render(); toast('Đã xóa dữ liệu, chơi lại từ đầu'); },
    });
  });
}

// ================== PHẦN THƯỞNG KHI VẮNG MẶT (theo thời gian thực) ==================
// Rời game từ 5 phút trở lên: nhận vàng + kinh nghiệm theo giờ vắng (tối đa 12 giờ), cứ 2 giờ thêm 1 rương (càng lâu rương càng quý).
const OFF_MIN_MS = 5 * 60e3, OFF_CAP_H = 12;
function offlineCalc(ms) {
  const h = Math.min(OFF_CAP_H, ms / 3.6e6), lvl = dropLevel();
  const gold = Math.round(h * (120 + lvl * 40)), xp = Math.round(h * (30 + (S.lv || 1) * 6)), chests = [];
  for (let i = 0; i < Math.floor(h / 2); i++) chests.push({ type: i >= 5 ? 'gold' : i >= 2 ? 'silver' : 'wood', ilvl: lvl });
  if (h >= OFF_CAP_H) chests.push({ type: 'legend', ilvl: lvl }); // đủ 12 giờ: thêm Rương Huyền Thoại
  return { h, ms, gold, xp, chests };
}
const fmtAway = (ms) => { const m = Math.floor(ms / 60000), h = Math.floor(m / 60); return h ? `${h} giờ ${m % 60} phút` : `${m} phút`; };
function markSeen() { if (S) { S.lastSeen = Date.now(); save(); } }
function checkOffline() {
  ensureFeat(); const now = Date.now(), last = S.lastSeen || now; S.lastSeen = now;
  if (now - last >= OFF_MIN_MS && !S.offPending) S.offPending = offlineCalc(now - last);
  save(); if (S.offPending) showOffline();
}
function showOffline() {
  const r = S.offPending; if (!r) return;
  if (!$('modal').classList.contains('hidden') || !$('battle').classList.contains('hidden')) { setTimeout(showOffline, 1500); return; } // chờ hộp thoại / trận đấu khác xong
  const give = (mult) => { S.offPending = null; S.gold += r.gold * mult; gainXP(r.xp * mult); queueChests(r.chests); save(); render(); closeModal(); sfx('win'); afterChestHook(); };
  const cnt = {}; r.chests.forEach(c => cnt[c.type] = (cnt[c.type] || 0) + 1);
  modal(`<h3>🌙 Phần thưởng khi vắng mặt</h3>
    <p class="hint" style="text-align:center">Bạn đã rời đi <b>${fmtAway(r.ms)}</b>${r.h >= OFF_CAP_H ? ' (tính tối đa 12 giờ)' : ''}.<br>Hiệp sĩ vẫn chinh chiến và mang về:</p>
    <div class="reward-line"><span>🪙 +${fmt(r.gold)}</span><span>⭐ +${fmt(r.xp)} KN</span></div>
    ${r.chests.length ? `<div class="reward-line">${Object.keys(cnt).map(k => `<span>${CHESTS[k].ic} ${CHESTS[k].n}${cnt[k] > 1 ? ' ×' + cnt[k] : ''}</span>`).join('')}</div>` : '<p class="hint" style="text-align:center">Vắng mặt từ 2 giờ trở lên sẽ nhận thêm rương.</p>'}
    <div class="btns"><button class="btn" id="bOff1">Nhận</button><button class="btn ok" id="bOff2" ${S.gems >= 30 ? '' : 'disabled'}>Nhận x2 vàng & KN (💎30)</button></div>`, root => {
    bindBtns(root, { '#bOff1': () => give(1), '#bOff2': () => { if (S.gems < 30) return; S.gems -= 30; give(2); } });
  });
}
setInterval(markSeen, 30000); // ghi mốc thời gian đang chơi
document.addEventListener('visibilitychange', () => { if (document.hidden) markSeen(); else checkOffline(); });
addEventListener('pagehide', markSeen);
setTimeout(checkOffline, 1200);

// ================== CÁNH (mở ở cấp 10) ==================
// 5 hệ × 5 bậc như thú linh. Cánh vẽ sau lưng nhân vật, đập nhẹ; bậc càng cao càng phát sáng.
const WING_UNLOCK_LV = 10;
const WING_TIER = ['Cánh Non', 'Cánh Lông Vũ', 'Cánh Khảm Kim', 'Cánh Bảo Ngọc', 'Cánh Thần Thoại'];
const WING_BONUS = [0.02, 0.04, 0.07, 0.11, 0.16], WING_SPEED = [1, 2, 3, 5, 8], WING_W = [50, 28, 14, 6, 2];
const WING_ELEMS = [...PET_ELEMS, 'quang']; // thêm bộ Cánh Thiên Thần (hệ Quang)
const wingName = (w) => w.e === 'quang' ? `${WING_TIER[w.r]} Thiên Thần` : `${WING_TIER[w.r]} ${ELEM[w.e].n}`;
for (const e of WING_ELEMS) for (let r = 0; r < 5; r++) { const id = `wing-${e}-${r}`; if (!SPR[id]) { const im = new Image(); im.src = `${id}.webp`; SPR[id] = im; } }
function curWing() { if (!S || !S.wings || (S.lv || 1) < WING_UNLOCK_LV) return null; return S.wings.find(w => w.id === S.wing) || null; }
// cộng chỉ số cánh vào applyBonuses
const _applyBonusesW = applyBonuses;
applyBonuses = function (st) { st = _applyBonusesW(st); const w = curWing(); if (w) { const b = WING_BONUS[w.r]; st.atk = Math.round(st.atk * (1 + b)); st.hp = Math.round(st.hp * (1 + b)); st.speed = (st.speed || 0) + WING_SPEED[w.r]; } return st; };
function drawWings(ctx, w, cx, cy, Hc, t, onBody) {
  const im = SPR[`wing-${w.e}-${w.r}`]; if (!im || !im.complete || !im.naturalWidth) return;
  // cỡ tăng đều theo cấp: cao 48% → 92% khung, bề ngang có trần theo cấp (cánh dẹt cấp thấp không bè ra)
  const asp = im.naturalHeight / im.naturalWidth; let wh = Hc * (0.48 + w.r * 0.11), ww = wh / asp;
  const maxW = Hc * (0.82 + w.r * 0.1); if (ww > maxW) { ww = maxW; wh = ww * asp; }
  // trên người: mép trên cánh neo gần đỉnh như cánh cấp cao nhất → cánh mọc từ ngang vai, không tụt xuống eo
  if (onBody) { const top = cy - Hc * 0.46 + (Hc * 0.92 - wh) * 0.3; cy = top + wh / 2; cx -= Hc * 0.05; } // nhân vật đứng nghiêng → cánh lệch nhẹ về phía lưng
  const flap = 1 + Math.sin(t * 3.2) * 0.07, bob = Math.sin(t * 3.2 + 1) * Hc * 0.012;
  ctx.save(); ctx.translate(cx, cy + bob);
  if (onBody) { ctx.rotate(-0.09); ctx.transform(1, 0, -0.06, 1, 0, 0); ctx.scale(0.93, 1); } // nghiêng theo dáng đứng 3/4 (theo hướng nhân vật vì khung đã lật theo facing)
  ctx.scale(flap, 1 - (flap - 1) * 0.4);
  if (w.r >= 2) { // quầng sáng ôm đúng hình cánh, màu theo bậc
    const S2 = imgSil(im, PET_RCOL[w.r]), pw = S2.p * wh; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (0.25 + (w.r - 2) * 0.18) * (0.75 + 0.25 * Math.sin(t * 3));
    ctx.drawImage(S2.c, -ww / 2 - pw, -wh / 2 - pw, ww + pw * 2, wh + pw * 2); ctx.restore(); }
  ctx.drawImage(im, -ww / 2, -wh / 2, ww, wh);
  if (w.r >= 3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3 + w.r * 2; i++) { const a = t * 0.8 + i * 2.1, px = Math.cos(a) * ww * 0.42, py = Math.sin(a * 1.3) * wh * 0.35, tw = Math.max(0, Math.sin(t * 5 + i * 1.7)); if (tw > 0.2) drawStar4(ctx, px, py, 2 + w.r * 0.8, PET_RCOL[w.r], tw); } ctx.restore(); }
  ctx.restore();
}
function openWingBox(free) {
  ensureFeat(); S.wings = S.wings || [];
  if (!free) { if (S.gems < 150) return toast('Không đủ ngọc'); S.gems -= 150; }
  const w = { id: uid(), e: pick(WING_ELEMS), r: weighted(WING_W) };
  const dup = S.wings.find(q => q.e === w.e && q.r === w.r), refund = (w.r + 1) * 30;
  if (dup) S.gems += refund; else { S.wings.push(w); if (!S.wing) S.wing = w.id; }
  save(); render(); sfx('chest');
  modal(`<h3>🪽 Mở Hộp Cánh</h3><div class="wing-show"><canvas id="wingCv" width="300" height="200"></canvas></div>
    <div class="rr" style="text-align:center;font-weight:800;color:${PET_RCOL[w.r]}">${PET_RAR[w.r]}</div><div style="text-align:center;font-size:18px;font-weight:800">${wingName(w)}</div>
    ${dup ? `<p class="hint" style="text-align:center">Đã có cánh này → hoàn 💎${refund}</p>` : ''}
    <div class="btns"><button class="btn ok" id="bOk">Tuyệt vời!</button></div>`, root => {
    bindBtns(root, { '#bOk': () => wingModal() });
    const cv = root.querySelector('#wingCv'), t0 = performance.now();
    const loop = (now) => { if (!document.body.contains(cv)) return; const x = hd(cv, 300, 200); x.clearRect(0, 0, 300, 200); drawWings(x, w, 150, 100, 170, (now - t0) / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  });
}
function wingModal() {
  ensureFeat(); S.wings = S.wings || [];
  if (S.lv < WING_UNLOCK_LV) return modal(`<h3>🪽 Cánh</h3><p style="text-align:center;font-size:14px">Đạt <b>cấp ${WING_UNLOCK_LV}</b> để mở ô Cánh.<br>Hiện tại: cấp ${S.lv}.</p><p class="hint">Cánh mọc sau lưng hiệp sĩ, tăng công, máu và tốc độ. ${WING_ELEMS.length} bộ (5 hệ + Thiên Thần), mỗi bộ 5 bậc; bậc cao phát sáng.</p><div class="btns"><button class="btn" id="bC">Đóng</button></div>`, r => bindBtns(r, { '#bC': closeModal }));
  const cur = curWing();
  let html = `<h3>🪽 Cánh</h3>${cur ? `<p class="hint" style="text-align:center">Đang mang: <b style="color:${PET_RCOL[cur.r]}">${wingName(cur)}</b> · +${Math.round(WING_BONUS[cur.r] * 100)}% công/máu · +${WING_SPEED[cur.r]} tốc</p>` : '<p class="hint" style="text-align:center">Chạm một đôi cánh đã có để mang.</p>'}
    <div class="btns" style="margin-top:0"><button class="btn ok" id="bBox" ${S.gems >= 150 ? '' : 'disabled'}>Mở Hộp Cánh 💎150</button>${cur ? '<button class="btn" id="bOff">Tháo cánh</button>' : ''}</div><div class="petgrid wings">`;
  for (const e of WING_ELEMS) for (let r = 0; r < 5; r++) { const own = S.wings.find(w => w.e === e && w.r === r), on = own && cur && own.id === cur.id;
    html += `<div class="pet ${own ? '' : 'lock'} ${on ? 'on' : ''}" data-id="${own ? own.id : ''}" style="--pc:${PET_RCOL[r]}"><canvas class="wcv" data-e="${e}" data-r="${r}" width="90" height="70"></canvas><b>${wingName({ e, r })}</b><small class="t${[0, 2, 3, 4, 6][r]}">${PET_RAR[r]}</small></div>`; }
  html += `</div><div class="btns"><button class="btn" id="bC">Đóng</button></div>`;
  modal(html, root => {
    bindBtns(root, { '#bC': closeModal, '#bBox': () => openWingBox(false), '#bOff': () => { S.wing = null; save(); render(); wingModal(); } });
    root.querySelectorAll('.pet[data-id]').forEach(el => { if (el.dataset.id) el.onclick = () => { S.wing = el.dataset.id; save(); sfx('tap'); render(); wingModal(); }; });
    const t0 = performance.now(), cvs = [...root.querySelectorAll('.wcv')];
    const loop = (now) => { if (!cvs.length || !document.body.contains(cvs[0])) return; for (const cv of cvs) { const x = hd(cv, 90, 70); x.clearRect(0, 0, 90, 70); drawWings(x, { e: cv.dataset.e, r: +cv.dataset.r }, 45, 35, 62, (now - t0) / 1000 + (+cv.dataset.r)); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
}
// nút Cánh ở màn Trang bị + thưởng hộp cánh khi lên cấp 10, 20, 30…
(function hookWings() {
  // nút Cánh ở màn Đấu Trường (cạnh Thú Linh)
  const hb = document.createElement('button'); hb.className = 'mode sm'; hb.id = 'btnWing'; hb.innerHTML = '<span class="ic">🪽</span><b>Cánh</b><small id="wingInfo"></small>';
  const pb = $('btnPet'); if (pb) { pb.parentNode.insertBefore(hb, pb.nextSibling); hb.onclick = () => { sfx('tap'); wingModal(); }; }
  const _rW = render; render = function () { _rW(); const wi = $('wingInfo'); if (wi && S) { const w = curWing(); wi.textContent = (S.lv || 1) < WING_UNLOCK_LV ? `Mở ở cấp ${WING_UNLOCK_LV}` : w ? wingName(w) : 'Chưa có'; } };
  const gb = document.createElement('button'); gb.className = 'mini'; gb.textContent = '🪽 Cánh'; gb.style.cssText = 'margin-left:4px;background:linear-gradient(#8a7aff,#3a2a9a)';
  const ref = $('btnPet2') || $('btnOutfit'); ref.parentNode.insertBefore(gb, ref.nextSibling); gb.onclick = () => { sfx('tap'); wingModal(); };
  const _gx = gainXP; gainXP = function (n) { const before = S.lv || 1; _gx(n); let k = 0; for (let L = before + 1; L <= S.lv; L++) if (L % 10 === 0) k++; if (k) setTimeout(() => { for (let i = 0; i < k; i++) openWingBox(true); }, 1800); };
  GIFT_CODES.CANHTHAN = { gems: 300, n: 'Quà cánh thần' };
  const _rs2 = renderShop; renderShop = function () { _rs2(); const shop = $('shop'); if (!shop || shop.querySelector('#bWingShop')) return; const d = document.createElement('div'); d.className = 'chest';
    d.innerHTML = `<span class="big">🪽</span><b>Hộp Cánh</b><small>Ra cánh 6 bộ (có Thiên Thần) · Thần Thoại 2% · cần cấp ${WING_UNLOCK_LV}</small><button id="bWingShop" ${S.gems >= 150 && (S.lv || 1) >= WING_UNLOCK_LV ? '' : 'disabled'}>💎150</button>`;
    shop.appendChild(d); d.querySelector('button').onclick = () => openWingBox(false); };
})();

// ===== Chặn zoom (chụm 2 ngón trên iPhone, chạm đúp) và menu giữ lâu =====
(function noZoomNoCopy() {
  const isField = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
  // chạm đúp: đã chặn bằng CSS touch-action: manipulation (không chặn bằng JS để không mất cú chạm nhanh)
  document.addEventListener('contextmenu', e => { if (!isField(e.target)) e.preventDefault(); });
  document.addEventListener('selectstart', e => { if (!isField(e.target)) e.preventDefault(); });
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
})();

// ===== Toàn màn hình khi chơi trên trình duyệt điện thoại =====
// Android/Chrome: tự vào toàn màn hình ở lần chạm đầu. iPhone/Safari không cho trang web tự ẩn thanh trình duyệt → hướng dẫn "Thêm vào MH chính".
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IS_STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches) || navigator.standalone === true;
function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement) || IS_STANDALONE; }
function goFull() {
  const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!rq || isFull()) return;
  try { const pr = rq.call(el, { navigationUI: 'hide' }); if (pr && pr.then) pr.then(() => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait').catch(() => {}); } catch (e) { } }).catch(() => {}); } catch (e) { }
}
(function autoFull() {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (!isMobile || IS_STANDALONE) return;
  const once = () => { if (!isFull()) goFull(); };
  document.addEventListener('pointerup', once, { passive: true }); // mỗi lần chạm nếu bị thoát (vuốt) thì vào lại
  if (IS_IOS) { try { if (!localStorage.getItem('hs_ios_full')) { localStorage.setItem('hs_ios_full', '1'); setTimeout(() => toast('Chơi toàn màn hình: bấm Chia sẻ ⬆ → “Thêm vào MH chính”'), 2500); } } catch (e) { } }
  addEventListener('resize', () => { try { if (B) fitBattle(); } catch (e) { } });
})();

// ================== CƯỜNG HÓA + ÉP SAO ==================
// Ép sao chỉ cho đồ đỏ (Thần Thoại) trở lên. Lên sao thứ n cần n trang bị CÙNG PHẨM CHẤT trong túi làm nguyên liệu,
// tỉ lệ thành công giảm dần; thất bại vẫn mất nguyên liệu, không mất sao. Mỗi sao +8% chỉ số.
const STAR_MIN_RAR = 6, STAR_MAX = 5, STAR_BONUS = 0.08, STAR_RATE = [90, 75, 60, 45, 30];
const starNeed = (it) => (it.star || 0) + 1;
const starStr = (n) => n ? '★'.repeat(n) : '';
const _itemStatsS = itemStats;
itemStats = function (it) { const s = _itemStatsS(it); if (it && it.star) { const k = 1 + STAR_BONUS * it.star; s.atk = Math.round(s.atk * k); s.hp = Math.round(s.hp * k); } return s; };
const _itemNameS = itemName;
itemName = function (it) { const n = _itemNameS(it); return it && it.star ? `${n} ${starStr(it.star)}` : n; };
function starMats(it) { return S.bag.filter(q => q !== it && q.rar === it.rar && !(q.star > 0)).sort((a, b) => a.ilvl - b.ilvl || a.up - b.up); }
function tryStar(it, done) {
  if (it.rar < STAR_MIN_RAR || (it.star || 0) >= STAR_MAX) return;
  const need = starNeed(it), mats = starMats(it);
  if (mats.length < need) return toast(`Cần ${need} đồ ${RAR[it.rar].n} trong túi`);
  mats.slice(0, need).forEach(removeFromBag);
  const rate = STAR_RATE[it.star || 0];
  if (Math.random() * 100 < rate) { it.star = (it.star || 0) + 1; sfx('chest'); toast(`Ép sao thành công! ${starStr(it.star)}`); }
  else { sfx('lose'); toast(`Ép sao thất bại (${rate}%) — mất ${need} nguyên liệu`); }
  save(); render(); done && done();
}
function forgeRow(it, slotName, equipped) {
  const cost = upCost(it), maxed = it.up >= MAX_UP[it.rar], canStar = it.rar >= STAR_MIN_RAR, st = it.star || 0;
  const mats = canStar ? starMats(it).length : 0, need = starNeed(it);
  return `<div class="forge-row" style="border-left-color:${RCOL[it.rar]}">
    <div class="icon bg${it.rar} r${it.rar}">${itemIconHTML(it)}</div>
    <div class="fi"><b class="t${it.rar}">${itemName(it)}</b><small>${slotName} · ${RAR[it.rar].n} · Cấp ${it.ilvl} · <b>+${it.up}</b>/${MAX_UP[it.rar]}${canStar ? ` · <span style="color:#ffd84a">${st}/${STAR_MAX}★</span>` : ''}</small>
      <div class="fb"><button class="btn green sm" data-up="${it.id}" ${maxed || S.gold < cost ? 'disabled' : ''}>${maxed ? 'Tối đa' : `Cường hóa 🪙${fmt(cost)}`}</button>
      ${canStar ? (st >= STAR_MAX ? '<button class="btn sm" disabled>★ Tối đa</button>' : `<button class="btn star sm" data-star="${it.id}" ${mats >= need ? '' : 'disabled'}>Ép sao ${st + 1}★ · ${STAR_RATE[st]}% · cần ${need} (${mats})</button>`) : ''}</div></div></div>`;
}
function forgeModal() {
  ensureFeat();
  const eq = SLOTS.map(s => [s, S.gear[s.id]]).filter(([, it]) => it);
  const html = `<h3>⚒ Cường hóa & Ép sao</h3>
    <p class="hint" style="text-align:center">Cường hóa: +10% chỉ số mỗi cấp (tốn vàng).<br>Ép sao: chỉ đồ <b style="color:${RCOL[STAR_MIN_RAR]}">${RAR[STAR_MIN_RAR].n}</b> trở lên · sao thứ n cần n đồ cùng phẩm chất · mỗi sao +${STAR_BONUS * 100}% chỉ số · thất bại mất nguyên liệu.</p>
    <div class="forge-list">${eq.map(([s, it]) => forgeRow(it, s.n, true)).join('') || '<p class="hint">Chưa mặc trang bị nào</p>'}</div>
    <div class="btns"><button class="btn" id="bC">Đóng</button></div>`;
  modal(html, root => {
    bindBtns(root, { '#bC': closeModal });
    const find = (id) => Object.values(S.gear).find(q => q && q.id === id) || S.bag.find(q => q.id === id);
    root.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const it = find(b.dataset.up), c = upCost(it); if (!it || S.gold < c || it.up >= MAX_UP[it.rar]) return; S.gold -= c; it.up++; sfx('coin'); save(); render(); forgeModal(); });
    root.querySelectorAll('[data-star]').forEach(b => b.onclick = () => { const it = find(b.dataset.star); if (it) tryStar(it, forgeModal); });
  });
}
(function hookForge() {
  // tab Cường hóa ở thanh dưới: vẽ màn khi mở tab
  const _rF = render; render = function () { _rF(); if (curTab === 'forge') renderForge(); };
  // chi tiết từng món: thêm nút ép sao cho đồ đỏ trở lên
  const _idS = itemDetail;
  itemDetail = function (it, equipped) { _idS(it, equipped); if (it.rar < STAR_MIN_RAR) return; const box = document.querySelector('#modal .btns'); if (!box || box.querySelector('#bStar')) return;
    const st = it.star || 0, need = starNeed(it), mats = starMats(it).length; const b = document.createElement('button'); b.className = 'btn star'; b.id = 'bStar';
    b.textContent = st >= STAR_MAX ? '★ Tối đa' : `Ép sao ${st + 1}★ · ${STAR_RATE[st]}% · cần ${need} (${mats})`; b.disabled = st >= STAR_MAX || mats < need;
    b.onclick = () => tryStar(it, () => itemDetail(it, equipped)); box.appendChild(b); };
})();

// ===== Màn Cường hóa (tab riêng): mục Trang bị / Cánh / Thú linh =====
let forgeSub = 'gear';
function renderForge() {
  const box = $('forgeBox'); if (!box) return; ensureFeat();
  const tabs = [['gear', '🛡 Trang bị'], ['wing', '🪽 Cánh'], ['pet', '🐾 Thú linh']];
  let body = '';
  if (forgeSub === 'gear') {
    const eq = SLOTS.map(s => [s, S.gear[s.id]]).filter(([, it]) => it);
    const red = S.bag.filter(it => it.rar >= STAR_MIN_RAR).sort((a, b) => b.rar - a.rar || (b.star || 0) - (a.star || 0) || b.ilvl - a.ilvl);
    body = `<p class="hint">Cường hóa: +10% chỉ số mỗi cấp (tốn vàng). Ép sao: đồ <b style="color:${RCOL[STAR_MIN_RAR]}">${RAR[STAR_MIN_RAR].n}</b> trở lên, tối đa ${STAR_MAX}★, sao thứ n cần n đồ cùng phẩm chất, mỗi sao +${STAR_BONUS * 100}% chỉ số, thất bại mất nguyên liệu.</p>
      <h4 class="forge-h">Đang mặc</h4><div class="forge-list">${eq.map(([s, it]) => forgeRow(it, s.n, true)).join('') || '<p class="hint">Chưa mặc trang bị nào</p>'}</div>
      ${red.length ? `<h4 class="forge-h">Đồ đỏ trở lên trong túi</h4><div class="forge-list">${red.map(it => forgeRow(it, SLOTS.find(s => s.id === it.slot).n, false)).join('')}</div>` : ''}`;
  } else if (forgeSub === 'wing') {
    const w = typeof curWing === 'function' ? curWing() : null;
    body = `<div class="forge-soon"><b>🪽 Cường hóa Cánh</b><p>Đang mang: ${w ? `<b style="color:${PET_RCOL[w.r]}">${wingName(w)}</b>` : 'chưa có'}</p><p class="hint">Phần nâng cấp / ép sao cho cánh sẽ được thêm ở đây.</p><button class="btn" id="fWing">Mở bộ sưu tập Cánh</button></div>`;
  } else {
    body = `<div class="forge-soon"><b>🐾 Cường hóa Thú linh</b><p class="hint">Hiện nâng cấp thú linh bằng 💠 đá thú linh trong mục Thú Linh. Phần ép sao cho thú linh sẽ được thêm ở đây.</p><button class="btn" id="fPet">Mở Thú Linh</button></div>`;
  }
  box.innerHTML = `<div class="forge-tabs">${tabs.map(([k, n]) => `<button class="${forgeSub === k ? 'on' : ''}" data-fs="${k}">${n}</button>`).join('')}</div>${body}`;
  box.querySelectorAll('[data-fs]').forEach(b => b.onclick = () => { forgeSub = b.dataset.fs; sfx('tap'); renderForge(); });
  const find = (id) => Object.values(S.gear).find(q => q && q.id === id) || S.bag.find(q => q.id === id);
  box.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const it = find(b.dataset.up), c = upCost(it); if (!it || S.gold < c || it.up >= MAX_UP[it.rar]) return; S.gold -= c; it.up++; sfx('coin'); save(); render(); });
  box.querySelectorAll('[data-star]').forEach(b => b.onclick = () => { const it = find(b.dataset.star); if (it) tryStar(it); });
  const fw = box.querySelector('#fWing'); if (fw) fw.onclick = () => { sfx('tap'); wingModal(); };
  const fp = box.querySelector('#fPet'); if (fp) fp.onclick = () => { sfx('tap'); (typeof petModal === 'function' ? petModal : () => $('btnPet') && $('btnPet').click())(); };
}
forgeModal = function () { forgeSub = 'gear'; showTab('forge'); };
