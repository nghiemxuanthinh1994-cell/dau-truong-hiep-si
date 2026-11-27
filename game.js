/* Đấu Trường Hiệp Sĩ — game đấu tay đôi tự động, thu thập trang bị.
   Một file JS thuần, không thư viện. Lưu tiến trình bằng localStorage. */
'use strict';

// ================== DỮ LIỆU CỐ ĐỊNH ==================
const SAVE_KEY = 'dths_save_v1';
const RAR = [
  { n: 'Thường',       m: 1.0,  sell: 1 },
  { n: 'Tinh Luyện',   m: 1.15, sell: 2 },
  { n: 'Hiếm',         m: 1.35, sell: 4 },
  { n: 'Sử Thi',       m: 1.65, sell: 9 },
  { n: 'Huyền Thoại',  m: 2.0,  sell: 18 },
  { n: 'Truyền Thuyết',m: 2.45, sell: 35 },
  { n: 'Thần Thoại',   m: 3.0,  sell: 60 },
  { n: 'Siêu Thần',    m: 3.8,  sell: 150 },
];
const R_MYTH = 6, R_SUPER = 7;
const RCOL = ['#9aa3ad', '#5fd36f', '#3fa0ff', '#b45cff', '#ff9a1f', '#2fe6e0', '#ff3d6e', '#ffd700'];
const SLOTS = [
  { id: 'helmet',   n: 'Mũ',       ic: '⛑', side: 'L' },
  { id: 'shoulder', n: 'Giáp Vai', ic: '🦾', side: 'L' },
  { id: 'armor',    n: 'Áo',       ic: '🦺', side: 'L' },
  { id: 'gloves',   n: 'Găng',     ic: '🧤', side: 'L' },
  { id: 'weapon',   n: 'Vũ khí',   ic: '🗡', side: 'R' },
  { id: 'shield',   n: 'Khiên',    ic: '🛡', side: 'R' },
  { id: 'pants',    n: 'Quần',     ic: '👖', side: 'R' },
  { id: 'boots',    n: 'Giày',     ic: '🥾', side: 'R' },
];
const WEAPONS = [
  { k: 'sword', n: 'Kiếm', ic: '🗡' }, { k: 'axe', n: 'Rìu', ic: '🪓' },
  { k: 'mace', n: 'Chùy', ic: '🔨' }, { k: 'spear', n: 'Thương', ic: '🔱' },
  { k: 'great', n: 'Đại Kiếm', ic: '⚔' }, { k: 'dual', n: 'Song Đao', ic: '🔪' },
  { k: 'hammer', n: 'Búa Chiến', ic: '⚒' }, { k: 'halberd', n: 'Kích', ic: '🪝' },
  { k: 'scythe', n: 'Lưỡi Hái', ic: '🌙' }, { k: 'trident', n: 'Đinh Ba', ic: '🔱' }, { k: 'staff', n: 'Trượng', ic: '🪄' },
];
// 8 bộ trang phục Thần Thoại (end game). Mặc >=4 món cùng bộ: +25% công/máu, đổi hệ và ngoại hình; đủ 6 món: +45%.
const MYTH_SETS = [
  { id: 'hoa-long',   n: 'Hỏa Long Thần',     e: 'hoa',   perk: 'fire',    wk: 'great',   spr: 'tt-hoa-long' },
  { id: 'bang-phuong',n: 'Băng Phượng',       e: 'bang',  perk: 'ice',     wk: 'spear',   spr: 'tt-bang-phuong' },
  { id: 'loi-than',   n: 'Lôi Thần',          e: 'loi',   perk: 'thunder', wk: 'hammer',  spr: 'tt-loi-than' },
  { id: 'tu-than',    n: 'Tử Thần Bóng Đêm',  e: 'am',    perk: 'leech',   wk: 'scythe',  spr: 'tt-tu-than' },
  { id: 'thanh-quang',n: 'Thánh Quang Thái Dương', e: 'quang', perk: 'heal', wk: 'sword', spr: 'tt-thanh-quang' },
  { id: 'hai-long',   n: 'Hải Long Vương',    e: 'thuy',  perk: 'whirl',   wk: 'trident', spr: 'tt-hai-long' },
  { id: 'phong-kiem', n: 'Phong Kiếm Lãng Khách', e: 'phong', perk: 'whirl', wk: 'dual',  spr: 'tt-phong-kiem' },
  { id: 'moc-than',   n: 'Mộc Thần Cổ Thụ',   e: 'moc',   perk: 'poison',  wk: 'staff',   spr: 'tt-moc-than' },
];
// 2 bộ Siêu Thần: cực hiếm, cực mạnh (đủ 4 món: +40%, đủ 6: +70%)
const SUPER_SETS = [
  { id: 'sieu-than-long', n: 'Siêu Thần Long',  e: 'hoa', perk: 'fire',  wk: 'great',  spr: 'st-sieu-than-long', super: true },
  { id: 'dia-nguc',       n: 'Địa Ngục Hỏa Đế', e: 'am',  perk: 'leech', wk: 'scythe', spr: 'st-dia-nguc',       super: true },
];
const ALL_SETS = [...MYTH_SETS, ...SUPER_SETS];
const setOf = (id) => ALL_SETS.find(x => x.id === id);
const MAT = [['Sắt', 'Gỗ Sồi', 'Da Thô'], ['Thép Rèn', 'Xích Bạc', 'Đồng Luyện'], ['Thép Xanh', 'Bạc', 'Đồng Đỏ'], ['Long Lân', 'Hắc Thiết', 'Băng Tinh'], ['Thần Hỏa', 'Thiên Lôi', 'Bất Diệt'], ['Tinh Thể Cổ', 'Bạch Kim Rune', 'Thiên Thạch'], ['Thần Thoại'], ['Siêu Thần']];
const PERKS = {
  fire:   { n: 'Chém Lửa',     c: '#ff7a1a', d: '180% sát thương, thiêu đốt 3 lượt: mỗi lượt 100% công, cộng dồn tối đa 300%' },
  whirl:  { n: 'Lốc Xoáy',     c: '#e0e0ff', d: 'Xoay 3 đòn liên tiếp, mỗi đòn 70%' },
  ice:    { n: 'Băng Giá',     c: '#6fe3ff', d: '130% sát thương, làm chậm đối thủ' },
  thunder:{ n: 'Sấm Sét',      c: '#ffe14a', d: '150% sát thương, choáng 1 lượt' },
  leech:  { n: 'Huyết Kiếm',   c: '#ff4a6a', d: '140% sát thương, hồi máu 50% lượng gây ra' },
  heal:   { n: 'Hồi Phục',     c: '#5dff8a', d: 'Đánh thường và hồi máu 100% công, cộng dồn mỗi lần tới tối đa 300% công' },
  guard:  { n: 'Khiên Thép',   c: '#c8d6e5', d: 'Chặn hoàn toàn đòn đánh kế tiếp' },
  poison: { n: 'Độc Tiễn',     c: '#9cff3a', d: 'Gây độc 4 lượt' },
};
const PERK_BY_SLOT = {
  weapon: ['fire', 'whirl', 'thunder', 'leech', 'ice'], gloves: ['fire', 'whirl', 'poison', 'leech'],
  helmet: ['heal', 'thunder', 'guard'], armor: ['guard', 'heal', 'ice'], shoulder: ['guard', 'thunder', 'fire'], pants: ['guard', 'heal', 'whirl'],
  shield: ['guard', 'ice', 'thunder'], boots: ['whirl', 'poison', 'heal'],
};
const PERK_CHANCE = [7, 10, 13, 17, 22, 27, 32, 38];
const LEAGUES = [
  { n: 'Giải Gỗ',       t: 0,    em: '🪵', gem: 0 },
  { n: 'Giải Đồng',     t: 200,  em: '🥉', gem: 50 },
  { n: 'Giải Bạc',      t: 500,  em: '🥈', gem: 100 },
  { n: 'Giải Vàng',     t: 1000, em: '🥇', gem: 200 },
  { n: 'Giải Bạch Kim', t: 1800, em: '💠', gem: 350 },
  { n: 'Giải Kim Cương',t: 3000, em: '💎', gem: 600 },
  { n: 'Giải Huyền Thoại', t: 5000, em: '👑', gem: 1000 },
];
const CHESTS = {
  wood:   { n: 'Rương Gỗ',          ic: '📦', w: [60, 30, 9, 1],                cost: { gold: 300 } },
  silver: { n: 'Rương Bạc',         ic: '🧰', w: [20, 35, 30, 13, 2],           cost: { gems: 60 } },
  gold:   { n: 'Rương Vàng',        ic: '💰', w: [0, 10, 40, 35, 13, 2],        cost: { gems: 150 } },
  legend: { n: 'Rương Huyền Thoại', ic: '👑', w: [0, 0, 0, 45, 38, 14, 3],      cost: { gems: 400 } },
  myth:   { n: 'Rương Thần Thoại',  ic: '🌟', w: [0, 0, 0, 0, 40, 40, 19, 1],   cost: { gems: 900 } },
  super:  { n: 'Rương Siêu Thần',   ic: '🐉', w: [0, 0, 0, 0, 0, 40, 50, 10],   cost: { gems: 2500 } },
};
const ARENAS = [
  { sky: ['#6a8fd8', '#b9d3f0'], ground: '#7b5a3a', deco: 'castle' },
  { sky: ['#f0a85a', '#ffe0a0'], ground: '#d9a85a', deco: 'desert' },
  { sky: ['#1a2a4a', '#3d5a7a'], ground: '#2f4a32', deco: 'forest' },
  { sky: ['#9fb8d0', '#e8f2ff'], ground: '#dfe8f0', deco: 'snow' },
];
const NAMES = ['Bảo Long', 'Trấn Phong', 'Hắc Vân', 'Thiết Hùng', 'Lôi Hổ', 'Kim Ưng', 'Bạch Mã', 'Phi Báo', 'Thanh Kiếm', 'Huyết Lang',
  'Ngạo Thiên', 'Cuồng Phong', 'Thạch Sơn', 'Hỏa Diệm', 'Băng Hà', 'Vô Ảnh', 'Đại Bàng', 'Mãnh Hổ', 'Hàn Thiết', 'Lạc Hồng',
  'Sir Aldric', 'Borin', 'Kael', 'Rurik', 'Ivar', 'Garron', 'Leif', 'Osric', 'Tamsin', 'Wulf'];
const BANNERS = ['#d33', '#36c', '#2a2', '#c90', '#939', '#0aa', '#e73', '#555'];

// ---------- Hệ (nguyên tố) ----------
// Khắc hệ: đánh vào hệ bị khắc +30% sát thương. Quang ⇄ Ám khắc lẫn nhau.
const ELEM = {
  vo:    { n: 'Vô Hệ', ic: '⚪', c: '#d0d0d0', beats: [] },
  hoa:   { n: 'Hỏa',   ic: '🔥', c: '#ff6a1a', beats: ['moc', 'bang'] },
  bang:  { n: 'Băng',  ic: '❄',  c: '#7fe3ff', beats: ['phong', 'tho'] },
  loi:   { n: 'Lôi',   ic: '⚡', c: '#ffe14a', beats: ['thuy', 'phong'] },
  doc:   { n: 'Độc',   ic: '☠',  c: '#9cff3a', beats: ['moc', 'thuy'] },
  tho:   { n: 'Thổ',   ic: '🪨', c: '#d8a35a', beats: ['loi', 'hoa'] },
  thuy:  { n: 'Thủy',  ic: '🌊', c: '#3fa8ff', beats: ['hoa', 'tho'] },
  phong: { n: 'Phong', ic: '🌪', c: '#8dffc8', beats: ['doc', 'moc'] },
  moc:   { n: 'Mộc',   ic: '🌿', c: '#5ad25a', beats: ['thuy', 'tho'] },
  quang: { n: 'Quang', ic: '☀',  c: '#fff2a0', beats: ['am'] },
  am:    { n: 'Ám',    ic: '🌑', c: '#b06cff', beats: ['quang'] },
};
const PERK_ELEM = { fire: 'hoa', ice: 'bang', thunder: 'loi', poison: 'doc', guard: 'tho', whirl: 'phong', heal: 'quang', leech: 'am' };
const elemMult = (a, d) => (ELEM[a] && ELEM[a].beats.includes(d)) ? 1.3 : 1;
// Chiêu riêng của quái (nội tại)
const PASSIVES = {
  revive: { n: 'Bất Tử',      d: 'Gục lần đầu sẽ hồi sinh với 35% máu' },
  rage:   { n: 'Cuồng Nộ',    d: 'Dưới 40% máu: công +50%' },
  dodge:  { n: 'Né Gió',      d: '18% né hoàn toàn đòn đánh' },
  pierce: { n: 'Xuyên Giáp',  d: 'Đòn đánh bỏ qua đỡ đòn' },
  regen:  { n: 'Tái Sinh',    d: 'Mỗi lượt hồi máu bằng 30% công' },
  thorns: { n: 'Gai Đá',      d: 'Phản 25% sát thương nhận vào' },
};
// Danh sách quái: ảnh trong <id>.webp
const MONSTERS = [
  { id: 'linh-gac',            n: 'Lính Gác Thành',     e: 'vo',    sk: [['whirl', 12]],                  ps: 'pierce' },
  { id: 'dau-si-gau',          n: 'Đấu Sĩ Gấu',         e: 'vo',    sk: [['leech', 12]],                  ps: 'rage' },
  { id: 'nu-hiep-si',          n: 'Nữ Thương Kỵ',       e: 'quang', sk: [['heal', 14], ['thunder', 8]],   ps: 'pierce' },
  { id: 'bo-xuong',            n: 'Chiến Binh Xương',   e: 'am',    sk: [['poison', 14]],                 ps: 'revive' },
  { id: 'than-lan-lua',        n: 'Thằn Lằn Lửa',       e: 'hoa',   sk: [['fire', 18]],                   ps: 'rage' },
  { id: 'nguoi-tuyet',         n: 'Người Tuyết',        e: 'bang',  sk: [['ice', 20]],                    ps: 'regen' },
  { id: 'golem-sam',           n: 'Golem Sấm',          e: 'loi',   sk: [['thunder', 16]],                ps: 'thorns' },
  { id: 'coc-doc',             n: 'Cóc Độc',            e: 'doc',   sk: [['poison', 24]],                 ps: 'regen' },
  { id: 'rua-da',              n: 'Rùa Đá Hộ Vệ',       e: 'tho',   sk: [['guard', 22]],                  ps: 'thorns' },
  { id: 'bong-ma-ky-si',       n: 'Bóng Ma Kỵ Sĩ',      e: 'am',    sk: [['leech', 20]],                  ps: 'dodge' },
  { id: 'ca-map-cuop-bien',    n: 'Cá Mập Cướp Biển',   e: 'thuy',  sk: [['whirl', 18], ['ice', 8]],      ps: 'rage' },
  { id: 'dieu-nhan-gio',       n: 'Điểu Nhân Gió',      e: 'phong', sk: [['whirl', 22]],                  ps: 'dodge' },
  { id: 'thanh-giap-anh-sang', n: 'Thánh Giáp Ánh Sáng',e: 'quang', sk: [['heal', 18], ['guard', 10]],    ps: 'thorns' },
  { id: 'nguoi-cay',           n: 'Người Cây Cổ Thụ',   e: 'moc',   sk: [['poison', 12], ['heal', 12]],   ps: 'regen' },
  // Trùm
  { id: 'lanh-chua',           n: 'Lãnh Chúa Thép',     e: 'tho',   sk: [['thunder', 18], ['guard', 10]], ps: 'rage',   boss: true },
  { id: 'quy-dung-nham',       n: 'Quỷ Dung Nham',      e: 'hoa',   sk: [['fire', 24]],                   ps: 'thorns', boss: true },
  { id: 'long-ky-si',          n: 'Long Kỵ Sĩ',         e: 'hoa',   sk: [['fire', 20], ['whirl', 12]],    ps: 'rage',   boss: true },
  { id: 'vua-tu-linh',         n: 'Vua Tử Linh',        e: 'am',    sk: [['leech', 20], ['poison', 16]],  ps: 'revive', boss: true },
];
// Quái bổ sung (Gemini Pro): [id, tên, hệ, nội tại, trùm?]
const SKILL_OF = { hoa: 'fire', bang: 'ice', loi: 'thunder', doc: 'poison', tho: 'guard', thuy: 'whirl', phong: 'whirl', moc: 'heal', quang: 'heal', am: 'leech', vo: 'whirl' };
const SKILL_2 = { hoa: 'whirl', bang: 'guard', loi: 'whirl', doc: 'leech', tho: 'thunder', thuy: 'ice', phong: 'thunder', moc: 'poison', quang: 'guard', am: 'poison', vo: 'leech' };
[
  ['goblin-cuop', 'Yêu Tinh Cướp', 'vo', 'dodge'], ['nguoi-soi', 'Người Sói', 'am', 'rage'], ['nam-khong-lo', 'Nấm Khổng Lồ', 'doc', 'regen'],
  ['nhen-yeu-tinh', 'Nhện Yêu Tinh', 'doc', 'pierce'], ['vua-slime', 'Vua Chất Nhờn', 'thuy', 'revive'], ['tien-day-leo', 'Tiên Dây Leo', 'moc', 'regen'],
  ['xac-uop', 'Xác Ướp Cổ', 'am', 'revive'], ['nguoi-bo-cap', 'Người Bọ Cạp', 'doc', 'pierce'], ['golem-cat', 'Golem Cát', 'tho', 'thorns'],
  ['ve-binh-cho-rung', 'Vệ Binh Chó Rừng', 'quang', 'pierce'], ['tieu-quy-lua', 'Tiểu Quỷ Lửa', 'hoa', 'dodge'], ['nguu-ma', 'Ngưu Ma', 'tho', 'rage'],
  ['khong-lo-bang', 'Khổng Lồ Băng', 'bang', 'thorns'], ['ky-si-canh-cut', 'Kỵ Sĩ Cánh Cụt', 'bang', 'dodge'], ['nguoi-bach-tuoc', 'Người Bạch Tuộc', 'thuy', 'regen'],
  ['phu-thuy-bang', 'Phù Thủy Băng', 'bang', 'regen'], ['nguoi-lun-bang', 'Người Lùn Băng', 'bang', 'rage'], ['cua-hiep-si', 'Cua Hiệp Sĩ', 'thuy', 'thorns'],
  ['ky-si-su-ung', 'Kỵ Sĩ Sư Ưng', 'phong', 'pierce'], ['quy-sam', 'Quỷ Sấm', 'loi', 'rage'], ['ky-si-co-khi', 'Kỵ Sĩ Cơ Khí', 'loi', 'thorns'],
  ['cuu-vi-ho', 'Cửu Vĩ Hồ', 'phong', 'dodge'], ['cuop-bien-troi', 'Cướp Biển Trời', 'phong', 'pierce'], ['khong-lo-mot-mat', 'Khổng Lồ Một Mắt', 'tho', 'rage'],
  ['ma-ca-rong', 'Ma Cà Rồng', 'am', 'regen'], ['tuong-quy-da', 'Tượng Quỷ Đá', 'tho', 'thorns'], ['hiep-si-xac-song', 'Hiệp Sĩ Xác Sống', 'doc', 'revive'],
  ['ninja-bong-toi', 'Ninja Bóng Tối', 'am', 'dodge'], ['giap-ma-am', 'Giáp Ma Ám', 'am', 'revive'], ['phu-thuy-dich-hach', 'Phù Thủy Dịch Hạch', 'doc', 'regen'],
  ['oni-samurai', 'Quỷ Oni Samurai', 'hoa', 'rage', 1], ['pharaoh', 'Pharaoh Thần Vương', 'quang', 'revive', 1], ['long-nhan-bang', 'Long Nhân Băng', 'bang', 'thorns', 1],
  ['ma-vuong', 'Ma Vương', 'am', 'rage', 1], ['nu-hoang-naga', 'Nữ Hoàng Naga', 'thuy', 'dodge', 1], ['titan-co-thu', 'Titan Cổ Thụ', 'moc', 'regen', 1],
].forEach(([id, n, e, ps, boss], i) => MONSTERS.push({ id, n, e, ps, boss: !!boss, sk: [[SKILL_OF[e], boss ? 20 : 14 + (i % 4) * 2], [SKILL_2[e], boss ? 12 : 7]] }));
// Hướng vẽ sẵn của từng ảnh quái (đã soát bằng mắt): các ảnh quay TRÁI -> lật để luôn nhìn về nhân vật bên trái
const NATIVE_LEFT = new Set([
  'dau-si-gau', 'quy-sam', 'long-nhan-bang', 'pharaoh', 'oni-samurai', 'ky-si-su-ung', 'nu-hiep-si', // (2026-11-27: nguoi-tuyet bỏ khỏi danh sách vì ảnh quay phải; nu-hiep-si thêm vào vì ảnh quay trái) 9 quái vẽ lại cho đủ hình 2026-11-26 đều quay trái (cùng bo-xuong, bong-ma-ky-si, coc-doc, ma-vuong, nu-hoang-naga)
  'bo-xuong', 'bong-ma-ky-si', 'coc-doc', 'cua-hiep-si', 'goblin-cuop', 'khong-lo-bang',
  'ky-si-co-khi', 'ky-si-su-ung', 'lanh-chua', 'long-ky-si', 'ma-vuong', 'nam-khong-lo',
  'nguoi-cay', 'nguoi-soi', 'nguu-ma', 'nhen-yeu-tinh', 'ninja-bong-toi', 'nu-hoang-naga',
  'phu-thuy-bang', 'rua-da', 'titan-co-thu', 'vua-slime', 'vua-tu-linh', 'xac-uop'
]);
MONSTERS.forEach(m => { m.faceL = NATIVE_LEFT.has(m.id); });
// Chỉ dùng quái đã có ảnh nạp xong
const monReady = (m) => SPR[m.id] && SPR[m.id].complete && SPR[m.id].naturalWidth > 0;
const MON_NORMAL_ALL = MONSTERS.filter(m => !m.boss), MON_BOSS_ALL = MONSTERS.filter(m => m.boss);
const MON_NORMAL = new Proxy([], { get: (t, k) => { const a = MON_NORMAL_ALL.filter(monReady); const r = a.length ? a : MON_NORMAL_ALL; return typeof r[k] === 'function' ? r[k].bind(r) : r[k]; } });
const MON_BOSS = new Proxy([], { get: (t, k) => { const a = MON_BOSS_ALL.filter(monReady); const r = a.length ? a : MON_BOSS_ALL; return typeof r[k] === 'function' ? r[k].bind(r) : r[k]; } });
const HERO_SPR = ['hs-1-thuong', 'hs-2-tinh-luyen', 'hs-3-hiem', 'hs-4-su-thi', 'hs-5-huyen-thoai', 'hs-6-truyen-thuyet'];
const TIER_GLOW = [null, null, null, '#c46cff', '#ffae2a', '#2fe6e0', '#ff3d6e', '#ffd700'];
// Tủ trang phục: chọn ngoại hình tự do sau khi mở khóa
const OUTFITS = [
  { id: 'hs-1-thuong', spr: 'hs-1-thuong', n: 'Tân Binh', tier: 0, how: 'Có sẵn', ok: () => true },
  { id: 'hs-2-tinh-luyen', spr: 'hs-2-tinh-luyen', n: 'Vệ Binh Xích Giáp', tier: 1, how: 'Sở hữu 1 món Tinh Luyện', ok: () => hasRar(1) },
  { id: 'hs-3-hiem', spr: 'hs-3-hiem', n: 'Kỵ Sĩ Thép Xanh', tier: 2, glow: '#3fa0ff', how: 'Sở hữu 1 món Hiếm', ok: () => hasRar(2) },
  { id: 'hs-4-su-thi', spr: 'hs-4-su-thi', n: 'Hắc Kỵ Sĩ', tier: 3, glow: '#c46cff', how: 'Sở hữu 1 món Sử Thi', ok: () => hasRar(3) },
  { id: 'hs-5-huyen-thoai', spr: 'hs-5-huyen-thoai', n: 'Hoàng Kim Long Kỵ', tier: 4, glow: '#ffae2a', how: 'Sở hữu 1 món Huyền Thoại', ok: () => hasRar(4) },
  { id: 'hs-6-truyen-thuyet', spr: 'hs-6-truyen-thuyet', n: 'Tinh Thể Cổ Thần', tier: 5, glow: '#2fe6e0', how: 'Sở hữu 1 món Truyền Thuyết', ok: () => hasRar(5) },
  { id: 'hiep-si-thuong', spr: 'hiep-si-thuong', n: 'Lính Đánh Thuê', tier: 0, how: 'Thắng 3 trận', ok: () => S.wins >= 3, style: true },
  { id: 'hiep-si-hiem', spr: 'hiep-si-hiem', n: 'Thiết Kỵ Lam', tier: 2, glow: '#3fa0ff', how: 'Thắng 15 trận', ok: () => S.wins >= 15, style: true },
  { id: 'hiep-si-su-thi', spr: 'hiep-si-su-thi', n: 'Tử Kỵ Rìu Tím', tier: 3, glow: '#c46cff', how: 'Thắng 40 trận', ok: () => S.wins >= 40, style: true },
  { id: 'hiep-si-huyen-thoai', spr: 'hiep-si-huyen-thoai', n: 'Hỏa Long Kỵ Sĩ', tier: 4, glow: '#ffae2a', how: 'Lên Giải Vàng', ok: () => S.bestLeague >= 3, style: true },
];
function setGlow(st) { return st.super ? (st.e === 'am' ? '#ff2a1a' : '#ffd700') : ELEM[st.e].c; }
// Trang phục phong cách vũ khí (ảnh ts-*) — thêm khi có ảnh
const STYLE_OUTFITS = [
  { id: 'ts-song-riu', n: 'Thợ Săn Song Rìu', how: 'Thắng 10 trận', ok: () => S.wins >= 10 },
  { id: 'ts-thuong-binh', n: 'Thương Binh Xích Giáp', how: 'Thắng 25 trận', ok: () => S.wins >= 25 },
  { id: 'ts-dai-kiem', n: 'Đại Kiếm Sĩ', how: 'Lên Giải Bạc', ok: () => S.bestLeague >= 2 },
  { id: 'ts-thap-thuan', n: 'Thiết Thuẫn Vệ Binh', how: 'Vượt Chương 3 Chiến Dịch', ok: () => S.camp.ch > 3 },
  { id: 'ts-song-dao', n: 'Song Đao Thích Khách', how: 'Thắng 60 trận', ok: () => S.wins >= 60 },
  { id: 'ts-thanh-kich', n: 'Thánh Kích Quân', how: 'Lên Giải Bạch Kim', ok: () => S.bestLeague >= 4 },
];
STYLE_OUTFITS.forEach(o => OUTFITS.push({ id: o.id, spr: o.id, n: o.n, tier: 2, glow: '#7fe3ff', how: o.how, ok: o.ok, style: true }));
ALL_SETS.forEach(st => OUTFITS.push({ id: st.spr, spr: st.spr, n: st.n, tier: st.super ? 7 : 6, super: !!st.super, glow: setGlow(st), how: `Thu thập 4 món bộ ${st.n}`, ok: () => mythCount(st.id) >= 4, myth: true, e: st.e }));
function hasRar(r) { return [...Object.values(S.gear), ...S.bag].some(it => it && it.rar >= r); }
function mythCount(id) { return Object.keys((S.mythSeen || {})[id] || {}).length; }
function noteMyth(it) { if (!it || !it.set) return; S.mythSeen = S.mythSeen || {}; (S.mythSeen[it.set] = S.mythSeen[it.set] || {})[it.slot] = 1; }
// Nhân vật ghép lớp: thân theo cấp GIÁP, vũ khí theo LOẠI vũ khí, khiên theo cấp KHIÊN
const BODY_SPR = ['than-1', 'than-2', 'than-3', 'than-4', 'than-5', 'than-6', 'than-7'];
const BODY_FALLBACK = { 'than-5': 'than-4' };
const BALD_SPR = ['tran-1', 'tran-2', 'tran-3', 'tran-4', 'tran-5', 'tran-6', 'tran-7', 'tran-8'];
const HELM_SPR = ['mu-1', 'mu-2', 'mu-3', 'mu-4', 'mu-5', 'mu-6', 'mu-7', 'mu-8'];
const BOOT_SPR = ['giay-1', 'giay-2', 'giay-3', 'giay-4', 'giay-5', 'giay-6', 'giay-7', 'giay-8'];
const PAUL_SPR = ['vai-1', 'vai-2', 'vai-3', 'vai-4', 'vai-5', 'vai-6', 'vai-7', 'vai-8'];
const tierIdx = (it) => it ? Math.min(it.rar, 7) : -1;
const LOPM = (typeof LOP !== 'undefined') ? LOP : null;
const LOP_IDS = [];
for (const v of ['dau', 'vai', 'giap', 'quan', 'gang', 'giay']) for (let t = 0; t <= 8; t++) LOP_IDS.push(`lop-${v}-${t}`);
for (const v of ['dau', 'vai', 'giap', 'quan', 'gang', 'giay']) for (let t = 1; t <= 8; t++) LOP_IDS.push(`ic-${v}-${t}`);
// cấp lớp: món rar 0..7 -> lớp 1..8, ô trống -> 0; thiếu ảnh cấp cao thì lùi xuống
const lopId = (v, it) => { let t = it ? Math.min(it.rar, 7) + 1 : 0; for (; t >= 0; t--) if (ready(`lop-${v}-${t}`)) return `lop-${v}-${t}`; return null; };
// chọn ảnh theo cấp, thiếu ảnh cấp cao thì lùi dần xuống cấp thấp hơn
const pickTier = (arr, i) => { for (let k = i; k >= 0; k--) if (ready(arr[k])) return arr[k]; return arr[Math.max(0, i)]; };
const HMETA = (typeof HELM_META !== 'undefined') ? HELM_META : {};
// Vũ khí / khiên theo 8 cấp: vk-<loại>-<1..8>, khien-<1..8>
const wpnTierId = (wk, rar) => { const base = WPN_SPR[wk]; if (!base) return null; for (let k = Math.min(rar, 7) + 1; k >= 1; k--) if (ready(`${base}-${k}`)) return `${base}-${k}`; return base; };
// Toạ độ đầu / vai / chân / tay đo tự động trên từng ảnh thân (anchors.js)
const ANCH = (typeof ANCHORS !== 'undefined') ? ANCHORS : {};
const anchorOf = (id) => ANCH[id] || { head: [0.3, 0.05, 0.85, 0.42], sho: [0.62, 0.42], feet: [0.15, 0.86, 0.9, 1.0], hand: [0.84, 0.6], off: [0.2, 0.6] };
// Điểm tay (tỉ lệ theo chiều rộng/cao ảnh thân) — tinh chỉnh theo ảnh thực tế
const HAND = { def: { x: 0.84, y: 0.6 }, shield: { x: 0.36, y: 0.58 } };
const WPN_SPR = { sword: 'vk-kiem', great: 'vk-dai-kiem', axe: 'vk-riu', mace: 'vk-chuy', hammer: 'vk-bua', spear: 'vk-thuong',
  halberd: 'vk-kich', scythe: 'vk-luoi-hai', trident: 'vk-dinh-ba', staff: 'vk-truong', dual: 'vk-song-dao' };
