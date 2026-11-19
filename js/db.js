/* ============================================================
   Supabase data layer — shared state between all visitors.
   Uses PostgREST over fetch, so no npm/build step is needed.
   Works offline (localStorage mode) until config.js is filled.
   ============================================================ */
window.DB = (function () {
  const URL_RAW = (window.JRB_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const KEY = (window.JRB_SUPABASE_KEY || window.JRB_SUPABASE_ANON_KEY || '').trim();
  const enabled = /^https?:\/\//.test(URL_RAW) && KEY.length > 20;
  const secrets = {}; // password hashes + tokens are never kept in the app state
  const TOKEN_KEY = 'jrb_token';

  function headers(prefer) {
    const h = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
    if (prefer) h.Prefer = prefer;
    return h;
  }
  async function request(method, table, qs, body, prefer) {
    const res = await fetch(`${URL_RAW}/rest/v1/${table}?${qs || 'select=*'}`, {
      method, headers: headers(prefer),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${table} → ${res.status} ${(await res.text()).slice(0, 200)}`);
    const txt = await res.text();
    return txt ? JSON.parse(txt) : [];
  }
  const select = (table, qs) => request('GET', table, qs);
  const upsert = (table, rows) => request('POST', table, '', rows, 'resolution=merge-duplicates,return=representation');
  const rid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  const num = (v) => Number(v || 0);

  /* ---------- password hashing (toy-grade, fictional accounts) ---------- */
  function fallbackHash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }
  async function hashPw(pw, salt) {
    if (window.crypto && crypto.subtle) {
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt.toLowerCase() + '::' + pw));
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) { /* file:// or older browser → fallback */ }
    }
    return fallbackHash(salt.toLowerCase() + '::' + pw);
  }

  /* ---------- row mappers ---------- */
  function mapUser(r) {
    return {
      id: r.id, name: r.name, email: r.email,
      nationalId: r.national_id || null, balance: num(r.balance),
      role: r.role || 'citizen',
      createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
      salaryClaimedAt: r.salary_claimed_at || null,
      votedFor: r.voted_for || null,
      lawVotes: r.law_votes || {},
    };
  }
  function userRow(u) {
    const s = secrets[u.id] || {};
    return {
      id: u.id, name: u.name, email: u.email,
      password_hash: s.hash || '', national_id: u.nationalId || null,
      balance: num(u.balance), role: u.role || 'citizen',
      created_at: new Date(u.createdAt || Date.now()).toISOString(),
      salary_claimed_at: u.salaryClaimedAt ? new Date(u.salaryClaimedAt).toISOString() : null,
      voted_for: u.votedFor || null, law_votes: u.lawVotes || {}, token: s.token || null,
    };
  }
  const bankRow = b => ({ id: 'main', reserve: num(b.reserve), issued: num(b.issued), collected: num(b.collected), spent: num(b.spent), exchange_rate: num(b.exchangeRate || 3.75) });
  const bankFrom = r => r ? ({ reserve: num(r.reserve), issued: num(r.issued), collected: num(r.collected), spent: num(r.spent), exchangeRate: num(r.exchange_rate || 3.75) }) : null;
  const settingsRow = S => ({ id: 'main', speaker: S.parliamentSpeaker || null, judge: S.judge || 'ادم وائل إسماعيل', flag: S.flag || null, anthem: S.anthem || null });
  const candRow = c => ({ id: c.id, name: c.name, slogan: c.slogan, votes: num(c.votes) });
  const lawRow = l => ({ id: l.id, title: l.title, description: l.desc || l.description || '', yes: num(l.yes), no: num(l.no), status: l.status || 'open' });
  const lawFrom = r => ({ id: r.id, title: r.title, desc: r.description || '', yes: num(r.yes), no: num(r.no), status: r.status || 'open' });
  const txRow = (t, uid) => ({ id: t.id, user_id: uid, title: t.title, amount: num(t.amount), type: t.type, date: t.date });
  const txFrom = r => ({ id: r.id, title: r.title, amount: num(r.amount), type: r.type, date: r.date });
  const vioRow = (v, uid) => ({ id: v.id, user_id: uid, title: v.title, amount: num(v.amount), paid: !!v.paid, date: v.date });
  const vioFrom = r => ({ id: r.id, title: r.title, amount: num(r.amount), paid: !!r.paid, date: r.date });
  const caseRow = c => ({ id: c.id, title: c.title, defendant: c.defendant, status: c.status, date: c.date });
  const bizRow = b => ({ id: b.id, owner_id: b.ownerId || null, owner_name: b.owner, name: b.name, type: b.type, category: b.category });
  const bizFrom = r => ({ id: r.id, owner: r.owner_name, name: r.name, type: r.type, category: r.category, ownerId: r.owner_id });
  const saleRow = x => ({ id: x.id, title: x.title, amount: num(x.amount), tax: num(x.tax), date: x.date });
  const saleFrom = r => ({ id: r.id, title: r.title, amount: num(r.amount), tax: num(r.tax), date: r.date });
  const roomRow = m => ({ id: m.id, name: m.name, game: m.game, code: m.code, host: m.host || (m.players ? m.players[0] : null), players: m.players || [], phase: m.phase || 'waiting', word: m.word || null, roles: m.roles || {} });
  const roomFrom = r => ({ id: r.id, name: r.name, game: r.game, code: r.code, host: r.host, players: r.players || [], phase: r.phase || 'waiting', word: r.word || null, roles: r.roles || {} });
  const artRow = a => ({ id: a.id, title: a.title, source: a.source, body: a.body, date: a.date });
  const projRow = p => ({ id: p.id, name: p.name, value: num(p.value), status: p.status });

  /* ---------- public API ---------- */
  async function init(S) {
    if (!enabled) return false;
    try {
      // Seed once per browser, in ONE parallel batch instead of 6 chained requests.
      if (!localStorage.getItem('jrb_seeded')) {
        const seeds = [
          ['candidates', S.candidates.map(candRow)],
          ['laws', S.laws.map(lawRow)],
          ['articles', S.articles.map(artRow)],
          ['projects', S.projects.map(projRow)],
        ];
        const checks = await Promise.all([
          ...seeds.map(([t]) => select(t, 'select=id')),
          select('bank', 'select=id'), select('settings', 'select=id'),
        ]);
        const jobs = [];
        seeds.forEach(([table, rows], i) => { if (!checks[i].length && rows.length) jobs.push(upsert(table, rows)); });
        if (!checks[seeds.length].length) jobs.push(upsert('bank', [bankRow(S.bank)]));
        if (!checks[seeds.length + 1].length) jobs.push(upsert('settings', [settingsRow(S)]));
        await Promise.all(jobs);
        localStorage.setItem('jrb_seeded', '1');
      }
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        const rows = await select('users', `token=eq.${encodeURIComponent(token)}&select=*`);
        if (rows.length) S.user = mapUser(rows[0]);
      }
      await reload(S);
      return true;
    } catch (e) {
      console.warn('[DB] init failed, using local mode:', e);
      return false;
    }
  }

  // One RPC call returns the whole public state. Falls back to parallel
  // per-table reads if the RPC has not been installed yet.
  async function loadBundle() {
    try {
      const res = await fetch(`${URL_RAW}/rest/v1/rpc/app_state`, {
        method: 'POST', headers: headers(), body: '{}',
      });
      if (res.ok) return await res.json();
    } catch (e) { /* fall through */ }
    const [bank, settings, candidates, laws, violations, cases, businesses, sales, rooms, articles, projects, users] = await Promise.all([
      select('bank'), select('settings'), select('candidates'), select('laws'),
      select('violations'), select('cases'), select('businesses'), select('sales'),
      select('rooms'), select('articles'), select('projects'), select('users'),
    ]);
    return { bank, settings, candidates, laws, violations, cases, businesses, sales, rooms, articles, projects, users };
  }

  function applyState(S, d) {
    const b = bankFrom((d.bank || [])[0]); if (b) S.bank = b;
    const st = (d.settings || [])[0];
    if (st) {
      S.parliamentSpeaker = st.speaker || null;
      S.judge = st.judge || S.judge;
      S.flag = st.flag || null;
      S.anthem = st.anthem || null;
    }
    if ((d.candidates || []).length) S.candidates = d.candidates.map(c => ({ id: c.id, name: c.name, slogan: c.slogan, votes: num(c.votes) }));
    if ((d.laws || []).length) S.laws = d.laws.map(lawFrom);
    S.articles = (d.articles || []).map(a => ({ id: a.id, title: a.title, source: a.source, body: a.body, date: a.date }));
    S.projects = (d.projects || []).map(p => ({ id: p.id, name: p.name, value: num(p.value), status: p.status }));
    S.violations = (d.violations || []).map(vioFrom);
    S.cases = (d.cases || []).map(c => ({ id: c.id, title: c.title, defendant: c.defendant, status: c.status, date: c.date }));
    S.businesses = (d.businesses || []).map(bizFrom);
    S.sales = (d.sales || []).map(saleFrom);
    S.rooms = (d.rooms || []).map(roomFrom);
    S.users = (d.users || []).map(u => ({ id: u.id, name: u.name, email: u.email, balance: num(u.balance), role: u.role || 'citizen' }));
  }

  async function reload(S) {
    if (!enabled) return;
    const d = await loadBundle();
    applyState(S, d);
    if (S.user) {
      const fresh = (d.users || []).find(u => u.id === S.user.id);
      if (fresh) S.user = mapUser(fresh);
      S.votedFor = S.user.votedFor || null;
      S.lawVotes = S.user.lawVotes || {};
      S.transactions = (await select('transactions', `user_id=eq.${encodeURIComponent(S.user.id)}&select=*`)).map(txFrom);
    }
    S.idIssued = !!(S.user && S.user.nationalId);
  }

  async function pushAll(S) {
    if (!enabled) return;
    try {
      const jobs = [
        upsert('bank', [bankRow(S.bank)]),
        upsert('settings', [settingsRow(S)]),
      ];
      if (S.user) jobs.push(upsert('users', [userRow(S.user)]));
      if (S.candidates.length) jobs.push(upsert('candidates', S.candidates.map(candRow)));
      if (S.laws.length) jobs.push(upsert('laws', S.laws.map(lawRow)));
      if (S.articles.length) jobs.push(upsert('articles', S.articles.map(artRow)));
      if (S.projects.length) jobs.push(upsert('projects', S.projects.map(projRow)));
      if (S.violations.length) jobs.push(upsert('violations', S.violations.map(v => vioRow(v, S.user ? S.user.id : null))));
      if (S.cases.length) jobs.push(upsert('cases', S.cases.map(caseRow)));
      if (S.businesses.length) jobs.push(upsert('businesses', S.businesses.map(bizRow)));
      if (S.sales.length) jobs.push(upsert('sales', S.sales.map(saleRow)));
      if (S.rooms.length) jobs.push(upsert('rooms', S.rooms.map(roomRow)));
      if (S.user && S.transactions.length) jobs.push(upsert('transactions', S.transactions.map(t => txRow(t, S.user.id))));
      await Promise.all(jobs);
    } catch (e) {
      console.warn('[DB] push failed:', e);
    }
  }

  async function register(name, email, password) {
    const id = 'usr_' + rid();
    const hash = await hashPw(password, email);
    const token = rid();
    secrets[id] = { hash, token };
    const existing = await select('users', 'select=id');
    const role = existing.length === 0 ? 'owner' : 'citizen'; // first account owns the state
    const u = {
      id, name, email, nationalId: 'JRB-' + Math.floor(100000 + Math.random() * 900000),
      balance: 5000, role, createdAt: Date.now(),
      salaryClaimedAt: null, votedFor: null, lawVotes: {},
    };
    await upsert('users', [userRow(u)]);
    localStorage.setItem(TOKEN_KEY, token);
    return u;
  }

  async function login(email, password) {
    const rows = await select('users', `email=eq.${encodeURIComponent(email)}&select=id,email,password_hash,token`);
    if (!rows.length) throw new Error('not found');
    const hash = await hashPw(password, email);
    if (rows[0].password_hash !== hash) throw new Error('bad password');
    const token = rows[0].token || rid();
    secrets[rows[0].id] = { hash, token };
    localStorage.setItem(TOKEN_KEY, token);
    const full = await select('users', `id=eq.${encodeURIComponent(rows[0].id)}&select=*`);
    if (!full.length) throw new Error('missing user');
    if (!full[0].token || full[0].token !== token) await upsert('users', [userRow(mapUser(full[0]))]);
    return mapUser(full[0]);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    Object.keys(secrets).forEach(k => delete secrets[k]);
  }

  /* ---------- Google OAuth (Supabase Auth) ---------- */
  function googleUrl() {
    const back = location.origin + location.pathname;
    return `${URL_RAW}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(back)}`;
  }

  async function handleOAuthCallback(S) {
    const raw = location.hash || '';
    if (!raw.includes('access_token=')) return null;
    try {
      const params = new URLSearchParams(raw.replace(/^#/, ''));
      const access = params.get('access_token');
      if (!access) return null;
      const res = await fetch(`${URL_RAW}/auth/v1/user`, {
        headers: { apikey: KEY, Authorization: 'Bearer ' + access },
      });
      if (!res.ok) return null;
      const au = await res.json();
      const email = au.email;
      if (!email) return null;
      const name = (au.user_metadata && (au.user_metadata.full_name || au.user_metadata.name)) || email.split('@')[0];

      const existing = await select('users', `email=eq.${encodeURIComponent(email)}&select=*`);
      let u;
      if (existing.length) {
        u = mapUser(existing[0]);
      } else {
        const id = 'usr_' + rid();
        const token = rid();
        secrets[id] = { hash: '', token };
        const isFirst = (await select('users', 'select=id')).length === 0;
        u = {
          id, name, email,
          nationalId: 'JRB-' + Math.floor(100000 + Math.random() * 900000),
          balance: 5000, role: isFirst ? 'owner' : 'citizen', createdAt: Date.now(),
          salaryClaimedAt: null, votedFor: null, lawVotes: {},
        };
        await upsert('users', [userRow(u)]);
      }
      const token = (existing.length && existing[0].token) || (secrets[u.id] && secrets[u.id].token) || rid();
      secrets[u.id] = { hash: (existing.length && existing[0].password_hash) || '', token };
      localStorage.setItem(TOKEN_KEY, token);
      if (existing.length && existing[0].token !== token) await upsert('users', [userRow(u)]);

      // strip OAuth tokens from the address bar
      history.replaceState(null, '', location.pathname + location.search);
      return u;
    } catch (e) {
      console.warn('[DB] Google callback failed', e);
      return null;
    }
  }

  function asDataURL(file) {
    return new Promise(resolve => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
    });
  }

  async function uploadAsset(file, kind) {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${kind}-${Date.now()}.${ext}`;
    if (enabled) {
      try {
        const res = await fetch(`${URL_RAW}/storage/v1/object/state-assets/${path}`, {
          method: 'POST',
          headers: {
            apikey: KEY, Authorization: 'Bearer ' + KEY,
            'Content-Type': file.type || 'application/octet-stream',
            'x-upsert': 'true',
          },
          body: file,
        });
        if (res.ok) return `${URL_RAW}/storage/v1/object/public/state-assets/${path}`;
      } catch (e) { /* fall through to inline storage */ }
    }
    // Works even before the Storage bucket is installed: keep the file inline
    // in the settings row so the owner can upload immediately.
    return await asDataURL(file);
  }

  return { enabled, init, reload, pushAll, register, login, logout, googleUrl, handleOAuthCallback, uploadAsset };
})();
