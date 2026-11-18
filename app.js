/* ============================================================
   الدولة الجروبية — a fictional virtual-state simulator (clean room)
   All state is fictional and stored locally in the browser.
   ============================================================ */

/* ---------- tiny helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n) => Number(n || 0).toLocaleString('en-US');
const fmt = (n) => num(n) + ' دولار جروبي';
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = n => String(n).padStart(2, '0');

const ICONS = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  bank: '<path d="M10 18v-7"/><path d="M11.1 2.2a2 2 0 0 1 1.8 0l7.8 3.8c.5.3.3 1-.2 1H3.5c-.5 0-.7-.7-.2-1z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  vote: '<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v1"/><rect x="3" y="8" width="18" height="13" rx="2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  gavel: '<path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 14-7-7"/>',
  store: '<path d="M3 9h18l-1.5-5h-15z"/><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6h6v6"/>',
  game: '<path d="M6 12h4"/><path d="M8 10v4"/><path d="M15 13h.01"/><path d="M18 11h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/>',
  news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h6"/><path d="M7 12h6"/><path d="M7 16h10"/><path d="M17 8h0"/>',
  id: '<rect x="2" y="4" width="20" height="16" rx="3"/><circle cx="8.5" cy="11" r="2.5"/><path d="M4.5 17c.6-1.5 2.1-2.5 4-2.5s3.4 1 4 2.5"/><path d="M15 9h4"/><path d="M15 13h4"/>',
  passport: '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 17h6"/>',
  licence: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="7.5" cy="12" r="2"/><path d="M12 9h6"/><path d="M12 13h6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  arrow: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  flag: '<path d="M4 22V4"/><path d="M4 5c4-2 8 2 12 0v9c-4 2-8-2-12 0"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18 16a6 6 0 1 1-6-6"/><path d="M8 12a6 6 0 0 0 6 6"/>',
  scale: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="m5 7-3 6h6z"/><path d="m19 7-3 6h6z"/><path d="M8 21h8"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m11 12 9-9"/><path d="m17 6 3 3"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16" cy="9" r="1"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h2"/><path d="M14 6h2"/><path d="M9 10h2"/><path d="M14 10h2"/><path d="M10 22v-5h4v5"/>',
};
const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* An original-style emblem drawn inline (not copied from the source app) */
const emblem = () => `<svg class="emblem" viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <circle cx="32" cy="32" r="30" stroke="rgb(var(--primary))" stroke-opacity=".45" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="25" stroke="rgb(var(--primary))" stroke-opacity=".25" stroke-width="1"/>
  <path d="M32 12c-3 5-8 7-13 8 3 2 5 5 6 9-5-1-9 0-12 3 5 1 9 4 11 9 3-3 5-4 8-5 3 1 5 2 8 5 2-5 6-8 11-9-3-3-7-4-12-3 1-4 3-7 6-9-5-1-10-3-13-8z" fill="rgb(var(--primary))" fill-opacity=".85"/>
  <circle cx="32" cy="30" r="4" fill="var(--bg)"/>
  <path d="M20 48h24M24 52h16" stroke="rgb(var(--primary))" stroke-width="2" stroke-linecap="round"/>
</svg>`;

