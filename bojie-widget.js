// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: hard-hat;

// 柏捷工地小工具：iPhone 桌面小工具（在免費的 Scriptable App 裡跑）
// 使用者 2026-11-10 選「甲」：iPhone 網頁版不能放小工具，改用 Scriptable。
// 資料跟 Android App 的小工具一樣，從收件服務的 feed 拿：今日提醒、這週行程（灌漿、注意事項放進那一天）、待辦、最新消息。
// 代碼存在 iPhone 的鑰匙圈（Keychain），不寫在這個檔案裡；這個檔案放在 GitHub，打開 Scriptable 時會自己更新。
//
// 小工具大小：
//   小、中＝⏰ 今日提醒（中的最後一行是待辦）
//   大＝📅 這個月的月曆＋這週行程＋待辦（跟 Android 的「行事曆」小工具一樣）
//   特大（只有 iPad）＝左邊月曆、右邊今日提醒＋這週行程＋待辦
//   鎖定畫面也可以放（今日提醒）；Mac（macOS 14 以上）可以把 iPhone 的這個小工具放到 Mac 桌面
// 開發者（管理者）放最完整的（使用者 2026-11-14「開發人員的不管在手機還是蘋果，她的小工具都能支援到最完整的功能」「有日誌跟提醒功能」）：
//   特大＝跟摺疊機一樣三欄：月曆＋今日提醒｜這週＋待辦｜今天的日誌＋最新消息
//   大＝月曆＋今日提醒＋今天的日誌＋這週＋待辦＋最新消息（每樣少幾行）；中＝今日提醒＋日誌＋待辦
// 「Parameter」打字可以換內容：消息＝📣 最新消息、提醒＝⏰ 今日提醒、行事曆＝📅 這週行程、日誌＝📋 今天的日誌
// 點小工具：打開柏捷工地（網頁版，用 Safari。使用者 2026-11-19「為何這個點進去不會跑到柏捷app」；原本是打開 Scriptable 的完整清單）。
//   iPhone 的規定：點小工具一定先經過它的 App（Scriptable，閃一下）再跳到 Safari；主畫面那個「柏捷工地」圖示沒辦法從別的地方打開。
//   完整清單（待辦打勾、換代碼）還在：打開 Scriptable 點「柏捷工地」。
//   點小工具不再經過清單 → 小工具重畫的時候自己看有沒有新版（selfUpdate）。
// 11/19b（使用者「三個都做看看」）：點小工具可以選三種，存在鑰匙圈 bojie.widget.tap：
//   safari＝用 Safari 打開柏捷工地；full＝在 Scriptable 裡面全螢幕打開柏捷工地（試驗，不用再輸入代碼）；list＝完整清單（待辦打勾）；ask＝每次問。
//   沒選過＝每次問（11/19c：每個人都一樣。11/19b 施工人員是直接 Safari，使用者「apple 的沒有跳可以選擇的功能」——
//   那支可能是施工人員的代碼；而且 Scriptable 裡讀不到小工具存的暫存資料時也會被當成不用問）。清單最下面「👆 點小工具要打開什麼」可以換。
//   小工具右上角的時間前面寫版本（小的不寫）：截圖就看得出手機上是哪一版。
// 11/19d（使用者實機：選單有了，「進入 scriptable 要快一點」「他會先進入這個 app 然後停 1 秒才會進入柏捷 app」）：
//   全螢幕＝先放一張不用連網路的「打開中」馬上全螢幕，真的那一頁在畫面上自己載進來（原本整頁載完才顯示，所以停在 Scriptable）；
//   固定 Safari＝小工具直接開網址，不用先跑這支程式；清單＝先用上一次的資料打開，新的在後面拿。

const VER = '11/19d';
const API = 'https://script.google.com/macros/s/AKfycbyAF82NyYZZ81ISJ_r7_jPRP0rWNA4kLraB9uMkd2FuZwbnkOJ9SzuM9HaA-oymdXpQ/exec';
const WEB = 'https://a0923337553-ai.github.io/bojie-site/';
const SELF = WEB + 'bojie-widget.js';
// 點小工具打開的網址（?from=widget：網頁版的登入頁看到這個會說「這裡是 Safari，輸入一次代碼」，不叫他再加入主畫面）
const OPEN = WEB + '?from=widget';
// 在 Scriptable 裡面全螢幕打開的網址（?from=sapp：網頁版看到這個、又有記住的代碼，就自己進去，不用按「登入」）
const FULL = WEB + '?from=sapp';
const ORIGIN = 'https://a0923337553-ai.github.io';
// 點小工具打開什麼
const TAP_NAME = { safari: '🌐 柏捷工地（用 Safari 打開）', full: '📱 柏捷工地 全螢幕（試驗）', list: '📋 清單（待辦打勾）', ask: '❓ 每次問我' };
// 這個檔的最後一行。自己更新的時候要看到這一行才換（半份寫進去小工具會壞掉）→ 以後每一版最後一行都要留著
const END = '// END-' + 'BOJIE-WIDGET';
const KC = 'bojie.widget.code', KD = 'bojie.widget.device', KU = 'bojie.widget.updated', KT = 'bojie.widget.tap';
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

// ---------------- 顏色（深色模式也看得清楚） ----------------
const dyn = (l, d) => Color.dynamic(new Color(l), new Color(d));
const COL = {
  bg: dyn('#FFFFFF', '#1C1C1E'),
  text: dyn('#183B56', '#EEF2F5'),
  muted: dyn('#8A9BA8', '#9AA7B2'),
  past: dyn('#AAB7C1', '#5F6B75'),
  teal: new Color('#16A6A0'),
  head: dyn('#0F766E', '#5EEAD4'),
  hot: dyn('#C2412D', '#FF8A75'),
  orange: dyn('#E0662B', '#FFA36B'),
  sun: dyn('#C2412D', '#FF8A75'),
  line: dyn('#D5DEE5', '#3A3A3C'),
  green: dyn('#1E8E5A', '#4ADE80'),
  white: new Color('#FFFFFF'),
};

// ---------------- 日期、時間 ----------------
const pad = n => ('0' + n).slice(-2);
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const hm = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
function dateOf(s) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; }
function addDays(s, n) { const d = dateOf(s); d.setDate(d.getDate() + n); return ymd(d); }
/** 14:00 → 下午2:00（跟 App、收件服務一樣） */
function ampm(t) {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); if (!m) return t || '';
  const h = +m[1], w = h < 5 ? '凌晨' : h < 12 ? '上午' : h < 13 ? '中午' : h < 18 ? '下午' : '晚上';
  return w + (h % 12 === 0 ? 12 : h % 12) + ':' + m[2];
}
/** 今天 14:05／昨天 09:30／11/7 16:00 */
function timeWord(ms, now) {
  if (!ms || ms <= 0) return '';
  const t = new Date(ms), diff = Math.round((dateOf(ymd(now)) - dateOf(ymd(t))) / 86400000);
  return diff === 0 ? '今天 ' + hm(t) : diff === 1 ? '昨天 ' + hm(t) : (t.getMonth() + 1) + '/' + t.getDate() + ' ' + hm(t);
}