const WPN_LEN = { sword: 0.62, great: 0.95, axe: 0.7, mace: 0.66, hammer: 0.78, spear: 1.05, halberd: 1.05, scythe: 1.0, trident: 1.0, staff: 0.95, dual: 0.5 };
const SHIELD_SPR = ['khien-1', 'khien-2', 'khien-3', 'khien-4', 'khien-5', 'khien-6', 'khien-7', 'khien-8'];
const FX_SPR = { fire: 'fx-lua', ice: 'fx-bang', thunder: 'fx-set', poison: 'fx-doc', whirl: 'fx-gio', heal: 'fx-thanh-quang', leech: 'fx-bong-toi', guard: 'fx-bang', wave: 'fx-nuoc' };
const ready = (id) => SPR[id] && SPR[id].complete && SPR[id].naturalWidth > 0;
// Nạp ảnh + bản bóng trắng (để nháy khi trúng đòn)
const SPR = {}, SPR_WHITE = {};
function loadSprites() {
  const fx = new Set(Object.values(FX_SPR));
  for (const id of [...new Set([...HERO_SPR, ...MONSTERS.map(m => m.id), ...OUTFITS.map(o => o.spr), ...BODY_SPR, ...BALD_SPR, ...HELM_SPR, ...BOOT_SPR, ...PAUL_SPR, ...Object.values(WPN_SPR), ...Object.values(WPN_SPR).flatMap(b => [1, 2, 3, 4, 5, 6, 7, 8].map(k => `${b}-${k}`)), ...SHIELD_SPR, ...LOP_IDS, ...fx])]) {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      SPR_WHITE[id] = c;
    };
    im.onerror = () => { im.bad = true; };
    im.src = `${id}.webp`;
    SPR[id] = im;
  }
}

// ================== TIỆN ÍCH ==================
const $ = (id) => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (n) => Math.round(n).toLocaleString('vi-VN');
function weighted(w) { let s = w.reduce((a, b) => a + b, 0), r = Math.random() * s; for (let i = 0; i < w.length; i++) { if ((r -= w[i]) < 0) return i; } return 0; }
let uidN = Date.now();
const uid = () => (uidN++).toString(36);

// ================== VẬT PHẨM ==================
// Kỹ năng ẩn chỉ có ở đồ từ Sử Thi (tím) trở lên; đồ thấp hơn (kể cả đồ cũ trong túi) không kích hoạt kỹ năng
const PERK_MIN_RAR = 3;
const hasPerk = (it) => !!(it && it.perk && PERKS[it.perk] && it.rar >= PERK_MIN_RAR);
function makeItem(slot, ilvl, rar, setId) {
  const it = { id: uid(), slot, ilvl: Math.max(1, ilvl), rar, up: 0 };
  if (slot === 'weapon') it.wk = pick(WEAPONS.filter(w => !['scythe', 'trident', 'staff'].includes(w.k) || rar >= 4)).k;
  it.perk = rar >= PERK_MIN_RAR ? pick(PERK_BY_SLOT[slot]) : null;
  it.mat = pick(MAT[rar]);
  if (rar >= R_MYTH) {
    const st = setOf(setId) || pick(rar === R_SUPER ? SUPER_SETS : MYTH_SETS); it.set = st.id; it.perk = st.perk; it.mat = st.n;
    if (slot === 'weapon') it.wk = st.wk;
    it.tint = ELEM[st.e].c; return it;
  }
  it.tint = RCOL[rar];
  return it;
}
function itemName(it) {
  const base = it.slot === 'weapon' ? WEAPONS.find(w => w.k === it.wk).n : SLOTS.find(s => s.id === it.slot).n;
  return `${base} ${it.mat}`;
}
// Biểu tượng cắt từ chính lớp ghép khuôn (ic-<vùng>-<cấp>): nhìn giống hệt khi mặc
const WEAR_REGION = { helmet: 'dau', shoulder: 'vai', armor: 'giap', pants: 'quan', gloves: 'gang', boots: 'giay' };
function wearIconId(it) { const v = WEAR_REGION[it.slot]; if (!v) return null; for (let t = Math.min(it.rar, 7) + 1; t >= 1; t--) if (ready(`ic-${v}-${t}`)) return `ic-${v}-${t}`; return null; }
function itemIconHTML(it) {
  const img = (id) => `<img class="ii" src="${id}.webp">`;
  if (it.slot === 'weapon') { const id = wpnTierId(it.wk, it.rar); if (id && ready(id)) return img(id); }
  const id2 = wearIconId(it); if (id2) return img(id2);
  if (it.slot === 'shield') { const id = pickTier(SHIELD_SPR, Math.min(it.rar, 7)); if (ready(id)) return img(id); }
  return itemIcon(it);
}
function itemIcon(it) { return it.slot === 'weapon' ? WEAPONS.find(w => w.k === it.wk).ic : SLOTS.find(s => s.id === it.slot).ic; }
function itemStats(it) {
  const P = 10 * Math.pow(1.09, it.ilvl - 1) * RAR[it.rar].m * (1 + 0.1 * it.up);
  const s = { atk: 0, hp: 0, block: 0, speed: 0 };
  switch (it.slot) {
    case 'weapon': s.atk = P * 0.9; break;
    case 'gloves': s.atk = P * 0.45; break;
    case 'helmet': s.hp = P * 3; break;
    case 'shoulder': s.hp = P * 2; s.atk = P * 0.15; break;
    case 'pants': s.hp = P * 2.5; s.speed = Math.round(1 + it.rar); break;
    case 'armor':  s.hp = P * 5; break;
    case 'boots':  s.hp = P * 2; s.speed = Math.round(3 + it.rar * 1.5); break;
    case 'shield': s.hp = P * 3; s.block = 6 + it.rar * 2; break;
  }
  s.atk = Math.round(s.atk); s.hp = Math.round(s.hp);
  return s;
}
function mainStat(it) { const s = itemStats(it); return s.atk ? { k: 'atk', v: s.atk, ic: '⚔' } : { k: 'hp', v: s.hp, ic: '❤' }; }
const perkChance = (it) => PERK_CHANCE[it.rar] + Math.floor(it.up / 2);
const upCost = (it) => Math.round(40 * Math.pow(it.up + 1, 1.6) * RAR[it.rar].m * (1 + it.ilvl * 0.15));
const sellPrice = (it) => Math.round((15 + it.ilvl * 4) * RAR[it.rar].sell * (1 + it.up * 0.3));
const MAX_UP = [5, 7, 9, 12, 15, 18, 22, 30];

function calcStats(gear) {
  const st = { atk: 6, hp: 80, block: 0, speed: 0, crit: 10 };
  for (const s of SLOTS) { const it = gear[s.id]; if (!it) continue; const x = itemStats(it); st.atk += x.atk; st.hp += x.hp; st.block += x.block; st.speed += x.speed; }
  const sb = setBonus(gear);
  if (sb) { const m = sb.set.super ? (sb.n >= 6 ? 1.7 : 1.4) : (sb.n >= 6 ? 1.45 : 1.25); st.atk = Math.round(st.atk * m); st.hp = Math.round(st.hp * m); st.set = sb.set.id; st.setN = sb.n; }
  return st;
}
// Bộ Thần Thoại đang kích hoạt (>=4 món cùng bộ)
function setBonus(gear) {
  const cnt = {};
  for (const s of SLOTS) { const it = gear[s.id]; if (it && it.set) cnt[it.set] = (cnt[it.set] || 0) + 1; }
  for (const id in cnt) if (cnt[id] >= 4) return { set: setOf(id), n: cnt[id] };
  return null;
}
const powerOf = (st) => Math.round(st.atk * 3 + st.hp * 0.6 + st.block * 4 + st.speed * 4);

// ================== LƯU TRỮ ==================
let S;
function newSave() {
  const gear = {}; for (const s of SLOTS) gear[s.id] = null;
  gear.weapon = makeItem('weapon', 1, 0); gear.weapon.wk = 'sword'; gear.weapon.perk = 'fire';
  gear.armor = makeItem('armor', 1, 0);
  return {
    name: 'Hiệp Sĩ', gold: 200, gems: 60, trophies: 0, bestLeague: 0,
    gear, bag: [], banner: '#36c',
    camp: { ch: 1, st: 1 },
    keys: 3, keyT: Date.now(),
    freeChestT: 0,
    champ: null, wins: 0, losses: 0, tutorial: true,
    outfit: 'auto', mythSeen: {}, ver: 2,
  };
}
function load() {
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { S = Object.assign(newSave(), JSON.parse(raw)); migrate(); return; } } catch (e) { }
  S = newSave();
}
// Bản lưu cũ (4–5 độ hiếm) -> 7 cấp
function migrate() {
  if (S.ver >= 2) return;
  const map = [0, 2, 3, 4, 6];
  const fix = (it) => { if (!it) return; it.rar = map[it.rar] ?? it.rar; if (it.rar >= R_MYTH && !it.set) it.set = pick(MYTH_SETS).id; it.tint = RCOL[it.rar]; };
  Object.values(S.gear).forEach(fix); S.bag.forEach(fix);
  S.outfit = 'auto';
  S.ver = 2;
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }

const myStats = () => (typeof applyBonuses === 'function' ? applyBonuses(calcStats(S.gear)) : calcStats(S.gear)); // + cấp nhân vật, thú linh
const leagueIdx = (t) => { let i = 0; LEAGUES.forEach((l, k) => { if (t >= l.t) i = k; }); return i; };
// Cấp vật phẩm rơi ra phụ thuộc tiến trình
const dropLevel = () => Math.max(1, Math.floor(S.trophies / 45) + 1, (S.camp.ch - 1) * 10 + S.camp.st);
function avgIlvl() { let s = 0, n = 0; for (const k in S.gear) if (S.gear[k]) { s += S.gear[k].ilvl + S.gear[k].up * 0.8; n++; } return n ? s / n : 1; }

// ================== ÂM THANH ==================
let AC = null;
function sfx(type) {
  if (S && S.muted) return; // tắt âm thanh trong Cài đặt
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    o.connect(g); g.connect(AC.destination);
    const P = { hit: [180, 60, 'square', .12], crit: [320, 80, 'sawtooth', .18], block: [900, 600, 'triangle', .1], skill: [500, 1200, 'sawtooth', .25],
      coin: [880, 1320, 'sine', .15], chest: [300, 900, 'triangle', .4], win: [523, 1046, 'triangle', .5], lose: [300, 100, 'sawtooth', .5], tap: [600, 700, 'sine', .05] }[type] || [440, 440, 'sine', .1];
    o.type = P[2]; o.frequency.setValueAtTime(P[0], t); o.frequency.exponentialRampToValueAtTime(P[1], t + P[3]);
    g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + P[3]);
    o.start(t); o.stop(t + P[3]);
  } catch (e) { }
}