/* ---------- dates ---------- */
const AR_DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function arabicDate(d = new Date()) {
  return `${AR_DAYS[d.getDay()]}، ${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function shortDate(d = new Date()) {
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function nextThursday() {
  const d = new Date();
  let add = (4 - d.getDay() + 7) % 7;
  if (add === 0 && (d.getHours() > 0 || d.getMinutes() > 0)) add = 7;
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + add);
  return t;
}
function countdownParts() {
  const now = new Date();
  const t = nextThursday();
  let diff = Math.max(0, Math.floor((t - now) / 1000));
  const days = Math.floor(diff / 86400); diff %= 86400;
  const hrs = Math.floor(diff / 3600); diff %= 3600;
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return { days, hrs, mins, secs, target: t };
}
const countdownHTML = () => {
  const c = countdownParts();
  return `<div class="digits" id="countdown"><b>${pad(c.days)}</b><span>:</span><b>${pad(c.hrs)}</b><span>:</span><b>${pad(c.mins)}</b><span>:</span><b>${pad(c.secs)}</b></div>`;
};
function tickCountdown() {
  const el = $('#countdown');
  if (!el) return;
  const c = countdownParts();
  el.innerHTML = `<b>${pad(c.days)}</b><span>:</span><b>${pad(c.hrs)}</b><span>:</span><b>${pad(c.mins)}</b><span>:</span><b>${pad(c.secs)}</b>`;
}
setInterval(tickCountdown, 1000);

/* ---------- default data ---------- */
const CONSTITUTION = [
  ['المادة الأولى', 'الدولة الجروبية دولة عربية ذات سيادة كاملة، نظامها جمهوري ديمقراطي، وعاصمتها العاصمة الإدارية الجروبية الجديدة مدينة جروبة. واللغة العربية هي لغتها الرسمية.'],
  ['المادة الثانية', 'السيادة للشعب، يمارسها عبر صناديق الاقتراع في انتخابات حرة نزيهة تُجرى كل يوم خميس، ولكل مواطن بلغ الثامنة عشرة حق الانتخاب والترشح.'],
  ['المادة الثالثة', 'جميع المواطنين متساوون أمام القانون، لا تمييز بينهم في الحقوق والواجبات بسبب الأصل أو اللون أو الجنس أو الرأي.'],
  ['المادة الرابعة', 'الحرية الشخصية مكفولة، ولا يجوز القبض على مواطن إلا بأمر قضائي، وحقه في محاكمة عادلة أمام المحكمة الجروبية مضمون.'],
  ['المادة الخامسة', 'السلطة التشريعية في مجلس الشعب، والسلطة التنفيذية في ديوان الدولة، والسلطة القضائية في المحكمة، ولا يجوز لأي سلطة أن تتعدى على الأخرى.'],
  ['المادة السادسة', 'العملة الرسمية للدولة دولار جروبي، يصدره المصرف المركزي الجروبي وحده، ويُحدد سعر صرفه بما يحفظ قيمة العملة.'],
  ['المادة السابعة', 'التعليم والصحة حق لكل مواطن، وتلتزم الدولة بتوفيرهما وتطوير الخدمات العامة بالنمو السكاني.'],
  ['المادة الثامنة', 'تُجرى انتخابات رئاسة الجمهورية كل يوم خميس، ويُنتخب الرئيس بالأغلبية الحرة المباشرة لمدة يحددها القانون.'],
  ['المادة التاسعة', 'تُنشر البيانات الرسمية والأخبار في الجريدة الرسمية، ولا تترتب على هذه الوثيقة أي آثار قانونية لأنها دولة افتراضية أُنشئت للتسلية.'],
];
const SERVICES = [
  ['id','الهوية الرقمية','بطاقة وطنية للهواية','#/wallet'],
  ['passport','جواز السفر','جواز جروبي وهمي','#/wallet'],
  ['wallet','المحفظة الإلكترونية','رصيدك ومعاملاتك','#/wallet'],
  ['key','الرخص والتصاريح','قيادة ومركبة — أسبوعان','#/wallet'],
  ['bank','البنك المركزي','العملة والاحتياطي والتحويل','#/bank'],
  ['vote','مركز الانتخابات','رئاسة الجمهورية — كل خميس','#/elections'],
  ['users','مجلس الشعب','الأعضاء وتصويت القوانين','#/parliament'],
  ['news','الأخبار والمشاريع','الجريدة الرسمية','#/news'],
  ['gavel','المحكمة','الأحكام والمخالفات','#/court'],
  ['store','المكاتب والأسواق','تجارة المواطنين والضرائب','#/market'],
  ['game','جروبيا بارك','ألعاب المواطنين','#/park'],
  ['scale','دستور الدولة','وثيقة رمزية للتسلية','#/constitution'],
];
const DEFAULT_LAWS = [
  { id:'l1', title:'الحد من عمليات غسيل الاموال', desc:'تنظيم عمليات التحويل وفرض رقابة على التدفقات المالية المشبوهة.', yes:0, no:0, status:'open' },
  { id:'l2', title:'قانون حماية المستهلك الجروبي', desc:'ضبط الأسعار وحماية حقوق المتسوقين في الأسواق والمكاتب.', yes:0, no:0, status:'open' },
  { id:'l3', title:'تطوير الخدمات الرقمية', desc:'توسيع الخدمات الإلكترونية للمواطنين وتوحيد الهوية الرقمية.', yes:0, no:0, status:'open' },
];
const DEFAULT_CANDIDATES = [
  { id:'c1', name:'ادم وائل إسماعيل', slogan:'العدل أولاً — الدولة في خدمة الشعب', votes:0 },
  { id:'c2', name:'هالة منصور', slogan:'رؤية جديدة للجروبية الرقمية', votes:0 },
  { id:'c3', name:'كريم عبد السلام', slogan:'اقتصاد قوي ومواطن كريم', votes:0 },
];
const DEFAULT_ARTICLES = [
  { id:'n1', title:'بيان رسمي', source:'حزب العدل الجروبي', date:'16 نوفمبر 2026', body:'ي يسعد حزب العدل الجروبي أن يعلن عن مبادرته الجديدة لتطوير الخدمات العامة وتعزيز الشفافية في الدولة الجروبية، انطلاقاً من إيماننا بأن الدولة في خدمة الشعب.' },
  { id:'n2', title:'افتتاح مكتب التسجيل الرقمي', source:'الهيئة الرقمية للدولة', date:'14 نوفمبر 2026', body:'افتتحت الهيئة الرقمية للدولة مكتب التسجيل الرقمي لتسهيل إصدار الهويات والجوازات للمواطنين دون الحاجة إلى زيارة ديوان الدولة.' },
  { id:'n3', title:'الرصيد الافتتاحي للمواطنين', source:'المصرف المركزي الجروبي', date:'18 نوفمبر 2026', body:'يُصرف لكل مواطن مسجل رصيد افتتاحي قدره 5,000 دولار جروبي، مع راتب شهري منتظم يُصرف من خزينة الدولة.' },
];
const DEFAULT_PROJECTS = [
  { id:'p1', name:'تطوير شبكة الطرق الجروبية', value:120000, status:'مخطط' },
  { id:'p2', name:'مستشفى جروبة المركزي', value:250000, status:'مخطط' },
];

function defaultState() {
  return {
    theme: 'royal',
    user: null,
    idIssued: false,
    transactions: [],
    bank: { reserve: 1000000, issued: 0, collected: 0, spent: 0, transfers: [] },
    candidates: structuredClone(DEFAULT_CANDIDATES),
    votedFor: null,
    laws: structuredClone(DEFAULT_LAWS),
    lawVotes: {},
    violations: [],
    cases: [],
    businesses: [],
    sales: [],
    rooms: [],
    articles: structuredClone(DEFAULT_ARTICLES),
    projects: structuredClone(DEFAULT_PROJECTS),
    parliamentSpeaker: null,
    judge: 'ادم وائل إسماعيل',
  };
}

const SKEY = 'jurubiya_state_v1';
function loadState() {
  try {
    const raw = localStorage.getItem(SKEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) {}
  return defaultState();
}
let S = loadState();
function save() {
  try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {}
  if (window.DB && DB.enabled) DB.pushAll(S); // shared Supabase mode
}
function resetState() { S = defaultState(); save(); render(); }

/* ---------- auth helpers ---------- */
const isLogged = () => !!S.user;
function requireAuth(action) {
  if (isLogged()) return true;
  toast('سجّل الدخول أو أنشئ حساباً أولاً');
  openModal('auth', { reason: action });
  return false;
}
function newNationalId() { return 'JRB-' + Math.floor(100000 + Math.random() * 900000); }

/* ---------- navigation ---------- */
const NAV = [
  ['#/', 'الرئيسية', 'home'],
  ['#/wallet', 'المحفظة والهوية', 'wallet'],
  ['#/bank', 'البنك المركزي', 'bank'],
  ['#/elections', 'مركز الانتخابات', 'vote'],
  ['#/parliament', 'مجلس الشعب', 'users'],
  ['#/court', 'المحكمة', 'gavel'],
  ['#/market', 'المكاتب والأسواق', 'store'],
  ['#/park', 'جروبيا بارك', 'game'],
  ['#/news', 'الأخبار والمشاريع', 'news'],
];
const BOTTOM_NAV = [NAV[0], NAV[1], NAV[2], NAV[3], NAV[8]];
function currentRoute() {
  const h = location.hash.replace(/^#/, '') || '/';
  return h.startsWith('/') ? h : '/' + h;
}
function navigate(route) {
  if (location.hash === '#' + route) render();
  else location.hash = route;
}

/* ---------- shell rendering ---------- */
function renderShell() {
  const route = currentRoute();
  const brand = `<div class="brand">${emblem()}<div><div class="brand-title">الدولة الجروبية</div><div class="brand-sub">دولة افتراضية</div></div></div>`;
  $('#sidebar').innerHTML = brand + `<div class="hairline"></div>
    <nav class="side-nav">${NAV.map(([h, t, i]) => `<a href="${h}" class="nav-item ${route === h.slice(1) ? 'active' : ''}">${icon(i)}<span>${t}</span></a>`).join('')}</nav>
    <div class="side-user" data-action="account">
      <div class="avatar">${isLogged() ? esc(S.user.name[0]) : 'م'}</div>
      <div><div class="u-name">${isLogged() ? esc(S.user.name) : 'زائر'}</div><div class="u-bal gold">${num(isLogged() ? S.user.balance : 5000)} ج.ج</div></div>
    </div>
    <div class="side-foot">نسخة تجريبية — للتسلية فقط</div>`;

  $('#topbar').innerHTML = `<div class="brand">${emblem()}<div><div class="brand-title">الدولة الجروبية</div><div class="brand-sub">دولة افتراضية للتسلية</div></div></div>
    <button class="btn btn-sm" data-action="account">${icon(isLogged() ? 'user' : 'plus')} ${isLogged() ? esc(S.user.name) : 'حسابي'}</button>`;

  $('#bottomNav').innerHTML = BOTTOM_NAV.map(([h, t, i]) => `<a href="${h}" class="${route === h.slice(1) ? 'active' : ''}">${icon(i)}<span>${t.split(' ')[0]}</span></a>`).join('');
  document.documentElement.dataset.theme = S.theme;
}

/* ---------- page renderers ---------- */
function renderHome() {
  return `
  <section class="hero">
    <div class="inner">
      <div class="hero-top"><span class="hero-flag">${icon('shield')} الهيئة الرقمية للدولة</span></div>
      <div class="hero-title">الدولة الجروبية ${emblem()}</div>
      <p class="hero-desc">جمهورية الجروبية — الدولة في خدمة الشعب. هويتك، جواز سفرك، محفظتك، وصوتك في الانتخابات. كلها في مكان واحد.</p>
      <div class="hero-badges">
        <span class="badge">${icon('calendar')} ${arabicDate()}</span>
        <span class="badge">${icon('user')} ${isLogged() ? 'مواطن مسجل' : 'زائر مسجل'}</span>
      </div>
      <div class="hero-actions">
        ${isLogged() ? `<button class="btn btn-gold" data-action="idcard">${icon('id')} بطاقتي الوطنية</button>
        <button class="btn" data-action="account">${icon('user')} حسابي</button>` :
        `<button class="btn btn-gold" data-action="auth" data-mode="register">${icon('plus')} إنشاء حساب جديد</button>
        <button class="btn" data-action="auth" data-mode="login">${icon('arrow')} تسجيل الدخول</button>`}
      </div>
      <p class="hero-note">نسخة تجريبية للهواية والتسلية — كل البيانات وهمية ولا تمثل أي دولة حقيقية.<br>أنشئ حساباً مجانياً لحفظ هويتك ورصيدك على جميع أجهزتك، أو تابع كزائر واستعرض كل الصفحات.</p>
    </div>
  </section>

  <div class="countdown-strip">
    <div class="countdown-side">
      <div class="countdown-icon">${icon('vote')}</div>
      <div><div class="countdown-label">انتخابات الرئاسة مغلقة</div><div class="countdown-sub">تفتح ${shortDate(nextThursday())}</div></div>
    </div>
    ${countdownHTML()}
  </div>

  <div class="face">
    <h2 class="section-title">رمز الدولة</h2><p class="section-sub">الهوية البصرية للدولة الجروبية</p>
    <div class="grid grid-2">
      <div class="card"><div class="row" style="border:0"><div class="row-main"><div class="row-title">علم الدولة</div><div class="row-sub muted small">خانة فارغة — لم يُرفع العلم بعد</div></div><div style="width:52px;height:36px;border:1px dashed var(--line-strong);border-radius:6px;background:linear-gradient(135deg,rgba(var(--primary),.12),transparent)"></div></div></div>
      <div class="card"><div class="row" style="border:0"><div class="row-main"><div class="row-title">النشيد الوطني</div><div class="row-sub muted small">خانة فارغة — لم تُعتمد النشيد بعد</div></div>${icon('music')}</div></div>
    </div>
  </div>

  <div class="face">
    <h2 class="section-title">خدمات المواطن</h2><p class="section-sub">كل شيء في مكان واحد</p>
    <div class="grid grid-4">
      ${SERVICES.map(([i, t, d, h]) => `<a class="service-card" href="${h}"><div class="service-ico">${icon(i)}</div><div class="service-name">${t}</div><div class="service-desc">${d}</div></a>`).join('')}
    </div>
  </div>

  <div class="face card constitution">
    <h2 class="section-title">دستور الدولة</h2>
    <p class="gold" style="font-family:var(--font-display);font-size:15px">بسم الله الرحمن الرحيم</p>
    <h4>دستور الدولة الجروبية</h4>
    ${CONSTITUTION.slice(0, 3).map(([t, b]) => `<h4>${t}</h4><p>${b}</p>`).join('')}
    <button class="btn btn-gold btn-sm" style="margin-top:18px" data-action="constitution">اقرأ الدستور كاملاً (9 مادة)</button>
    <p class="muted small" style="margin-top:14px">وثيقة رمزية لدولة افتراضية أُنشئت للتسلية — لا تترتب عليها أي آثار قانونية.</p>
  </div>

  <div class="face grid grid-2">
    <div class="card">
      <h3 class="section-title">مجلس الشعب</h3><p class="small muted">السلطة التشريعية</p>
      <p class="small" style="line-height:1.9;margin:14px 0">${S.laws.length ? `آخر قانون معروض: ${esc(S.laws[0].title)}` : 'لا توجد قوانين معروضة للتصويت — يفتح المجلس أبوابه كل يوم.'}</p>
      <a class="btn btn-gold btn-sm" href="#/parliament">دخول المجلس</a>
    </div>
    <div class="card">
      <h3 class="section-title">آخر الأخبار</h3><p class="small muted"><a href="#/news">كل الأخبار</a></p>
      ${S.articles.length ? `<div style="margin-top:12px"><span class="pill">بيان رسمي</span><div class="row-title" style="margin-top:10px">${esc(S.articles[0].title)}</div><div class="row-sub">${esc(S.articles[0].source)} · ${esc(S.articles[0].date)}</div></div>`
        : '<div class="empty" style="margin-top:12px">لا توجد أخبار منشورة بعد — تُنشر البيانات الرسمية من ديوان الدولة.</div>'}
    </div>
  </div>

  <div class="face grid grid-2">
    <div class="card">
      <h3 class="section-title">بطاقتك الوطنية</h3>
      ${S.idIssued ? `<div class="id-card" style="margin-top:14px"><div class="id-row"><span>الاسم</span><span>${esc(S.user?.name || 'مواطن جروبي')}</span></div><div class="id-row"><span>رقم الهوية</span><span class="gold">${esc(S.user?.nationalId || 'JRB-000000')}</span></div><div class="id-row"><span>الجنسية</span><span>جروبي</span></div></div>
      <button class="btn btn-sm" style="margin-top:12px" data-action="idcard">عرض البطاقة</button>`
      : `<div class="row" style="border:0"><div class="row-main"><div class="row-title">لم تُصدر هويتك بعد</div><div class="row-sub gold">${newNationalId()}</div></div></div><button class="btn btn-gold btn-sm" data-action="issue-id">إصدار البطاقة</button>`}
    </div>
    <div class="card">
      <h3 class="section-title">حسابي</h3>
      ${isLogged() ? `<p class="small" style="line-height:1.9;margin:12px 0">مرحباً، ${esc(S.user.name)}. رصيدك الحالي <span class="gold">${fmt(S.user.balance)}</span>.</p><button class="btn btn-sm" data-action="account">إدارة الحساب</button>`
      : `<p class="small muted" style="line-height:1.9;margin:12px 0">ليس لديك حساب بعد — أنشئه ليُحفظ اسمك وهويتك ورصيدك على كل أجهزتك، ويُصرف لك راتبك الشهري.</p>
         <div style="display:flex;gap:10px"><button class="btn btn-gold btn-sm" data-action="auth" data-mode="register">إنشاء حساب</button><button class="btn btn-sm" data-action="auth" data-mode="login">دخول</button></div>`}
    </div>
  </div>

  <div class="face card">
    <h3 class="section-title">مظهر الدولة</h3>
    <p class="section-sub">اختر ألوان الموقع كما تحب — يُحفظ اختيارك على جهازك ويُطبَّق على كل صفحات الدولة.</p>
    ${themeCardsHTML()}
  </div>

  <div class="logo-line">${icon('clock')} ${arabicDate()} &nbsp;•&nbsp; الرصيد الافتتاحي لكل مواطن: 5,000 دولار جروبي</div>
  `;
}

function themeCardsHTML() {
  const items = [
    ['royal', ['#f1dfb0', '#c8ac74', '#060f0b'], 'الديوان الذهبي', 'الأخضر الملكي والذهبي — سمة الدولة الأصلية'],
    ['silver', ['#ffffff', '#9fd6ad', '#050707'], 'الأسود والفضي', 'خلفية سوداء، ذهبيّ يصير أبيض، والكلام أخضر'],
    ['blue', ['#a9c0e0', '#8fb6d8', '#060b16'], 'الأزرق الملكي', 'أزرق عميق وفولاذي هادئ'],
  ];
  return `<div class="theme-grid">${items.map(([k, cols, n, d]) => `
    <button class="theme-card ${S.theme === k ? 'active' : ''}" data-action="theme" data-theme="${k}">
      <div class="dots">${cols.map(c => `<i style="background:${c}"></i>`).join('')}</div>
      <div class="tn">${n}</div><div class="td">${d}</div>
    </button>`).join('')}</div>`;
}

function pageHead(eyebrow, title, desc, note) {
  return `<div class="page-head"><div class="eyebrow">${eyebrow}</div><h1 class="page-title">${title}</h1><p class="page-desc">${desc}</p>
  ${note ? `<p class="page-desc gold" style="font-size:12px">${note}</p>` : ''}</div>`;
}
function authGate(text) {
  return isLogged() ? '' : `<div class="card" style="border-color:rgba(var(--primary),.25);margin-bottom:18px">
    <div class="row" style="border:0"><div class="row-main"><div class="row-title">${text}</div></div>
    <button class="btn btn-gold btn-sm" data-action="auth" data-mode="register">إنشاء حساب / دخول</button></div></div>`;
}

function renderWallet() {
  const t = S.user?.transactions || S.transactions;
  const inc = t.filter(x => x.amount > 0).reduce((a, b) => a + b.amount, 0);
  const out = t.filter(x => x.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
  const fines = t.filter(x => x.type === 'fine').length;
  return pageHead('وزارة المالية والداخلية', 'المحفظة الإلكترونية',
    'رصيدك وهويتك وجواز سفرك ورخصك — كلها في حساب واحد.',
    'أي إجراء في الدولة — التصويت، الدفع، التحويل، التجديد — يحتاج حساباً مسجّلاً. أنشئ حسابك ليبقى رصيدك وهويتك على كل أجهزتك.') +
  authGate('سجّل الدخول للوصول إلى رصيدك وهويتك.') +
  `<div class="tabs" id="walletTabs">
    ${[['wallet','المحفظة'],['identity','الهوية الرقمية'],['passport','جواز السفر'],['licence','الرخص والتصاريح']].map(([k,n],i) => `<button class="tab ${i===0?'active':''}" data-wtab="${k}">${n}</button>`).join('')}
  </div>
  <div id="walletPanel">${walletPanel('wallet', t, inc, out, fines)}</div>`;
}
function walletPanel(tab, t, inc, out, fines) {
  if (tab === 'identity') return `<div class="card"><h3 class="section-title">الهوية الرقمية</h3>
    ${S.idIssued ? `<div class="id-card" style="margin-top:14px"><div class="id-row"><span>الاسم</span><span>${esc(S.user?.name)}</span></div><div class="id-row"><span>رقم الهوية</span><span class="gold">${esc(S.user?.nationalId)}</span></div><div class="id-row"><span>الجنسية</span><span>جروبي</span></div><div class="id-row"><span>تاريخ الإصدار</span><span>${shortDate()}</span></div></div>`
    : `<div class="empty" style="margin-top:14px"><span class="big">${icon('id')}</span>لم تُصدر هويتك بعد</div><button class="btn btn-gold btn-sm" data-action="issue-id">إصدار البطاقة</button>`}</div>`;
  if (tab === 'passport') return `<div class="card"><h3 class="section-title">جواز السفر</h3><div class="empty" style="margin-top:14px"><span class="big">${icon('passport')}</span>جواز جروبي وهمي — يُصدر بعد تفعيل الحساب</div>${isLogged() ? '<button class="btn btn-sm" data-action="issue-passport">إصدار الجواز</button>' : ''}</div>`;
  if (tab === 'licence') return `<div class="card"><h3 class="section-title">الرخص والتصاريح</h3><div class="empty" style="margin-top:14px"><span class="big">${icon('key')}</span>رخصة قيادة ومركبة — صالحة لأسبوعين</div>${isLogged() ? '<button class="btn btn-sm" data-action="issue-licence">طلب رخصة</button>' : ''}</div>`;

  const bal = isLogged() ? S.user.balance : 5000;
  return `
  <div class="balance-box">
    <div class="account-chip">ACCOUNT …${esc((S.user?.email || 'guest').slice(-6))}</div>
    <div class="balance-num">${num(bal)}</div><div class="balance-cur">دولار جروبي — العملة الرسمية لـ <span class="gold">الدولة الجروبية</span></div>
    <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
      <button class="btn btn-gold btn-sm" data-action="pay">${icon('send')} دفع / تحويل</button>
      <button class="btn btn-sm" data-action="salary">${icon('coins')} استلام الراتب الشهري</button>
    </div>
  </div>
  <div class="grid grid-4">
    <div class="stat"><div class="k">إجمالي الوارد</div><div class="v">${num(inc)}</div><div class="u">دولار جروبي</div></div>
    <div class="stat"><div class="k">إجمالي الصادر</div><div class="v">${num(out)}</div><div class="u">دولار جروبي</div></div>
    <div class="stat"><div class="k">مخالفات مدفوعة</div><div class="v">${fines}</div><div class="u">${fines} مخالفة</div></div>
    <div class="stat"><div class="k">الراتب الشهري</div><div class="v">6,000</div><div class="u">مرة واحدة كل شهر</div></div>
  </div>
  <div class="card" style="margin-top:16px"><p class="small muted center" style="margin:0">محفظة افتراضية للتسلية فقط — لا تمثل أموالاً حقيقية ولا يمكن شحنها أو سحبها.</p></div>
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px"><h3 class="section-title">كشف الحساب</h3><button class="btn btn-sm" data-action="pay">عملية جديدة</button></div>
    ${t.length ? t.slice().reverse().map(x => `<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-sub">${esc(x.date)}</div></div><div class="row-amount ${x.amount<0?'neg':''}">${x.amount>0?'+':''}${num(x.amount)}</div></div>`).join('')
      : `<div class="empty"><span class="big">${icon('doc')}</span>لا توجد معاملات بعد<br>استلم راتبك الشهري من الدولة، أو سجّل أول دفعة لك.<br><button class="btn btn-gold btn-sm" style="margin-top:14px" data-action="salary">استلام الراتب الشهري</button></div>`}
  </div>`;
}

function renderBank() {
  const b = S.bank;
  return pageHead('المصرف المركزي الجروبي', 'البنك المركزي',
    'الجهة الوحيدة المسؤولة عن إصدار دولار جروبي وحماية قيمته.',
    'التحويل إلى مواطن آخر والاحتفاظ برصيدك على كل أجهزتك يحتاج حساباً مسجّلاً.') +
  authGate('سجّل الدخول لتحويل الأموال وحفظ رصيدك.') +
  `<div class="card">
    <h3 class="section-title">العملة الوطنية</h3>
    <div class="row"><div class="row-main"><div class="row-title gold" style="font-family:var(--font-display);font-size:20px">دولار جروبي</div><div class="row-sub">سعر الصرف: ${b.exchangeRate || 3.75} دولار جروبي لكل دولار أمريكي</div></div>${icon('coins')}</div>
    <p class="small muted" style="line-height:1.9;margin:10px 0 0">يصدر المصرف النقد عبر منح المواطنين اليومية، ويحتفظ باحتياطي في خزينته. احتياطي الخزينة ينقص فعلياً مع كل راتب تصرفه الدولة، ويزيد مع الغرامات والرسوم والمشاريع المطلقة.</p>
    <button class="btn btn-gold btn-sm" style="margin-top:14px" data-action="transfer">${icon('send')} تحويل إلى مواطن آخر</button>
  </div>
  <div class="grid grid-4" style="margin-top:16px">
    <div class="stat"><div class="k">احتياطي المصرف</div><div class="v">${num(b.reserve)}</div><div class="u">يتحدث لحظياً مع كل حركة</div></div>
    <div class="stat"><div class="k">إجمالي ما أُصدر</div><div class="v">${num(b.issued)}</div><div class="u">دولار جروبي</div></div>
    <div class="stat"><div class="k">سعر الصرف</div><div class="v">${b.exchangeRate || 3.75}</div><div class="u">دولار جروبي لكل دولار أمريكي</div></div>
    <div class="stat"><div class="k">المحصّل للخزينة</div><div class="v">${num(b.collected)}</div><div class="u">غرامات ورسوم ومشاريع</div></div>
    <div class="stat"><div class="k">المصروف من الخزينة</div><div class="v">${num(b.spent)}</div><div class="u">رواتب ومنح</div></div>
    <div class="stat"><div class="k">صافي الخزينة</div><div class="v">${num(b.collected - b.spent)}</div><div class="u">خارج احتياطي المصرف</div></div>
  </div>
  <div class="card"><h3 class="section-title">حركة الإصدار النقدي</h3><p class="section-sub">آخر 7 أيام</p>
    ${S.transactions.filter(x => x.type === 'salary').length ? S.transactions.filter(x => x.type === 'salary').slice().reverse().map(x => `<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-sub">${esc(x.date)}</div></div><div class="row-amount">+${num(x.amount)}</div></div>`).join('')
    : '<div class="empty">لا توجد إصدارات نقدية بعد. كل منحة يستلمها المواطن من المحفظة تُسجَّل هنا.</div>'}
  </div>
  <div class="card"><h3 class="section-title">سجل الخزينة</h3>
    <div class="empty">لا توجد حركات على الخزينة بعد. تصرف الدولة الرواتب من ديوان الحاكم وتظهر هنا فوراً.</div>
  </div>
  <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3 class="section-title">آخر التحويلات بين المواطنين</h3><button class="btn btn-sm" data-action="transfer">تحويل جديد</button></div>
    ${b.transfers.length ? b.transfers.slice().reverse().map(x => `<div class="row"><div class="row-main"><div class="row-title">${esc(x.from)} ← ${esc(x.to)}</div><div class="row-sub">${esc(x.date)}</div></div><div class="row-amount">${num(x.amount)}</div></div>`).join('')
    : '<div class="empty">لا توجد تحويلات بعد. افتح نافذة التحويل واختر مواطناً من السجل العام.</div>'}
  </div>
  <div class="grid grid-3">
    ${[['shield','إصدار النقد','يُصدر المصرف النقد حصرياً، ولا يجوز لأي جهة أخرى طباعة العملة.'],['scale','حماية القيمة','يُراقب المصرف سعر الصرف ويعدّل الاحتياطي للحفاظ على قيمة العملة.'],['doc','شفافية','كل حركة على الخزينة مسجّلة وتظهر لأي مواطن في السجل أعلاه.']].map(([i,t,d])=>`<div class="card"><div class="service-ico" style="margin-bottom:12px">${icon(i)}</div><div class="row-title">${t}</div><p class="small muted" style="line-height:1.8;margin:8px 0 0">${d}</p></div>`).join('')}
  </div>`;
}

function isThursday() { return new Date().getDay() === 4; }
function renderElections() {
  const open = isThursday();
  return pageHead('المفوضية الوطنية للانتخابات', 'انتخابات الرئاسة',
    'انتخابات رئاسة الجمهورية تُفتح كل يوم خميس فقط، من منتصف الليل حتى نهايته — وهي منفصلة عن تصويت القوانين في مجلس الشعب.',
    'التصويت في انتخابات الرئاسة يحتاج حساباً مسجّلاً — أنشئ حسابك ليدخل صوتك في الصندوق ويثبت بهويتك.') +
  authGate('سجّل الدخول للإدلاء بصوتك.') +
  `<div class="countdown-strip"><div class="countdown-side"><div class="countdown-icon">${icon('vote')}</div>
    <div><div class="countdown-label">${open ? 'الصندوق مفتوح الآن' : 'الصندوق مغلق'}</div><div class="countdown-sub">${open ? 'يوم الاقتراع — الخميس' : 'الافتتاح القادم — ' + shortDate(nextThursday())}</div></div></div>
    <div><div class="small muted center" style="margin-bottom:4px">${open ? 'يغلق الصندوق بعد' : 'المتبقي على افتتاح يوم الخميس'}</div>${countdownHTML()}</div></div>
  <div class="grid grid-4">
    <div class="stat"><div class="k">المرشحون</div><div class="v">${S.candidates.length}</div></div>
    <div class="stat"><div class="k">الأصوات</div><div class="v">${S.candidates.reduce((a,c)=>a+c.votes,0)}</div></div>
    <div class="stat"><div class="k">حالتي</div><div class="v" style="font-size:18px">${S.votedFor ? 'صوّت ✓' : (open ? 'جاهز' : 'مغلق')}</div></div>
    <div class="stat"><div class="k">يوم الاقتراع</div><div class="v" style="font-size:16px">الخميس</div><div class="u">كل أسبوع</div></div>
  </div>
  <div class="card" style="margin-top:16px"><h3 class="section-title">قائمة المرشحين</h3>
    ${S.candidates.map(c => `<div class="row"><div class="row-main"><div class="row-title">${esc(c.name)}</div><div class="row-sub">${esc(c.slogan)}</div></div>
      <div style="display:flex;align-items:center;gap:14px"><span class="gold small">${num(c.votes)} صوت</span><button class="btn btn-gold btn-sm" data-action="vote" data-id="${c.id}" ${!open || S.votedFor ? 'disabled' : ''}>${S.votedFor === c.id ? 'صوّت ✓' : 'انتخاب'}</button></div></div>`).join('')}
  </div>
  <p class="small muted center" style="margin-top:18px">وفق الدستور الجروبي لا يُفتح صندوق الاقتراع إلا يوم الخميس. عدّاد الافتتاح أعلاه يعمل باستمرار حتى ذلك اليوم.</p>`;
}

function renderParliament() {
  return pageHead('السلطة التشريعية', 'مجلس الشعب',
    'المجلس مفتوح كل يوم على مدار الساعة — التشكيل والرئاسة يختارهما مالك الدولة، والقوانين تُعرض للتصويت هنا منفصلة تماماً عن انتخابات الرئاسة.',
    'التصويت على القوانين يحتاج حساباً مسجّلاً — أنشئ حسابك ليُحسب صوتك في المجلس.') +
  authGate('سجّل الدخول للتصويت على القوانين.') +
  `<div class="official" style="margin-bottom:16px"><div class="avatar">${icon('users')}</div><div><div class="row-title">رئيس مجلس الشعب المختار</div><div class="row-sub">${S.parliamentSpeaker ? esc(S.parliamentSpeaker) : 'لم يُختر بعد'}</div></div>
    <button class="btn btn-sm" style="margin-inline-start:auto" data-action="choose-speaker">${icon('plus')} اختيار رئيس</button></div>
  <div class="grid grid-3">
    <div class="stat"><div class="k">الأعضاء</div><div class="v">0</div><div class="u">يختارهم مالك الدولة</div></div>
    <div class="stat"><div class="k">تصويتات القوانين</div><div class="v">0</div><div class="u">منفصل عن انتخابات الرئاسة</div></div>
    <div class="stat"><div class="k">قوانين مفتوحة</div><div class="v">${S.laws.length}</div><div class="u">تصويت جارٍ</div></div>
  </div>
  <div class="card" style="margin-top:16px"><div class="row" style="border:0"><div><div class="row-title gold">المجلس منعقد الآن</div><div class="row-sub">مفتوح 24 ساعة كل يوم</div></div><span class="pill">${icon('clock')} مفتوح 24 ساعة</span></div></div>
  <div class="card"><h3 class="section-title">جدول القوانين والتصويت</h3>
    ${S.laws.length ? S.laws.map(l => `<div style="padding:14px 0;border-bottom:1px solid var(--line)">
      <div class="row-title">${esc(l.title)}</div><div class="row-sub">${esc(l.desc)}</div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
        <span class="pill">${icon('check')} ${num(l.yes)} مع</span><span class="tag">${num(l.no)} ضد</span>
        <button class="btn btn-gold btn-sm" data-action="law-vote" data-id="${l.id}" data-v="yes" ${S.lawVotes[l.id] ? 'disabled' : ''}>مع ✓</button>
        <button class="btn btn-sm" data-action="law-vote" data-id="${l.id}" data-v="no" ${S.lawVotes[l.id] ? 'disabled' : ''}>ضد</button>
      </div></div>`).join('') : '<div class="empty">جارٍ تحميل الجدول…</div>'}
  </div>
  <p class="small muted center" style="margin-top:18px">مجلس الشعب منفصل عن مركز الانتخابات: هنا يصوّت المواطنون على القوانين في أي وقت، أما انتخابات رئاسة الجمهورية فتُفتح كل يوم خميس فقط.</p>`;
}

function renderCourt() {
  return pageHead('السلطة القضائية', 'المحكمة',
    'سجل القضايا والأحكام، والمخالفات الصادرة بحق المواطنين وسدادها. المحكمة مفتوحة كل يوم.', '') +
  `<div class="official" style="margin-bottom:16px"><div class="avatar">${icon('gavel')}</div><div><div class="row-title gold">قاضي المحكمة</div><div class="row-sub">${esc(S.judge)}</div></div></div>` +
  authGate('سداد المخالفات ومتابعة ملفاتك أمام المحكمة وتعيين محامٍ يحتاج حساباً مسجّلاً.') +
  `<div class="grid grid-3">
    <div class="stat"><div class="k">مخالفاتي غير المدفوعة</div><div class="v">${S.violations.filter(v=>!v.paid).length}</div></div>
    <div class="stat"><div class="k">المستحق عليّ</div><div class="v">${num(S.violations.filter(v=>!v.paid).reduce((a,b)=>a+b.amount,0))}</div></div>
    <div class="stat"><div class="k">قضايا مسجّلة</div><div class="v">${S.cases.length}</div></div>
  </div>
  <div class="card" style="margin-top:16px"><h3 class="section-title">مخالفاتي</h3>
    ${S.violations.length ? S.violations.map(v => `<div class="row"><div class="row-main"><div class="row-title">${esc(v.title)}</div><div class="row-sub">${esc(v.date)}</div></div><div style="display:flex;align-items:center;gap:12px"><span class="row-amount ${v.paid?'':'neg'}">${num(v.amount)}</span>${v.paid?'<span class="pill">مدفوعة</span>':`<button class="btn btn-gold btn-sm" data-action="pay-fine" data-id="${v.id}">سداد</button>`}</div></div>`).join('')
    : `<div class="empty"><span class="big">${icon('shield')}</span>سجلك نظيف<br>لا توجد مخالفات صادرة بحقك. تُصدر المخالفات من ديوان الدولة فقط.</div>`}
  </div>
  <div class="card"><h3 class="section-title">سجل القضايا</h3>
    ${S.cases.length ? S.cases.map(c => `<div class="row"><div class="row-main"><div class="row-title">${esc(c.title)}</div><div class="row-sub">${esc(c.defendant)} · ${esc(c.date)}</div></div><span class="tag">${esc(c.status)}</span></div>`).join('')
    : `<div class="empty">لا توجد قضايا مسجّلة<br>سجل المحكمة فارغ وجاهز — يسجّل قاضي المحكمة القضايا والأحكام ويختار المدعى عليه من قائمة المواطنين.</div>`}
  </div>`;
}

function renderMarket() {
  const cats = S.businesses.reduce((a, b) => { a[b.type] = (a[b.type] || 0) + 1; return a; }, {});
  return pageHead('اقتصاد المواطنين', 'المكاتب والأسواق',
    'افتح متجراً يبيع بضاعة أو مكتباً يقدّم خدمة، ويدفع لك المواطنون مباشرة — والدولة تقتطع ضريبة على كل عملية.', '') +
  authGate('فتح متجر أو مكتب، والدفع لمواطن آخر، يحتاج حساباً مسجّلاً.') +
  `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px"><span class="pill">ضريبة الدولة على كل عملية بيع أو خدمة: 10%</span><button class="btn btn-gold btn-sm" data-action="new-business">${icon('plus')} منشأة جديدة</button></div>
  <div class="grid grid-3">
    <div class="stat"><div class="k">منشآت مفتوحة</div><div class="v">${S.businesses.length}</div></div>
    <div class="stat"><div class="k">متاجر</div><div class="v">${cats.shop || 0}</div></div>
    <div class="stat"><div class="k">مكاتب</div><div class="v">${cats.office || 0}</div></div>
  </div>
  <div class="tabs" style="margin-top:18px">${['الكل','الأسواق','المكاتب','منشآتي'].map((x,i)=>`<button class="tab ${i===0?'active':''}" data-mtab="${i}">${x}</button>`).join('')}</div>
  <div class="card" id="businessList">
    ${S.businesses.length ? S.businesses.map(b => `<div class="row"><div class="service-ico" style="width:34px;height:34px;flex:0 0 34px">${icon(b.type==='shop'?'store':'building')}</div><div class="row-main" style="flex:1"><div class="row-title">${esc(b.name)}</div><div class="row-sub">${esc(b.category)} · ${b.type==='shop'?'متجر':'مكتب'} · ${esc(b.owner)}</div></div><button class="btn btn-sm" data-action="buy" data-id="${b.id}">دفع</button></div>`).join('')
    : '<div class="empty">القطاع الخاص<br>جارٍ تحميل المنشآت…</div>'}
  </div>
  <div class="card"><h3 class="section-title">آخر عمليات البيع والخدمات</h3>
    ${S.sales.length ? S.sales.slice().reverse().map(x => `<div class="row"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-sub">${esc(x.date)} · ضريبة ${num(x.tax)}</div></div><div class="row-amount">${num(x.amount)}</div></div>`).join('')
    : '<div class="empty">لا توجد عمليات بعد. عندما يدفع مواطن لمواطن آخر تُسجَّل العملية هنا وتُضاف ضريبتها إلى خزينة الدولة.</div>'}
  </div>
  <div class="card"><h3 class="section-title">كيف تربح في الدولة؟</h3><p class="small muted" style="line-height:2">افتح متجراً يبيع بضاعة، أو مكتباً يقدّم خدمة تحددها أنت (استشارة قانونية، محاماة، تصميم…). كل مبلغ يدفعه لك مواطن يدخل رصيدك مباشرة بعد خصم ضريبة الدولة. مكاتب المحاماة تظهر تلقائياً في صفحة المحكمة ليعيّنها من تُرفع عليه قضية.</p></div>`;
}

function renderPark() {
  const games = [
    ['شبكة الجواسيس','لعبة الفريقين بكلمات سرّية','🕵️'],
    ['برا السالفة','واحد منكم لا يعرف الكلمة','🎯'],
    ['الجاسوس في القضية','محققون وجاسوس بينهم','🔎'],
  ];
  return pageHead('ترفيه المواطنين', 'جروبيا بارك',
    'غرف لعب جماعية — كل واحد يفتح الغرفة من هاتفه، والمنشئ يوزّع الأدوار ويبدأ.', '') +
  `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px"><span class="pill">منتزه الدولة الرقمي</span><button class="btn btn-gold btn-sm" data-action="new-room">${icon('plus')} غرفة جديدة</button></div>
  <div class="card"><p class="small muted" style="line-height:1.9;margin:0 0 14px">كل غرفة مقفولة بكود من خمسة حروف — المنشئ وحده يرى كودها ويشاركه مع من يريد. رسوم إنشاء الغرفة 500 دولار جروبي — مالك الدولة معفى.</p>
    <h3 class="section-title">الغرف المفتوحة</h3>
    ${S.rooms.length ? S.rooms.map(r => `<div class="row"><div class="row-main"><div class="row-title">${esc(r.name)}</div><div class="row-sub">${esc(r.game)} · ${r.players.length} لاعبين · الكود: <span class="gold">${esc(r.code)}</span></div></div><button class="btn btn-gold btn-sm" data-action="join-room" data-id="${r.id}">دخول</button></div>`).join('')
    : '<div class="empty">لا توجد غرف بعد — أنشئ أول غرفة وادعُ أصحابك بالكود.</div>'}
  </div>
  <div class="face"><h2 class="section-title">الألعاب</h2><div class="grid grid-3">
    ${games.map(([n,d,e]) => `<div class="service-card"><div style="font-size:28px">${e}</div><div class="service-name">${n}</div><div class="service-desc">${d}</div></div>`).join('')}
  </div></div>`;
}

function renderNews() {
  const total = S.projects.reduce((a, p) => a + Number(p.value || 0), 0);
  return pageHead('وكالة الأنباء الجروبية', 'الأخبار',
    'الجريدة الرسمية للدولة — بيانات وبيانات وزارات وأخبار المواطنين.', '') +
  `<div class="card"><h3 class="section-title">آخر الأخبار</h3>
    ${S.articles.length ? S.articles.map(a => `<div style="padding:14px 0;border-bottom:1px solid var(--line)"><span class="pill">${esc(a.source)}</span><div class="row-title" style="margin-top:8px">${esc(a.title)}</div><div class="row-sub">${esc(a.date)}</div><p class="small muted" style="line-height:1.9;margin:8px 0 0">${esc(a.body)}</p></div>`).join('')
    : '<div class="empty">جارٍ تحميل الأخبار…</div>'}
  </div>
  <div class="card"><h3 class="section-title">مشاريع الدولة</h3>
    <p class="small muted" style="line-height:1.9">عند اعتماد مشروع (إطلاقه) تُضاف قيمته إلى خزينة الدولة فوراً ويظهر خبر إطلاقه في الجريدة. مجموع ما أُطلق: <span class="gold">${num(total)} دولار جروبي</span></p>
    ${S.projects.length ? S.projects.map(p => `<div class="row"><div class="row-main"><div class="row-title">${esc(p.name)}</div><div class="row-sub">${esc(p.status)}</div></div><div style="display:flex;align-items:center;gap:12px"><span class="row-amount">${num(p.value)}</span>${p.status !== 'مُطلق' ? `<button class="btn btn-gold btn-sm" data-action="launch-project" data-id="${p.id}">إطلاق</button>` : '<span class="pill">مُطلق</span>'}</div></div>`).join('')
    : '<div class="empty">جارٍ التحميل…</div>'}
  </div>
  <p class="small muted center" style="margin-top:18px">كل ما يُنشر هنا افتراضي وللتسلية فقط، ولا يمثل أي جهة إعلامية حقيقية.</p>`;
}

function renderConstitution() {
  return pageHead('الوثيقة التأسيسية', 'دستور الدولة', 'بسم الله الرحمن الرحيم — وثيقة رمزية لدولة افتراضية أُنشئت للتسلية.', '') +
    `<div class="card constitution"><h2 class="section-title">دستور الدولة الجروبية</h2>
      ${CONSTITUTION.map(([t, b]) => `<h4>${t}</h4><p>${b}</p>`).join('')}
      <p class="muted small" style="margin-top:20px">وثيقة رمزية لدولة افتراضية أُنشئت للتسلية — لا تترتب عليها أي آثار قانونية.</p>
      <button class="btn btn-sm" style="margin-top:14px" data-action="go-home">العودة للرئيسية</button></div>`;
}

/* ---------- router ---------- */
function render() {
  const r = currentRoute();
  const pages = {
    '/': renderHome, '/wallet': renderWallet, '/bank': renderBank, '/elections': renderElections,
    '/parliament': renderParliament, '/court': renderCourt, '/market': renderMarket,
    '/park': renderPark, '/news': renderNews, '/constitution': renderConstitution,
  };
  renderShell();
  $('#main').innerHTML = (pages[r] || renderHome)();
  closeModal();
  window.scrollTo({ top: 0 });
}

/* ---------- toast + modal ---------- */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  $('#toastRoot').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
function openModal(type, data = {}) {
  const body = modalBody(type, data);
  $('#modalRoot').innerHTML = `<div class="modal-backdrop" data-close="1"><div class="modal ${data.wide ? 'wide' : ''}">
    <div class="modal-head"><div><h2 class="modal-title">${data.title || ''}</h2>${data.sub ? `<div class="modal-sub">${data.sub}</div>` : ''}</div><button class="x-btn" data-action="close-modal">${icon('x')}</button></div>
    ${body}</div></div>`;
}
function closeModal() { $('#modalRoot').innerHTML = ''; }

function modalBody(type, d) {
  if (type === 'auth') {
    const reg = d.mode === 'register';
    return `<div class="tabs"><button class="tab ${reg?'active':''}" data-action="auth-switch" data-mode="register">حساب جديد</button><button class="tab ${!reg?'active':''}" data-action="auth-switch" data-mode="login">تسجيل الدخول</button></div>
      <form data-form="auth" data-mode="${reg?'register':'login'}">
        ${reg ? `<div class="field"><label>الاسم الكامل</label><input name="name" required placeholder="اكتب اسمك"></div>` : ''}
        <div class="field"><label>البريد الإلكتروني</label><input name="email" type="email" required placeholder="name@example.com" value="${esc(d.email||'')}"></div>
        <div class="field"><label>كلمة المرور</label><input name="password" type="password" required placeholder="••••••••" minlength="4"></div>
        <button class="btn btn-gold btn-block" type="submit">${reg ? 'إنشاء الحساب' : 'دخول'}</button>
      </form>
      <p class="small muted center" style="margin:14px 0 0">حساب وهمي للتسلية — لا تُدخل بيانات حقيقية.</p>`;
  }
  if (type === 'account') {
    if (!isLogged()) return `<div class="empty">ليس لديك حساب بعد.<br><button class="btn btn-gold btn-sm" style="margin-top:14px" data-action="auth" data-mode="register">إنشاء حساب</button></div>`;
    return `<div class="card" style="box-shadow:none;background:rgba(255,255,255,.02)">
      <div class="row"><div class="row-main"><div class="row-title">${esc(S.user.name)}</div><div class="row-sub">${esc(S.user.email)}</div></div><div class="avatar">${esc(S.user.name[0])}</div></div>
      <div class="row"><div class="row-main"><div class="row-sub">رقم الهوية</div></div><div class="gold">${esc(S.user.nationalId || '—')}</div></div>
      <div class="row"><div class="row-main"><div class="row-sub">الرصيد</div></div><div class="gold">${fmt(S.user.balance)}</div></div>
      <div class="row"><div class="row-main"><div class="row-sub">عضو منذ</div></div><div>${shortDate(new Date(S.user.createdAt))}</div></div>
    </div>
    <button class="btn btn-block" style="margin-top:14px" data-action="logout">تسجيل الخروج</button>`;
  }
  if (type === 'idcard') {
    const name = S.user?.name || 'مواطن جروبي';
    const id = S.user?.nationalId || newNationalId();
    return `<div class="id-card"><div class="center" style="font-family:var(--font-display);color:rgb(var(--primary));font-size:18px;margin-bottom:12px">الدولة الجروبية — بطاقة الهوية الوطنية</div>
      <div class="id-row"><span>الاسم</span><span>${esc(name)}</span></div>
      <div class="id-row"><span>رقم الهوية</span><span class="gold">${esc(id)}</span></div>
      <div class="id-row"><span>الجنسية</span><span>جروبي</span></div>
      <div class="id-row"><span>تاريخ الإصدار</span><span>${shortDate()}</span></div>
      <div class="center small muted" style="margin-top:16px">بطاقة وهمية للتسلية فقط</div></div>`;
  }
  if (type === 'constitution') {
    return `<p class="gold" style="font-family:var(--font-display)">بسم الله الرحمن الرحيم</p>${CONSTITUTION.map(([t,b]) => `<h4 style="font-family:var(--font-display);color:rgb(var(--primary));margin:16px 0 0">${t}</h4><p class="small muted" style="line-height:2">${b}</p>`).join('')}
      <p class="small muted center" style="margin-top:18px">وثيقة رمزية لدولة افتراضية — لا آثار قانونية.</p>`;
  }
  if (type === 'pay') {
    return `<form data-form="pay"><div class="field"><label>المستفيد</label><input name="to" required placeholder="اسم المواطن"></div>
      <div class="field"><label>المبلغ (دولار جروبي)</label><input name="amount" type="number" min="1" required placeholder="0"></div>
      <div class="field"><label>الملاحظة</label><input name="note" placeholder="اختياري"></div>
      <button class="btn btn-gold btn-block" type="submit">${icon('send')} تأكيد الدفع</button></form>`;
  }
  if (type === 'transfer') {
    return `<form data-form="transfer"><div class="field"><label>من السجل العام — المستفيد</label><select name="to">${['هالة منصور','كريم عبد السلام','مصطفى شريف','ليلى أحمد','يوسف فؤاد'].map(n=>`<option>${n}</option>`).join('')}</select></div>
      <div class="field"><label>المبلغ (دولار جروبي)</label><input name="amount" type="number" min="1" required placeholder="0"></div>
      <button class="btn btn-gold btn-block" type="submit">${icon('send')} تحويل</button></form>
      <p class="small muted center" style="margin:12px 0 0">سعر الصرف: ${S.bank.exchangeRate || 3.75} دولار جروبي لكل دولار أمريكي</p>`;
  }
  if (type === 'new-business') {
    return `<form data-form="business"><div class="field"><label>اسم المنشأة</label><input name="name" required placeholder="مثال: مقهى جروبة"></div>
      <div class="field"><label>النوع</label><select name="type"><option value="shop">متجر / سوق</option><option value="office">مكتب خدمات</option></select></div>
      <div class="field"><label>التصنيف</label><input name="category" required placeholder="مثال: مقاهي، استشارات قانونية، تصميم"></div>
      <button class="btn btn-gold btn-block" type="submit">${icon('plus')} فتح المنشأة</button></form>`;
  }
  if (type === 'new-room') {
    return `<form data-form="room"><div class="field"><label>اسم الغرفة</label><input name="name" required placeholder="مثال: ليلة الجواسيس"></div>
      <div class="field"><label>اللعبة</label><select name="game"><option>شبكة الجواسيس</option><option>برا السالفة</option><option>الجاسوس في القضية</option></select></div>
      <button class="btn btn-gold btn-block" type="submit">${icon('plus')} إنشاء الغرفة (500 دولار جروبي)</button></form>`;
  }
  if (type === 'choose-speaker') {
    return `<form data-form="speaker"><div class="field"><label>اسم رئيس المجلس</label><input name="name" required placeholder="اسم المواطن"></div><button class="btn btn-gold btn-block" type="submit">تعيين</button></form>`;
  }
  if (type === 'join-room') {
    return `<div class="center"><div style="font-size:44px;letter-spacing:.3em;color:rgb(var(--primary));font-family:var(--font-display)">${esc(d.code)}</div><p class="small muted">كود الغرفة — شاركه مع أصدقائك للدخول</p><button class="btn btn-gold" data-action="close-modal">حسناً</button></div>`;
  }
  return '';
}

/* ---------- actions / business logic ---------- */
function addTx(title, amount, type) {
  S.transactions.push({ id: uid(), title, amount, type, date: shortDate() });
}
function addToWallet(amount, title, type) {
  if (!S.user) return;
  S.user.balance += amount;
  addTx(title, amount, type);
}

function handleAction(el) {
  const a = el.dataset.action;
  if (a === 'auth') { openModal('auth', { mode: el.dataset.mode || 'register', title: el.dataset.mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد' }); return; }
  if (a === 'auth-switch') { openModal('auth', { mode: el.dataset.mode, title: el.dataset.mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد' }); return; }
  if (a === 'close-modal') { closeModal(); return; }
  if (a === 'account') { openModal('account', { title: 'حسابي' }); return; }
  if (a === 'constitution') { openModal('constitution', { title: 'دستور الدولة الجروبية', wide: true }); return; }
  if (a === 'go-home') { navigate('/'); return; }
  if (a === 'theme') { S.theme = el.dataset.theme; save(); render(); toast('تم تغيير مظهر الدولة'); return; }
  if (a === 'issue-id') {
    if (!requireAuth('إصدار البطاقة')) return;
    S.user.nationalId = S.user.nationalId || newNationalId();
    S.idIssued = true; save(); render(); toast('تم إصدار بطاقتك الوطنية'); return;
  }
  if (a === 'idcard') { openModal('idcard', { title: 'البطاقة الوطنية' }); return; }
  if (a === 'issue-passport') { toast('تم إصدار جواز السفر الجروبي'); return; }
  if (a === 'issue-licence') { toast('تم طلب الرخصة — صالحة لأسبوعين'); return; }
  if (a === 'salary') {
    if (!requireAuth('استلام الراتب')) return;
    const now = new Date();
    const last = S.user.salaryClaimedAt ? new Date(S.user.salaryClaimedAt) : null;
    if (last && last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear()) { toast('استلمت راتب هذا الشهر بالفعل'); return; }
    S.user.salaryClaimedAt = now.toISOString();
    addToWallet(6000, 'الراتب الشهري من الدولة', 'salary');
    S.bank.issued += 6000; S.bank.spent += 6000; S.bank.reserve -= 6000;
    save(); render(); toast('تم صرف راتبك الشهري: 6,000 دولار جروبي'); return;
  }
  if (a === 'pay' || a === 'transfer') { if (requireAuth('إجراء مالي')) openModal(a, { title: a === 'pay' ? 'دفع / تحويل' : 'تحويل إلى مواطن آخر' }); return; }
  if (a === 'vote') {
    if (!requireAuth('التصويت')) return;
    if (!isThursday()) { toast('صندوق الانتخابات مغلق — يفتح يوم الخميس'); return; }
    if (S.votedFor) { toast('صوّتت بالفعل'); return; }
    const c = S.candidates.find(x => x.id === el.dataset.id);
    c.votes++; S.votedFor = c.id;
    if (S.user) S.user.votedFor = c.id;
    save(); render(); toast('تم تسجيل صوتك ✓'); return;
  }
  if (a === 'law-vote') {
    if (!requireAuth('التصويت على القانون')) return;
    const l = S.laws.find(x => x.id === el.dataset.id);
    if (S.lawVotes[l.id]) { toast('صوّتت على هذا القانون بالفعل'); return; }
    l[el.dataset.v === 'yes' ? 'yes' : 'no']++; S.lawVotes[l.id] = el.dataset.v;
    if (S.user) S.user.lawVotes = { ...S.lawVotes };
    save(); render(); toast('تم تسجيل صوتك'); return;
  }
  if (a === 'choose-speaker') { openModal('choose-speaker', { title: 'اختيار رئيس مجلس الشعب' }); return; }
  if (a === 'pay-fine') {
    if (!requireAuth('سداد المخالفة')) return;
    const v = S.violations.find(x => x.id === el.dataset.id);
    if (S.user.balance < v.amount) { toast('الرصيد غير كافٍ'); return; }
    v.paid = true; addToWallet(-v.amount, 'سداد مخالفة', 'fine'); S.bank.collected += v.amount;
    save(); render(); toast('تم سداد المخالفة'); return;
  }
  if (a === 'new-business') { if (requireAuth('فتح منشأة')) openModal('new-business', { title: 'منشأة جديدة' }); return; }
  if (a === 'buy') {
    if (!requireAuth('الدفع')) return;
    const b = S.businesses.find(x => x.id === el.dataset.id);
    openModal('pay', { title: `الدفع إلى ${b.name}` }); return;
  }
  if (a === 'new-room') { if (requireAuth('إنشاء غرفة')) openModal('new-room', { title: 'غرفة جديدة' }); return; }
  if (a === 'join-room') { const r = S.rooms.find(x => x.id === el.dataset.id); openModal('join-room', { title: r.name, code: r.code }); return; }
  if (a === 'launch-project') {
    const p = S.projects.find(x => x.id === el.dataset.id);
    p.status = 'مُطلق'; S.bank.collected += Number(p.value); S.bank.reserve += Number(p.value);
    S.articles.unshift({ id: uid(), title: `إطلاق مشروع: ${p.name}`, source: 'ديوان الدولة', date: shortDate(), body: `تم اعتماد وإطلاق مشروع ${p.name} بقيمة ${num(p.value)} دولار جروبي، وقد أُضيفت قيمته إلى خزينة الدولة.` });
    save(); render(); toast('تم إطلاق المشروع وإضافة قيمته للخزينة'); return;
  }
  if (a === 'logout') { if (window.DB && DB.enabled) DB.logout(); S.user = null; S.idIssued = false; S.votedFor = null; S.lawVotes = {}; save(); closeModal(); render(); toast('تم تسجيل الخروج'); return; }
}

/* ---------- forms ---------- */
function handleSubmit(form) {
  const f = form.dataset.form;
  const data = Object.fromEntries(new FormData(form));
  if (f === 'auth') {
    (async () => {
      try {
        if (window.DB && DB.enabled) {
          if (form.dataset.mode === 'register') {
            S.user = await DB.register(data.name.trim(), data.email.trim(), data.password);
            S.idIssued = false;
          } else {
            S.user = await DB.login(data.email.trim(), data.password);
            S.idIssued = !!S.user.nationalId;
          }
        } else {
          if (form.dataset.mode === 'register') {
            S.user = { name: data.name.trim(), email: data.email.trim(), balance: 5000, nationalId: newNationalId(), createdAt: Date.now(), salaryClaimedAt: null };
            S.idIssued = false;
          } else {
            S.user = { name: data.email.split('@')[0] || 'مواطن', email: data.email.trim(), balance: 5000, nationalId: newNationalId(), createdAt: Date.now(), salaryClaimedAt: null };
          }
        }
        S.votedFor = S.user.votedFor || null;
        S.lawVotes = S.user.lawVotes || {};
        save(); closeModal(); render();
        toast(form.dataset.mode === 'register' ? 'تم إنشاء حسابك — أهلاً بك في الدولة الجروبية' : 'تم تسجيل الدخول بنجاح');
      } catch (err) {
        toast('تعذر إتمام العملية — تأكد من البريد وكلمة المرور');
      }
    })();
    return;
  }
  if (f === 'pay' || f === 'transfer') {
    const amount = Number(data.amount);
    if (!S.user || S.user.balance < amount) { toast('الرصيد غير كافٍ'); return; }
    addToWallet(-amount, `تحويل إلى ${data.to || data.name}`, 'transfer');
    S.bank.transfers.push({ from: S.user.name, to: data.to || '—', amount, date: shortDate() });
    save(); closeModal(); render(); toast(`تم تحويل ${num(amount)} دولار جروبي`); return;
  }
  if (f === 'business') {
    S.businesses.push({ id: uid(), name: data.name.trim(), type: data.type, category: data.category.trim(), owner: S.user?.name || 'مالك الدولة' });
    save(); closeModal(); render(); toast('تم فتح المنشأة'); return;
  }
  if (f === 'room') {
    if (S.user && S.user.balance < 500) { toast('الرصيد غير كافٍ لإنشاء الغرفة'); return; }
    const code = Array.from({ length: 5 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    if (S.user) addToWallet(-500, 'رسوم إنشاء غرفة لعب', 'fee');
    S.rooms.push({ id: uid(), name: data.name.trim(), game: data.game, code, players: [S.user?.name || 'المالك'] });
    save(); closeModal(); render(); toast('تم إنشاء الغرفة'); return;
  }
  if (f === 'speaker') { S.parliamentSpeaker = data.name.trim(); save(); closeModal(); render(); toast('تم تعيين رئيس المجلس'); return; }
}

/* ---------- global events ---------- */
document.addEventListener('click', (e) => {
  const close = e.target.closest('[data-close]');
  if (close && e.target === close) { closeModal(); return; }
  const action = e.target.closest('[data-action]');
  if (action) { e.preventDefault(); handleAction(action); return; }
  const wt = e.target.closest('[data-wtab]');
  if (wt) {
    $$('[data-wtab]').forEach(x => x.classList.remove('active')); wt.classList.add('active');
    const t = S.transactions;
    const inc = t.filter(x=>x.amount>0).reduce((a,b)=>a+b.amount,0);
    const out = t.filter(x=>x.amount<0).reduce((a,b)=>a+Math.abs(b.amount),0);
    const fines = t.filter(x=>x.type==='fine').length;
    $('#walletPanel').innerHTML = walletPanel(wt.dataset.wtab, t, inc, out, fines); return;
  }
  const mt = e.target.closest('[data-mtab]');
  if (mt) {
    $$('[data-mtab]').forEach(x=>x.classList.remove('active')); mt.classList.add('active');
    const k = Number(mt.dataset.mtab);
    const list = S.businesses.filter(b => k===0 || (k===1&&b.type==='shop') || (k===2&&b.type==='office') || (k===3&&b.owner===S.user?.name));
    $('#businessList').innerHTML = list.length ? list.map(b => `<div class="row"><div class="service-ico" style="width:34px;height:34px;flex:0 0 34px">${icon(b.type==='shop'?'store':'building')}</div><div class="row-main" style="flex:1"><div class="row-title">${esc(b.name)}</div><div class="row-sub">${esc(b.category)} · ${b.type==='shop'?'متجر':'مكتب'} · ${esc(b.owner)}</div></div><button class="btn btn-sm" data-action="buy" data-id="${b.id}">دفع</button></div>`).join('') : '<div class="empty">لا توجد منشآت في هذا التصنيف.</div>';
    return;
  }
});
document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-form]');
  if (form) { e.preventDefault(); handleSubmit(form); }
});
window.addEventListener('hashchange', render);

/* ---------- init ---------- */
function boot() {
  render(); // show the UI instantly from defaults / cached state
  if (window.DB && DB.enabled) {
    DB.init(S).then(ok => {
      if (!ok) return;
      try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {}
      DB.pushAll(S); // keep seeded defaults and the signed-in user in sync
      render();
    }).catch(() => {});
  }
}
boot();

// Keep every visitor in sync with the shared database (skip while a form is open).
async function refreshFromDB() {
  if (!window.DB || !DB.enabled) return;
  if ($('#modalRoot').innerHTML) return;
  try { await DB.reload(S); render(); } catch (e) { /* offline / temporary error */ }
}
setInterval(refreshFromDB, 15000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshFromDB();
});