// ---------------- 代碼、手機編號（鑰匙圈） ----------------
const kget = k => (Keychain.contains(k) ? Keychain.get(k) : '');
function device() {
  let d = kget(KD);
  if (!d) {
    const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    d = 'w';
    for (let i = 0; i < 20; i++) d += a[Math.floor(Math.random() * a.length)];
    Keychain.set(KD, d);
  }
  return d;
}

// ---------------- 收件服務 ----------------
async function api(action, body, timeout) {
  const r = new Request(API);
  r.method = 'POST';
  r.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
  // client 'page'：跟網頁版一樣（收件服務不會要求更新 App）；via 只是記號
  const q = Object.assign({ action: action, code: kget(KC), client: 'page', via: 'widget', device: device() }, body || {});
  r.body = JSON.stringify(q);
  r.timeoutInterval = timeout || 25;
  let j = null;
  try { j = await r.loadJSON(); } catch (e) { throw { error: 'NET', message: '連不上收件服務（網路有問題）' }; }
  if (j && j.ok) return j;
  throw (j || { error: 'NET', message: '收件服務沒有回覆' });
}

// 上一次拿到的資料（沒網路時先顯示這份）
const LFM = FileManager.local();
const CACHE = LFM.joinPath(LFM.cacheDirectory(), 'bojie-widget-feed.json');
function readCache() { try { if (LFM.fileExists(CACHE)) return JSON.parse(LFM.readString(CACHE)); } catch (e) { } return null; }
function writeCache(o) { try { if (o) LFM.writeString(CACHE, JSON.stringify(o)); else if (LFM.fileExists(CACHE)) LFM.remove(CACHE); } catch (e) { } }

/** state：ok＝剛拿到、old＝沒網路用上一次的、nocode＝還沒設代碼、gone＝代碼不能用了、locked、err */
async function getData(fresh) {
  if (!kget(KC)) return { state: 'nocode' };
  try {
    const f = await api('feed', fresh ? { fresh: true } : {});
    const at = Date.now();
    writeCache({ at: at, f: f });
    return { state: 'ok', at: at, f: f };
  } catch (e) {
    // 代碼被停用、換掉：不要再一直送（打錯太多次這支手機會被鎖）
    if (e && e.error === 'CODE') { Keychain.remove(KC); writeCache(null); return { state: 'gone', msg: e.message || '' }; }
    if (e && e.error === 'LOCKED') return { state: 'locked', msg: e.message || '' };
    const c = readCache();
    if (c && c.f) return { state: 'old', at: c.at, f: c.f, msg: (e && e.message) || '' };
    return { state: 'err', msg: (e && (e.message || e.error)) || '連不上收件服務' };
  }
}

// ---------------- 要顯示什麼（跟 Android 的 SiteWidget 一樣） ----------------
/** 一行：k 0＝一般、1＝紅字、2＝標題（粗體）、3＝灰字、4＝綠字 */
const R = (t, k) => ({ t: t, k: k || 0 });

/** 收件服務的「今天」不是今天（昨天拿的）：不能把昨天的「今天…」當成今天 */
const stale = f => !!(f && f.today && f.today !== ymd(new Date()));

/** noLog：旁邊已經有「📋 今天的日誌」（開發者）→「📋 A、B 今天還沒填施工日誌」那行不用重複 */
function remRows(f, noLog) {
  if (!f) return [];
  if (stale(f)) return [R('還沒有今天的提醒，點一下更新', 3)];
  const list = (f.reminders || []).filter(r => !(noLog && /今天還沒填施工日誌$/.test(String(r.text || '')))).map(r => R(r.text, r.hot ? 1 : 0));
  return list.length ? list : [R('今天沒有要特別注意的事 👍', 3)];
}