// ================== VẼ HIỆP SĨ ==================
function lookFromGear(gear, banner, boss, outfit) {
  const c = (slot, def) => gear[slot] ? gear[slot].tint : def;
  const L0 = {
    helmet: !!gear.helmet, helmetC: c('helmet', '#6b4a2a'), helmetR: gear.helmet ? gear.helmet.rar : 0,
    armorC: c('armor', '#8a6a4a'), armorR: gear.armor ? gear.armor.rar : -1,
    glovesC: c('gloves', '#e0b088'), bootsC: c('boots', '#5a3a22'),
    shield: !!gear.shield, shieldC: c('shield', '#7a5230'), shieldR: gear.shield ? gear.shield.rar : 0,
    weapon: gear.weapon ? gear.weapon.wk : 'fist', weaponC: c('weapon', '#ccc'), weaponR: gear.weapon ? gear.weapon.rar : 0,
    banner: banner || '#36c', boss: !!boss, skin: '#f0c090',
    tier: heroTier(gear), spr: HERO_SPR[heroTier(gear)], glow: TIER_GLOW[heroTier(gear)],
  };
  L0.body = BODY_SPR[gear.armor ? Math.min(gear.armor.rar, 6) : 0];
  L0.wk = gear.weapon ? gear.weapon.wk : null; L0.wR = gear.weapon ? gear.weapon.rar : 0; L0.wFire = !!(gear.weapon && gear.weapon.perk === 'fire');
  L0.wing = (typeof S !== 'undefined' && S && gear === S.gear && typeof curWing === 'function') ? curWing() : null; // cánh sau lưng (chỉ nhân vật của người chơi)
  L0.sh = gear.shield ? pickTier(SHIELD_SPR, Math.min(gear.shield.rar, 7)) : null; L0.sR = gear.shield ? gear.shield.rar : 0;
  L0.layered = true;
  L0.paper = { dau: gear.helmet, vai: gear.shoulder, giap: gear.armor, quan: gear.pants, gang: gear.gloves, giay: gear.boots };
  L0.bald = pickTier(BALD_SPR, Math.max(0, tierIdx(gear.armor)));
  L0.helm = gear.helmet ? pickTier(HELM_SPR, tierIdx(gear.helmet)) : null; L0.hR = tierIdx(gear.helmet);
  L0.boot = gear.boots ? pickTier(BOOT_SPR, tierIdx(gear.boots)) : null; L0.bR = tierIdx(gear.boots);
  L0.paul = gear.shoulder ? pickTier(PAUL_SPR, tierIdx(gear.shoulder)) : null; L0.pR = tierIdx(gear.shoulder);
  const sb = setBonus(gear);
  if (sb) L0.layered = false;
  if (sb) Object.assign(L0, { tier: sb.set.super ? 7 : 6, spr: sb.set.spr, glow: setGlow(sb.set), myth: true, super: !!sb.set.super });
  if (outfit && outfit !== 'auto') { const o = OUTFITS.find(x => x.id === outfit); if (o) Object.assign(L0, { layered: false, spr: o.spr, glow: o.glow || L0.glow, tier: Math.max(L0.tier, o.tier || 0) }); }
  return L0;
}
// Bậc ngoại hình hiệp sĩ = độ hiếm trung bình của 6 ô (ô trống tính 0) -> đổi ảnh khi đồ tốt lên
function heroTier(gear) {
  let s = 0; for (const sl of SLOTS) s += gear[sl.id] ? gear[sl.id].rar + 0.35 : 0;
  return clamp(Math.floor(s / SLOTS.length), 0, 5);
}
function lookFromMonster(m) {
  return { spr: m.id, glow: ELEM[m.e].c, boss: !!m.boss, elem: m.e, monster: true, faceL: !!m.faceL, giant: !!m.giant, rank: m.rank != null ? m.rank : (m.giant ? 3 : m.boss ? 2 : 0) };
}
const lookOf = (f) => f.mon ? lookFromMonster(f.mon) : lookFromGear(f.gear, f.banner, f.boss, f.outfit);
const elemOf = (f) => { if (f.mon) return f.mon.e; const sb = setBonus(f.gear); if (sb) return sb.set.e; return hasPerk(f.gear.weapon) ? PERK_ELEM[f.gear.weapon.perk] : 'vo'; };

/* Vẽ nhân vật bằng ảnh 3D (có hào quang phát sáng). Không có ảnh thì quay về hình vẽ khối.
   pose: {arm (pha vung đòn), dead 0..1, walk, flash 0..1, t (giây)} */
