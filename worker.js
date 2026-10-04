import { DurableObject } from "cloudflare:workers";
import html from "./index.html";

// قیمت‌های بدون عدد از طرف من حدس زده شده، راحت عوض کن
const CAT = {
  handk:  { n: "سد دستمالی", i: "🧻", k: "def", p: 200, q: 20, hp: 2, d: "بسته ۲۰ تایی، هر کدام ۲ ضربه. در برابر منگنه ضعیف" },
  thread: { n: "سیم نخ خیس", i: "🧵", k: "def", p: 150, q: 5, hp: 3, d: "حمله زمینی (تانک، ای‌کی) را ضعیف می‌کند" },
  ped:    { n: "پدافند دستمالی", i: "📡", k: "def", p: 250, q: 1, hp: 6, d: "برابر جنگنده مقاوم" },
  wall:   { n: "دیوار آبی", i: "🟦", k: "def", p: 100, q: 1, hp: 15, d: "مقوای ضخیم" },
  eraser: { n: "سد پاک‌کنی", i: "🧽", k: "def", p: 600, q: 1, hp: 60, d: "فقط پرگار آن را خوب می‌شکند" },
  clip:   { n: "سیم‌خاردار گیره", i: "📎", k: "def", p: 50, q: 1, hp: 4, d: "حمله زمینی را ضعیف می‌کند" },
  card:   { n: "کارت ویزیت", i: "🪪", k: "def", p: 400, q: 2, hp: 8, d: "نازک ولی محکم، بسته ۲ تایی" },
  tank:   { n: "تانک ضد آب", i: "🚜", k: "atk", p: 400, pow: 20, d: "زمینی، قدرت ۲۰" },
  jet:    { n: "جنگنده آبی", i: "✈️", k: "atk", p: 500, pow: 30, d: "هوایی، قدرت ۳۰" },
  stapler:{ n: "توپ منگنه", i: "🔫", k: "atk", p: 300, pow: 40, d: "قدرت ۴۰، دستمال را سوراخ می‌کند، ۳ بار" },
  compass:{ n: "پرتابه پرگاری", i: "📐", k: "atk", p: 500, pow: 25, d: "پاک‌کن را ۳ برابر خراب می‌کند" },
  glue:   { n: "چسب ماتیکی", i: "💧", k: "atk", p: 550, q: 2, d: "حریف ۲ حمله بعدی‌اش را از دست می‌دهد" },
  ak:     { n: "ای‌کی‌دار", i: "🔸", k: "atk", p: 1, pow: 2, d: "ارزان، قدرت ۲" },
  paper_s:{ n: "کارخانه کاغذ کوچک", i: "📄", k: "inc", p: 200, hp: 10, inc: 200, d: "روزی ۲۰۰ تکه (باید در زمین بچینی)" },
  paper_m:{ n: "کارخانه کاغذ متوسط", i: "📚", k: "inc", p: 400, hp: 20, inc: 400, d: "روزی ۴۰۰ تکه (باید در زمین بچینی)" },
  cardcastle:{ n: "قلعه مقوایی", i: "🏯", k: "def", p: 300, hp: 40, lv: 1, d: "دفاع محکم" },
  pencil:  { n: "برج مداد", i: "✏️", k: "def", p: 250, hp: 30, lv: 1, d: "دفاع متوسط" },
  ruler:   { n: "خط‌کش فلزی", i: "📏", k: "def", p: 350, hp: 50, lv: 5, d: "دیوار بلند" },
  tape:    { n: "تله چسب نواری", i: "🩹", k: "def", p: 100, q: 2, hp: 12, lv: 1, d: "تانک را خیلی ضعیف می‌کند" },
  stapwall:{ n: "دیوار منگنه‌ای", i: "🗄️", k: "def", p: 450, hp: 35, lv: 8, d: "برابر توپ منگنه مقاوم" },
  book:    { n: "سپر کتاب", i: "📘", k: "def", p: 400, hp: 45, lv: 10, d: "سپر ضخیم" },
  marker:  { n: "پدافند ماژیک", i: "🖍️", k: "def", p: 500, hp: 20, lv: 12, d: "هواپیما و بمب‌افکن را ضعیف می‌کند" },
  ink:     { n: "خندق جوهر", i: "🖋️", k: "def", p: 200, q: 3, hp: 25, lv: 3, d: "پیاده و تانک را ضعیف می‌کند" },
  dome:    { n: "گنبد شفاف", i: "🔮", k: "def", p: 900, hp: 80, lv: 20, d: "موشک و بمب را ضعیف می‌کند" },
  vault:   { n: "گاوصندوق فولادی", i: "🔐", k: "def", p: 1200, hp: 120, lv: 30, d: "قوی‌ترین دفاع تکه‌ای" },
  pencil_missile:{ n: "موشک مداد", i: "🚀", k: "atk", p: 450, pow: 35, lv: 3, d: "قدرت ۳۵" },
  ink_bomb:{ n: "بمب جوهر", i: "⚫", k: "atk", p: 650, pow: 45, lv: 6, d: "قدرت ۴۵" },
  eraser_bot:{ n: "ربات پاک‌کن", i: "🤖", k: "atk", p: 500, pow: 28, lv: 8, d: "پاک‌کن را ۳ برابر خراب می‌کند" },
  plane:   { n: "هواپیمای کاغذی", i: "🛩️", k: "atk", p: 250, pow: 18, lv: 2, d: "ارزان و سریع" },
  clip_sling:{ n: "تیرکمان گیره", i: "🏹", k: "atk", p: 300, pow: 22, lv: 4, d: "قدرت ۲۲" },
  lighter: { n: "آتش‌افکن فندکی", i: "🔥", k: "atk", p: 550, pow: 38, lv: 10, d: "کاغذی‌ها را ۲.۵ برابر می‌سوزاند" },
  cutter:  { n: "کاتر برقی", i: "🔪", k: "atk", p: 450, pow: 30, lv: 7, d: "دیوارها را ۲ برابر می‌برد" },
  bomber:  { n: "بمب‌افکن A3", i: "💣", k: "atk", p: 900, pow: 55, lv: 12, d: "قدرت ۵۵" },
  ballistic:{ n: "موشک بالستیک", i: "☄️", k: "atk", p: 1500, pow: 80, lv: 20, d: "قدرت ۸۰" },
  nuke:    { n: "بمب کاغذی هسته‌ای", i: "☢️", k: "atk", p: 3000, pow: 150, lv: 40, d: "قدرت ۱۵۰" },
  pencil_mine:{ n: "معدن مداد", i: "⛏️", k: "inc", p: 300, hp: 15, inc: 300, lv: 3, d: "روزی ۳۰۰ تکه" },
  printer: { n: "چاپخانه", i: "🖨️", k: "inc", p: 800, hp: 20, inc: 700, lv: 5, d: "روزی ۷۰۰ تکه" },
  library: { n: "کتابخانه", i: "🏛️", k: "inc", p: 1500, hp: 30, inc: 1200, lv: 15, d: "روزی ۱۲۰۰ تکه" },
  tekke_bank:{ n: "بانک تکه", i: "🏦", k: "inc", p: 3000, hp: 35, inc: 2000, lv: 25, d: "روزی ۲۰۰۰ تکه" },
  a4_factory:{ n: "کارخانه کاغذ A4", i: "🏭", k: "inc", p: 6000, hp: 40, inc: 4000, lv: 40, d: "روزی ۴۰۰۰ تکه" },
  gold_tank:{ n: "تانک طلایی", i: "🥇", k: "atk", tp: 40, q: 3, pow: 60, d: "۳ عدد، قدرت ۶۰" },
  diamond_wall:{ n: "دیوار الماسی", i: "💎", k: "def", tp: 30, q: 2, hp: 120, d: "۲ عدد، بسیار محکم" },
  gold_mine:{ n: "معدن طلا", i: "💰", k: "inc", tp: 50, hp: 40, inc: 3000, d: "روزی ۳۰۰۰ تکه" },
};
const MULT = {
  eraser: { compass: 3, eraser_bot: 3, _: 0.3 }, handk: { stapler: 3, lighter: 2.5 }, wall: { jet: 0.5, plane: 0.5, cutter: 2 },
  ped: { jet: 0.3, plane: 0.3 }, thread: { tank: 0.4, ak: 0.4 }, clip: { tank: 0.4, ak: 0.4 }, tape: { tank: 0.3, ak: 0.3 },
  ink: { tank: 0.5, ak: 0.2 }, stapwall: { stapler: 0.3 }, marker: { jet: 0.2, plane: 0.2, bomber: 0.3 }, cardcastle: { cutter: 2, lighter: 1.5 },
  dome: { ballistic: 0.5, nuke: 0.6 }, paper_s: { lighter: 2.5 }, paper_m: { lighter: 2.5 }, card: { lighter: 2.5 }, book: { lighter: 2.5 },
};
const Q = [
  { x: "۳ حمله انجام بده", k: "atk", n: 3, r: { t: 400, xp: 50 } },
  { x: "۳ ساختمان دشمن را نابود کن", k: "des", n: 3, r: { t: 700, xp: 80, tr: 5 } },
  { x: "۵ ساختمان یا دفاع بچین", k: "plc", n: 5, r: { t: 300, xp: 40 } },
];
const BPR = { 5: ["plane", 3], 10: ["cutter", 2], 15: ["bomber", 1], 20: ["ballistic", 1] };
const KEYS = ["hq", ...Object.keys(CAT)];
const RLV = [1, 30, 60], RM = [1, 2, 3]; // سطح لازم و ضریب درآمد هر سرزمین
const clean = (s) => String(s || "").replace(/[<>&"'`]/g, "").trim();
const DAY = 60, W_ = 192;
const grid = () => { const g = Array(64).fill(null); g[27] = { k: "hq", hp: 100 }; return g; };

export default {
  async fetch(req, env) {
    if (new URL(req.url).pathname === "/ws") return env.GAME.get(env.GAME.idFromName("world")).fetch(req);
    return new Response(html, { headers: { "content-type": "text/html;charset=utf-8" } });
  },
};

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.P = {}; this.B = { game: {}, chat: {}, dev: {}, ip: {}, rep: [], rn: 0 }; this.mid = 0; this.admins = new Set(); this.an = 0; this.plots = {}; this.log = []; this.chat = []; this.evn = 0; this.ev = null; this.socks = new Map(); this.last = Date.now(); this.n = 0;
    ctx.blockConcurrencyWhile(async () => {
      try {
        await this.env.DB.exec("CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER)");
        const { results } = await this.env.DB.prepare("SELECT id, data FROM players").all();
        for (const r of results) {
          if (r.id === "__w") this.plots = JSON.parse(r.data); else if (r.id === "__b") this.B = { ...this.B, ...JSON.parse(r.data) }; else this.P[r.id] = JSON.parse(r.data);
        }
      } catch (e) { console.log("D1 init failed", e); this.dbErr = String(e); }
    });
    setInterval(() => this.tick(), 1000);
  }

  async fetch(req) {
    if (req.headers.get("Upgrade") !== "websocket") return new Response("ws only", { status: 400 });
    const [c, s] = Object.values(new WebSocketPair());
    s.accept(); s.ip = req.headers.get("CF-Connecting-IP") || "";
    s.addEventListener("message", (e) => { try { this.onMsg(s, e.data); } catch (x) { console.log("onMsg error", x); try { this.err(s, "خطای سرور، دوباره تلاش کن"); } catch {} } });
    s.addEventListener("error", () => this.socks.delete(s));
    s.addEventListener("close", () => { this.socks.delete(s); this.admins.delete(s); });
    s.send(JSON.stringify({ t: "cat", cat: CAT, Q, RLV }));
    return new Response(null, { status: 101, webSocket: c });
  }

  async hash(pw, salt) {
    salt ||= [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    const b = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 50000 }, k, 256);
    return { s: salt, h: [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("") };
  }
  issue(ws, p) {
    const tok = [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, "0")).join("");
    p.toks = [...(p.toks || []), tok].slice(-5);
    ws.send(JSON.stringify({ t: "auth", id: p.id, tok, name: p.name }));
  }
  async auth(ws, m) {
    if ((ws.fails || 0) >= 8) return this.err(ws, "تلاش بیش از حد؛ صفحه را دوباره باز کن");
    const name = clean(m.name).slice(0, 14), pw = String(m.pw || "");
    if (!name) return this.err(ws, "نام کاربری لازم است");
    if (pw.length < 4 || pw.length > 64) return this.err(ws, "رمز باید ۴ تا ۶۴ نویسه باشد");
    let p = Object.values(this.P).find((x) => x.name === name);
    ws.dev = String(m.dev || "").slice(0, 40);
    const bn = this.isBanned(ws, p?.id);
    if (bn) return this.banMsg(ws, bn);
    if (m.t === "reg") {
      const hp = await this.hash(pw);
      if (Object.values(this.P).some((x) => x.name === name)) return this.err(ws, "این نام قبلاً گرفته شده");
      const id = crypto.randomUUID(), i = this.claim(id);
      if (i === null) return this.err(ws, "نقشه پر است");
      p = this.P[id] = { id, name, pw: hp, toks: [], reqs: [], tekke: 1500, inv: {}, ally: "", traitor: 0, caps: 0, su: 0, stun: 0, cd: 0, lv: 1, xp: 0, tr: 0, bp: 0, bpc: 0, emp: "امپراطوری " + name, king: name };
      this.say(`${name} وارد جنگ شد`);
    } else {
      if (p && !p.pw) return this.err(ws, "این حساب رمز ندارد؛ از همان دستگاه قبلی وارد شو و رمز بگذار");
      const ok = p && (await this.hash(pw, p.pw.s)).h === p.pw.h;
      if (!ok) { ws.fails = (ws.fails || 0) + 1; return this.err(ws, "نام کاربری یا رمز اشتباه است"); }
    }
    this.issue(ws, p); this.enter(ws, p);
  }
  async setpw(ws, me, m) {
    const pw = String(m.pw || "");
    if (me.pw) return this.err(ws, "این حساب از قبل رمز دارد");
    if (pw.length < 4 || pw.length > 64) return this.err(ws, "رمز باید ۴ تا ۶۴ نویسه باشد");
    me.pw = await this.hash(pw); this.issue(ws, me); this.save(); this.push(); this.err(ws, "رمز ذخیره شد ✓");
  }
  enter(ws, pp) {
    pp.lv ??= 1; pp.xp ??= 0; pp.tr ??= 0; pp.bp ??= 0; pp.bpc ??= 0; pp.emp ??= "امپراطوری " + pp.name; pp.king ??= pp.name; pp.reqs ??= [];
    if (ws.dev && !(pp.devs ||= []).includes(ws.dev)) pp.devs = [...pp.devs, ws.dev].slice(-5);
    pp.ip = ws.ip || pp.ip;
    this.socks.set(ws, { id: pp.id, view: this.mine(pp.id)[0] ?? null });
    this.save(); this.push(ws); this.push();
  }

  async alogin(ws, m) {
    const bad = (x) => ws.send(JSON.stringify({ t: "aerr", m: x }));
    if ((ws.fails || 0) >= 8) return bad("تلاش بیش از حد؛ صفحه را دوباره باز کن");
    const p = Object.values(this.P).find((x) => x.name === clean(m.name).slice(0, 14));
    const ok = this.isAdmin(p) && (await this.hash(String(m.pw || ""), p.pw.s)).h === p.pw.h;
    if (!ok) { ws.fails = (ws.fails || 0) + 1; return bad("نام کاربری یا رمز مدیر اشتباه است"); }
    ws.adm = true; this.admins.add(ws); this.pushAdm(ws);
  }
  pushAdm(only) {
    if (!this.admins.size) return;
    const B = this.B, on = new Set([...this.socks.values()].map((s) => s.id));
    const msg = JSON.stringify({
      t: "admstate", online: on.size,
      pl: Object.values(this.P).map((p) => ({ n: p.name, lv: p.lv, t: Math.floor(p.tekke), a: p.ally, c: p.caps, l: this.mine(p.id).length, on: on.has(p.id), bg: !!B.game[p.id], bc: !!B.chat[p.id] })),
      bg: Object.entries(B.game).map(([id, b]) => ({ id, n: b.name, w: b.why, t: b.t })),
      bc: Object.entries(B.chat).map(([id, b]) => ({ id, n: b.name, w: b.why, t: b.t })),
      rp: B.rep, chat: this.chat.map(({ id: _i, ...c }) => c),
    });
    for (const ws of only ? [only] : this.admins) try { ws.send(msg); } catch {}
  }
  isAdmin(p) { return !!p && !!p.pw && !!this.env.ADMIN_NAME && p.name === this.env.ADMIN_NAME; }
  isBanned(ws, id) {
    const B = this.B;
    if (id && B.game[id]) return B.game[id];
    const d = ws.dev && B.dev[ws.dev], i = ws.ip && B.ip[ws.ip];
    return (d && B.game[d]) || (i && B.game[i]) || null;
  }
  banMsg(ws, b) {
    try { ws.send(JSON.stringify({ t: "banned", m: "🚫 تو از بازی محروم شده‌ای" + (b.why ? " · دلیل: " + b.why : "") })); ws.close(1008, "banned"); } catch {}
    this.socks.delete(ws);
  }
  ban(kind, p, why, ip) {
    const B = this.B; B[kind][p.id] = { name: p.name, why, t: Date.now() };
    if (kind === "game") {
      for (const d of p.devs || []) B.dev[d] = p.id;
      if (ip && p.ip) B.ip[p.ip] = p.id;
      for (const [ws, s] of [...this.socks]) if (s.id === p.id) this.banMsg(ws, B.game[p.id]);
    }
    B.rep = B.rep.filter((r) => r.id !== p.id);
  }
  admin(ws, me, m) {
    const B = this.B, tg = Object.values(this.P).find((p) => p.name === m.to);
    if (m.t === "x_give") {
      const a = Math.trunc(+m.a);
      if (!tg || !a || Math.abs(a) > 1e9) return this.err(ws, "بازیکن یا مقدار نامعتبر");
      tg.tekke = Math.max(0, tg.tekke + a);
      this.alert(tg.id, a > 0 ? `🎁 مدیر ${a} تکه به تو داد` : `مدیر ${-a} تکه از تو کم کرد`);
      this.err(ws, "انجام شد ✓");
    } else if (m.t === "x_ban") {
      if (!tg || this.isAdmin(tg)) return this.err(ws, "بازیکن نامعتبر");
      this.ban(m.k === "chat" ? "chat" : "game", tg, clean(m.why).slice(0, 60), !!m.ip);
      this.err(ws, "بن شد ✓");
    } else if (m.t === "x_unban") {
      const k = m.k === "chat" ? "chat" : "game", id = String(m.id);
      delete B[k][id];
      if (k === "game") for (const t of ["dev", "ip"]) for (const x of Object.keys(B[t])) if (B[t][x] === id) delete B[t][x];
      this.err(ws, "رفع بن شد ✓");
    } else if (m.t === "x_rej") B.rep = B.rep.filter((r) => r.r !== m.r);
  }

  xp(p, n) {
    p.xp += n; p.bp += n; const l = Math.floor(Math.sqrt(p.xp / 20)) + 1;
    if (l > p.lv) { p.lv = l; this.say(`⭐ ${p.name} به سطح ${l} رسید`); }
  }
  q(p, k) {
    const d = Math.floor(Date.now() / 864e5);
    if (!p.q || p.q.d !== d) p.q = { d, atk: 0, des: 0, plc: 0, c: [0, 0, 0] };
    if (k) p.q[k]++;
    return p.q;
  }
  say(m) { this.log.unshift(m); this.log.length = Math.min(this.log.length, 10); }
  alert(id, m) { for (const [ws, s] of this.socks) if (s.id === id) try { ws.send(JSON.stringify({ t: "alert", m })); } catch {} }
  err(ws, m, bad) { ws.send(JSON.stringify({ t: "err", m, bad: bad ? 1 : 0 })); }
  mine(id) { return Object.keys(this.plots).filter((i) => this.plots[i].o === id).map(Number); }

  claim(id, r = 0) {
    const free = [...Array(64).keys()].map((i) => r * 64 + i).filter((i) => !this.plots[i]);
    if (!free.length) return null;
    const i = free[Math.floor(Math.random() * free.length)];
    this.plots[i] = { o: id, g: grid() };
    return i;
  }

  onMsg(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === "alogin") return this.alogin(ws, m);
    if (String(m.t).startsWith("x_")) { if (ws.adm) { this.admin(ws, null, m); this.save(); this.pushAdm(); } return; }
    if (m.t === "reg" || m.t === "login") return this.auth(ws, m);
    if (m.t === "join") {
      const p = this.P[String(m.id || "").slice(0, 40)];
      if (!p) return this.err(ws, "حساب پیدا نشد؛ ثبت‌نام کن یا وارد شو", 1);
      ws.dev = String(m.dev || "").slice(0, 40);
      const bn = this.isBanned(ws, p.id);
      if (bn) return this.banMsg(ws, bn);
      if (p.pw && !(p.toks || []).includes(String(m.tok || ""))) return this.err(ws, "نشست منقضی شده؛ دوباره وارد شو", 1);
      return this.enter(ws, p);
    }
    const sk = this.socks.get(ws), me = sk && this.P[sk.id];
    if (!me) return;
    const it = CAT[m.k];
    if (m.t === "view" && this.plots[m.i] && me.lv >= RLV[m.i >> 6]) sk.view = m.i;
    else if (m.t === "buy" && it) {
      if (me.lv < (it.lv || 1)) return this.err(ws, "سطح کافی نداری");
      if (it.tp) { if (me.tr < it.tp) return this.err(ws, "جام کافی نداری"); me.tr -= it.tp; }
      else { if (me.tekke < it.p) return this.err(ws, "تکه کافی نداری"); me.tekke -= it.p; }
      me.inv[m.k] = (me.inv[m.k] || 0) + (it.q || 1); this.xp(me, 2);
    } else if (m.t === "buyplot") {
      const cost = 500 * (1 + (m.i >> 6)) * this.mine(me.id).length;
      if (this.plots[m.i] || m.i < 0 || m.i >= W_) return this.err(ws, "این زمین صاحب دارد");
      if (me.tekke < cost) return this.err(ws, `خرید زمین ${cost} تکه لازم دارد`);
      if (me.lv < RLV[m.i >> 6]) return this.err(ws, "سطح کافی نداری");
      me.tekke -= cost; this.plots[m.i] = { o: me.id, g: grid() }; sk.view = m.i;
      this.say(`${me.name} یک زمین جدید خرید`);
    } else if (m.t === "place") {
      const pl = this.plots[m.i];
      if (!pl || pl.o !== me.id || !it || it.k === "atk" || !me.inv[m.k] || pl.g[m.c] || m.c < 0 || m.c > 63) return;
      pl.g[m.c] = { k: m.k, hp: it.hp }; me.inv[m.k]--; this.q(me, "plc"); this.xp(me, 2);
    } else if (m.t === "pick") {
      const pl = this.plots[m.i], b = pl?.g[m.c];
      if (!pl || pl.o !== me.id || !b || b.k === "hq") return;
      me.inv[b.k] = (me.inv[b.k] || 0) + 1; pl.g[m.c] = null;
    } else if (m.t === "atk") this.attack(ws, me, m);
    else if (m.t === "world") {
      const r = m.r | 0;
      if (r < 0 || r > 2 || me.lv < RLV[r]) return;
      const p = {};
      for (let j = 0; j < 64; j++) {
        const pl = this.plots[r * 64 + j]; if (!pl) continue;
        const a = []; pl.g.forEach((b, c) => { if (b) a.push([c, KEYS.indexOf(b.k), Math.ceil(b.hp)]); });
        p[r * 64 + j] = a;
      }
      return ws.send(JSON.stringify({ t: "world", r, p }));
    }
    else if (m.t === "prof") { me.emp = clean(m.emp).slice(0, 16) || me.emp; me.king = clean(m.king).slice(0, 14) || me.king; }
    else if (m.t === "name") { const pl = this.plots[m.i]; if (pl && pl.o === me.id) pl.nm = clean(m.nm).slice(0, 16); }
    else if (m.t === "qclaim") {
      const x = Q[m.n], q = this.q(me);
      if (!x || q.c[m.n] || q[x.k] < x.n) return this.err(ws, "هنوز کامل نشده");
      q.c[m.n] = 1; me.tekke += x.r.t; me.tr += x.r.tr || 0; this.xp(me, x.r.xp);
    } else if (m.t === "bpc") {
      const tier = Math.min(20, Math.floor(me.bp / 150));
      if (tier <= me.bpc) return;
      const t = ++me.bpc; me.tekke += 300 + 100 * t;
      const r = BPR[t]; if (r) { me.inv[r[0]] = (me.inv[r[0]] || 0) + r[1]; me.tr += 10; }
    }
    else if (m.t === "bonus") { if (Date.now() < (me.bonus || 0)) return this.err(ws, "هنوز آماده نیست"); me.tekke += 300; me.bonus = Date.now() + 600000; }
    else if (m.t === "repair") {
      const pl = this.plots[m.i], b = pl?.g[m.c];
      if (!pl || pl.o !== me.id || !b) return;
      const mx = b.k === "hq" ? 100 : CAT[b.k].hp, cost = Math.ceil((b.k === "hq" ? 500 : CAT[b.k].p || 600) * 0.3);
      if (b.hp >= mx) return this.err(ws, "سالم است");
      if (me.tekke < cost) return this.err(ws, `ترمیم ${cost} تکه لازم دارد`);
      me.tekke -= cost; b.hp = mx;
    } else if (m.t === "chat") {
      const x = clean(m.x).slice(0, 80);
      if (this.B.chat[me.id]) return this.err(ws, "تو از گفتگو محروم شده‌ای 🔇");
      if (x) { this.chat.unshift({ n: me.name, a: me.ally, x, id: me.id, m: ++this.mid }); this.chat.length = Math.min(this.chat.length, 20); }
    } else if (m.t === "gift") {
      const to = Object.values(this.P).find((p) => p.name === m.to), a = Math.floor(+m.a);
      if (!to || to.id === me.id || !me.ally || to.ally !== me.ally || !(a > 0) || me.tekke < a) return this.err(ws, "هدیه فقط به هم‌پیمان و با تکه کافی");
      me.tekke -= a; to.tekke += a; this.say(`🎁 ${me.name} ${a} تکه به ${to.name} هدیه داد`);
    }
    else if (m.t === "report") {
      const c = this.chat.find((x) => x.m === m.m);
      if (!c || c.id === me.id) return this.err(ws, "پیام پیدا نشد");
      if (this.B.rep.some((r) => r.m === c.m && r.by === me.name)) return this.err(ws, "قبلاً گزارش دادی");
      this.B.rep.push({ r: ++this.B.rn, m: c.m, id: c.id, n: c.n, x: c.x, by: me.name, t: Date.now() });
      this.B.rep = this.B.rep.slice(-100);
      const ad = Object.values(this.P).find((p) => this.isAdmin(p)); if (ad) this.alert(ad.id, "🚩 گزارش جدید در پنل مدیریت");
      this.err(ws, "گزارش ثبت شد ✓");
    }
    else if (String(m.t).startsWith("x_")) { if (this.isAdmin(me)) this.admin(ws, me, m); else return; }
    else if (m.t === "ally") return this.err(ws, "برای اتحاد باید درخواست بدهی و طرف مقابل قبول کند");
    else if (m.t === "areq") {
      const to = Object.values(this.P).find((p) => p.name === m.to);
      if (!to || to.id === me.id) return this.err(ws, "بازیکن پیدا نشد");
      if (me.ally && me.ally === to.ally) return this.err(ws, "از قبل هم‌پیمان هستید");
      if (me.ally && to.ally) return this.err(ws, "یکی از شما در اتحاد دیگری است");
      to.reqs = (to.reqs || []).filter((r) => r.f !== me.name && Date.now() - r.t < 36e5);
      to.reqs.push({ f: me.name, t: Date.now() });
      this.alert(to.id, `🤝 ${me.name} درخواست اتحاد داد`);
      this.err(ws, "درخواست فرستاده شد ✓");
    }
    else if (m.t === "aacc") {
      const r = (me.reqs || []).find((x) => x.f === m.f), f = r && Object.values(this.P).find((p) => p.name === r.f);
      me.reqs = (me.reqs || []).filter((x) => x !== r);
      if (!f) return this.err(ws, "درخواست معتبر نیست");
      if (me.ally && f.ally && me.ally !== f.ally) return this.err(ws, "هر دو در اتحادهای جدا هستید");
      let nm = f.ally || me.ally;
      if (!nm) { const b = "اتحاد " + f.name; nm = b; let k = 2; while (Object.values(this.P).some((p) => p.ally === nm)) nm = b + " " + k++; }
      f.ally = me.ally = nm;
      this.alert(f.id, `✅ ${me.name} درخواست اتحادت را قبول کرد`);
      this.say(`🤝 ${f.name} و ${me.name} هم‌پیمان شدند («${nm}»)`);
    }
    else if (m.t === "arej") me.reqs = (me.reqs || []).filter((x) => x.f !== m.f);
    else if (m.t === "setpw") return this.setpw(ws, me, m);
    else if (m.t === "betray" && !me.ally) return this.err(ws, "تو در هیچ اتحادی نیستی");
    else if (m.t === "betray") {
      this.say(`🗡️ ${me.name} به اتحاد «${me.ally}» خیانت کرد!`); me.ally = ""; me.traitor++; this.err(ws, "از اتحاد خارج شدی 🗡️");
    }
    this.save(); this.push();
  }

  attack(ws, me, { i, c, w }) {
    const pl = this.plots[i], it = CAT[w], t = pl && this.P[pl.o];
    if (!t || !it || it.k !== "atk" || !me.inv[w]) return this.err(ws, "حمله ممکن نیست");
    if (t.id === me.id) return this.err(ws, "به زمین خودت حمله نکن");
    if (me.lv < RLV[i >> 6]) return this.err(ws, "سطح کافی نداری");
    const bet = me.ally && me.ally === t.ally;
    if (pl.sh > Date.now()) return this.err(ws, "این زمین سپر دارد 🛡️");
    if (Date.now() < me.cd) return this.err(ws, "نیروها هنوز آماده نیستند");
    me.cd = Date.now() + 4000;
    if (bet) { this.say(`🗡️ ${me.name} به هم‌پیمانش ${t.name} حمله کرد و خیانت کرد!`); me.ally = ""; me.traitor++; }
    this.ev = { id: ++this.evn, i, c, w };
    this.alert(t.id, `⚠️ ${me.name} به زمین تو حمله کرد!`);
    this.xp(me, 5); this.q(me, "atk");
    if (me.stun > 0) { me.stun--; return this.err(ws, "گیر چسب افتادی!"); }
    if (w === "stapler") { if (me.su >= 3) return this.err(ws, "منگنه فقط ۳ بار"); me.su++; }
    if (w === "stapler" || w === "glue") me.inv[w]--;
    if (w === "glue") { t.stun = 2; return this.say(`${me.name} چسب روی ${t.name} ریخت 💧`); }
    const b = pl.g[c];
    if (!b) return this.say(`${me.name} به ${t.name} حمله کرد ولی خطا رفت`);
    const mu = MULT[b.k]; b.hp -= it.pow * (mu ? mu[w] ?? mu._ ?? 1 : 1);
    if (b.hp > 0) return this.say(`${me.name} به ${t.name} حمله کرد (${CAT[b.k]?.n || "مرکز"}: ${Math.ceil(b.hp)})`);
    pl.g[c] = null;
    if (b.k !== "hq") { this.q(me, "des"); this.xp(me, 10); me.tr += 3; t.tr = Math.max(0, (t.tr || 0) - 1); const l = Math.floor((CAT[b.k].p || 0) * 0.5); me.tekke += l; return this.say(`${me.name} ${CAT[b.k].n} ${t.name} را نابود کرد (غنیمت ${l})`); }
    delete this.plots[i]; me.tekke += 300; me.caps++; me.tr += 30; t.tr = Math.max(0, (t.tr || 0) - 20); this.xp(me, 60);
    this.say(`🏴 ${me.name} زمین ${t.name} را فتح کرد!`);
    if (!this.mine(t.id).length) { t.tekke = 500; t.inv = {}; t.stun = 0; this.claim(t.id); }
    for (const j of this.mine(t.id)) this.plots[j].sh = Date.now() + 120000;
    for (const s of this.socks.values()) if (s.view == i) s.view = this.mine(s.id)[0] ?? null;
  }

  tick() {
    const dt = (Date.now() - this.last) / 1000; this.last = Date.now();
    for (const [pi, pl] of Object.entries(this.plots)) {
      const o = this.P[pl.o]; if (!o) continue;
      for (const b of pl.g) if (b && CAT[b.k]?.inc) o.tekke += (CAT[b.k].inc * RM[pi >> 6] / DAY) * dt;
    }
    if (this.socks.size) { if (this.n % 2 === 0) this.push(); if (++this.n % 30 === 0) this.save(); }
    if (this.admins.size && ++this.an % 2 === 0) this.pushAdm();
  }

  save() {
    if (this.saving || this.dbErr) return;
    this.saving = setTimeout(async () => {
      this.saving = null;
      const q = "INSERT INTO players (id,name,data,updated) VALUES (?1,?2,?3,?4) ON CONFLICT(id) DO UPDATE SET name=?2,data=?3,updated=?4";
      const st = Object.values(this.P).map((p) => this.env.DB.prepare(q).bind(p.id, p.name, JSON.stringify(p), Date.now()));
      st.push(this.env.DB.prepare(q).bind("__w", "__w", JSON.stringify(this.plots), Date.now()));
      st.push(this.env.DB.prepare(q).bind("__b", "__b", JSON.stringify(this.B), Date.now()));
      try { await this.env.DB.batch(st); } catch (e) { console.log("D1 save failed", e); }
    }, 3000);
  }

  push(only) {
    const map = [...Array(W_).keys()].map((i) => {
      const pl = this.plots[i], o = pl && this.P[pl.o];
      return o ? [o.name, Math.ceil(pl.g[27]?.hp ?? pl.g.find((b) => b?.k === "hq")?.hp ?? 0), o.ally, o.id, pl.nm || "", o.emp, o.king] : null;
    });
    const pub = Object.values(this.P).map((p) => ({ name: p.name, ally: p.ally, caps: p.caps, tr: p.traitor, tp: p.tr, lv: p.lv, emp: p.emp, king: p.king, n: this.mine(p.id).length }));
    for (const [ws, sk] of this.socks) {
      if (only && ws !== only) continue;
      const me = this.P[sk.id], pl = this.plots[sk.view];
      if (!me) continue;
      const { pw: pw0, toks: _t, ...mm } = me;
      this.q(me);
      let inc = 0;
      for (const i of this.mine(me.id)) for (const b of this.plots[i].g) if (b && CAT[b.k]?.inc) inc += CAT[b.k].inc * RM[i >> 6];
      try {
        ws.send(JSON.stringify({ t: "state", me: { ...mm, nopw: !pw0, admin: this.isAdmin(me), tekke: Math.floor(me.tekke), inc }, map, pub, log: this.log, view: pl ? { i: sk.view, o: pl.o, g: pl.g, sh: pl.sh || 0 } : null, chat: this.chat.map(({ id: _i, ...c }) => c), ev: this.ev, adm: this.isAdmin(me) ? { bg: Object.entries(this.B.game).map(([id, b]) => ({ id, n: b.name, w: b.why })), bc: Object.entries(this.B.chat).map(([id, b]) => ({ id, n: b.name, w: b.why })), rp: this.B.rep } : undefined }));
      } catch {}
    }
  }
}