/** 這週行程的事件：行程（只有開發者、老闆、主任、公司）＋有選日期的注意事項＋這週灌漿 */
function weekEvents(f) {
  const ev = [];
  (f.cal || []).forEach(e => ev.push({ date: e.date, end: e.endDate || e.date, allDay: !!e.allDay, start: e.start || '', title: e.title || '', site: e.site || '', o: 2 }));
  (f.news || []).filter(n => n.kind === 'notice' && n.date).forEach(n => {
    const t = String(n.text || ''), i = t.indexOf('：');
    ev.push({ date: n.date, end: n.date, allDay: true, start: '', title: (i >= 0 ? t.slice(i + 1) : t).replace(/\s+/g, ' ').trim(), site: n.site || '', o: 1 });
  });
  (f.pourWeek || []).filter(p => p.date).forEach(p => {
    const qty = p.m3 ? ' ' + p.m3 + ' m³' + (p.trucks ? '（約 ' + p.trucks + ' 車）' : '') : '';
    ev.push({ date: p.date, end: p.date, allDay: true, start: '', title: (p.part ? p.part + ' ' : '') + '灌漿' + qty, site: p.site || '', o: 0 });
  });
  return ev;
}
/** 今天起 8 天，有事的那幾天：label＝今天／明天／11/12（四），short＝今天／明天／11/12；先 🚚 灌漿、📢 注意事項，再行程 */
function weekDays(f) {
  const today = ymd(new Date()), ev = weekEvents(f), out = [];
  for (let i = 0; i <= 7; i++) {
    const ds = addDays(today, i);
    const evs = ev.filter(e => e.date <= ds && e.end >= ds).sort((a, b) =>
      a.o - b.o || (a.allDay === b.allDay ? 0 : a.allDay ? -1 : 1) || (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
    if (!evs.length) continue;
    const d = dateOf(ds), md = (d.getMonth() + 1) + '/' + d.getDate();
    out.push({
      label: i === 0 ? '今天' : i === 1 ? '明天' : md + '（' + WEEK[d.getDay()] + '）',
      short: i === 0 ? '今天' : i === 1 ? '明天' : md,
      items: evs.map(e => {
        const site = e.site ? '（' + e.site + '）' : '';
        if (e.o === 0) return R('🚚 ' + site + e.title, 1);
        if (e.o === 1) return R('📢 ' + site + e.title, 1);
        return R(e.title + site + (e.allDay || !e.start ? '' : '（' + ampm(e.start) + '）'));
      }),
    });
  }
  return out;
}
const weekEmpty = f => (f.cal ? '這週沒有行程' : '這週沒有灌漿、注意事項');
/** 完整清單用：一天一個標題 */
function weekRows(f) {
  const out = [];
  weekDays(f).forEach(d => { out.push(R(d.label, 2)); d.items.forEach(x => out.push(x)); });
  return out.length ? out : [R(weekEmpty(f), 3)];
}
const weekTitle = f => (f.cal ? '📅 這週行程' : '📅 這週灌漿・注意事項');

/** 待辦（施工人員沒有 → null）：還沒做的在上面（還沒做多的工地排前面），做完的在下面 */
function todoList(f) {
  if (!f || !f.todos) return null;
  const open = f.todos.map(t => ({ id: t.id, site: t.site || '', text: t.text || '', done: false }));
  const done = (f.todosDone || []).map(t => ({ id: t.id, site: t.site || '', text: t.text || '', done: true, by: t.doneBy || '', at: t.doneAt || 0 }));
  const cnt = {}; open.forEach(t => { cnt[t.site] = (cnt[t.site] || 0) + 1; });
  open.sort((a, b) => (cnt[b.site] - cnt[a.site]) || (a.site < b.site ? -1 : a.site > b.site ? 1 : 0));
  done.sort((a, b) => b.at - a.at);
  return open.concat(done);
}
const todoLabel = t => (t.done ? '☑ （' + t.site + '）' + t.text + '　— ' + (t.by || '有人') + ' 完成' : '☐ （' + t.site + '）' + t.text);

/** 開發者（管理者）：小工具放最完整的 */
const isDev = f => !!(f && f.role === '管理者');
/**
 * 今天的日誌（開發者）：進行中的工地（跟收件服務一樣：開工了、還沒完工、不算測試）裡，
 * 今日提醒那行「📋 A、B 今天還沒填施工日誌」寫到的＝還沒填，其他＝已填。收件服務的「今天」不是今天＝null
 */
function logToday(f) {
  if (!f || !f.today || stale(f)) return null;
  const today = f.today, empty = {};
  (f.reminders || []).forEach(r => {
    const m = /^📋 (.+) 今天還沒填施工日誌$/.exec(String(r.text || ''));
    if (m) m[1].split('、').forEach(n => { empty[n.trim()] = 1; });
  });
  return (f.sites || []).filter(s => !/測試/.test(s.name || '') && (!s.start || s.start <= today) && (!s.end || s.end >= today))
    .map(s => ({ site: s.name, done: !empty[s.name] }));
}
function logRows(f) {
  const l = logToday(f);
  if (!l) return [R('還沒有今天的資料，點一下更新', 3)];
  if (!l.length) return [R('今天沒有進行中的工地', 3)];
  return l.map(x => R((x.done ? '✓ ' : '✗ ') + x.site + (x.done ? ' 已填' : ' 還沒填'), x.done ? 4 : 1));
}
/** 擠成一行：📋 日誌　✓巫紹安　✗陳佩君（全部填了＝綠字，有還沒填的＝紅字） */
function logLine(f) {
  const l = logToday(f);
  if (!l || !l.length) return null;
  return { t: '📋 日誌　' + l.map(x => (x.done ? '✓' : '✗') + x.site).join('　'), ok: l.every(x => x.done) };
}

/** 最新消息前面的標籤（跟 App 一樣） */
function newsLabel(kind, tag) {
  switch (kind) {
    case 'worker': return ['施工人員', '#1D4F91'];
    case 'pour': return ['灌漿數量', '#F09A4A'];
    case 'sheet': return ['施工單', '#16A6A0'];
    case 'contract': return ['發包', '#9B51E0'];
    case 'notice': return ['注意事項', '#E0662B'];
    case 'todo': return [tag === 'done' ? '待辦完成' : '新增待辦', '#1E8E5A'];
    case 'mark': return [tag === 'done' ? '3D 改好了' : '3D 要改進', '#E03131'];
    case 'task': return [tag === 'got' ? '派工收到' : tag === 'done' ? '派工做好了' : '派工', '#F28C28'];
    case 'snote': return [tag === 'give' ? '施工單記號給你' : '施工單記號', '#B08900'];
    case 'cal': return ['行事曆', '#2F80ED'];
    default: return ['消息', '#5D7486'];
  }
}
function newsItems(f) {
  const now = new Date();
  return (f.news || []).filter(n => n.kind !== 'cal').sort((a, b) => (b.at || 0) - (a.at || 0)).map(n => {
    const lb = newsLabel(n.kind, n.tag);
    return { label: lb[0], color: lb[1], text: (n.site ? n.site + '　' : '') + (n.text || ''), sub: timeWord(n.at, now) };
  });
}

// ---------------- 畫小工具 ----------------
function txt(st, s, size, color, o) {
  o = o || {};
  const t = st.addText(String(s));
  t.font = o.bold ? Font.boldSystemFont(size) : o.semi ? Font.semiboldSystemFont(size) : Font.systemFont(size);
  t.textColor = color || COL.text;
  t.lineLimit = o.lines || 1;
  t.minimumScaleFactor = o.scale || 0.8;
  return t;
}
function stamp(d) {
  if (!d.at) return null;
  const t = new Date(d.at), today = ymd(t) === ymd(new Date());
  return { t: (today ? hm(t) : (t.getMonth() + 1) + '/' + t.getDate() + ' ' + hm(t)) + (d.state === 'old' ? ' 舊資料' : ' 更新'), old: d.state === 'old' };
}
let FAM = '';   // 現在在畫哪一種大小（buildWidget 設的）
function header(w, title, d, size) {
  const h = w.addStack(); h.layoutHorizontally(); h.centerAlignContent();
  txt(h, title, size || 13, COL.head, { bold: true });
  h.addSpacer();
  const s = stamp(d);
  // 時間前面寫版本（小的放不下不寫）：截圖就看得出這支手機的小工具是哪一版
  if (s) txt(h, (FAM === 'small' ? '' : VER + '版　') + s.t, 9.5, s.old ? COL.orange : COL.muted);
  w.addSpacer(3);
}
/** 一串字；超過 max 行：最後一行寫「還有 N 則」 */
function rows(w, list, max, size, lines) {
  let shown = list;
  if (list.length > max) shown = list.slice(0, Math.max(0, max - 1)).concat([R('還有 ' + (list.length - max + 1) + ' 則（點一下看全部）', 3)]);
  shown.forEach(r => {
    const color = r.k === 1 ? COL.hot : r.k === 2 ? COL.head : r.k === 3 ? COL.muted : r.k === 4 ? COL.green : COL.text;
    txt(w, r.t, r.k === 2 ? size - 0.5 : size, color, { bold: r.k === 2, lines: r.k === 2 ? 1 : (lines || 1) });
  });
}
const colorOf = k => (k === 1 ? COL.hot : k === 2 ? COL.head : k === 3 ? COL.muted : k === 4 ? COL.green : COL.text);
/** 小工具的這週行程（擠一點）：左邊一欄日期（那天第一行才寫），右邊事情；超過 max 行寫「還有 N 則」 */
function weekBlock(w, f, max, size) {
  const flat = [];
  weekDays(f).forEach(d => d.items.forEach((x, i) => flat.push({ day: i === 0 ? d.short : '', r: x })));
  if (!flat.length) { txt(w, weekEmpty(f), size, COL.muted); return; }
  let shown = flat;
  if (flat.length > max) shown = flat.slice(0, Math.max(0, max - 1));
  shown.forEach(x => {
    const s = w.addStack(); s.layoutHorizontally(); s.centerAlignContent();
    const dc = s.addStack(); dc.size = new Size(Math.round(size * 3), 0);
    txt(dc, x.day, size - 1, COL.head, { bold: true, scale: 0.8 });
    txt(s, x.r.t, size, colorOf(x.r.k));
  });
  if (shown.length < flat.length) txt(w, '還有 ' + (flat.length - shown.length) + ' 則（點一下看全部）', size, COL.muted);
}
function divider(w) {
  w.addSpacer(4);
  const l = w.addStack(); l.size = new Size(0, 1); l.backgroundColor = COL.line; l.addSpacer();
  w.addSpacer(4);
}
function todoRows(todos, max) {
  const open = todos.filter(t => !t.done);
  if (!open.length) return [R('都做完了 👍', 3)];
  const out = open.slice(0, max).map(t => R(todoLabel(t)));
  if (open.length > max) out[max - 1] = R('還有 ' + (open.length - max + 1) + ' 項（點一下看全部）', 3);
  return out;
}

/** 這個月的月曆：今天綠底白字；有事的那天下面一個點（綠＝行程、橘＝灌漿／注意事項） */
function monthGrid(w, f) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), today = ymd(now);
  const lead = new Date(y, m, 1, 12).getDay(), days = new Date(y, m + 1, 0, 12).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  while (cells.length % 7) cells.push(null);
  const marks = f.marks || {}, CW = 34;
  const hr = w.addStack(); hr.layoutHorizontally();
  WEEK.forEach((n, i) => {
    if (i) hr.addSpacer();
    const c = hr.addStack(); c.size = new Size(CW, 13); c.centerAlignContent();
    txt(c, n, 9.5, i === 0 ? COL.sun : COL.muted, { semi: true, scale: 1 });
  });
  for (let r = 0; r < cells.length / 7; r++) {
    const row = w.addStack(); row.layoutHorizontally();
    for (let i = 0; i < 7; i++) {
      if (i) row.addSpacer();
      const n = cells[r * 7 + i];
      const c = row.addStack(); c.size = new Size(CW, 18); c.layoutVertically(); c.centerAlignContent();
      if (n == null) continue;
      const ds = y + '-' + pad(m + 1) + '-' + pad(n), isT = ds === today;
      if (isT) { c.backgroundColor = COL.teal; c.cornerRadius = 6; }
      c.addSpacer();
      txt(c, n, 10.5, isT ? COL.white : ds < today ? COL.past : i === 0 ? COL.sun : COL.text, { bold: isT, scale: 1 });
      const k = marks[ds] || [], dots = [];
      if (k.indexOf('cal') >= 0) dots.push(COL.teal);
      if (k.indexOf('pour') >= 0 || k.indexOf('notice') >= 0) dots.push(COL.orange);
      const dr = c.addStack(); dr.layoutHorizontally(); dr.spacing = 1;
      if (!dots.length) txt(dr, ' ', 4.5, COL.muted, { scale: 1 });
      else dots.forEach(col => txt(dr, '●', 4.5, isT ? COL.white : col, { scale: 1 }));
      c.addSpacer();
    }
  }
  // 圖例
  w.addSpacer(2);
  const lg = w.addStack(); lg.layoutHorizontally(); lg.centerAlignContent();
  const anyCal = Object.keys(marks).some(d => (marks[d] || []).indexOf('cal') >= 0);
  if (anyCal) { txt(lg, '●', 7, COL.teal); txt(lg, ' 行程　', 9, COL.muted); }
  txt(lg, '●', 7, COL.orange); txt(lg, ' 灌漿／注意事項', 9, COL.muted);
  return cells.length / 7;
}