// Vẽ nhân vật ghép theo khuôn: giày -> áo giáp -> găng -> giáp vai -> mũ, rồi khiên + vũ khí ở điểm tay cố định
// ===== Độ nét & chuyển động mềm =====
const DPR = Math.min(window.devicePixelRatio || 1, 2); // ×2 đủ nét, đỡ nặng GPU điện thoại
// Đặt khung vẽ theo mật độ điểm ảnh của máy (vẽ toạ độ logic, hiển thị sắc nét)
function hd(c, w, h) {
  const W = Math.round(w * DPR), H = Math.round(h * DPR);
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const x = c.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  return x;
}
const SCR = {};
function scratch(key, w, h, keep) {
  const W = Math.ceil(w * DPR) + 8, H = Math.ceil(h * DPR) + 8;
  let c = SCR[key]; if (!c) c = SCR[key] = document.createElement('canvas');
  if (c.width < W || c.height < H) { c.width = Math.max(c.width, W); c.height = Math.max(c.height, H); }
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  if (!keep) x.clearRect(0, 0, W, H); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  return [c, x, W, H];
}
// Uốn thân theo dải ngang: đầu-vai đung đưa, chân đứng yên (giống có khớp xương)
function warpInto(x, img, W, H, t, amp, phase) {
  const N = 20, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, w = W - 8, h = H - 8;
  for (let i = 0; i < N; i++) {
    const v = i / N, k = 1 - v, off = Math.sin(t * 1.7 + phase + v * 1.8) * amp * DPR * k * k;
    x.drawImage(img, 0, ih * v, iw, ih / N + 1, 4 + off, 4 + h * v, w, h / N + 1.2);
  }
}
function flashScratch(x, W, H, a) {
  if (a <= 0) return; x.globalCompositeOperation = 'source-atop'; x.globalAlpha = a; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
}
// Ngôi sao 4 cánh lấp lánh
function drawStar4(ctx, x, y, r, col, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#fff'; ctx.shadowColor = col; ctx.shadowBlur = r * 2;
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.22, y - r * 0.22); ctx.lineTo(x + r, y); ctx.lineTo(x + r * 0.22, y + r * 0.22);
  ctx.lineTo(x, y + r); ctx.lineTo(x - r * 0.22, y + r * 0.22); ctx.lineTo(x - r, y); ctx.lineTo(x - r * 0.22, y - r * 0.22); ctx.closePath(); ctx.fill(); ctx.restore();
}
// Vũ khí lung linh theo phẩm chất: phủ năng lượng, vệt sáng chạy dọc lưỡi, sao lấp lánh, hạt năng lượng bay quanh (từ Truyền Thuyết)
// Điểm cầm của vũ khí: đo từ chính ảnh (tâm cán ở độ cao tay cầm), vì cán không luôn nằm giữa ảnh (lưỡi hái, rìu, kích lệch một bên)
const GRIP_Y = { spear: 0.64, halberd: 0.64, scythe: 0.66, trident: 0.64, staff: 0.62 };
function wGrip(wi, wk) {
  const gy = GRIP_Y[wk] || 0.86; wi.__grip = wi.__grip || {}; if (wi.__grip[gy]) return wi.__grip[gy];
  let gx = 0.5;
  try {
    const w = 96, h = Math.round(96 * wi.naturalHeight / wi.naturalWidth), c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(wi, 0, 0, w, h);
    const y0 = Math.floor(h * (gy - 0.03)), y1 = Math.ceil(h * (gy + 0.03)), d = x.getImageData(0, y0, w, y1 - y0).data, xs = [];
    for (let yy = 0; yy < y1 - y0; yy++) for (let xx = 0; xx < w; xx++) if (d[(yy * w + xx) * 4 + 3] > 140) xs.push(xx);
    if (xs.length) { xs.sort((a, b) => a - b); gx = (xs[xs.length >> 1] + 0.5) / w; }
  } catch (e) { }
  return (wi.__grip[gy] = [gx, gy]);
}
// Lửa vẽ tay mềm mại (6 khung hình Gemini: flame-0..5), dùng cho thiêu đốt và kiếm lửa
const FLAMES = [0, 1, 2, 3, 4, 5].map(i => { const im = new Image(); im.src = `flame-${i}.webp`; return im; });
function drawFlame(ctx, x, yb, h, t, seed, alpha) { // yb = chân ngọn lửa
  const im = FLAMES[(Math.floor(t * 11 + seed * 3.7) % 6 + 6) % 6]; if (!im.complete || !im.naturalWidth) return;
  const w = h * im.naturalWidth / im.naturalHeight; ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.drawImage(im, x - w / 2, yb - h, w, h);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.25 + 0.1 * Math.sin(t * 9 + seed); ctx.drawImage(im, x - w / 2, yb - h, w, h); ctx.restore();
}
const BLADE_LEN = { sword: 0.8, great: 0.85, dual: 0.7, axe: 0.36, mace: 0.34, hammer: 0.34, spear: 0.28, halberd: 0.34, scythe: 0.3, trident: 0.3, staff: 0.24 };
function weaponFlames(ctx, wi, ww, wl, t, wk) { // kiếm lửa: lửa bao trùm cả lưỡi, từ gần chuôi lên tới mũi, ngọn lớn dần về phía mũi
  const top = -wl * 0.86, len = wl * (BLADE_LEN[wk] || 0.8), prof = wProfile(wi), cxAt = (yy) => (prof[Math.max(0, Math.min(39, Math.floor((yy - top) / wl * 40)))] - 0.5) * ww;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; // quầng sáng cam mờ dần ra ngoài, không thấy viền
  const cy0 = top + len * 0.4, rg = ctx.createRadialGradient(cxAt(cy0), cy0, 2, cxAt(cy0), cy0, len * 0.7 + ww * 0.3); rg.addColorStop(0, 'rgba(255,150,50,.32)'); rg.addColorStop(1, 'rgba(255,80,10,0)');
  ctx.fillStyle = rg; ctx.fillRect(cxAt(cy0) - len, cy0 - len, len * 2, len * 2); ctx.restore();
  const N = 7;
  for (let i = N - 1; i >= 0; i--) { const k = i / (N - 1), yy = top + len * (0.02 + k * 0.78); // k=0 mũi, k=1 gần chuôi
    const fr = len / wl, h = wl * (0.42 - k * 0.26) * Math.max(0.55, fr / 0.8) * (fr < 0.5 ? 1.25 : 1), sway = Math.sin(t * 5 + i * 1.3) * ww * 0.06;
    drawFlame(ctx, cxAt(yy) + sway, yy + h * 0.55, h, t, i * 1.7, 0.9 - k * 0.25); }
}
function drawWeaponFx(ctx, wi, ww, wl, rar, t, wk, fire) {
  const [gx, gy] = wGrip(wi, wk); ctx.save(); ctx.translate(ww * (0.5 - gx), wl * (0.86 - gy)); drawWeaponFx0(ctx, wi, ww, wl, rar, t); ctx.restore(); // (lửa trên vũ khí đã bỏ theo yêu cầu; weaponFlames giữ lại để dùng sau)
}
// Đường giữa thân vũ khí theo từng hàng (tỉ lệ ngang 0..1) để tia sét và chớp sáng bám đúng vào lưỡi/cán
// Hình bóng vũ khí tô một màu (để làm lớp điện tích bao quanh), lưu đệm theo màu
// Lớp sáng ôm đúng hình vũ khí: hình bóng tô màu, làm mờ ra ngoài, có lề để quầng sáng không bị cắt
function weaponSil(wi, col) {
  wi.__sil = wi.__sil || {}; if (wi.__sil[col]) return wi.__sil[col];
  const W = wi.naturalWidth, H = wi.naturalHeight, P = Math.round(H * 0.06), c = document.createElement('canvas'); c.width = W + P * 2; c.height = H + P * 2; const x = c.getContext('2d');
  x.filter = `blur(${Math.round(P * 0.45)}px)`; x.drawImage(wi, P, P); x.drawImage(wi, P, P); x.filter = 'none';
  x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  return (wi.__sil[col] = { c, p: P / H });
}
function wEdges(wi) {
  if (wi.__edges) return wi.__edges; const N = 60, out = new Array(N).fill(null);
  try { const w = 64, c = document.createElement('canvas'); c.width = w; c.height = N; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(wi, 0, 0, w, N);
    const d = x.getImageData(0, 0, w, N).data; for (let y = 0; y < N; y++) { let a = -1, b = -1; for (let xx = 0; xx < w; xx++) if (d[(y * w + xx) * 4 + 3] > 120) { if (a < 0) a = xx; b = xx; } if (a >= 0) out[y] = [a / w, (b + 1) / w]; } } catch (e) { }
  return (wi.__edges = out);
}
function wProfile(wi) {
  if (wi.__prof) return wi.__prof; const N = 40, out = new Array(N).fill(0.5);
  try { const w = 64, h = N, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(wi, 0, 0, w, h);
    const d = x.getImageData(0, 0, w, h).data; for (let y = 0; y < h; y++) { let s = 0, n = 0; for (let xx = 0; xx < w; xx++) if (d[(y * w + xx) * 4 + 3] > 120) { s += xx; n++; } out[y] = n ? (s / n + 0.5) / w : (y ? out[y - 1] : 0.5); } } catch (e) { }
  return (wi.__prof = out);
}
function drawWeaponFx0(ctx, wi, ww, wl, rar, t) {
  if (rar >= 3) { // quầng sáng phía sau, đúng hình và đúng chỗ vũ khí, sáng dần theo độ hiếm
    const S2 = weaponSil(wi, RCOL[rar]), pw = S2.p * wl;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (0.45 + (rar - 3) * 0.13) * (0.8 + 0.2 * Math.sin(t * 3.2));
    ctx.drawImage(S2.c, -ww / 2 - pw, -wl * 0.86 - pw, ww + pw * 2, wl + pw * 2); ctx.restore();
  }
  ctx.drawImage(wi, -ww / 2, -wl * 0.86, ww, wl);
  if (rar < 3 || (S && S.noFx)) return; // dưới Sử Thi (tím) hoặc đã tắt hiệu ứng động: không chớp/sét
  const col = RCOL[rar], top = -wl * 0.86, len = wl * 0.8, prof = wProfile(wi), cxAt = (y) => (prof[Math.max(0, Math.min(39, Math.floor((y - top) / wl * 40)))] - 0.5) * ww;
  ctx.save(); ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter';
  // phủ năng lượng nhấp nháy nhẹ lên thân vũ khí
  ctx.globalAlpha = 0.08 + 0.07 * Math.sin(t * 5) + rar * 0.025; ctx.drawImage(wi, -ww / 2, top, ww, wl);
  // LÓE SÁNG: chớp sao nhỏ sắc nét ở một điểm trên lưỡi, chu kỳ ngắn dần theo độ hiếm
  const per = 2.4 - rar * 0.2, ph = t % per, cyc = Math.floor(t / per);
  if (ph < 0.26) {
    const R = zrand(cyc * 131 + rar), k = ph / 0.26, a = Math.sin(k * Math.PI), py = top + len * (0.04 + R() * 0.4), px = cxAt(py), sz = (4 + rar * 1.1) * (0.5 + a);
    ctx.globalAlpha = a * 0.9; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px - sz * 1.8, py); ctx.lineTo(px + sz * 1.8, py); ctx.moveTo(px, py - sz * 1.8); ctx.lineTo(px, py + sz * 1.8); ctx.stroke();
    drawStar4(ctx, px, py, sz, col, a);
  }
  // TIA SÉT NHỎ (từ Huyền Thoại): các tia mảnh bò dọc theo hai mép thân vũ khí, từ chuôi lên mũi, rung nháy liên tục
  if (rar >= 4) {
    const E = wEdges(wi), N = E.length, fr = Math.floor(t * 24), nb = rar - 2, segL = 0.16 + rar * 0.01;
    const edgeX = (y, side) => { const r = Math.max(0, Math.min(N - 1, Math.floor((y - top) / wl * N))), e = E[r]; return e ? (side < 0 ? e[0] : e[1]) * ww - ww / 2 : null; };
    for (let b = 0; b < nb; b++) {
      const side = b % 2 ? -1 : 1, head = 1 - ((t * (0.55 + b * 0.07) + b / nb) % 1); // vị trí đầu tia (0 = mũi, 1 = chuôi), chạy dần lên mũi
      const yA = top + len * Math.max(0, head - segL), yB = top + len * Math.min(1, head), R = zrand(fr * 31 + b * 7 + rar), pts = [];
      for (let k = 0; k <= 7; k++) { const y = yA + (yB - yA) * k / 7, ex = edgeX(y, side); if (ex == null) continue; pts.push([ex + side * (0.8 + R() * 1.6) + (R() - 0.5) * 2.4, y + (R() - 0.5) * 2]); }
      if (pts.length < 3) continue;
      const path = () => { ctx.beginPath(); pts.forEach(([x, y], q) => q ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
      ctx.lineJoin = 'miter'; ctx.shadowColor = col; ctx.shadowBlur = 6;
      ctx.globalAlpha = 0.55; ctx.strokeStyle = col; ctx.lineWidth = 2.2; path(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 0.95; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8; path(); ctx.stroke();
      if (R() < 0.35) { const [hx, hy] = pts[0]; drawStar4(ctx, hx, hy, 2.5 + rar * 0.4, col, 0.9); } // tia đi qua lóe nhẹ
    }
  }
  // vài hạt sao nhỏ lấp lánh dọc lưỡi
  const n = rar - 1; ctx.globalAlpha = 1;
  for (let i = 0; i < n; i++) { const kk = (t * 0.4 + i / n) % 1, py = top + len * kk * 0.8, px = cxAt(py) + Math.sin(t * 3 + i * 1.9) * ww * 0.12, tw = Math.max(0, Math.sin(t * 7 + i * 2.3)); if (tw > 0.3) drawStar4(ctx, px, py, 1.8 + rar * 0.4, col, tw); }
  ctx.restore();
}
function drawPaper(ctx, x, y, sc, L, facing, pose) {
  pose = pose || {};
  const t = pose.t != null ? pose.t : performance.now() / 1000, dead = pose.dead || 0;
  const base = SPR['lop-giap-0'], Hc = 150 * sc / (LOPM.feet - LOPM.figTop), Wc = Hc * LOPM.aspect;
  const H = 150 * sc, W = Wc;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(0, 0, H * 0.3, 9 * sc, 0, 0, Math.PI * 2); ctx.fill();
  const glow = L.glow;
  if (glow && dead < 1) {
    const pulse = 0.65 + Math.sin(t * 3) * 0.2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = pulse * (1 - dead);
    let g = ctx.createRadialGradient(0, 0, 4, 0, 0, H * 0.4); g.addColorStop(0, glow); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, H * 0.4, 16 * sc, 0, 0, Math.PI * 2); ctx.fill();
    const n = L.tier >= 6 ? 14 : L.tier >= 4 ? 9 : L.tier >= 2 ? 6 : 3;
    for (let i = 0; i < n; i++) { const k = (t * 0.35 + i / n) % 1; ctx.globalAlpha = (1 - k) * 0.9 * (1 - dead); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(Math.sin(i * 12.9 + t * 0.8) * H * 0.28, -k * H * 1.05, (1.6 + (i % 3)) * sc, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  const arm = pose.arm != null ? pose.arm : 0.6;
  const lean = arm < 0.6 ? (arm - 0.6) / 2.7 * 0.05 : (arm - 0.6) / 0.7 * 0.06; // nghiêng rất nhẹ, không đổ người về trước
  const breathe = 1 + Math.sin(t * 2.4 + x) * 0.018, hop = pose.walk ? Math.abs(Math.sin(pose.walk)) * 6 * sc : 0;
  ctx.scale(facing, 1); ctx.translate(0, -hop); ctx.rotate(lean - dead * 1.35); ctx.translate(-dead * 18, 0);
  ctx.scale(1 + (breathe - 1) * -0.5, breathe); ctx.globalAlpha = 1 - dead * 0.35;
  if (!pose.still) ctx.transform(1, 0, Math.sin(t * 1.6 + x * 0.03) * 0.022, 1, 0, 0); // đung đưa cả khối, chân đứng yên, giữ nét
  const ox = -Wc * (LOPM.cx || 0.5), oy = -Hc * LOPM.feet; // khung ảnh: tâm thân và chân trùng gốc toạ độ
  const P = L.paper;
  const [pc, px, PW, PH] = scratch('paper' + (pose.key || ''), Wc, Hc, true);
  // chỉ ghép lại 6 lớp giáp khi bộ đồ / cỡ / chớp trúng đòn thay đổi (đỡ nặng máy mỗi khung hình)
  const ids = ['giay', 'quan', 'giap', 'gang', 'vai', 'dau'].map(v => lopId(v, P[v])), fl = (pose.flash || 0) * 0.7;
  const sig = ids.join('|') + '@' + PW + 'x' + PH + ':' + ids.map(id => id && SPR[id] && SPR[id].complete ? 1 : 0).join('');
  if (pc.__sig !== sig || fl > 0 || pc.__fl > 0) {
    px.clearRect(0, 0, pc.width, pc.height);
    for (const id of ids) if (id) px.drawImage(SPR[id], 4, 4, PW - 8, PH - 8);
    flashScratch(px, PW, PH, fl); pc.__sig = sig; pc.__fl = fl;
  }
  if (L.wing && typeof drawWings === 'function' && dead < 1) drawWings(ctx, L.wing, ox + Wc * (LOPM.cx || 0.5), oy + Hc * (LOPM.figTop + 0.42 * (LOPM.feet - LOPM.figTop)), Hc, t, true); // cánh vẽ sau lưng, tâm cánh = giữa lưng
  if (glow && !B) { ctx.shadowColor = glow; ctx.shadowBlur = Math.min(10, 4 + (L.tier || 0) * 1.2); } // trong trận bỏ đổ bóng mờ cả thân (nặng GPU) cho mượt
  ctx.drawImage(pc, 0, 0, PW, PH, ox - 4 / DPR, oy - 4 / DPR, PW / DPR, PH / DPR); ctx.shadowBlur = 0;
  { // ánh hào quang phủ lên giáp khi mặc đồ từ Sử Thi (tím) trở lên; đồ thấp hơn không phát sáng
    let top = -1; for (const v in P) if (P[v] && P[v].rar > top) top = P[v].rar;
    if (top >= 3 && dead < 1) {
      const c2 = RCOL[top]; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (0.12 + 0.08 * Math.sin(t * 3.2)) * (top >= 6 ? 1.5 : 1); ctx.shadowColor = c2; ctx.shadowBlur = 12;
      ctx.drawImage(pc, 0, 0, PW, PH, ox - 4 / DPR, oy - 4 / DPR, PW / DPR, PH / DPR); ctx.shadowBlur = 0;
      // dải sáng chạy dọc người
      const k = (t * 0.45) % 1, sy = oy + Hc * (LOPM.figTop + (1 - k) * (LOPM.feet - LOPM.figTop));
      const g = ctx.createLinearGradient(0, sy - 18, 0, sy + 18); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, c2); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.35; ctx.globalCompositeOperation = 'source-atop'; ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.18 + 0.1 * Math.sin(t * 6); ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(ox + Wc * (LOPM.cx || 0.5), sy, Wc * 0.28, 16, 0, 0, Math.PI * 2); ctx.fill();
      // tia lấp lánh quanh người
      for (let i = 0; i < 3 + top; i++) { const a = t * 0.9 + i * 2.39, rx = Wc * 0.3, px2 = ox + Wc * (LOPM.cx || 0.5) + Math.cos(a) * rx, py2 = oy + Hc * (0.3 + ((i * 0.37 + t * 0.15) % 0.6)); const tw = Math.max(0, Math.sin(t * 5 + i * 1.7)); if (tw > 0.05) drawStar4(ctx, px2, py2, 3 + top * 0.6, c2, tw); }
      ctx.restore();
    }
  }
  const hx = ox + Wc * LOPM.hand[0], hy = oy + Hc * LOPM.hand[1], sx = ox + Wc * LOPM.off[0], sy = oy + Hc * LOPM.off[1];
  if (L.sh && ready(L.sh)) { const si = SPR[L.sh], shh = H * 0.44, sw = shh * si.naturalWidth / si.naturalHeight;
    if (L.sR >= 3) { ctx.shadowColor = RCOL[L.sR]; ctx.shadowBlur = 8 + L.sR * 2; }
    ctx.drawImage(si, sx - sw / 2 + H * 0.05, sy - shh * 0.48, sw, shh); ctx.shadowBlur = 0; }
  const wid2 = L.wk && wpnTierId(L.wk, L.wR);
  if (wid2 && ready(wid2)) { const wi = SPR[wid2], wl = H * (WPN_LEN[L.wk] || 0.7), ww = wl * wi.naturalWidth / wi.naturalHeight;
    const ang = arm < 0.6 ? 0.25 + (arm - 0.6) / 2.7 * 2.3 : 0.25 + (arm - 0.6) / 0.7 * 1.45;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang);
    ctx.shadowBlur = 0; // quầng sáng vũ khí vẽ trong drawWeaponFx (ôm đúng hình)
    drawWeaponFx(ctx, wi, ww, wl, L.wR, t, L.wk, L.wFire); ctx.restore(); }
  ctx.restore();
}
// ===== Hiệu ứng quái theo HẠNG (thường / tinh anh / trùm / trùm thế giới) và HỆ =====
// Thường: không hiệu ứng. Tinh anh: viền tím + ít hạt hệ. Trùm: viền cam đỏ + vòng chân. Trùm thế giới: vàng, mạnh nhất.
const RANK_COL = [null, '#b45cff', '#ff5a2a', '#ffd700'];
const MON_SZ = [1, 1.1, 1.22, 1.38]; // thường / tinh anh / trùm / trùm thế giới (siêu cấp)
// độ mạnh phát sáng: theo hạng + cấp quái (cấp trang bị trung bình của quái), 0 → ~2
function monPw(L, f) { if (!L.monster) return L; let s = 0, n = 0; for (const k in (f.gear || {})) if (f.gear[k]) { s += f.gear[k].ilvl; n++; } L.lv = n ? s / n : 1; L.pw = (L.rank || 0) * 0.4 + Math.max(0, Math.min(1, (L.lv - 8) / 50)) * 0.8; return L; }
function imgSil(im, col) { // hình bóng tô màu có lề + làm mờ (dùng chung cho quái)
  im.__msil = im.__msil || {}; if (im.__msil[col]) return im.__msil[col];
  const W = im.naturalWidth, H = im.naturalHeight, P = Math.round(H * 0.05), c = document.createElement('canvas'); c.width = W + P * 2; c.height = H + P * 2; const x = c.getContext('2d');
  x.filter = `blur(${Math.round(P * 0.4)}px)`; x.drawImage(im, P, P); x.drawImage(im, P, P); x.filter = 'none'; x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  return (im.__msil[col] = { c, p: P / H });
}
function monsterSilGlow(ctx, im, L, W, H, t) {
  const rk = L.rank, ec = ELEM[L.elem] ? ELEM[L.elem].c : '#fff', S2 = imgSil(im, rk >= 2 ? RANK_COL[rk] : ec), pw = S2.p * H;
  const pwr = L.pw != null ? L.pw : rk * 0.4; ctx.save(); ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(0.95, 0.2 + pwr * 0.48) * (0.75 + 0.25 * Math.sin(t * 3)); // càng mạnh càng sáng
  ctx.drawImage(S2.c, -W / 2 - pw, -H - pw, W + pw * 2, H + pw * 2);
  if (rk >= 2 || pwr >= 1) { const S3 = imgSil(im, ec); ctx.globalAlpha = 0.3 + 0.15 * Math.sin(t * 2.2 + 1); ctx.drawImage(S3.c, -W / 2 - pw * 0.6, -H - pw * 0.6, W + pw * 1.2, H + pw * 1.2); }
  ctx.restore();
}
function monsterFxBack(ctx, L, W, H, sc, t) {
  const rk = L.rank, pw = L.pw != null ? L.pw : rk * 0.4; if (!rk && pw < 0.35) return; const col = RANK_COL[rk] || (ELEM[L.elem] ? ELEM[L.elem].c : '#fff'), ec = ELEM[L.elem] ? ELEM[L.elem].c : '#fff';
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, W * 0.6); g.addColorStop(0, ec); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = Math.min(0.75, 0.1 + pw * 0.3) + Math.sin(t * 3) * 0.08; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, W * 0.6, 15 * sc, 0, 0, Math.PI * 2); ctx.fill();
  if (rk >= 2) { // vòng chân nhấp nháy theo màu hạng; trùm thế giới thêm vòng thứ hai xoay
    ctx.globalAlpha = 0.45 + Math.sin(t * 5) * 0.2; ctx.strokeStyle = col; ctx.lineWidth = 2.5 * sc; ctx.shadowColor = col; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.ellipse(0, 0, W * 0.5, 12 * sc, 0, 0, Math.PI * 2); ctx.stroke();
    if (rk >= 3) { ctx.setLineDash([10 * sc, 8 * sc]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = ec; ctx.beginPath(); ctx.ellipse(0, 0, W * 0.62, 16 * sc, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
  }
  ctx.restore();
}
// Hạt theo hệ, bay quanh thân quái
function monsterFxFront(ctx, L, W, H, sc, t) {
  const rk = L.rank, e = L.elem, ec = ELEM[e] ? ELEM[e].c : '#fff', n = Math.round([0, 7, 13, 20][rk] + (L.pw || 0) * 5);
  ctx.save(); ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const seed = i * 12.9898, k = (t * (0.25 + (i % 5) * 0.04) + i / n) % 1, sx = Math.sin(seed) * W * 0.45 + Math.sin(t * 1.3 + i) * 6 * sc;
    let px = sx, py = -H * (0.05 + k * 1.0), a = Math.sin(k * Math.PI), r = (1.5 + (i % 3)) * sc;
    ctx.globalAlpha = a * 0.85;
    switch (e) {
      case 'hoa': ctx.fillStyle = i % 3 ? '#ff8a20' : '#ffe060'; ctx.beginPath(); ctx.ellipse(px, py, r * 0.8, r * 1.6, 0, 0, Math.PI * 2); ctx.fill(); break; // tàn lửa bốc lên
      case 'bang': py = -H * (1 - k); ctx.strokeStyle = '#dff8ff'; ctx.lineWidth = 1; for (let q = 0; q < 3; q++) { const an = q * Math.PI / 3 + t; ctx.beginPath(); ctx.moveTo(px - Math.cos(an) * r * 1.6, py - Math.sin(an) * r * 1.6); ctx.lineTo(px + Math.cos(an) * r * 1.6, py + Math.sin(an) * r * 1.6); ctx.stroke(); } break; // bông tuyết rơi
      case 'loi': if (Math.sin(t * 9 + i * 3) > 0.4) { ctx.strokeStyle = i % 2 ? '#fff' : ec; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 4 * sc, py + 4 * sc); ctx.lineTo(px, py + 7 * sc); ctx.lineTo(px + 5 * sc, py + 12 * sc); ctx.stroke(); } break; // tia điện nhỏ
      case 'doc': case 'thuy': ctx.strokeStyle = e === 'doc' ? '#a8ff4a' : '#8fd8ff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(px, py, r * 1.3, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.globalAlpha *= 0.6; ctx.beginPath(); ctx.arc(px - r * 0.4, py - r * 0.4, r * 0.35, 0, Math.PI * 2); ctx.fill(); break; // bong bóng
      case 'tho': ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = i % 2 ? '#b08850' : '#7a5a36'; ctx.fillRect(px, py, r * 1.4, r * 1.2); ctx.globalCompositeOperation = 'lighter'; break; // đá vụn bay
      case 'phong': ctx.strokeStyle = '#c8fff0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(px, py, 8 * sc, t * 3 + i, t * 3 + i + 1.6); ctx.stroke(); break; // vệt gió xoáy
      case 'moc': ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = i % 2 ? '#5ad25a' : '#9ae86a'; ctx.save(); ctx.translate(px, -H * (1 - k)); ctx.rotate(t * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, r * 1.6, r * 0.7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); ctx.globalCompositeOperation = 'lighter'; break; // lá rơi
      case 'quang': drawStar4(ctx, px, py, r * 1.8, ec, a); break; // sao sáng
      case 'am': { const gg = ctx.createRadialGradient(px, py, 0, px, py, r * 3); gg.addColorStop(0, '#d090ff'); gg.addColorStop(1, 'rgba(60,0,90,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(px, py, r * 3, 0, Math.PI * 2); ctx.fill(); break; } // khói ma
      default: ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}
// ===== Hiệu ứng trạng thái trên người: thiêu đốt (lửa cháy), nhiễm độc (khói xanh), choáng (sao xoay) =====
function drawStatusFx(ctx, f, x, ground, fsc, t) {
  const H = 150 * fsc, w = H * 0.32;
  if (f.burn > 0) { // một đốm lửa nhỏ (lửa vẽ tay mềm mại) cháy ở chân
    const fx0 = x + w * 0.15, fb = ground + 2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(fx0, fb - 10, 1, fx0, fb - 10, 34 * fsc); gl.addColorStop(0, 'rgba(255,140,40,.35)'); gl.addColorStop(1, 'rgba(255,80,0,0)'); ctx.fillStyle = gl; ctx.fillRect(fx0 - 26 * fsc, fb - 34 * fsc, 52 * fsc, 38 * fsc); ctx.restore();
    drawFlame(ctx, fx0, fb, 42 * fsc, t, 0, 1); drawFlame(ctx, fx0 - 12 * fsc, fb, 26 * fsc, t, 2.3, 0.9); drawFlame(ctx, fx0 + 11 * fsc, fb, 22 * fsc, t, 4.1, 0.85);
  }
  if (f.poison > 0) { // khói độc xanh cuộn bốc lên từ người + bong bóng độc
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const k = (t * 0.45 + i / 14) % 1, px = x + Math.sin(i * 4.1 + t * 0.8) * w * 1.0 + Math.sin(k * 6 + i) * 6, py = ground - H * (0.15 + k * 1.0), r = (10 + k * 26) * fsc * 0.7;
      const g = ctx.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(170,255,70,${0.75 * (1 - k)})`); g.addColorStop(0.6, `rgba(80,200,30,${0.5 * (1 - k)})`); g.addColorStop(1, 'rgba(40,90,10,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const k = (t * 0.7 + i / 5) % 1; ctx.globalAlpha = Math.sin(k * Math.PI); ctx.strokeStyle = '#b8ff5a'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(x + Math.sin(i * 9.7) * w, ground - H * (0.4 + k * 0.6), (2 + (i % 3)) * fsc, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  if (f.stun || (f.stunFx && f.stunFx > performance.now())) { // choáng: vòng sao vàng xoay quanh đầu (sao phía sau mờ và nhỏ hơn -> có chiều sâu)
    ctx.save(); const hy = ground - H * 1.12, rx = w * 0.95, ry = 7 * fsc;
    ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffe98a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x, hy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    for (let i = 0; i < 5; i++) { const a = t * 4.5 + i * Math.PI * 2 / 5, z = Math.sin(a), sx = x + Math.cos(a) * rx, sy = hy + z * ry; drawStar4(ctx, sx, sy, (5 + (z + 1) * 2.2) * fsc, '#ffd23a', 0.55 + (z + 1) * 0.22); }
    ctx.restore();
  }
}
// Tia sét giáng xuống từ trời: nhánh chính gấp khúc (chia đôi đoạn ngẫu nhiên), nhánh phụ, lõi trắng, chớp 2 lần, vòng va chạm dưới chân
function drawLightning(ctx, p, ground) {
  const life = p.life / (p.max || 420), age = 1 - life, flick = age < 0.12 || (age > 0.22 && age < 0.38) || age > 0.5 ? 1 : 0.35;
  const R = zrand(Math.floor(p.seed) + (age > 0.22 ? 77 : 0)), top = -260, bot = ground - 18;
  let pts = [[p.x + (R() - 0.5) * 60, top], [p.x, bot]];
  for (let it = 0; it < 6; it++) { const np = [pts[0]]; for (let q = 1; q < pts.length; q++) { const [ax, ay] = pts[q - 1], [bx, by] = pts[q], l = Math.hypot(bx - ax, by - ay); np.push([(ax + bx) / 2 + (R() - 0.5) * l * 0.28, (ay + by) / 2], pts[q]); } pts = np; }
  const branches = []; for (let b = 0; b < 4; b++) { const i0 = Math.floor(pts.length * (0.25 + R() * 0.5)), [sx, sy] = pts[i0], dir = R() < 0.5 ? -1 : 1, br = [[sx, sy]]; let x = sx, y = sy; for (let k = 0; k < 6; k++) { x += dir * (6 + R() * 12); y += 10 + R() * 14; br.push([x, y]); } branches.push(br); }
  const stroke = (arr, lw, c, a, blur) => { ctx.globalAlpha = a * flick * Math.min(1, life * 2.2); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.shadowColor = '#ffe14a'; ctx.shadowBlur = blur; ctx.beginPath(); arr.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
  stroke(pts, 9, 'rgba(255,220,80,.35)', 1, 16); for (const br of branches) stroke(br, 4, '#ffd84a', 0.7, 10);
  stroke(pts, 5, '#fff1a0', 1, 14); for (const br of branches) stroke(br, 1.2, '#ffffff', 0.9, 0); stroke(pts, 2, '#ffffff', 1, 0);
  // vòng va chạm + tia bắn dưới chân
  const k = Math.min(1, age * 2.5); ctx.shadowBlur = 0; ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = '#fff3a0'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(p.x, bot, 14 + k * 46, 5 + k * 11, 0, 0, Math.PI * 2); ctx.stroke();
  const g = ctx.createRadialGradient(p.x, bot, 0, p.x, bot, 46); g.addColorStop(0, 'rgba(255,250,200,.9)'); g.addColorStop(1, 'rgba(255,200,60,0)'); ctx.globalAlpha = (1 - k) * flick; ctx.fillStyle = g; ctx.fillRect(p.x - 46, bot - 46, 92, 92);
  ctx.restore();
}
function drawFighter(ctx, x, y, sc, L, facing, pose) {
  const paper = L.layered && LOPM && ready('lop-giap-0'); // ghép theo khuôn
  const fine = false; // ghép mảnh rời đã tắt vì không khít
  const bodyId = fine ? L.bald : L.body && (ready(L.body) ? L.body : BODY_FALLBACK[L.body]);
  const useLayer = L.layered && bodyId && ready(bodyId);
  if (paper) return drawPaper(ctx, x, y, sc, L, facing, pose);
  const im = useLayer ? SPR[bodyId] : SPR[L.spr];
  if (!im || !im.complete || !im.naturalWidth) return drawKnight(ctx, x, y, sc, L, facing, pose);
  pose = pose || {};
  const t = pose.t != null ? pose.t : performance.now() / 1000;
  let H = L.monster ? 150 * sc * 1.05 * MON_SZ[L.rank || 0] * (L.super ? 1.12 : 1) // quái cùng hạng cao bằng nhau; tinh anh/trùm/siêu cấp to hơn
    : 150 * sc * (L.boss ? 1.2 : 1) * (L.super ? 1.12 : 1) * (L.giant ? 1.25 : 1), W = H * im.naturalWidth / im.naturalHeight;
  const mwCap = L.monster ? Math.max(pose.maxW || 0, H * 1.3) : pose.maxW * (L.giant ? 1.45 : 1);
  if (pose.maxW && W > mwCap) { H *= mwCap / W; W = mwCap; } // chỉ con quá bè (rộng > 1,3× cao) mới thu lại
  if (pose.fitW > 0 && W > pose.fitW) { H *= pose.fitW / W; W = pose.fitW; } // không tràn mép màn hình
  if (pose.fitH > 0 && H > pose.fitH) { W *= pose.fitH / H; H = pose.fitH; } // không chạm thanh máu phía trên
  const dead = pose.dead || 0;
  ctx.save();
  ctx.translate(x, y);
  // bóng đổ
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(0, 0, W * 0.38, 9 * sc, 0, 0, Math.PI * 2); ctx.fill();
  // hào quang dưới chân + quầng sáng sau lưng
  const glow = L.monster ? null : L.glow;
  if (L.monster && dead < 1) monsterFxBack(ctx, L, W, H, sc, t, dead);
  if (glow && dead < 1) {
    const pulse = 0.65 + Math.sin(t * 3) * 0.2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = pulse * (1 - dead);
    let g = ctx.createRadialGradient(0, 0, 4, 0, 0, W * 0.6);
    g.addColorStop(0, glow); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, W * 0.6, 16 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = pulse * 0.35 * (1 - dead);
    g = ctx.createRadialGradient(0, -H * 0.5, 10, 0, -H * 0.5, H * 0.62);
    g.addColorStop(0, glow); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(-H * 0.7, -H * 1.15, H * 1.4, H * 1.2);
    // hạt sáng bay lên
    const n = L.super ? 18 : L.boss ? 10 : (L.tier >= 6 ? 14 : L.tier >= 4 ? 9 : L.tier >= 2 ? 6 : 3);
    for (let i = 0; i < n; i++) {
      const k = (t * 0.35 + i / n) % 1, px = Math.sin(i * 12.9 + t * 0.8) * W * 0.42, py = -k * H * 1.05;
      ctx.globalAlpha = (1 - k) * 0.9 * (1 - dead); ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(px, py, (1.6 + (i % 3)) * sc, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  if (L.boss && !L.monster && dead < 1) { // trùm: vòng lửa đỏ sẫm dưới chân
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 + Math.sin(t * 5) * 0.15;
    ctx.strokeStyle = '#ff2a2a'; ctx.lineWidth = 3 * sc; ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.ellipse(0, 0, W * 0.5, 12 * sc, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  // tư thế: nghiêng theo pha vung đòn, thở, ngã khi thua
  const arm = pose.arm != null ? pose.arm : 0.6;
  const lean = arm < 0.6 ? (arm - 0.6) / 2.7 * 0.05 : (arm - 0.6) / 0.7 * 0.06; // nghiêng rất nhẹ, không đổ người về trước
  const breathe = 1 + Math.sin(t * 2.4 + x) * 0.018;
  const hop = pose.walk ? Math.abs(Math.sin(pose.walk)) * 6 * sc : 0;
  ctx.scale(L.faceL ? -facing : facing, 1); // ảnh vẽ sẵn quay trái thì lật ngược để luôn nhìn về đối thủ
  ctx.translate(0, -hop);
  ctx.rotate(lean - dead * 1.35);
  ctx.translate(-dead * 18, 0);
  ctx.scale(1 + (breathe - 1) * -0.5, breathe);
  ctx.globalAlpha = 1 - dead * 0.35;
  if (!pose.still) ctx.transform(1, 0, Math.sin(t * 1.6 + x * 0.03) * (L.boss ? 0.026 : 0.02), 1, 0, 0); // đung đưa cả khối, chân đứng yên
  if (glow && !B) { ctx.shadowColor = glow; ctx.shadowBlur = L.boss ? 12 : Math.min(10, 4 + (L.tier || 2) * 1.5); }
  const wid = useLayer ? bodyId : L.spr;
  if (L.monster && (L.rank >= 1 || (L.pw || 0) >= 0.15) && dead < 1) monsterSilGlow(ctx, im, L, W, H, t);
  ctx.drawImage(im, -W / 2, -H, W, H);
  if (L.monster && (L.rank >= 1 || (L.pw || 0) >= 0.3) && dead < 1 && !(S && S.noFx)) monsterFxFront(ctx, L, W, H, sc, t);
  ctx.shadowBlur = 0;
  if (pose.flash > 0 && SPR_WHITE[wid]) { ctx.globalAlpha = pose.flash * 0.75; ctx.drawImage(SPR_WHITE[wid], -W / 2, -H, W, H); ctx.globalAlpha = 1 - dead * 0.35; }
  const A = anchorOf(bodyId);
  const ov = (id, R2, cx, cy, w, alignBottom) => {
    if (!id || !ready(id)) return; const oi = SPR[id], h2 = w * oi.naturalHeight / oi.naturalWidth;
    if (R2 >= 3) { ctx.shadowColor = RCOL[R2]; ctx.shadowBlur = 6 + R2 * 2; }
    ctx.drawImage(oi, cx - w / 2, alignBottom ? cy - h2 : cy - h2 / 2, w, h2); ctx.shadowBlur = 0;
  };
  const PX = (fx) => -W / 2 + W * fx, PY = (fy) => -H + H * fy;
  if (useLayer && fine) {
    const [fx0, fy0, fx1, fy1] = A.feet; ov(L.boot, L.bR, PX((fx0 + fx1) / 2) - H * 0.005, PY(fy1) + H * 0.005, H * 0.27, true);
    if (L.helm && ready(L.helm) && HMETA[L.helm] && A.neck) {
      const m = HMETA[L.helm], hi = SPR[L.helm], w2 = m.w * H, h2 = m.h * H;
      if (L.hR >= 3) { ctx.shadowColor = RCOL[L.hR]; ctx.shadowBlur = 5 + L.hR * 2; }
      ctx.drawImage(hi, PX(A.neck[0]) - m.nx * w2, PY(A.neck[1]) - m.ny * h2, w2, h2); ctx.shadowBlur = 0;
    }
    ov(L.paul, L.pR, PX(A.sho[0]) + H * 0.02, PY(A.sho[1]) + H * 0.01, H * 0.17, false);
  }
  if (useLayer) {
    // khiên (tay trước)
    if (L.sh && ready(L.sh)) {
      const si = SPR[L.sh], sh = H * (fine ? 0.4 : 0.46), sw = sh * si.naturalWidth / si.naturalHeight;
      const hx = -W / 2 + W * (ANCH[bodyId] ? A.off[0] + 0.06 : HAND.shield.x), hy = -H + H * (ANCH[bodyId] ? A.off[1] : HAND.shield.y);
      if (L.sR >= 3) { ctx.shadowColor = RCOL[L.sR]; ctx.shadowBlur = 8 + L.sR * 2; }
      ctx.drawImage(si, hx - sw / 2, hy - sh / 2, sw, sh); ctx.shadowBlur = 0;
    }
    // vũ khí xoay quanh tay theo pha đòn
    const wid2 = L.wk && wpnTierId(L.wk, L.wR);
    if (wid2 && ready(wid2)) {
      const wi = SPR[wid2], wl = H * (WPN_LEN[L.wk] || 0.7), ww = wl * wi.naturalWidth / wi.naturalHeight;
      const hx = -W / 2 + W * (ANCH[bodyId] ? A.hand[0] - 0.04 : HAND.def.x), hy = -H + H * (ANCH[bodyId] ? A.hand[1] : HAND.def.y);
      const ang = arm < 0.6 ? 0.25 + (arm - 0.6) / 2.7 * 2.3 : 0.25 + (arm - 0.6) / 0.7 * 1.45;
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang);
      ctx.shadowBlur = 0; // quầng sáng vũ khí vẽ trong drawWeaponFx (ôm đúng hình)
      drawWeaponFx(ctx, wi, ww, wl, L.wR, t, L.wk, L.wFire);
      ctx.restore();
    }
  }
  ctx.restore();
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function shade(hex, f) {
  let c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  r = clamp(Math.round(r * f), 0, 255); g = clamp(Math.round(g * f), 0, 255); b = clamp(Math.round(b * f), 0, 255);
  return `rgb(${r},${g},${b})`;
}
/* pose: {bob, swing(0..1), flash(0..1), dead(0..1), walk} — hiệp sĩ quay mặt sang phải ở gốc toạ độ chân */
function drawKnight(ctx, x, y, sc, L, facing, pose) {
  pose = pose || {};
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc * facing, sc);
  const dead = pose.dead || 0;
  // bóng
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(-dead * 1.4); ctx.translate(-dead * 20, dead * 6);
  const bob = (pose.bob || 0), walk = pose.walk || 0;
  const lw = 4;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = '#1a1020';

  // chân
  const legA = Math.sin(walk) * 8;
  for (const [dx, a] of [[-9, legA], [9, -legA]]) {
    ctx.save(); ctx.translate(dx, -40 + bob); ctx.rotate(a * 0.03);
    ctx.fillStyle = shade(L.armorC, .7); rr(ctx, -7, 0, 14, 26, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = L.bootsC; rr(ctx, -9, 22, dx < 0 ? 20 : 20, 14, 5); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // thân
  ctx.fillStyle = L.armorC; rr(ctx, -22, -102 + bob, 44, 62, 12); ctx.fill(); ctx.stroke();
  if (L.armorR >= 1) { ctx.fillStyle = shade(L.armorC, 1.3); rr(ctx, -14, -94 + bob, 28, 22, 6); ctx.fill(); }
  if (L.armorR >= 2) { ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = 2; rr(ctx, -18, -98 + bob, 36, 54, 9); ctx.stroke(); ctx.strokeStyle = '#1a1020'; ctx.lineWidth = lw; }
  // áo khoác cờ hiệu
  ctx.fillStyle = L.banner; ctx.beginPath(); ctx.moveTo(-16, -70 + bob); ctx.lineTo(16, -70 + bob); ctx.lineTo(12, -38 + bob); ctx.lineTo(0, -32 + bob); ctx.lineTo(-12, -38 + bob); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3a2410'; ctx.fillRect(-22, -48 + bob, 44, 7);
  ctx.fillStyle = '#ffd040'; ctx.fillRect(-4, -48 + bob, 8, 7);

  // đầu
  const hy = -122 + bob;
  ctx.fillStyle = L.skin; ctx.beginPath(); ctx.arc(2, hy, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // râu
  ctx.fillStyle = L.boss ? '#222' : '#8a4a20'; ctx.beginPath(); ctx.moveTo(-10, hy + 6); ctx.quadraticCurveTo(6, hy + 30, 20, hy + 6); ctx.lineTo(16, hy + 4); ctx.quadraticCurveTo(6, hy + 14, -6, hy + 4); ctx.closePath(); ctx.fill();
  // mắt
  ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(12, hy - 3, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(7, hy - 10); ctx.lineTo(17, hy - 7); ctx.stroke(); ctx.lineWidth = lw;
  // mũ
  if (L.helmet) {
    ctx.fillStyle = L.helmetC;
    ctx.beginPath(); ctx.arc(2, hy - 2, 23, Math.PI, 0); ctx.lineTo(25, hy + 2); ctx.lineTo(-21, hy + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = shade(L.helmetC, 1.3); ctx.fillRect(-21, hy - 4, 46, 6); ctx.strokeRect(-21, hy - 4, 46, 6);
    if (L.helmetR >= 1) { ctx.fillStyle = shade(L.helmetC, .7); ctx.fillRect(-2, hy - 24, 6, 26); }
    if (L.helmetR >= 2) { // chùm lông
      ctx.fillStyle = L.helmetR === 3 ? '#ff4a2a' : '#e04ad0';
      ctx.beginPath(); ctx.moveTo(0, hy - 24); ctx.quadraticCurveTo(-30, hy - 50, -40, hy - 20); ctx.quadraticCurveTo(-20, hy - 34, 0, hy - 18); ctx.fill(); ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#6a3a18'; ctx.beginPath(); ctx.arc(2, hy - 6, 20, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  }
  if (L.boss) { // vương miện
    ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.moveTo(-16, hy - 22); ctx.lineTo(-12, hy - 40); ctx.lineTo(-4, hy - 28); ctx.lineTo(2, hy - 44); ctx.lineTo(8, hy - 28); ctx.lineTo(16, hy - 40); ctx.lineTo(20, hy - 22); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // khiên (phía trước)
  if (L.shield) {
    ctx.save(); ctx.translate(18, -76 + bob);
    ctx.fillStyle = L.shieldC; ctx.beginPath(); ctx.moveTo(-14, -26); ctx.lineTo(18, -26); ctx.lineTo(18, 4); ctx.quadraticCurveTo(18, 24, 2, 34); ctx.quadraticCurveTo(-14, 24, -14, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = L.shieldR >= 2 ? '#ffd040' : shade(L.shieldC, 1.4);
    ctx.beginPath(); ctx.moveTo(2, -16); ctx.lineTo(10, 2); ctx.lineTo(2, 20); ctx.lineTo(-6, 2); ctx.closePath(); ctx.fill();
    if (L.shieldR >= 1) { ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -22); ctx.lineTo(14, -22); ctx.stroke(); }
    ctx.restore();
  } else {
    ctx.fillStyle = L.glovesC; ctx.beginPath(); ctx.arc(20, -62 + bob, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // tay cầm vũ khí (vẽ trước khiên để thấy rõ đòn chém)
  const ang = pose.arm != null ? pose.arm : 0.6 - (pose.swing || 0) * 2.5;
  ctx.save(); ctx.translate(14, -88 + bob); ctx.rotate(ang);
  ctx.fillStyle = shade(L.armorC, .85); rr(ctx, -6, -6, 30, 13, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = L.glovesC; ctx.beginPath(); ctx.arc(30, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  drawWeapon(ctx, 30, 0, L);
  ctx.restore();
  ctx.restore();
}
function drawWeapon(ctx, x, y, L) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.18);
  const c = L.weaponC, glow = L.weaponR >= 3;
  if (glow) { ctx.shadowColor = L.weaponR === 3 ? '#ff9a1f' : '#b45cff'; ctx.shadowBlur = 14; }
  ctx.lineWidth = 3; ctx.strokeStyle = '#1a1020';
  switch (L.weapon) {
    case 'sword':
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(-3, -4, 6, 16);
      ctx.fillStyle = '#ffd040'; ctx.fillRect(-12, -8, 24, 6); ctx.strokeRect(-12, -8, 24, 6);
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(6, -8); ctx.lineTo(5, -62); ctx.lineTo(0, -72); ctx.lineTo(-5, -62); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'axe':
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-3, -60, 6, 72); ctx.strokeRect(-3, -60, 6, 72);
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(2, -58); ctx.quadraticCurveTo(34, -64, 30, -36); ctx.quadraticCurveTo(26, -28, 2, -34); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'mace':
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-3, -46, 6, 58); ctx.strokeRect(-3, -46, 6, 58);
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, -56, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, -56 + Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 21, -56 + Math.sin(a) * 21); ctx.stroke(); }
      break;
    case 'spear':
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-2.5, -80, 5, 96); ctx.strokeRect(-2.5, -80, 5, 96);
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-7, -78); ctx.lineTo(7, -78); ctx.lineTo(0, -104); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
  }
  ctx.restore();
}

// ================== GIAO DIỆN CHUNG ==================
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1800); }
function modal(html, onMount) {
  $('modalBox').innerHTML = html; $('modal').classList.remove('hidden');
  // mọi hộp thoại đều có nút đóng ✕ ở góc (trừ khi đang chiếu hiệu ứng mở rương / ấp trứng có nút riêng)
  const bx = $('modalBox'); if (!bx.querySelector('.x-close') && !bx.querySelector('.chest-fx')) { const b = document.createElement('button'); b.className = 'x-close'; b.setAttribute('aria-label', 'Đóng'); b.textContent = '✕'; b.onclick = () => { sfx('tap'); closeModal(); }; bx.prepend(b); }
  if (onMount) onMount(bx);
}
function closeModal() { $('modal').classList.add('hidden'); }
function bindBtns(root, map) { for (const k in map) { const el = root.querySelector(k); if (el) el.onclick = () => { sfx('tap'); map[k](); }; } }

function refreshTop() {
  $('heroName').textContent = S.name;
  $('heroPower').textContent = 'Lực chiến ' + fmt(powerOf(myStats()));
  $('gold').textContent = fmt(S.gold); $('gems').textContent = fmt(S.gems);
}
let curTab = 'home';
function showTab(t) {
  curTab = t;
  // màn phụ (Cửa hàng, Trang bị, Danh vọng) có nút ‹ Quay lại về Đấu Trường
  document.querySelectorAll('.screen').forEach(sc => { if (sc.id !== 'scr-home' && !sc.querySelector('.back-home')) { const b = document.createElement('button'); b.className = 'back-home'; b.textContent = '‹ Quay lại'; b.onclick = () => { sfx('tap'); showTab('home'); }; sc.prepend(b); } });
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'scr-' + t));
  render();
}
function render() {
  regenKeys(); refreshTop();
  if (curTab === 'home') renderHome();
  if (curTab === 'gear') renderGear();
  if (curTab === 'shop') renderShop();
  if (curTab === 'rank') renderRank();
}

// ---------- Màn chính ----------
function renderHome() {
  const li = leagueIdx(S.trophies), L = LEAGUES[li], N = LEAGUES[li + 1];
  $('leagueChip').textContent = `${L.em} ${L.n} · 🏆 ${S.trophies}` + (N ? ` / ${N.t}` : '');
  $('dungeonInfo').textContent = `🗝 ${S.keys}/3 chìa khóa`;
  $('campaignInfo').textContent = `Chương ${S.camp.ch} · Ải ${S.camp.st}/10`;
  ensureChamp();
  const rank = champBoard().findIndex(r => r.me) + 1;
  $('champInfo').textContent = `Hạng ${rank}/${S.champ.bots.length + 1} · ${champTimeLeft()}`;
  $('rankedInfo').textContent = `Thắng ${S.wins} · Thua ${S.losses}`;
}
let homeAnimT = 0;
let homeLast = 0;
function homeLoop(ts) {
  if (ts - homeLast < 32) { requestAnimationFrame(homeLoop); return; } homeLast = ts; // màn chính chỉ cần ~30 khung/giây
  if (curTab === 'home' && $('battle').classList.contains('hidden')) {
    const c = $('heroCanvas'), ctx = hd(c, 360, 330);
    ctx.clearRect(0, 0, 360, 330);
    // bệ đá
    const g = ctx.createRadialGradient(180, 300, 10, 180, 300, 150); g.addColorStop(0, 'rgba(255,200,90,.35)'); g.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 360, 330);
    ctx.fillStyle = '#3a2d62'; ctx.beginPath(); ctx.ellipse(180, 305, 110, 20, 0, 0, Math.PI * 2); ctx.fill();
    const t = ts / 1000;
    drawFighter(ctx, 180, 305, 1.6, lookFromGear(S.gear, S.banner, false, S.outfit), 1, { key: 'home', maxW: 320, t, arm: 0.6 + Math.max(0, Math.sin(t * 0.9)) ** 8 * 0.7 });
  }
  requestAnimationFrame(homeLoop);
}

// ---------- Trang bị ----------
function slotHTML(it, s, extraCls) {
  if (!it) return `<div class="slot empty ${extraCls || ''}" data-slot="${s.id}"><span class="nm">${s.n}</span>${s.ic}</div>`;
  return `<div class="slot r${it.rar} bg${it.rar} ${extraCls || ''}" data-slot="${s.id}" data-id="${it.id}"><span class="nm">${s.n}</span>${itemIconHTML(it)}<span class="lv">Lv${it.ilvl}${it.up ? ' +' + it.up : ''}</span></div>`;
}
function renderGear() {
  const L = SLOTS.filter(s => s.side === 'L'), R = SLOTS.filter(s => s.side === 'R');
  $('slotsL').innerHTML = L.map(s => slotHTML(S.gear[s.id], s)).join('');
  $('slotsR').innerHTML = R.map(s => slotHTML(S.gear[s.id], s)).join('');
  document.querySelectorAll('#slotsL .slot,#slotsR .slot').forEach(el => el.onclick = () => {
    const it = S.gear[el.dataset.slot]; if (it) itemDetail(it, true); else toast('Ô trống — mở rương để tìm ' + SLOTS.find(s => s.id === el.dataset.slot).n);
  });
  const st = myStats();
  $('statLine').innerHTML = `<span>⚔ Công <b>${fmt(st.atk)}</b></span><span>❤ Máu <b>${fmt(st.hp)}</b></span><span>🛡 Đỡ <b>${st.block}%</b></span><span>💨 Tốc <b>+${st.speed}%</b></span>`;
  $('bagCount').textContent = `(${S.bag.length}/30)`;
  S.bag.sort((a, b) => b.rar - a.rar || b.ilvl - a.ilvl);
  $('bag').innerHTML = S.bag.length ? S.bag.map(it => {
    const s = SLOTS.find(x => x.id === it.slot); const better = isBetter(it);
    return slotHTML(it, s).replace('</div>', better ? '<span style="position:absolute;top:0;right:3px;color:#5dff8a;font-size:14px">▲</span></div>' : '</div>');
  }).join('') : '<p class="hint" style="grid-column:1/6">Túi trống. Thắng trận để nhận rương!</p>';
  document.querySelectorAll('#bag .slot').forEach(el => el.onclick = () => { const it = S.bag.find(x => x.id === el.dataset.id); if (it) compareItem(it); });
  const c = $('gearCanvas'), ctx = hd(c, 200, 260); ctx.clearRect(0, 0, 200, 260);
  drawFighter(ctx, 100, 250, 1.4, lookFromGear(S.gear, S.banner, false, S.outfit), 1, { key: 'gear', maxW: 196, still: true });
}
function isBetter(it) { const cur = S.gear[it.slot]; if (!cur) return true; return mainStat(it).v > mainStat(cur).v; }
function cardHTML(it, tag) {
  const s = itemStats(it), m = mainStat(it), pk = PERKS[it.perk];
  let extra = ''; if (s.block) extra += ` · 🛡 Đỡ ${s.block}%`; if (s.speed) extra += ` · 💨 Tốc +${s.speed}%`;
  return `<div class="card" style="border-left-color:${RCOL[it.rar]}">${tag ? `<span class="tag">${tag}</span>` : ''}
    <div class="icon bg${it.rar} glowr r${it.rar}">${itemIconHTML(it)}</div>
    <div class="info"><div class="rr t${it.rar}">${RAR[it.rar].n} · Cấp ${it.ilvl}${it.up ? ' · +' + it.up : ''}</div>
    <div class="t">${itemName(it)}</div>
    <div class="st">${m.ic} ${fmt(m.v)}<small style="font-weight:400;color:#b8a9da">${extra}</small></div>
    ${hasPerk(it) ? `<div class="pk" style="color:${pk.c}">✦ ${pk.n} · ${perkChance(it)}%</div>` : `<div class="pk" style="color:#7d7398">Không có kỹ năng ẩn</div>`}</div></div>`;
}
function itemDetail(it, equipped) {
  const pk = PERKS[it.perk], cost = upCost(it), maxed = it.up >= MAX_UP[it.rar];
  modal(`<h3>${itemName(it)}</h3>${cardHTML(it, equipped ? 'Đang mặc' : '')}
    ${hasPerk(it) ? `<p style="font-size:13px;color:#ddd">✦ <b style="color:${pk.c}">${pk.n}</b>: ${pk.d}. Tỉ lệ kích hoạt mỗi đòn: <b>${perkChance(it)}%</b>.</p>` : `<p style="font-size:13px;color:#a89cc8">Món này chưa có kỹ năng ẩn. Chỉ đồ <b style="color:${RCOL[PERK_MIN_RAR]}">${RAR[PERK_MIN_RAR].n}</b> trở lên mới có kỹ năng ẩn.</p>`}
    <p style="font-size:12px;color:#b8a9da;margin-top:6px">Cường hóa: +10% chỉ số mỗi cấp, +1% tỉ lệ chiêu mỗi 2 cấp. Tối đa +${MAX_UP[it.rar]} (${RAR[it.rar].n}).</p>
    <div class="btns"><button class="btn" id="bClose">Đóng</button>
    <button class="btn green" id="bUp" ${maxed || S.gold < cost ? 'disabled' : ''}>${maxed ? 'Đã tối đa' : `Cường hóa 🪙${fmt(cost)}`}</button></div>`, root => {
    bindBtns(root, {
      '#bClose': closeModal,
      '#bUp': () => { if (S.gold < cost) return; S.gold -= cost; it.up++; sfx('coin'); save(); toast(`Cường hóa thành công! +${it.up}`); itemDetail(it, equipped); render(); },
    });
  });
}
function compareItem(it, fromChest) {
  noteMyth(it); save();
  const cur = S.gear[it.slot];
  const a = mainStat(it), b = cur ? mainStat(cur) : { v: 0 };
  const diff = a.v - b.v;
  modal(`<h3>${fromChest ? 'Nhận được trang bị mới!' : 'So sánh trang bị'}</h3>
    ${cardHTML(it, fromChest ? 'MỚI' : '')}
    <div style="text-align:center;font-weight:700;margin:-2px 0 6px" class="${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '▲' : '▼'} ${fmt(Math.abs(diff))} ${a.ic}</div>
    ${cur ? cardHTML(cur, 'Đang mặc') : '<p class="hint">Ô này đang trống</p>'}
    <div class="btns"><button class="btn red" id="bSell">Bán 🪙${fmt(sellPrice(it))}</button>
    ${fromChest ? '<button class="btn" id="bKeep">Cất túi</button>' : ''}
    <button class="btn ok" id="bEquip">Trang bị</button></div>`, root => {
    bindBtns(root, {
      '#bSell': () => { removeFromBag(it); S.gold += sellPrice(it); sfx('coin'); save(); closeModal(); render(); afterChestHook(); },
      '#bKeep': () => { if (!S.bag.includes(it)) { if (S.bag.length >= 30) { toast('Túi đầy! Đã bán tự động.'); S.gold += sellPrice(it); } else S.bag.push(it); } save(); closeModal(); render(); afterChestHook(); },
      '#bEquip': () => { removeFromBag(it); if (cur) S.bag.push(cur); S.gear[it.slot] = it; sfx('tap'); save(); closeModal(); render(); toast('Đã trang bị ' + itemName(it)); afterChestHook(); },
    });
  });
}
function removeFromBag(it) { const i = S.bag.indexOf(it); if (i >= 0) S.bag.splice(i, 1); }
$('btnOutfit').onclick = () => { sfx('tap'); outfitModal(); };
$('btnSellCommon').onclick = () => {
  const list = S.bag.filter(i => i.rar === 0); if (!list.length) return toast('Không có đồ Thường');
  let g = 0; list.forEach(i => { g += sellPrice(i); removeFromBag(i); }); S.gold += g; sfx('coin'); save(); render(); toast(`Đã bán ${list.length} món, +🪙${fmt(g)}`);
};

// ---------- Rương ----------
let chestQueue = [];
function rollChest(type, ilvl) {
  const C = CHESTS[type]; const rar = weighted(C.w);
  const slot = pick(SLOTS).id;
  return makeItem(slot, ilvl + rint(0, rar >= 3 ? 2 : 1), rar);
}
function openChest(type, ilvl) {
  const it = rollChest(type, ilvl || dropLevel());
  const C = CHESTS[type];
  sfx('chest');
  modal(`<div class="chest-open"><div class="big" id="cBig">${C.ic}</div><h3>${C.n}</h3><p class="hint">Chạm để mở</p></div>`, root => {
    let opened = false;
    const go = () => { if (opened) return; opened = true; sfx('win'); compareItem(it, true); };
    root.querySelector('.chest-open').onclick = go;
    setTimeout(go, 1300);
  });
}
function queueChests(list) { chestQueue.push(...list); }
function afterChestHook() { if (chestQueue.length) { const c = chestQueue.shift(); setTimeout(() => openChest(c.type, c.ilvl), 150); } }

// ---------- Cửa hàng ----------
const FREE_CHEST_MS = 4 * 3600 * 1000;
function renderShop() {
  const left = S.freeChestT + FREE_CHEST_MS - Date.now();
  let html = `<div class="chest" style="grid-column:1/3;background:linear-gradient(#2c6a3b,#173a20)"><span class="big">🎁</span><b>Rương miễn phí</b>
    <small>${left > 0 ? 'Mở lại sau ' + fmtDur(left) : 'Sẵn sàng! Một Rương Gỗ miễn phí mỗi 4 giờ.'}</small>
    <button id="bFree" ${left > 0 ? 'disabled' : ''}>Mở miễn phí</button></div>`;
  for (const k in CHESTS) {
    const C = CHESTS[k], cost = C.cost.gold ? `🪙${fmt(C.cost.gold)}` : `💎${C.cost.gems}`;
    const can = C.cost.gold ? S.gold >= C.cost.gold : S.gems >= C.cost.gems;
    html += `<div class="chest"><span class="big">${C.ic}</span><b>${C.n}</b><small>${C.w.map((w, i) => w ? `<span class="t${i}">${RAR[i].n} ${w}%</span>` : '').filter(Boolean).join(' · ')}</small>
      <button data-k="${k}" ${can ? '' : 'disabled'}>${cost}</button></div>`;
  }
  $('shop').innerHTML = html;
  $('bFree').onclick = () => { S.freeChestT = Date.now(); save(); render(); openChest('wood'); };
  document.querySelectorAll('#shop button[data-k]').forEach(b => b.onclick = () => {
    const C = CHESTS[b.dataset.k];
    if (C.cost.gold) { if (S.gold < C.cost.gold) return; S.gold -= C.cost.gold; } else { if (S.gems < C.cost.gems) return; S.gems -= C.cost.gems; }
    save(); render(); openChest(b.dataset.k);
  });
}
function fmtDur(ms) { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return h ? `${h}g ${m}p` : `${m}p ${ss}s`; }

// ---------- Danh vọng ----------
function renderRank() {
  const li = leagueIdx(S.trophies);
  $('leaguePath').innerHTML = LEAGUES.map((L, i) => `<div class="lg ${i === li ? 'cur' : ''} ${i > li ? 'lock' : ''}"><span class="em">${L.em}</span>
    <div><b>${L.n}</b><small>Từ 🏆 ${L.t}</small></div><div class="rw">${L.gem ? `Thưởng lên hạng<br>💎 ${L.gem} + ${i >= 4 ? CHESTS.legend.n : i >= 2 ? CHESTS.gold.n : CHESTS.silver.n}` : 'Khởi đầu'}</div></div>`).reverse().join('')
    + `<p class="hint">Cúp hiện tại: 🏆 ${S.trophies}. Thắng Đấu Hạng +25~32 cúp, thua -15 cúp. Hạng cao hơn rơi đồ cấp cao hơn.</p>`
    + bestiaryHTML();
}
// Bách khoa quái + bảng khắc hệ
function bestiaryHTML() {
  const list = MONSTERS.filter(m => ready(m.id));
  const beats = Object.entries(ELEM).filter(([k, e]) => e.beats.length).map(([k, e]) => `<span style="color:${e.c}">${e.ic}${e.n}</span> ➜ ${e.beats.map(b => `<span style="color:${ELEM[b].c}">${ELEM[b].ic}${ELEM[b].n}</span>`).join(' ')}`).join('<br>');
  return `<h2 style="margin-top:18px">Bách khoa quái (${list.length})</h2>
    <p class="hint" style="text-align:left;line-height:1.7">Khắc hệ (+30% sát thương):<br>${beats}</p>
    <div class="beast">${list.map(m => { const e = ELEM[m.e]; return `<div class="b ${m.boss ? 'boss' : ''}" style="--g:${e.c}">
      <img src="${m.id}.webp" loading="lazy"><b>${m.boss ? '👑 ' : ''}${m.n}</b>
      <span style="color:${e.c}">${e.ic} ${e.n}</span><br>${m.sk.map(([k, ch]) => `<span style="color:${PERKS[k].c}">${PERKS[k].n} ${ch}%</span>`).join(' · ')}<br>
      <span style="color:#ffd040">${PASSIVES[m.ps].n}</span>: ${PASSIVES[m.ps].d}</div>`; }).join('')}</div>`;
}
// Tủ trang phục
function outfitModal() {
  const cur = S.outfit || 'auto';
  const groups = [['Tự động theo trang bị', [{ id: 'auto', n: 'Tự động', how: 'Thân đổi theo Giáp, vũ khí và khiên đổi theo món đang mặc' }]],
    ['Cấp trang bị', OUTFITS.filter(o => !o.style && !o.myth && !o.super)], ['Phong cách vũ khí', OUTFITS.filter(o => o.style)],
    ['Thần Thoại', OUTFITS.filter(o => o.myth && !o.super)], ['Siêu Thần', OUTFITS.filter(o => o.super)]];
  const card = (o) => {
    const ok = o.id === 'auto' || o.ok(), on = o.id === cur, img = o.spr && ready(o.spr) ? `<img src="${o.spr}.webp">` : `<div style="height:100px;display:grid;place-items:center;font-size:40px">${o.id === 'auto' ? '⚙' : '❔'}</div>`;
    return `<div class="o ${ok ? '' : 'lock'} ${on ? 'on' : ''} ${o.myth ? 'myth' : ''} ${o.super ? 'super' : ''}" data-o="${o.id}" style="--g:${o.glow || '#fff'}">${img}<b>${o.n}</b><br><small>${ok ? (on ? '✔ Đang dùng' : 'Chạm để mặc') : '🔒 ' + o.how}</small></div>`;
  };
  modal(`<h3>👘 Tủ trang phục</h3>${groups.map(([t, arr]) => arr.length ? `<p style="margin:8px 0 2px;font-weight:700">${t}</p><div class="outfits">${arr.map(card).join('')}</div>` : '').join('')}
    <div class="btns"><button class="btn" id="bClose">Đóng</button></div>`, root => {
    bindBtns(root, { '#bClose': closeModal });
    root.querySelectorAll('.o').forEach(el => el.onclick = () => {
      const o = el.dataset.o === 'auto' ? { ok: () => true } : OUTFITS.find(x => x.id === el.dataset.o);
      if (!o.ok()) return toast('Chưa mở khóa');
      S.outfit = el.dataset.o; save(); sfx('tap'); outfitModal(); render();
    });
  });
}

// ================== ĐỐI THỦ ==================
function genOpponent(targetPower, ilvl, opts) {
  opts = opts || {};
  const gear = {}; const rw = opts.rarW || [40, 32, 18, 8, 2];
  for (const s of SLOTS) { if (Math.random() < (opts.fill ?? 0.85) || s.id === 'weapon' || s.id === 'armor') gear[s.id] = makeItem(s.id, Math.max(1, ilvl + rint(-1, 1)), weighted(rw)); else gear[s.id] = null; }
  let st = calcStats(gear);
  if (targetPower) {
    // Cân bằng: đối thủ giữ cùng tỉ lệ Công/Máu với người chơi (lệch ±12% cho đa dạng), rồi co giãn cho khớp lực chiến mục tiêu.
    // (Trước đây tỉ lệ lấy theo đồ của đối thủ nên người chơi thiên máu gặp đối thủ công cao gấp hơn 10 lần.)
    const me = (typeof S !== 'undefined' && S) ? myStats() : st, tilt = rnd(0.88, 1.12);
    const base = { atk: me.atk * tilt, hp: me.hp / tilt, block: st.block, speed: st.speed };
    const f = targetPower / Math.max(1, powerOf(base));
    st.atk = Math.max(4, Math.round(base.atk * f)); st.hp = Math.max(40, Math.round(base.hp * f));
  }
  if (opts.boss) { st.atk = Math.round(st.atk * 1.25); st.hp = Math.round(st.hp * 1.5); }
  return { name: opts.name || (opts.mon ? opts.mon.n : pick(NAMES)), gear, stats: st, banner: pick(BANNERS), boss: !!opts.boss, mon: opts.mon || null };
}
// Phân bố phẩm chất đồ của đối thủ quanh mức đồ trung bình người chơi đang mặc (đồ nhìn thấy khớp với chỉ số)
function gearRarW() {
  const its = SLOTS.map(s => S.gear[s.id]).filter(Boolean), avg = its.length ? its.reduce((a, it) => a + it.rar, 0) / its.length : 0;
  return [0, 1, 2, 3, 4, 5, 6, 7].map(r => Math.max(0.01, Math.exp(-Math.pow(r - avg, 2) / 1.1) * (r >= 6 ? 0.5 : 1)));
}
function meFighter() { return { name: S.name, gear: S.gear, stats: myStats(), banner: S.banner, outfit: S.outfit }; }

function vsScreen(op, opts) {
  const me = meFighter();
  const mini = (f) => f.mon
    ? f.mon.sk.map(([k, ch]) => `<span class="sk" style="border-color:${PERKS[k].c};color:${PERKS[k].c}">${PERKS[k].n} ${ch}%</span>`).join('') + `<span class="sk ps">${PASSIVES[f.mon.ps].n}</span>`
    : SLOTS.map(s => f.gear[s.id] ? `<span class="bg${f.gear[s.id].rar}" style="border-color:${RCOL[f.gear[s.id].rar]}">${itemIcon(f.gear[s.id])}</span>` : '').join('');
  const eb = (f) => { const e = ELEM[elemOf(f)]; return `<span class="elem" style="color:${e.c};border-color:${e.c}">${e.ic} ${e.n}</span>`; };
  const adv = elemMult(elemOf(me), elemOf(op)) > 1 ? '<p class="hint" style="color:#5dff8a">✦ Bạn khắc hệ đối thủ: +30% sát thương</p>' : elemMult(elemOf(op), elemOf(me)) > 1 ? '<p class="hint" style="color:#ff6a5a">✦ Đối thủ khắc hệ bạn: họ +30% sát thương</p>' : '';
  modal(`<h3>${opts.title}</h3><div class="vs">
    <div class="side me"><canvas id="vsA" width="110" height="130"></canvas><div><div class="nm">${me.name}</div>${eb(me)}
      <div class="sl">⚔ ${fmt(me.stats.atk)} &nbsp; ❤ ${fmt(me.stats.hp)}</div><div class="mini-items">${mini(me)}</div></div></div>
    <div class="mid">VS</div>
    <div class="side op"><canvas id="vsB" width="110" height="130"></canvas><div><div class="nm">${op.boss ? '👑 ' : ''}${op.name}</div>${eb(op)}
      <div class="sl">⚔ ${fmt(op.stats.atk)} &nbsp; ❤ ${fmt(op.stats.hp)}</div><div class="mini-items">${mini(op)}</div></div></div>
  </div>${adv}${opts.note ? `<p class="hint">${opts.note}</p>` : ''}
  <div class="btns"><button class="btn" id="bBack">Quay lại</button>
  ${opts.reroll ? `<button class="btn" id="bReroll">🔄 Đổi (💎5)</button>` : ''}
  <button class="btn ok" id="bFight">CHIẾN!</button></div>`, root => {
    const draw = (id, f, face) => { const c = root.querySelector(id), x = hd(c, 110, 130); drawFighter(x, 55, 126, 0.66, lookOf(f), face, { key: id, maxW: 104, still: true }); };
    draw('#vsA', me, 1); draw('#vsB', op, -1);
    bindBtns(root, {
      '#bBack': closeModal,
      '#bReroll': () => { if (S.gems < 5) return toast('Không đủ ngọc'); S.gems -= 5; save(); refreshTop(); opts.reroll(); },
      '#bFight': () => { closeModal(); startBattle(me, op, opts.onEnd, opts.arena, opts.hpA); },
    });
  });
}

// ================== TRẬN ĐẤU ==================
const BC = $('battleCanvas'), bx = BC.getContext('2d');
let B = null, bSpeed = 1;
$('btnSpeed').onclick = () => { bSpeed = bSpeed === 1 ? 2 : bSpeed === 2 ? 3 : 1; $('btnSpeed').textContent = 'x' + bSpeed; };
$('btnSkip').onclick = () => { if (B && !B.over) B.skip = true; };

function mkFighter(f, side, hpStart) {
  const perks = [];
  if (f.mon) f.mon.sk.forEach(([k, ch]) => perks.push({ k, ch }));
  else for (const s of SLOTS) { const it = f.gear[s.id]; if (hasPerk(it)) perks.push({ k: it.perk, ch: perkChance(it) }); }
  const st = f.stats;
  return {
    name: f.name, side, look: monPw(lookOf(f), f), elem: elemOf(f), passive: f.mon ? f.mon.ps : null, revived: false, swoosh: 0, swC: '#fff', maxHp: st.hp, hp: hpStart != null ? Math.min(hpStart, st.hp) : st.hp,
    atk: st.atk, block: st.block, crit: st.crit || 10, interval: 1000 / (1 + (st.speed || 0) / 100), perks,
    x: side < 0 ? -60 : 420, homeX: side < 0 ? 80 : 280, next: side < 0 ? 0 : 120,
    burn: 0, poison: 0, guard: false, stun: false, swing: 0, arm: 0.6, flash: 0, dead: 0, lunge: 0, walk: 0, shownHp: 0,
  };
}
// Khung trận giãn theo tỉ lệ màn hình: rộng logic 360, cao theo máy (560..900)
let BH = 640;
function fitBattle() {
  const el = $('app'); const w = el.clientWidth || 360, h = el.clientHeight || 640;
  BH = clamp(Math.round(360 * h / w), 560, 900); hd(BC, 360, BH);
}
window.addEventListener('resize', () => { if (B) fitBattle(); });
function startBattle(me, op, onEnd, arena, hpA) {
  const A = mkFighter(me, -1, hpA), O = mkFighter(op, 1);
  A.shownHp = A.hp; O.shownHp = O.hp;
  const zone = (typeof ZONES !== 'undefined') ? (op.mon ? ZONE_OF_ELEM[op.mon.e] : (typeof arena === 'string' ? arena : ZONE_LIST[arena != null ? arena % ZONE_LIST.length : rint(0, ZONE_LIST.length - 1)])) : null;
  B = { zone, zst: {}, A, O, t: 0, phase: 'intro', fx: [], texts: [], q: null, over: false, onEnd, arena: ARENAS[arena != null ? arena : rint(0, 3)], last: 0, skip: false, banner: null, shake: 0, log: [] };
  $('battle').classList.remove('hidden');
  fitBattle();
  B.last = performance.now();
  requestAnimationFrame(battleLoop);
}
function battleLoop(now) {
  if (!B) return;
  if (now - B.last < 15.5 && !B.skip) { requestAnimationFrame(battleLoop); return; } // trần 60 khung/giây cho đỡ nóng máy
  let dt = Math.min(50, now - B.last) * bSpeed; B.last = now;
  if (B.skip) { B.A.x = B.A.homeX; B.O.x = B.O.homeX; B.A.walk = B.O.walk = 0; B.q = null; B.A.arm = B.O.arm = 0.6; B.A.lunge = B.O.lunge = 0; while (!B.over) simStep(); B.skip = false; }
  else update(dt);
  drawBattle(now);
  if (B.phase === 'done') { const b = B; B = null; setTimeout(() => { $('battle').classList.add('hidden'); b.onEnd(b.winner === b.A, b.A.hp, b); }, 50); return; }
  requestAnimationFrame(battleLoop);
}
// Chạy nhanh để bỏ qua: xử lý logic không cần hoạt ảnh
function simStep() {
  const { A, O } = B;
  const actor = A.next <= O.next ? A : O, tgt = actor === A ? O : A;
  B.t = actor.next;
  doAction(actor, tgt, true);
  if (tgt.hp <= 0 || actor.hp <= 0) finish(tgt.hp <= 0 ? actor : tgt);
  else if (roundOver()) finishByHp();
  else if (B.limit && B.t >= B.limit) { B.timeUp = true; finish(A); } // trận đánh boss có giới hạn thời gian
}
function update(dt) {
  const { A, O } = B;
  B.t += dt;
  for (const f of [A, O]) { f.flash = Math.max(0, f.flash - dt / 200); f.shownHp += (f.hp - f.shownHp) * Math.min(1, dt / 150); }
  B.shake = Math.max(0, B.shake - dt / 30);
  // khựng hình khi trúng đòn (hit-stop) và zoom ống kính hồi về
  if (B.hitstop > 0) { B.hitstop -= dt; dt *= 0.15; }
  B.zoom = 1 + ((B.zoom || 1) - 1) * Math.pow(0.002, dt / 1000);
  for (const f of [A, O]) f.kb = (f.kb || 0) * Math.pow(0.0004, dt / 1000);
  B.fx = B.fx.filter(p => (p.life -= dt) > 0); B.fx.forEach(p => { p.x += (p.vx || 0) * dt / 16; p.y += (p.vy || 0) * dt / 16; if (p.vy != null) p.vy += (p.g || 0) * dt / 16; });
  B.texts = B.texts.filter(t => (t.life -= dt) > 0); B.texts.forEach(t => t.y -= dt * 0.04);
  if (B.banner) { B.banner.life -= dt; if (B.banner.life <= 0) B.banner = null; }
  if (B.tint) { B.tint.life -= dt; if (B.tint.life <= 0) B.tint = null; }

  if (B.phase === 'intro') {
    let doneIn = true;
    for (const f of [A, O]) { const d = f.homeX - f.x; if (Math.abs(d) > 1) { f.x += Math.sign(d) * Math.min(Math.abs(d), dt * 0.25); f.walk += dt * 0.02; doneIn = false; } else f.walk = 0; }
    if (doneIn) { B.phase = 'fight'; B.t = 0; A.next = 300; O.next = 420; B.banner = { txt: 'CHIẾN!', life: 700, c: '#ffd040' }; }
    return;
  }
  if (B.phase === 'fight') {
    if (B.limit && B.t >= B.limit && !B.q) { B.timeUp = true; finish(A); return; }
    if (!B.q) {
      const actor = A.next <= O.next ? A : O;
      if (B.t >= actor.next) B.q = { actor, tgt: actor === A ? O : A, t: 0, dur: 620, hit: false };
    }
    if (B.q) {
      const q = B.q; q.t += dt; const p = q.t / q.dur;
      const f = q.actor;
      const lerp = (a, b, k) => a + (b - a) * k;
      const oCub = k => 1 - Math.pow(1 - k, 3), oQ = k => 1 - Math.pow(1 - k, 4), ioC = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const oBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
      // lấy đà lùi -> lao tới có nảy -> giữ -> về chỗ êm
      f.lunge = p < 0.3 ? -0.14 * oCub(p / 0.3) : p < 0.5 ? lerp(-0.14, 1, oBack((p - 0.3) / 0.2)) : p < 0.66 ? 1 : lerp(1, 0, ioC((p - 0.66) / 0.34));
      f.arm = p < 0.3 ? lerp(0.6, -2.1, oCub(p / 0.3)) : p < 0.5 ? lerp(-2.1, 1.45, oQ((p - 0.3) / 0.2)) : p < 0.66 ? lerp(1.45, 1.25, (p - 0.5) / 0.16) : lerp(1.25, 0.6, ioC((p - 0.66) / 0.34));
      f.swoosh = p > 0.3 && p < 0.62 ? 1 - Math.abs(p - 0.46) / 0.16 : 0;
      if (!q.hit && p >= 0.5) { q.hit = true; doAction(f, q.tgt, false); }
      if (p >= 1) {
        f.lunge = 0; f.arm = 0.6; f.swoosh = 0; B.q = null;
        if (A.hp <= 0 || O.hp <= 0) { finish(A.hp <= 0 ? O : A); } else if (roundOver()) finishByHp();
      }
    }
    return;
  }
  if (B.phase === 'end') {
    const L = B.winner === A ? O : A; L.dead = Math.min(1, L.dead + dt / 500);
    B.endT -= dt; if (B.endT <= 0) B.phase = 'done';
  }
}
function finish(winner) {
  B.over = true; B.winner = winner; B.phase = 'end'; B.endT = 1500;
  B.banner = { txt: winner === B.A ? 'VICTORY!' : 'DEFEAT', life: 1500, c: winner === B.A ? '#ffd040' : '#ff5a4a' };
  sfx(winner === B.A ? 'win' : 'lose');
}
function addText(f, txt, c, big) { if (!B) return; B.texts.push({ x: f.x + rnd(-14, 14), y: 360 - 185, txt, c, big, life: 900 }); }
function burst(f, c, n, kind) {
  for (let i = 0; i < n; i++) B.fx.push({ x: f.x + rnd(-20, 20), y: 360 - rnd(40, 120), vx: rnd(-3, 3), vy: rnd(-4, 1), g: kind === 'heal' ? -0.02 : 0.15, c, life: rnd(350, 700), r: rnd(2, 5), kind });
}
const MAX_ROUND = 30, LATE_ROUND = MAX_ROUND - 4; // giới hạn 30 hiệp; hiệp 26–30 sát thương ×10
const roundOver = () => !B.limit && (B.acts || 0) >= MAX_ROUND * 2;
function finishByHp() { const { A, O } = B; B.timeUp = true; finish(A.hp / A.maxHp >= O.hp / O.maxHp ? A : O); if (B.banner) B.banner.txt = 'TIME UP · ' + B.banner.txt; }
function doAction(actor, tgt, fast) {
  const vis = !fast;
  B.acts = (B.acts || 0) + 1; B.round = Math.ceil(B.acts / 2); const lateX = !B.limit && B.round >= LATE_ROUND ? 10 : 1;
  if (vis && lateX > 1 && !B.lateShown) { B.lateShown = true; setTimeout(() => B && (B.banner = { txt: '5 HIỆP CUỐI · SÁT THƯƠNG ×10', life: 1200, c: '#ff5a2a' }), 50); }
  // Hiệu ứng duy trì đầu lượt
  if (actor.burn > 0) { const d = Math.round((actor.burnAtk || tgt.atk) * (actor.burnStk || 1)); actor.hp -= d; actor.burn--; if (vis) { addText(actor, '-' + d, '#ff7a1a'); burst(actor, '#ff7a1a', 8); } }
  if (actor.poison > 0) { const d = Math.round(tgt.atk * 0.6); actor.hp -= d; actor.poison--; if (vis) { addText(actor, '-' + d, '#9cff3a'); burst(actor, '#9cff3a', 6); } }
  actor.next += actor.interval;
  tryRevive(actor, vis);
  if (actor.hp <= 0) return;
  if (actor.passive === 'regen' && actor.hp < actor.maxHp) { const h = Math.round(actor.atk * 0.3); actor.hp = Math.min(actor.maxHp, actor.hp + h); if (vis) { addText(actor, '+' + h, '#5dff8a'); burst(actor, '#5dff8a', 5, 'heal'); } }
  if (actor.stun) { actor.stun = false; actor.stunFx = performance.now() + 900; if (vis) addText(actor, 'CHOÁNG! Mất lượt', '#ffe14a', true); return; } // choáng: mất 1 lượt, sao vẫn xoay thêm chút

  actor.swC = ELEM[actor.elem || 'vo'].c;
  // Kích hoạt chiêu (tối đa 1)
  let perk = null;
  for (const p of actor.perks) { if (Math.random() * 100 < p.ch) { perk = p.k; break; } }
  let mult = 1, hits = 1;
  if (perk) {
    if (vis) {
      B.banner = { txt: PERKS[perk].n, life: 800, c: PERKS[perk].c, side: actor.side }; sfx('skill');
      const fxid = FX_SPR[perk]; if (fxid && ready(fxid)) B.fx.push({ kind: 'img', id: fxid, x: (perk === 'heal' || perk === 'guard') ? actor.x : tgt.x, y: 360 - 80, life: 650, max: 650, flip: actor.side > 0, sc: fxid === 'fx-bang' ? 0.6 : 1 }); // băng thu nhỏ
      B.tint = { c: PERKS[perk].c, life: 260 };
    }
    actor.swC = PERKS[perk].c;
    if (perk === 'fire') mult = 1.8; if (perk === 'ice') mult = 1.3; if (perk === 'thunder') mult = 1.5; if (perk === 'leech') mult = 1.4;
    if (perk === 'whirl') { hits = 3; mult = 0.7; }
    if (perk === 'heal') { actor.healStk = Math.min(3, (actor.healStk || 0) + 1); const h = Math.round(actor.atk * actor.healStk); actor.hp = Math.min(actor.maxHp, actor.hp + h); if (vis) { addText(actor, '+' + h, '#5dff8a', true); burst(actor, '#5dff8a', 14, 'heal'); } }
    if (perk === 'guard') { actor.guard = true; if (vis) addText(actor, 'Khiên!', '#c8d6e5'); }
  }
  let total = 0;
  for (let h = 0; h < hits; h++) {
    const em = elemMult(actor.elem, tgt.elem);
    let dmg = actor.atk * mult * em * lateX * rnd(0.85, 1.15), crit = false, blocked = false, dodged = false;
    if (actor.passive === 'rage' && actor.hp < actor.maxHp * 0.4) dmg *= 1.5;
    if (Math.random() * 100 < actor.crit) { dmg *= 1.7; crit = true; }
    if (tgt.passive === 'dodge' && Math.random() < 0.18) { dmg = 0; dodged = true; }
    else if (tgt.guard) { dmg = 0; tgt.guard = false; blocked = true; }
    else if (actor.passive !== 'pierce' && Math.random() * 100 < tgt.block) { dmg *= 0.4; blocked = true; }
    dmg = Math.round(dmg); tgt.hp -= dmg; total += dmg;
    if (tgt.passive === 'thorns' && dmg > 0) { const r = Math.round(dmg * 0.25); actor.hp -= r; if (vis) setTimeout(() => B && addText(actor, '-' + r, '#d8a35a'), 200); }
    if (vis && em > 1 && h === 0) setTimeout(() => B && addText(tgt, 'KHẮC HỆ!', ELEM[actor.elem].c, true), 60);
    if (vis && dodged) { setTimeout(() => B && addText(tgt, 'Né!', '#8dffc8'), h * 140); continue; }
    if (vis) {
      setTimeout(() => {
        if (!B) return;
        addText(tgt, blocked && dmg === 0 ? 'Chặn!' : (crit ? 'CHÍ MẠNG -' : '-') + dmg, blocked ? '#c8d6e5' : crit ? '#ffd040' : '#fff', crit);
        tgt.flash = 1; B.shake = crit ? 5 : 2.5; tgt.kb = crit ? 1 : 0.6; B.hitstop = crit ? 70 : 35; B.zoom = crit ? 1.05 : 1.02;
        burst(tgt, perk ? PERKS[perk].c : '#fff2a0', crit ? 14 : 8);
        sfx(blocked ? 'block' : crit ? 'crit' : 'hit');
      }, h * 140);
    }
  }
  if (perk === 'fire') { tgt.burnStk = tgt.burn > 0 ? Math.min(3, (tgt.burnStk || 1) + 1) : 1; tgt.burnAtk = actor.atk; tgt.burn = 3; }
  if (perk === 'poison') tgt.poison = 4;
  if (perk === 'ice') tgt.next += tgt.interval * 0.6;
  if (perk === 'thunder') tgt.stun = true;
  if (perk === 'leech') { const h = Math.round(total * 0.5); actor.hp = Math.min(actor.maxHp, actor.hp + h); if (vis) addText(actor, '+' + h, '#ff4a6a'); }
  if (vis && perk === 'thunder') { B.fx.push({ x: tgt.x, y: 0, vx: 0, vy: 0, c: '#ffe14a', life: 420, max: 420, kind: 'bolt', seed: Math.random() * 1e6 }); B.tint = { c: '#fff6c0', life: 160 }; B.shake = Math.max(B.shake || 0, 5); }
  tryRevive(tgt, vis); tryRevive(actor, vis);
}
function tryRevive(f, vis) {
  if (f.hp > 0 || f.passive !== 'revive' || f.revived) return;
  f.revived = true; f.hp = Math.round(f.maxHp * 0.35);
  if (vis) setTimeout(() => { if (!B) return; addText(f, 'BẤT TỬ!', '#b06cff', true); burst(f, '#b06cff', 24, 'heal'); B.fx.push({ kind: 'ring', x: f.x, y: 290, c: '#b06cff', life: 700, max: 700 }); }, 250);
}
// Vệt chém phát sáng theo màu chiêu/hệ
function drawSwoosh(ctx, f, dx, ground) {
  const dir = f.side < 0 ? 1 : -1, cx = f.x + dx + dir * 30, cy = ground - 95; // vệt chém thu nhỏ
  const c = f.swC || ELEM[f.elem || 'vo'].c;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = f.swoosh * 0.9;
  ctx.shadowBlur = 0; ctx.strokeStyle = c; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.lineWidth = 8 - i * 3; ctx.globalAlpha = f.swoosh * (0.3 + i * 0.28);
    ctx.beginPath(); ctx.arc(cx, cy, 46 - i * 3, dir > 0 ? -1.9 : Math.PI - 1.2, dir > 0 ? 1.2 : Math.PI + 1.9, false); ctx.stroke();
  }
  ctx.restore();
}
function drawArena(ctx, A, t) {
  const g = ctx.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, A.sky[0]); g.addColorStop(1, A.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, -400, 360, 1100);
  ctx.save();
  if (A.deco === 'castle') {
    ctx.fillStyle = '#7d86a0'; for (let i = 0; i < 5; i++) { const x = i * 80 - 10, h = 120 + (i % 2) * 50; ctx.fillRect(x, 340 - h, 50, h); for (let k = 0; k < 4; k++) ctx.fillRect(x + k * 14, 330 - h, 8, 12); }
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(150, 170); ctx.lineTo(190, 110); ctx.lineTo(230, 170); ctx.fill(); ctx.fillStyle = '#8a92aa'; ctx.fillRect(160, 170, 60, 170);
    ctx.fillStyle = '#2b2b3a'; ctx.beginPath(); ctx.arc(190, 300, 20, Math.PI, 0); ctx.fill(); ctx.fillRect(170, 300, 40, 40);
  } else if (A.deco === 'desert') {
    ctx.fillStyle = '#e8b870'; for (let i = 0; i < 4; i++) ctx.fillRect(20 + i * 90, 160 + (i % 2) * 30, 34, 200);
    ctx.fillStyle = '#d4a05a'; ctx.beginPath(); ctx.moveTo(0, 340); ctx.quadraticCurveTo(120, 260, 240, 330); ctx.quadraticCurveTo(300, 300, 360, 320); ctx.lineTo(360, 360); ctx.lineTo(0, 360); ctx.fill();
    ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(290, 80, 30, 0, Math.PI * 2); ctx.fill();
  } else if (A.deco === 'forest') {
    ctx.fillStyle = '#f5f0c0'; ctx.beginPath(); ctx.arc(80, 80, 24, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 9; i++) { const x = i * 45 - 10, h = 140 + (i * 37 % 60); ctx.fillStyle = i % 2 ? '#1d3524' : '#264430'; ctx.beginPath(); ctx.moveTo(x, 350); ctx.lineTo(x + 30, 350 - h); ctx.lineTo(x + 60, 350); ctx.fill(); }
    for (let i = 0; i < 2; i++) { const fx = 60 + i * 240, fl = Math.sin(t / 90 + i) * 4; ctx.fillStyle = '#5a3a22'; ctx.fillRect(fx - 3, 290, 6, 60); ctx.fillStyle = '#ff9a1f'; ctx.beginPath(); ctx.ellipse(fx, 282, 9, 16 + fl, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffe14a'; ctx.beginPath(); ctx.ellipse(fx, 286, 4, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(80, 150); ctx.lineTo(160, 300); ctx.lineTo(220, 180); ctx.lineTo(300, 290); ctx.lineTo(360, 200); ctx.lineTo(360, 360); ctx.lineTo(0, 360); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 40; i++) { const x = (i * 97 + t / 20 * (1 + i % 3)) % 360, y = (i * 53 + t / 12 * (1 + i % 2)) % 640; ctx.fillRect(x, y, 2, 2); }
  }
  ctx.restore();
  ctx.fillStyle = A.ground; ctx.fillRect(0, 350, 360, 900);
  ctx.fillStyle = shade(A.ground, .8); for (let i = 0; i < 9; i++) ctx.fillRect(i * 42, 350, 40, 10);
  ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 18; i++) ctx.fillRect((i * 71) % 360, 400 + (i * 43) % 420, 30, 6);
}
function drawHud(ctx, f, left) {
  const w = 150, x = left ? 10 : 200, y = 18;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(ctx, x, y, w, 46, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Segoe UI, Arial'; ctx.textAlign = left ? 'left' : 'right';
  ctx.fillText(f.name.toUpperCase(), left ? x + 8 : x + w - 8, y + 17);
  const bw = w - 16, ratio = clamp(f.shownHp / f.maxHp, 0, 1), real = clamp(f.hp / f.maxHp, 0, 1);
  ctx.fillStyle = '#300'; ctx.fillRect(x + 8, y + 24, bw, 14);
  ctx.fillStyle = '#ffeb8a'; ctx.fillRect(left ? x + 8 : x + 8 + bw * (1 - ratio), y + 24, bw * ratio, 14);
  ctx.fillStyle = real > .3 ? '#46c25a' : '#e8452f'; ctx.fillRect(left ? x + 8 : x + 8 + bw * (1 - real), y + 24, bw * real, 14);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Segoe UI, Arial'; ctx.textAlign = 'center';
  ctx.fillText(`${Math.max(0, Math.round(f.hp))}/${f.maxHp}`, x + w / 2, y + 35);
  let ix = left ? x + 8 : x + w - 8; ctx.font = '12px Segoe UI'; ctx.textAlign = left ? 'left' : 'right';
  const st = []; if (f.burn) st.push('🔥'); if (f.poison) st.push('☠'); if (f.stun) st.push('💫'); if (f.guard) st.push('🛡');
  if (st.length) ctx.fillText(st.join(' '), ix, y + 60);
}
function drawBattle(now) {
  const ctx = bx, { A, O } = B;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.save();
  if (B.shake > 0.3) { const k = now / 1000; ctx.translate(Math.round(Math.sin(k * 61) * B.shake * DPR) / DPR, Math.round(Math.cos(k * 47) * B.shake * 0.6 * DPR) / DPR); }
  ctx.fillStyle = B.zone ? ZONES[B.zone].sky[0] : B.arena.sky[0]; ctx.fillRect(-20, -20, 400, BH + 40);
  ctx.translate(0, Math.round((BH - 640) * 0.62)); // màn hình dài: hạ sân đấu xuống giữa
  if (B.zone) drawZone(ctx, B.zone, now / 1000, B.zst, DPR); else drawArena(ctx, B.arena, now);
  const ground = 470;
  // ống kính zoom nhẹ vào tâm trận khi có đòn mạnh
  if (B.zoom > 1.0005) { ctx.translate(180, ground - 90); ctx.scale(B.zoom, B.zoom); ctx.translate(-180, -(ground - 90)); }
  for (const f of [A, O]) {
    const dir = f.side < 0 ? 1 : -1;
    const dx = f.lunge * 42 * dir - dir * (f.kb || 0) * 14; // lao tới + giật lùi khi trúng
    const fsc = 1.0 * Math.pow(BH / 640, 0.7); // máy càng dài, nhân vật càng to (nhỏ lại ~10% theo yêu cầu)
    const hx = f.side < 0 ? 80 : 280, fitW = 2 * Math.min(hx, 360 - hx) + 36, fitH = ground + Math.round((BH - 640) * 0.62) - 130;
    drawFighter(ctx, f.x + dx, ground, fsc, f.look, dir, { key: 'b' + f.side, t: now / 1000, arm: f.arm, dead: f.dead, walk: f.walk || (f.lunge > 0 ? Math.min(1, f.lunge) * Math.PI : 0), flash: f.flash, maxW: 170, fitW, fitH }); // lao tới = bước nhún lên khỏi mặt đất
    if (f.swoosh > 0 && f.look && f.look.monster) drawSwoosh(ctx, f, dx, ground); // chỉ quái có vệt chém (ảnh tĩnh, cần thấy lượt quái đánh); nhân vật đã có động tác vung vũ khí
    if (!f.dead) drawStatusFx(ctx, f, f.x + dx, ground, fsc, now / 1000);
  }
  // hạt hiệu ứng (toạ độ y gốc 360 -> lệch lên ground)
  const oy = ground - 360;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const p of B.fx) {
    if (p.kind === 'ring') {
      const k = 1 - p.life / p.max; ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = p.c; ctx.lineWidth = 6 * (1 - k) + 1;
      ctx.shadowColor = p.c; ctx.shadowBlur = 20; ctx.beginPath(); ctx.ellipse(p.x, p.y + oy, 22 + k * 58, 9 + k * 20, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(p.x, p.y + oy - 60, 10 + k * 50, 10 + k * 50, 0, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; continue;
    }
    if (p.kind === 'img') {
      const k = 1 - p.life / p.max, im = SPR[p.id], s2 = 140 * (p.sc || 1) * (0.6 + k * 0.6), w2 = s2 * im.naturalWidth / im.naturalHeight;
      ctx.save(); ctx.globalAlpha = k < 0.2 ? k / 0.2 : (1 - k) / 0.8; ctx.translate(p.x, p.y + oy); if (p.flip) ctx.scale(-1, 1);
      ctx.rotate((k - 0.5) * 0.4); ctx.drawImage(im, -w2 / 2, -s2 / 2, w2, s2); ctx.restore(); ctx.globalAlpha = 1; continue;
    }
    if (p.kind === 'bolt') { drawLightning(ctx, p, ground); continue; }
    ctx.globalAlpha = Math.min(1, p.life / 300); ctx.fillStyle = p.c;
    if (p.kind === 'heal') { ctx.font = 'bold 14px Arial'; ctx.fillText('+', p.x, p.y + oy); }
    else { const a0 = ctx.globalAlpha; ctx.globalAlpha = a0 * 0.35; ctx.beginPath(); ctx.arc(p.x, p.y + oy, p.r * 2.2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = a0; ctx.beginPath(); ctx.arc(p.x, p.y + oy, p.r, 0, Math.PI * 2); ctx.fill(); } // quầng giả thay shadowBlur
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if (B.tint) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = B.tint.life / 260 * 0.14; ctx.fillStyle = B.tint.c; ctx.fillRect(0, -400, 360, 1700); ctx.restore(); }
  for (const t of B.texts) {
    ctx.globalAlpha = Math.min(1, t.life / 300); ctx.textAlign = 'center';
    ctx.font = `900 ${t.big ? 24 : 18}px Segoe UI, Arial`; ctx.lineWidth = 4; ctx.strokeStyle = '#000';
    ctx.strokeText(t.txt, t.x, t.y + oy); ctx.fillStyle = t.c; ctx.fillText(t.txt, t.x, t.y + oy); ctx.globalAlpha = 1;
  }
  ctx.restore();
  drawHud(ctx, A, true); drawHud(ctx, O, false);
  if (B.phase === 'fight' && !B.limit) { const r = Math.min(MAX_ROUND, B.round || 1), late = r >= LATE_ROUND; ctx.save(); ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.7)'; const tx = `Hiệp ${r}/${MAX_ROUND}` + (late ? ' · ×10' : ''); ctx.strokeText(tx, 180, 96); ctx.fillStyle = late ? '#ff7a3a' : '#ffe9a8'; ctx.fillText(tx, 180, 96); ctx.restore(); }
  if (B.banner) {
    const b = B.banner, big = !b.side;
    ctx.save(); ctx.globalAlpha = Math.min(1, b.life / 200);
    ctx.textAlign = 'center'; ctx.font = `900 ${big ? 40 : 22}px Segoe UI, Arial`;
    const y = big ? 250 : 120, x = big ? 180 : (b.side < 0 ? 100 : 260);
    if (!big) { ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(ctx, x - 85, y - 24, 170, 34, 8); ctx.fill(); }
    ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.strokeText(b.txt, x, y); ctx.fillStyle = b.c; ctx.fillText(b.txt, x, y);
    ctx.restore();
  }
}

// ================== CHẾ ĐỘ: ĐẤU HẠNG ==================
function startRanked() {
  const li = leagueIdx(S.trophies);
  const make = () => genOpponent(powerOf(myStats()) * rnd(0.85, 1.1), Math.round(avgIlvl()), { rarW: gearRarW() });
  let op = make();
  const show = () => vsScreen(op, { title: `Đấu Hạng · ${LEAGUES[li].n}`, arena: 'dau-truong', reroll: () => { op = make(); show(); }, onEnd: rankedEnd });
  show();
}
function rankedEnd(win) {
  const before = leagueIdx(S.trophies);
  let html = '';
  if (win) {
    const tr = rint(25, 32), g = 20 + dropLevel() * 8; S.trophies += tr; S.gold += g; S.wins++;
    const type = weighted([70, 25, 5]) === 0 ? 'wood' : Math.random() < .83 ? 'silver' : 'gold';
    queueChests([{ type }]);
    html = `<h3>🏆 Chiến thắng!</h3><div class="reward-line"><span>🏆 +${tr}</span><span>🪙 +${fmt(g)}</span></div><p class="hint">Phần thưởng: ${CHESTS[type].ic} ${CHESTS[type].n}</p>`;
  } else {
    const g = 8 + dropLevel() * 2; S.trophies = Math.max(0, S.trophies - 15); S.gold += g; S.losses++;
    html = `<h3 style="color:#ff6a5a">Thất bại</h3><div class="reward-line"><span>🏆 -15</span><span>🪙 +${fmt(g)}</span></div><p class="hint">Mẹo: nâng cấp trang bị hoặc mở rương để tìm đồ tốt hơn.</p>`;
  }
  const after = leagueIdx(S.trophies);
  if (after > before && after > S.bestLeague) {
    S.bestLeague = after; const L = LEAGUES[after]; S.gems += L.gem;
    queueChests([{ type: after >= 4 ? 'legend' : after >= 2 ? 'gold' : 'silver' }]);
    html += `<div class="chest-open"><div class="big burst">${L.em}</div><h3>Thăng hạng: ${L.n}!</h3><div class="reward-line"><span>💎 +${L.gem}</span></div></div>`;
  }
  save();
  resultModal(html);
}
function resultModal(html) {
  modal(html + `<div class="btns"><button class="btn ok" id="bOk">${chestQueue.length ? 'Mở rương' : 'Tiếp tục'}</button></div>`, root => {
    bindBtns(root, { '#bOk': () => { closeModal(); render(); afterChestHook(); } });
  });
}

// ================== CHẾ ĐỘ: CHIẾN DỊCH ==================
function campaignScreen() {
  const { ch, st } = S.camp;
  let stages = '';
  for (let i = 1; i <= 10; i++) stages += `<div class="stage ${i < st ? 'done' : i === st ? 'cur' : ''} ${i === 10 ? 'boss' : ''}">${i === 10 ? '👑' : i}</div>`;
  modal(`<h3>🗺 Chiến Dịch · Chương ${ch}</h3><div class="stages">${stages}</div>
    <p class="hint">Mỗi ải thắng lần đầu nhận rương. Ải 10 là Lãnh Chúa — thưởng Rương Vàng và 💎50.</p>
    <div class="btns"><button class="btn" id="bBack">Đóng</button><button class="btn ok" id="bGo">Đánh ải ${st}</button></div>`, root => {
    bindBtns(root, {
      '#bBack': closeModal,
      '#bGo': () => {
        const lvl = (ch - 1) * 10 + st, boss = st === 10;
        const mon = boss ? MON_BOSS[(ch - 1) % MON_BOSS.length] : Object.assign({}, MON_NORMAL[(ch * 5 + st * 3) % MON_NORMAL.length], { rank: st >= 7 ? 1 : 0 }); // ải 7-9: quái tinh anh
        const op = genOpponent(campaignPower(lvl) * (boss ? 0.95 : 0.85), lvl, { boss, mon, rarW: [50, 30, 14, 5, 1], fill: Math.min(0.9, 0.25 + lvl * 0.06) });
        vsScreen(op, { title: `Ải ${ch}-${st}${boss ? ' · BOSS' : ''}`, arena: (ch - 1) % 4, onEnd: (win) => campaignEnd(win, boss, lvl) });
      },
    });
  });
}
// Lực chiến chuẩn của ải: như một người chơi mặc N món, độ hiếm tăng dần theo chương
function campaignPower(lvl) {
  const order = ['weapon', 'armor', 'helmet', 'gloves', 'shield', 'boots'];
  const n = Math.min(6, 2 + Math.floor(lvl / 2)), rar = lvl > 60 ? 4 : lvl > 40 ? 3 : lvl > 25 ? 2 : lvl > 10 ? 1 : 0;
  const g = {}; order.forEach((s, i) => g[s] = i < n ? Object.assign(makeItem(s, lvl, rar), { up: Math.floor(lvl / 8) }) : null);
  return powerOf(calcStats(g));
}
function campaignEnd(win, boss, lvl) {
  if (!win) { save(); return resultModal(`<h3 style="color:#ff6a5a">Thất bại</h3><p class="hint">Ải này mạnh hơn bạn. Hãy cường hóa trang bị rồi thử lại!</p>`); }
  const g = 30 + lvl * 10; S.gold += g;
  let extra = '';
  if (boss) { S.gems += 50; queueChests([{ type: 'gold', ilvl: lvl }]); extra = '<span>💎 +50</span>'; S.camp.ch++; S.camp.st = 1; }
  else { queueChests([{ type: Math.random() < .25 ? 'silver' : 'wood', ilvl: lvl }]); S.camp.st++; }
  save();
  resultModal(`<h3>🗺 Vượt ải thành công!</h3><div class="reward-line"><span>🪙 +${fmt(g)}</span>${extra}</div>${boss ? `<p class="hint">Mở khóa Chương ${S.camp.ch}!</p>` : ''}`);
}

// ================== CHẾ ĐỘ: HẦM NGỤC ==================
const KEY_MS = 2 * 3600 * 1000;
function regenKeys() {
  if (S.keys >= 3) { S.keyT = Date.now(); return; }
  const n = Math.floor((Date.now() - S.keyT) / KEY_MS);
  if (n > 0) { S.keys = Math.min(3, S.keys + n); S.keyT += n * KEY_MS; save(); }
}
function dungeonScreen() {
  regenKeys();
  const left = S.keys < 3 ? `Chìa tiếp theo sau ${fmtDur(S.keyT + KEY_MS - Date.now())}` : 'Đầy chìa khóa';
  modal(`<h3>🏰 Hầm Ngục</h3><p style="font-size:13px;text-align:center">Vượt 5 tầng liên tiếp, máu <b>không hồi đầy</b> giữa các tầng (chỉ hồi 25%).<br>Tầng 5 có Trùm Hầm Ngục canh giữ Rương Vàng.</p>
    <div class="reward-line"><span>🗝 ${S.keys}/3</span></div><p class="hint">${left}</p>
    <div class="btns"><button class="btn" id="bBack">Đóng</button><button class="btn ok" id="bGo" ${S.keys < 1 ? 'disabled' : ''}>Vào hầm (🗝1)</button></div>`, root => {
    bindBtns(root, { '#bBack': closeModal, '#bGo': () => { if (S.keys < 1) return; S.keys--; save(); render(); dungeonFloor(1, null, 0); } });
  });
}
function dungeonFloor(fl, hp, goldAcc) {
  const boss = fl === 5, myP = powerOf(myStats());
  const op = genOpponent(myP * (0.55 + fl * 0.1) * (boss ? 0.7 : 1), Math.round(avgIlvl()), { boss, mon: boss ? pick(MON_BOSS) : pick(MON_NORMAL), fill: 0.6 });
  vsScreen(op, {
    title: `Hầm Ngục · Tầng ${fl}/5`, arena: 2, hpA: hp,
    note: hp != null ? `Máu hiện tại: ${Math.round(hp)}/${myStats().hp}` : '',
    onEnd: (win, hpLeft) => {
      if (!win) { S.gold += goldAcc; save(); return resultModal(`<h3 style="color:#ff6a5a">Gục ở tầng ${fl}</h3><div class="reward-line"><span>🪙 +${fmt(goldAcc)}</span></div>`); }
      const g = 25 + fl * 12 + dropLevel() * 4; goldAcc += g;
      if (boss) { S.gold += goldAcc; queueChests([{ type: 'gold' }]); save(); return resultModal(`<h3>🏰 Chinh phục Hầm Ngục!</h3><div class="reward-line"><span>🪙 +${fmt(goldAcc)}</span></div><p class="hint">Phần thưởng: 💰 Rương Vàng</p>`); }
      const heal = myStats().hp * 0.25, nhp = Math.min(myStats().hp, hpLeft + heal);
      modal(`<h3>Qua tầng ${fl}!</h3><div class="reward-line"><span>🪙 +${fmt(g)}</span></div><p class="hint">Hồi 25% máu → ${Math.round(nhp)}/${myStats().hp}. Tổng vàng tích lũy: ${fmt(goldAcc)}</p>
        <div class="btns"><button class="btn" id="bOut">Rút lui (giữ vàng)</button><button class="btn ok" id="bNext">Tầng ${fl + 1} ▶</button></div>`, root => {
        bindBtns(root, {
          '#bOut': () => { S.gold += goldAcc; save(); closeModal(); render(); toast(`Rút lui an toàn, +🪙${fmt(goldAcc)}`); },
          '#bNext': () => { closeModal(); dungeonFloor(fl + 1, nhp, goldAcc); },
        });
      });
    },
  });
}

// ================== CHẾ ĐỘ: GIẢI VÔ ĐỊCH ==================
const SEASON_MS = 3 * 24 * 3600 * 1000;
const DIVS = ['Gỗ', 'Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Huyền Thoại'];
function ensureChamp() {
  if (S.champ && Date.now() < S.champ.end) { tickChamp(); return; }
  let div = 0, report = null;
  if (S.champ) { // kết thúc mùa cũ
    tickChamp(true);
    const rank = champBoard().findIndex(r => r.me) + 1;
    div = S.champ.div;
    const rw = rank === 1 ? { gems: 300, chest: 'legend' } : rank <= 3 ? { gems: 150, chest: 'gold' } : rank <= 7 ? { gems: 60, chest: 'silver' } : { gems: 0, chest: 'wood' };
    S.gems += rw.gems; queueChests([{ type: rw.chest }]);
    if (rank <= 3) div = Math.min(DIVS.length - 1, div + 1); else if (rank >= 13) div = Math.max(0, div - 1);
    report = { rank, rw, div };
  }
  const bots = [];
  for (let i = 0; i < 14; i++) bots.push({ name: pick(NAMES) + ' ' + rint(1, 99), pts: rint(0, 2), rate: rnd(0.15, 1.2), lvl: rnd(0.75, 1.25), banner: pick(BANNERS) });
  S.champ = { start: Date.now(), end: Date.now() + SEASON_MS, last: Date.now(), div, pts: 0, bots };
  save();
  if (report) setTimeout(() => resultModal(`<h3>🏆 Kết thúc Giải Vô Địch</h3><p style="text-align:center">Bạn xếp hạng <b>${report.rank}</b></p>
    <div class="reward-line">${report.rw.gems ? `<span>💎 +${report.rw.gems}</span>` : ''}<span>${CHESTS[report.rw.chest].ic}</span></div><p class="hint">Mùa mới: Giải ${DIVS[report.div]}</p>`), 300);
}
function tickChamp(toEnd) {
  const now = toEnd ? S.champ.end : Math.min(Date.now(), S.champ.end);
  const h = (now - S.champ.last) / 3600000;
  if (h <= 0) return;
  for (const b of S.champ.bots) { const exp = b.rate * h; b.pts += Math.floor(exp) + (Math.random() < exp % 1 ? 1 : 0); }
  S.champ.last = now;
}
function champBoard() {
  const rows = S.champ.bots.map(b => ({ ...b })); rows.push({ name: S.name, pts: S.champ.pts, me: true });
  return rows.sort((a, b) => b.pts - a.pts || (a.me ? -1 : 1));
}
function champTimeLeft() { return 'còn ' + fmtDur(S.champ.end - Date.now()); }
function champScreen() {
  ensureChamp();
  const rows = champBoard();
  let html = `<h3>🏆 Giải Vô Địch · ${DIVS[S.champ.div]}</h3><p class="hint" style="margin:-4px 0 8px">Kết thúc ${champTimeLeft()} · Thắng +3 điểm · Top 3 thăng giải</p><div class="board">`;
  rows.forEach((r, i) => {
    if (i === 3) html += '<div class="zone">▲ Vùng thăng giải ▲</div>';
    if (i === 12) html += '<div class="zone r">▼ Vùng xuống giải ▼</div>';
    const bi = S.champ.bots.findIndex(b => b.name === r.name);
    html += `<div class="row ${r.me ? 'me' : ''}"><span class="rk">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span><span class="n">${r.name}</span><span class="p">${r.pts}đ</span>${r.me ? '' : `<button data-b="${bi}">Thách</button>`}</div>`;
  });
  html += `</div><div class="btns"><button class="btn" id="bBack">Đóng</button></div>`;
  modal(html, root => {
    bindBtns(root, { '#bBack': closeModal });
    root.querySelectorAll('button[data-b]').forEach(b => b.onclick = () => {
      const bot = S.champ.bots[+b.dataset.b];
      const op = genOpponent(powerOf(myStats()) * bot.lvl * (1 + S.champ.div * 0.04), Math.round(avgIlvl()), { name: bot.name });
      op.banner = bot.banner;
      vsScreen(op, {
        title: 'Giải Vô Địch', arena: 'dau-truong', note: `Đối thủ ${bot.lvl > 1.05 ? 'mạnh hơn' : bot.lvl < 0.95 ? 'yếu hơn' : 'ngang sức'} · Thắng +3 điểm, thua +0`,
        onEnd: (win) => {
          if (win) { S.champ.pts += 3; const g = 15 + dropLevel() * 5; S.gold += g; if (Math.random() < .35) queueChests([{ type: 'wood' }]); save(); resultModal(`<h3>Thắng!</h3><div class="reward-line"><span>+3 điểm</span><span>🪙 +${fmt(g)}</span></div>`); }
          else { save(); resultModal(`<h3 style="color:#ff6a5a">Thua</h3><p class="hint">Không mất điểm. Chọn đối thủ yếu hơn để leo hạng chắc chắn.</p>`); }
        },
      });
    });
  });
}

// ================== KHỞI ĐỘNG ==================
function bindUI() {
  document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { sfx('tap'); showTab(b.dataset.tab); });
  $('btnRanked').onclick = () => { sfx('tap'); startRanked(); };
  $('btnCampaign').onclick = () => { sfx('tap'); campaignScreen(); };
  $('btnDungeon').onclick = () => { sfx('tap'); dungeonScreen(); };
  $('btnChamp').onclick = () => { sfx('tap'); champScreen(); };
  $('btnName').onclick = () => {
    modal(`<h3>Hồ sơ hiệp sĩ</h3><input class="name" id="iName" maxlength="14" value="${S.name.replace(/"/g, '')}">
      <p style="margin:10px 0 6px;font-size:13px">Màu cờ hiệu:</p><div style="display:flex;gap:8px;flex-wrap:wrap">${BANNERS.map(c => `<button data-c="${c}" style="width:34px;height:34px;border-radius:8px;background:${c};border:3px solid ${c === S.banner ? '#fff' : 'transparent'}"></button>`).join('')}</div>
      <p class="hint">Thắng ${S.wins} · Thua ${S.losses} · Cúp cao nhất: ${LEAGUES[S.bestLeague].n}</p>
      <div class="btns"><button class="btn red" id="bReset">Chơi lại từ đầu</button><button class="btn ok" id="bSave">Lưu</button></div>`, root => {
      let col = S.banner;
      root.querySelectorAll('button[data-c]').forEach(b => b.onclick = () => { col = b.dataset.c; root.querySelectorAll('button[data-c]').forEach(x => x.style.borderColor = x.dataset.c === col ? '#fff' : 'transparent'); });
      bindBtns(root, {
        '#bSave': () => { S.name = (root.querySelector('#iName').value.trim() || 'Hiệp Sĩ').slice(0, 14); S.banner = col; save(); closeModal(); render(); },
        '#bReset': () => { const bt = root.querySelector('#bReset'); if (!bt.dataset.ok) { bt.dataset.ok = 1; bt.textContent = 'Bấm lần nữa để xóa hết'; return; } try { localStorage.removeItem(SAVE_KEY); } catch (e) { } S = newSave(); save(); closeModal(); render(); toast('Đã chơi lại từ đầu'); },
      });
    });
  };
}
function tutorial() {
  if (!S.tutorial) return;
  S.tutorial = false; save();
  modal(`<h3>⚔ Chào mừng tới Đấu Trường Hiệp Sĩ!</h3>
    <p style="font-size:14px;line-height:1.5">• Trận đấu diễn ra <b>tự động</b>: sức mạnh nằm ở <b>trang bị</b> bạn mặc.<br>
    • Đồ <b>Sử Thi (tím)</b> trở lên có <b>kỹ năng ẩn</b> (Chém Lửa, Sấm Sét, Hồi Phục…) kèm tỉ lệ kích hoạt.<br>
    • Thắng trận → nhận <b>rương</b> → so sánh và thay đồ mạnh hơn → leo hạng.<br>
    • Dùng vàng để <b>cường hóa</b>, thử sức ở Chiến Dịch, Hầm Ngục và Giải Vô Địch.<br>
    • 7 cấp đồ: Thường → Tinh Luyện → Hiếm → Sử Thi → Huyền Thoại → Truyền Thuyết → <b style="color:#ff3d6e">Thần Thoại</b>, và cực hiếm <b style="color:#ffd700">Siêu Thần</b>.<br>
    • Mặc đủ 4 món cùng bộ Thần Thoại/Siêu Thần để đổi tạo hình và nhận thưởng bộ. Quái có <b>hệ</b>: đánh khắc hệ +30%.</p>
    <p class="hint">Quà tân thủ: 1 Rương Bạc!</p>
    <div class="btns"><button class="btn ok" id="bOk">Mở quà</button></div>`, root => bindBtns(root, { '#bOk': () => { closeModal(); openChest('silver', 1); } }));
}

loadSprites();
load();
bindUI();
render();
requestAnimationFrame(homeLoop);
setInterval(() => { if ($('modal').classList.contains('hidden') && $('battle').classList.contains('hidden')) render(); }, 1000);
tutorial();