function newsRows(w, f, max, size, small) {
  const list = newsItems(f);
  if (!list.length) { txt(w, '最近沒有新消息', size, COL.muted); return; }
  list.slice(0, max).forEach(n => {
    if (small) {
      txt(w, n.label + '　' + n.sub, size - 1.5, new Color(n.color), { bold: true });
      txt(w, n.text, size, COL.text, { lines: 2 });
      return;
    }
    const s = w.addStack(); s.layoutHorizontally(); s.centerAlignContent();
    txt(s, n.label, size - 1, new Color(n.color), { bold: true, scale: 1 });
    s.addSpacer(5);
    txt(s, n.text, size, COL.text);
    s.addSpacer(4);
    txt(s, n.sub.replace(/^今天 /, ''), size - 2.5, COL.muted, { scale: 1 });
  });
}

/** 沒有資料可以畫（還沒設代碼、代碼不能用、鎖住、連不上） */
function messageWidget(w, d, fam) {
  const small = fam === 'small';
  txt(w, '柏捷工地', small ? 14 : 15, COL.head, { bold: true });
  w.addSpacer(6);
  const msg = d.state === 'nocode' ? '還沒設定代碼\n點一下這裡設定'
    : d.state === 'gone' ? '代碼不能用了（停用或換了）\n點一下重新設定'
      : d.state === 'locked' ? (d.msg || '這支手機鎖住了，請找管理者')
        : '連不上收件服務，等一下會再試\n' + (d.msg || '');
  txt(w, msg, small ? 12 : 13, d.state === 'err' ? COL.muted : COL.hot, { lines: 5 });
  w.addSpacer();
}

/** 小工具（fam：small／medium／large／extraLarge／accessory…；p＝Parameter） */
function buildWidget(d, fam, p) {
  fam = fam || 'medium';
  p = String(p || '').trim();
  const w = new ListWidget();
  w.refreshAfterDate = new Date(Date.now() + 15 * 60000);
  const kind = /消息|news/i.test(p) ? 'news' : /行事曆|月曆|行程|cal/i.test(p) ? 'cal' : /提醒|rem/i.test(p) ? 'rem' : /日誌|log/i.test(p) ? 'log' : '';
  const f = d.f;
  // 點小工具（11/19b）：沒資料（還沒設代碼、代碼不能用…）→ 打開 Scriptable 的清單去設定；
  // 其他 → 先回 Scriptable 照設定走（?tap=1，見 tapMain）：改了設定馬上有效，不用等小工具重畫
  const run = 'scriptable:///run/' + encodeURIComponent(Script.name());
  // 固定用 Safari 的：直接開網址最快（不用先跑這支程式）。改設定以後要等小工具重畫才會照新的
  w.url = !f ? run : tapMode() === 'safari' ? OPEN : run + '?tap=1' + (kind ? '&show=' + kind : '');
  FAM = fam;

  // 鎖定畫面
  if (fam.indexOf('accessory') === 0) {
    if (!f) { txt(w, d.state === 'nocode' || d.state === 'gone' ? '柏捷工地：要設定代碼' : '柏捷工地：連不上', 12, null, { lines: 2 }); return w; }
    const list = remRows(f);
    const n = (f.reminders || []).length;
    if (fam === 'accessoryInline') { txt(w, '⏰ ' + (n && !stale(f) ? list[0].t : '今天沒有提醒'), 12); return w; }
    if (fam === 'accessoryCircular') {
      w.addAccessoryWidgetBackground = true;
      txt(w, '⏰', 12, null, { scale: 1 }).centerAlignText();
      txt(w, String(stale(f) ? '–' : n), 18, null, { bold: true, scale: 0.6 }).centerAlignText();
      return w;
    }
    txt(w, '⏰ 今日提醒 ' + (stale(f) ? '' : n), 12, null, { bold: true });
    list.slice(0, 2).forEach(r => txt(w, r.t, 11, null, { lines: 1 }));
    return w;
  }

  w.backgroundColor = COL.bg;
  const pd = fam === 'small' ? 12 : 14;
  w.setPadding(pd, pd, pd - 2, pd);
  w.spacing = 1.5;
  if (!f) { messageWidget(w, d, fam); return w; }

  const big = fam === 'large' || fam === 'extraLarge';
  const todos = todoList(f);
  const show = kind || (big ? 'cal' : 'rem');
  const dev = isDev(f);
  const Y = new Date().getFullYear(), M = new Date().getMonth() + 1;

  if (fam === 'extraLarge' && dev && (show === 'cal' || show === 'rem')) {
    // 開發者 iPad 特大：跟摺疊機「全部資料」一樣三欄（多了今天的日誌）
    header(w, '📅 ' + Y + ' 年 ' + M + ' 月　柏捷工地', d, 13.5);
    const row = w.addStack(); row.layoutHorizontally(); row.topAlignContent();
    const c1 = row.addStack(); c1.layoutVertically(); c1.size = new Size(262, 0);
    const weeks = monthGrid(c1, f);
    c1.addSpacer(6);
    txt(c1, '⏰ 今日提醒', 12, COL.head, { bold: true });
    rows(c1, remRows(f, true), weeks >= 6 ? 4 : 5, 11.5);
    c1.addSpacer();
    row.addSpacer(14);
    const c2 = row.addStack(); c2.layoutVertically(); c2.size = new Size(215, 0);
    txt(c2, weekTitle(f), 12, COL.head, { bold: true });
    weekBlock(c2, f, todos ? 9 : 15, 11.5);
    if (todos) {
      divider(c2);
      txt(c2, '✅ 待辦 ' + todos.filter(t => !t.done).length, 12, COL.green, { bold: true });
      rows(c2, todoRows(todos, 4), 9, 11.5);
    }
    c2.addSpacer();
    row.addSpacer(14);
    const c3 = row.addStack(); c3.layoutVertically();
    txt(c3, '📋 今天的日誌', 12, COL.head, { bold: true });
    rows(c3, logRows(f), 4, 11.5);
    divider(c3);
    txt(c3, '📣 最新消息', 12, COL.head, { bold: true });
    newsRows(c3, f, 4, 11.5, true);
    c3.addSpacer();
  } else if (fam === 'large' && dev && show === 'cal') {
    // 開發者 iPhone 大：月曆＋今日提醒＋今天的日誌＋這週＋待辦＋最新消息，每樣少幾行（點一下看全部）
    header(w, '📅 ' + Y + ' 年 ' + M + ' 月', d, 13);
    const weeks = monthGrid(w, f);
    w.addSpacer(4);
    const ll = logLine(f);
    txt(w, '⏰ 今日提醒', 11.5, COL.head, { bold: true });
    rows(w, remRows(f, !!ll), weeks >= 6 ? 2 : 3, 11);
    if (ll) txt(w, ll.t, 11, ll.ok ? COL.green : COL.hot, { semi: true });
    w.addSpacer(2);
    txt(w, weekTitle(f), 11.5, COL.head, { bold: true });
    weekBlock(w, f, 2, 11);
    if (todos) {
      const open = todos.filter(t => !t.done);
      txt(w, '✅ 待辦 ' + open.length + (open.length ? '：' + open.slice(0, 3).map(t => t.text).join('、') : '　都做完了'), 11, COL.green, { semi: true });
    }
    const n = newsItems(f)[0];
    if (n) txt(w, '📣 ' + n.label + '　' + n.text, 11, COL.text);
  } else if (show === 'log') {
    header(w, '📋 今天的日誌', d, fam === 'small' ? 12 : 13);
    rows(w, logRows(f), fam === 'small' ? 4 : big ? 12 : 5, fam === 'small' ? 11.5 : 12.5);
  } else if (fam === 'extraLarge' && show !== 'news') {
    // iPad 特大（使用者 2026-11-10「ipad也要適配」）：左邊這個月的月曆，右邊今日提醒＋這週行程＋待辦
    header(w, '📅 ' + new Date().getFullYear() + ' 年 ' + (new Date().getMonth() + 1) + ' 月　柏捷工地', d, 13.5);
    const row = w.addStack(); row.layoutHorizontally(); row.topAlignContent();
    const left = row.addStack(); left.layoutVertically(); left.size = new Size(275, 0);
    monthGrid(left, f);
    left.addSpacer();
    row.addSpacer(18);
    const right = row.addStack(); right.layoutVertically();
    const rem = remRows(f), open = todos ? todos.filter(t => !t.done) : null;
    txt(right, '⏰ 今日提醒', 12, COL.head, { bold: true });
    const remN = Math.min(rem.length, 6);
    rows(right, rem, 6, 12);
    divider(right);
    const tl = todos ? 1 + Math.min(3, Math.max(1, open.length)) : 0;
    txt(right, weekTitle(f), 12, COL.head, { bold: true });
    weekBlock(right, f, Math.max(3, 19 - 1 - remN - 1 - tl - (todos ? 1 : 0)), 12);
    if (todos) {
      divider(right);
      txt(right, '✅ 待辦 ' + open.length, 12, COL.green, { bold: true });
      rows(right, todoRows(todos, tl - 1), 9, 12);
    }
    right.addSpacer();
  } else if (show === 'news') {
    header(w, '📣 最新消息', d, fam === 'small' ? 12 : 13);
    newsRows(w, f, fam === 'small' ? 2 : big ? 12 : 5, fam === 'small' ? 11.5 : 12, fam === 'small');
  } else if (show === 'cal' && big) {
    header(w, '📅 ' + new Date().getFullYear() + ' 年 ' + (new Date().getMonth() + 1) + ' 月', d, 13);
    const weeks = monthGrid(w, f);
    divider(w);
    // 月曆下面大約還有幾行（6 週的月份少一行）
    const budget = weeks >= 6 ? 10 : 11, tl = todos ? 1 + Math.min(3, Math.max(1, todos.filter(t => !t.done).length)) : 0;
    txt(w, weekTitle(f), 11.5, COL.head, { bold: true });
    weekBlock(w, f, budget - 1 - tl - (todos ? 1 : 0), 11.5);
    if (todos) {
      divider(w);
      txt(w, '✅ 待辦 ' + todos.filter(t => !t.done).length, 11.5, COL.green, { bold: true });
      rows(w, todoRows(todos, tl - 1), 9, 11.5);
    }
  } else if (show === 'cal') {
    header(w, weekTitle(f), d, fam === 'small' ? 12 : 13);
    weekBlock(w, f, 7, fam === 'small' ? 11 : 12);
  } else {
    // 今日提醒
    header(w, '⏰ 今日提醒', d, fam === 'small' ? 12 : 13);
    const list = remRows(f);
    if (fam === 'small') rows(w, list, 4, 11.5, 2);
    else if (big) {
      rows(w, list, 7, 12.5);
      divider(w);
      txt(w, weekTitle(f), 12, COL.head, { bold: true });
      weekBlock(w, f, todos ? 6 : 10, 12);
      if (todos) {
        divider(w);
        txt(w, '✅ 待辦 ' + todos.filter(t => !t.done).length, 12, COL.green, { bold: true });
        rows(w, todoRows(todos, 3), 9, 12);
      }
    } else if (dev && fam === 'medium') {
      // 開發者中：今日提醒＋今天的日誌＋待辦
      const open = todos ? todos.filter(t => !t.done) : null, ll = logLine(f);
      rows(w, ll ? remRows(f, true) : list, 4, 12.5);
      w.addSpacer(2);
      if (ll) txt(w, ll.t, 12, ll.ok ? COL.green : COL.hot, { semi: true });
      if (open && open.length) txt(w, '✅ 待辦 ' + open.length + '：' + open.slice(0, 3).map(t => t.text).join('、'), 12, COL.green, { semi: true });
    } else {
      const open = todos ? todos.filter(t => !t.done) : null;
      rows(w, list, open && open.length ? 5 : 6, 12.5);
      if (open && open.length) {
        w.addSpacer(2);
        txt(w, '✅ 待辦 ' + open.length + '：' + open.slice(0, 3).map(t => t.text).join('、'), 12, COL.green, { semi: true });
      }
    }
  }
  w.addSpacer();
  return w;
}

// ---------------- 在 Scriptable 裡打開：完整清單 ----------------
async function say(title, msg, ok) {
  const a = new Alert(); a.title = title; a.message = msg || ''; a.addAction(ok || '好');
  return a.presentAlert();
}
async function askCode(why) {
  for (; ;) {
    const a = new Alert();
    a.title = '柏捷工地小工具';
    a.message = (why ? why + '\n\n' : '') + '輸入你的代碼（跟登入柏捷工地的一樣；沒有的話找管理者拿）';
    a.addTextField('代碼', '');
    a.addAction('確定');
    a.addCancelAction('取消');
    const i = await a.presentAlert();
    if (i < 0) return false;
    const c = a.textFieldValue(0).trim().toUpperCase();
    if (!c) continue;
    const old = kget(KC);
    Keychain.set(KC, c);
    try { await api('feed', {}); return true; } catch (e) {
      if (old) Keychain.set(KC, old); else Keychain.remove(KC);
      why = (e && e.message) || '代碼不對';
      if (e && e.error === 'LOCKED') { await say('這支手機鎖住了', why); return false; }
    }
  }
}
/** 看 GitHub 上有沒有新版（1 小時最多看一次；force＝現在就看）：在 Scriptable 裡打開的時候、小工具自己重畫的時候都看；有新版就把這個檔換掉，回傳新的版本 */
async function selfUpdate(force) {
  try {
    if (!force && Date.now() - (Number(kget(KU)) || 0) < 3600000) return '';   // 1 小時最多看一次（11/19b；原本 6 小時，要等太久）
    Keychain.set(KU, String(Date.now()));
    const r = new Request(SELF + '?t=' + Date.now()); r.timeoutInterval = 8;
    const src = await r.loadString();
    const m = /const VER = '([^']+)'/.exec(src);
    if (src.indexOf('柏捷工地小工具') < 0 || !m || m[1] === VER) return '';
    if (src.trim().slice(-END.length) !== END) return '';   // 沒下載完整
    const fm = module.filename.indexOf('iCloud~') >= 0 ? FileManager.iCloud() : FileManager.local();
    fm.writeString(module.filename, src);
    return m[1];
  } catch (e) { return ''; }
}

/** 點小工具要打開什麼：選過的照選的；沒選過＝每次問（每個人都一樣） */
function tapMode() {
  const m = kget(KT);
  return TAP_NAME[m] ? m : 'ask';
}
/** 固定用哪一種（withAsk＝也可以選「每次問我」）；回傳選的那一種，取消＝'' */
async function pickTap(withAsk) {
  const ks = withAsk ? ['safari', 'full', 'list', 'ask'] : ['safari', 'full', 'list'];
  const a = new Alert();
  a.title = '以後點小工具都打開哪一個？';
  a.message = '之後要換：打開 Scriptable → 點「柏捷工地」→ 最下面「👆 點小工具要打開什麼」。\n（改了以後，桌面的小工具過幾分鐘才會照新的。）';
  ks.forEach(k => a.addAction(TAP_NAME[k]));
  a.addCancelAction('取消');
  const i = await a.presentSheet();
  if (i < 0 || i >= ks.length) return '';
  Keychain.set(KT, ks[i]);
  return ks[i];
}
/** 「每次問我」：點小工具先跳這個選單；回傳 safari／full／list，取消＝'' */
async function askTap() {
  const ks = ['safari', 'full', 'list'];
  const a = new Alert();
  a.title = '要打開哪一個？';
  a.message = '三種都可以試。試好了，選最下面那個固定用一種，以後就不會再問。';
  ks.forEach(k => a.addAction(TAP_NAME[k]));
  a.addAction('⚙️ 固定用一種，以後不要問');
  a.addCancelAction('取消');
  const i = await a.presentSheet();
  if (i < 0) return '';
  return i < ks.length ? ks[i] : pickTap(false);
}
/**
 * 全螢幕打開柏捷工地（試驗）：在 Scriptable 裡面開網頁版，沒有 Safari 的網址列。
 * 這支手機的代碼（鑰匙圈裡的）直接放進那一頁在這支手機上的儲存區，不放在網址上 → 不用再輸入代碼；網頁版看到 ?from=sapp 會自己進去。
 * 打不開就改用 Safari。
 */
function fullScript() {
  return '(function(){try{if(location.origin!==' + JSON.stringify(ORIGIN) + ')return "x";' +
    'var c=' + JSON.stringify(kget(KC)) + ',d=' + JSON.stringify(device()) + ',L=localStorage,had=L.getItem("bojie.code")||"";' +
    'if(!L.getItem("bojie.device"))L.setItem("bojie.device",d);' +
    'if(had===c)return "ok";' +
    '["sess","feed","here","fc","seen"].forEach(function(k){L.removeItem("bojie."+k)});' +
    'L.setItem("bojie.code",c);return "set"}catch(e){return "err"}})()';
}
/** 全螢幕一開始那張「打開中」：不用連網路，馬上出得來；5 秒還沒換成柏捷工地就多一顆按鈕可以自己點 */
const LOADING = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<style>html,body{height:100%;margin:0}body{display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,sans-serif;background:#F0F5F8;color:#183B56}' +
  'b{font-size:28px;color:#16A6A0}p{font-size:16px;color:#5D7486;margin:10px 0 0}a{display:none;margin-top:22px;font-size:17px;color:#fff;background:#16A6A0;padding:11px 20px;border-radius:12px;text-decoration:none}' +
  '@media(prefers-color-scheme:dark){body{background:#1C1C1E;color:#EEF2F5}p{color:#9AA7B2}}</style></head>' +
  '<body><b>柏捷工地</b><p>打開中…</p><a id="go" href="' + FULL + '">沒有自己打開？點這裡</a>' +
  '<script>setTimeout(function(){document.getElementById("go").style.display="block"},5000)</script></body></html>';
async function openFull() {
  try {
    const wv = new WebView();
    let r = '';
    // 快的做法（11/19d）：先放「打開中」那一張（網址算在柏捷工地底下 → 代碼可以先放好），馬上全螢幕；它自己換成真的那一頁，只載一次
    try {
      await wv.loadHTML(LOADING, WEB);
      r = await wv.evaluateJavaScript('(function(){var r=' + fullScript() + ';if(r==="ok"||r==="set")setTimeout(function(){location.replace(' + JSON.stringify(FULL) + ')},20);return r})()', false);
    } catch (e) { r = ''; }
    if (r !== 'ok' && r !== 'set') {
      // 快的做法不行（那一張沒有算在柏捷工地底下…）：照原本的，整頁載完再顯示
      await wv.loadURL(FULL);
      r = await wv.evaluateJavaScript(fullScript(), false);
      if (r === 'set') await wv.loadURL(FULL);   // 第一次（或換過代碼）：再載一次，網頁版就用這個代碼自己進去
    }
    await wv.present(true);
  } catch (e) {
    await say('全螢幕打不開', ((e && e.message) || String(e)) + '\n\n改用 Safari 打開。');
    Safari.open(OPEN);
  }
}
/** 點小工具進來的（scriptable:///run/…?tap=1）：照設定打開 Safari／全螢幕／清單 */
async function tapMain(show) {
  if (!kget(KC)) return appMain(show);   // 還沒設代碼：清單（會先問代碼）
  let mode = tapMode();
  if (mode === 'ask') mode = await askTap();
  if (!mode) return;
  if (mode === 'safari') { Safari.open(OPEN); return; }
  if (mode === 'full') return openFull();
  return appMain(show);
}

const HOWTO = '放到桌面：\n① 回到桌面，長按空白的地方\n② 左上角「編輯」→「加入小工具」\n③ 搜尋「Scriptable」，選大小 →「加入小工具」\n④ 點一下剛放好的小工具，「Script」選「柏捷工地」\n\n' +
  '點小工具：可以選打開「柏捷工地（Safari）」「柏捷工地 全螢幕（試驗）」或「清單」；清單最下面「👆 點小工具要打開什麼」可以換。\n\n小、中＝今日提醒；大＝月曆＋這週行程＋待辦；特大（iPad）＝左邊月曆、右邊今日提醒＋這週＋待辦。\n開發者：大、特大是最完整的（多了今天的日誌、最新消息）。\n「Parameter」打「消息」＝最新消息、「日誌」＝今天的日誌。\n鎖定畫面也可以放。\n\nMac：macOS 14 以上可以把這支 iPhone 的小工具放到 Mac 桌面（桌面按右鍵 →「編輯小工具」→ iPhone 的 Scriptable）。';

async function appMain(show) {
  if (!kget(KC)) {
    const ok = await askCode('');
    if (!ok) return;
  }
  // 快一點（11/19d）：有上一次的資料就先用它把清單打開，新的資料、有沒有新版在後面拿，拿到再換上去
  const c0 = readCache();
  let upd = '', loading = !!(c0 && c0.f);
  let d = loading ? { state: 'ok', at: c0.at, f: c0.f } : await getData(true);
  if (d.state === 'gone') { if (!(await askCode('代碼不能用了（停用或換了）'))) return; d = await getData(true); }
  const t = new UITable();
  t.showSeparators = true;
  const fill = () => {
    t.removeAllRows();
    const head = (title, right, color) => {
      const r = new UITableRow(); r.isHeader = true; r.height = 44;
      const c = r.addText(title, right || ''); c.titleFont = Font.boldSystemFont(18); c.titleColor = color || COL.head;
      c.subtitleFont = Font.systemFont(12); c.subtitleColor = COL.muted;
      t.addRow(r);
    };
    const line = (text, color, sub, onSelect, bold) => {
      const r = new UITableRow();
      const len = String(text).length;
      r.height = Math.max(40, 22 + Math.ceil(len / 20) * 20 + (sub ? 16 : 0));
      const c = r.addText(text, sub || ''); c.titleFont = bold ? Font.boldSystemFont(15) : Font.systemFont(15); c.titleColor = color || COL.text;
      c.subtitleFont = Font.systemFont(12); c.subtitleColor = COL.muted;
      if (onSelect) { r.onSelect = onSelect; r.dismissOnSelect = false; }
      t.addRow(r);
    };
    const s = stamp(d);
    const top = new UITableRow(); top.height = 64;
    const tc = top.addText('柏捷工地', (s ? s.t : '') + (d.f ? '　' + (d.f.role || '') : ''));
    tc.titleFont = Font.heavySystemFont(26); tc.titleColor = COL.teal; tc.subtitleColor = s && s.old ? COL.orange : COL.muted;
    t.addRow(top);
    if (upd) line('小工具更新到 ' + upd + ' 版了（下次就會用新的）', COL.green);
    if (loading) line('更新中…', COL.muted);
    if (!d.f) { line(d.msg || '連不上收件服務', COL.hot); }
    else {
      const f = d.f, todos = todoList(f);
      const sec = {
        rem: () => { head('⏰ 今日提醒'); remRows(f, isDev(f) && !!logToday(f)).forEach(r => line(r.t, r.k === 1 ? COL.hot : r.k === 3 ? COL.muted : COL.text)); },
        cal: () => { head(weekTitle(f)); weekRows(f).forEach(r => line(r.t, r.k === 1 ? COL.hot : r.k === 2 ? COL.head : r.k === 3 ? COL.muted : COL.text, '', null, r.k === 2)); },
        todo: () => {
          if (!todos) return;
          head('✅ 待辦 ' + todos.filter(x => !x.done).length, '點一下打勾或取消');
          if (!todos.length) line('都做完了 👍', COL.muted);
          todos.forEach(x => line(todoLabel(x), x.done ? COL.muted : COL.text, '', async () => {
            const a = new Alert(); a.title = x.done ? '改回還沒做？' : '這項做完了嗎？'; a.message = '（' + x.site + '）' + x.text;
            a.addAction(x.done ? '改回還沒做' : '✓ 做完了'); a.addCancelAction('取消');
            if ((await a.presentAlert()) !== 0) return;
            try { await api('todo', { op: 'check', id: x.id, done: !x.done }); } catch (e) { await say('沒有改成', (e && e.message) || '網路有問題，等一下再試'); return; }
            d = await getData(true); fill(); t.reload();
          }));
        },
        news: () => { head('📣 最新消息'); const l = newsItems(f); if (!l.length) line('最近沒有新消息', COL.muted); l.slice(0, 40).forEach(n => line('【' + n.label + '】' + n.text, COL.text, n.sub)); },
        // 開發者：今天每個工地的日誌填了沒（點一下打開網頁版去寫）
        log: () => {
          if (!isDev(f)) return;
          head('📋 今天的日誌', '點一下打開網頁版');
          logRows(f).forEach(r => line(r.t, r.k === 1 ? COL.hot : r.k === 4 ? COL.green : COL.muted, '', () => Safari.open(WEB)));
        },
      };
      const order = show === 'news' ? ['news', 'rem', 'log', 'cal', 'todo'] : show === 'cal' ? ['cal', 'todo', 'rem', 'log', 'news']
        : show === 'log' ? ['log', 'rem', 'cal', 'todo', 'news'] : ['rem', 'log', 'cal', 'todo', 'news'];
      order.forEach(k => sec[k]());
    }
    head('其他');
    line('🔄 重新整理', COL.teal, '', async () => { d = await getData(true); fill(); t.reload(); });
    line('👆 點小工具要打開什麼', COL.teal, '現在：' + TAP_NAME[tapMode()].replace(/^\S+\s/, '') + (kget(KT) ? '' : '（還沒固定）'), async () => { if (await pickTap(true)) { fill(); t.reload(); } });
    line('📱 全螢幕打開柏捷工地（試驗）', COL.teal, '在這裡面直接開，不用再輸入代碼', async () => { await openFull(); });
    line('🌐 打開柏捷工地網頁版', COL.teal, '用 Safari 打開；第一次要在 Safari 輸入一次代碼', () => Safari.open(WEB));
    line('👁 看小工具的樣子（小）', COL.teal, '', async () => { await buildWidget(d, 'small', '').presentSmall(); });
    line('👁 看小工具的樣子（中）', COL.teal, '', async () => { await buildWidget(d, 'medium', '').presentMedium(); });
    line('👁 看小工具的樣子（大）', COL.teal, '', async () => { await buildWidget(d, 'large', '').presentLarge(); });
    if (Device.isPad()) line('👁 看小工具的樣子（特大）', COL.teal, '', async () => { await buildWidget(d, 'extraLarge', '').presentExtraLarge(); });
    line('📖 怎麼放到桌面', COL.teal, '', async () => { await say('怎麼放到桌面', HOWTO); });
    line('🔑 換代碼', COL.muted, '', async () => { if (await askCode('')) { d = await getData(true); fill(); t.reload(); } });
    line('⬇️ 看有沒有新版的小工具', COL.teal, '現在是 ' + VER, async () => {
      const v = await selfUpdate(true);
      await say(v ? '更新到 ' + v + ' 版了' : '已經是最新的（' + VER + '）', v ? '把這個清單關掉，再點一次小工具就是新的。' : '');
    });
    line('小工具版本 ' + VER, COL.muted);
  };
  fill();
  const shown = t.present(false);
  if (loading) { d = await getData(true); loading = false; fill(); t.reload(); }
  selfUpdate().then(v => { if (v) { upd = v; fill(); t.reload(); } }).catch(() => { });
  await shown;
}

// ---------------- 開始 ----------------
const P = String(args.widgetParameter || '').trim();
if (config.runsInWidget) {
  const d = await getData(false);
  Script.setWidget(buildWidget(d, config.widgetFamily, P));
  await selfUpdate();   // 畫好以後看有沒有新版（點小工具不再打開 Scriptable）；有的話下次重畫就用新的
} else if (config.runsInApp) {
  const q = args.queryParameters || {};
  if (q.tap) await tapMain(String(q.show || '')); else await appMain(String(q.show || ''));
} else {
  // 捷徑、分享選單：預覽中的
  const d = await getData(false);
  await buildWidget(d, 'medium', P).presentMedium();
}
Script.complete();
// END-BOJIE-WIDGET
