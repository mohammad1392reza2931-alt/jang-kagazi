import { DurableObject } from "cloudflare:workers";
import html from "./index.html";

// ---- کاتالوگ لول ۱ (کاغذ آبی). قیمت‌های بدون عدد از طرف من حدس زده شده، راحت عوض کن ----
const CAT = {
  handk:  { n: "سد دستمالی", k: "def", p: 200, q: 20, hp: 2, d: "بسته ۲۰ تایی، هر دستمال ۲ ضربه تحمل می‌کند" },
  thread: { n: "سیم نخ خیس", k: "def", p: 150, q: 5, hp: 3, d: "حمله زمینی را نصف می‌کند" },
  ped:    { n: "پدافند دستمالی", k: "def", p: 250, q: 1, hp: 6, d: "حمله هوایی را نصف می‌کند" },
  wall:   { n: "دیوار آبی", k: "def", p: 100, q: 1, hp: 15, d: "مقوای ضخیم، استحکام بالا" },
  eraser: { n: "سد پاک‌کنی", k: "def", p: 600, q: 1, hp: 100, d: "همه چیز را می‌گیرد جز پرتابه پرگاری" },
  clip:   { n: "سیم‌خاردار گیره کاغذ", k: "def", p: 50, q: 1, hp: 4, d: "حمله زمینی را نصف می‌کند" },
  card:   { n: "دیوار کارت ویزیت", k: "def", p: 400, q: 2, hp: 8, d: "فقط از شهر اول (مرکز فرماندهی) محافظت می‌کند" },
  tank:   { n: "تانک ضد آب", k: "atk", p: 400, pow: 20, d: "زمینی، قدرت ۲۰" },
  jet:    { n: "جنگنده آبی", k: "atk", p: 500, pow: 30, d: "هوایی، قدرت ۳۰، از دیوار و دستمال رد می‌شود" },
  stapler:{ n: "توپ منگنه", k: "atk", p: 300, pow: 40, d: "قدرت ۴۰، سد دستمالی را سوراخ می‌کند، فقط ۳ بار" },
  compass:{ n: "پرتابه پرگاری", k: "atk", p: 500, pow: 25, d: "تنها سلاحی که از سد پاک‌کنی رد می‌شود" },
  glue:   { n: "خمپاره چسب ماتیکی", k: "atk", p: 550, q: 2, d: "حریف ۲ حمله بعدی‌اش را نمی‌تواند انجام دهد" },
  ak:     { n: "ای‌کی‌دار", k: "atk", p: 1, pow: 2, d: "ارزان، قدرت ۲" },
  paper_s:{ n: "تولید کاغذ کوچک", k: "inc", p: 200, inc: 200, d: "روزی ۲۰۰ تکه" },
  paper_m:{ n: "تولید کاغذ متوسط", k: "inc", p: 400, inc: 400, d: "روزی ۴۰۰ تکه" },
};
const DAY = 60; // هر «روز» بازی = ۶۰ ثانیه واقعی
const ORDER = ["card", "wall", "handk", "thread", "clip", "ped"];

const fresh = (id, name) => ({
  id, name, tekke: 1000, cities: [100, 100, 100], inv: {}, hp: {}, inc: 0,
  su: 0, stun: 0, cd: 0, wins: 0, seen: Date.now(),
});

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      return env.GAME.get(env.GAME.idFromName("world")).fetch(req);
    }
    return new Response(html, { headers: { "content-type": "text/html;charset=utf-8" } });
  },
};

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.players = {};
    this.log = [];
    this.socks = new Map();
    this.last = Date.now();
    this.n = 0;
    ctx.blockConcurrencyWhile(async () => {
      await this.env.DB.exec("CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER)");
      const { results } = await this.env.DB.prepare("SELECT id, data FROM players").all();
      for (const r of results) this.players[r.id] = JSON.parse(r.data);
    });
    setInterval(() => this.tick(), 1000);
  }

  async fetch(req) {
    if (req.headers.get("Upgrade") !== "websocket") return new Response("ws only", { status: 400 });
    const [c, s] = Object.values(new WebSocketPair());
    s.accept();
    s.addEventListener("message", (e) => this.onMsg(s, e.data));
    s.addEventListener("close", () => this.socks.delete(s));
    s.send(JSON.stringify({ t: "cat", cat: CAT }));
    return new Response(null, { status: 101, webSocket: c });
  }

  say(m) { this.log.unshift(m); this.log.length = Math.min(this.log.length, 8); }
  err(ws, m) { ws.send(JSON.stringify({ t: "err", m })); }

  onMsg(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === "join") {
      const id = String(m.id || "").slice(0, 40);
      const name = String(m.name || "").trim().slice(0, 14);
      if (!id || !name) return this.err(ws, "نام لازم است");
      if (!this.players[id]) {
        if (Object.values(this.players).some((p) => p.name === name)) return this.err(ws, "این نام قبلاً گرفته شده");
        this.players[id] = fresh(id, name);
        this.say(`${name} وارد جنگ شد`);
      }
      this.socks.set(ws, id);
      this.save(); return this.push();
    }
    const me = this.players[this.socks.get(ws)];
    if (!me) return;
    if (m.t === "buy") {
      const it = CAT[m.k];
      if (!it) return;
      if (me.tekke < it.p) return this.err(ws, "تکه کافی نداری");
      me.tekke -= it.p;
      if (it.k === "inc") me.inc += it.inc;
      else if (it.k === "def") me.hp[m.k] = (me.hp[m.k] || 0) + it.q * it.hp;
      else me.inv[m.k] = (me.inv[m.k] || 0) + (it.q || 1);
    }
    if (m.t === "atk") this.attack(ws, me, m);
    this.save(); this.push();
  }

  attack(ws, me, { tid, ci, w }) {
    const it = CAT[w], t = this.players[tid];
    if (!it || it.k !== "atk" || !t || t.id === me.id) return;
    if (!me.inv[w]) return this.err(ws, "این سلاح را نداری");
    if (ci < 0 || ci > 2 || t.cities[ci] <= 0) return this.err(ws, "این شهر قبلاً نابود شده");
    if (Date.now() < me.cd) return this.err(ws, "نیروها هنوز آماده نیستند");
    if (me.stun > 0) { me.stun--; me.cd = Date.now() + 4000; return this.err(ws, `گیر چسب افتادی! (${me.stun} نوبت دیگر)`); }
    if (w === "stapler") { if (me.su >= 3) return this.err(ws, "منگنه ۳ بار بیشتر شلیک نمی‌شود"); me.su++; }
    if (w === "stapler" || w === "glue") me.inv[w]--;
    me.cd = Date.now() + 4000;
    if (w === "glue") { t.stun = 2; return this.say(`${me.name} چسب ماتیکی روی ${t.name} ریخت`); }

    let pow = it.pow;
    const ground = w === "tank" || w === "ak", air = w === "jet";
    if (ground && (t.hp.thread > 0 || t.hp.clip > 0)) pow *= 0.5;
    if (air && t.hp.ped > 0) pow *= 0.5;
    if (t.hp.eraser > 0 && w !== "compass") {
      t.hp.eraser = Math.max(0, t.hp.eraser - pow); pow = 0;
    } else {
      for (const k of ORDER) {
        if (pow <= 0) break;
        if (k === "card" && ci !== 0) continue;
        if (air && (k === "wall" || k === "handk")) continue;
        if (w === "stapler" && k === "handk") { t.hp.handk = Math.max(0, (t.hp.handk || 0) - 12); continue; }
        const h = t.hp[k] || 0; if (h <= 0 || k === "ped") continue;
        const used = Math.min(h, pow); t.hp[k] -= used; pow -= used;
      }
    }
    t.cities[ci] = Math.max(0, Math.round(t.cities[ci] - pow));
    this.say(`${me.name} با ${it.n} به ${t.name} حمله کرد (شهر ${ci + 1}: ${t.cities[ci]})`);
    if (t.cities.every((c) => c <= 0)) {
      me.wins++; me.tekke += 500;
      this.say(`${me.name} هر ۳ شهر ${t.name} را نابود کرد! 🏆`);
      Object.assign(t, fresh(t.id, t.name), { tekke: 500, wins: t.wins });
    }
  }

  tick() {
    const now = Date.now(), dt = (now - this.last) / 1000; this.last = now;
    for (const p of Object.values(this.players)) p.tekke += (p.inc / DAY) * dt;
    if (this.socks.size) { this.push(); if (++this.n % 30 === 0) this.save(); }
  }

  save() {
    if (this.saving) return;
    this.saving = setTimeout(async () => {
      this.saving = null;
      const q = "INSERT INTO players (id,name,data,updated) VALUES (?1,?2,?3,?4) ON CONFLICT(id) DO UPDATE SET name=?2,data=?3,updated=?4";
      const st = Object.values(this.players).map((p) => this.env.DB.prepare(q).bind(p.id, p.name, JSON.stringify(p), Date.now()));
      if (st.length) try { await this.env.DB.batch(st); } catch (e) { console.log("D1 save failed", e); }
    }, 3000);
  }

  push() {
    const online = new Set(this.socks.values());
    const pub = Object.values(this.players).map((p) => ({ id: p.id, name: p.name, cities: p.cities, wins: p.wins, on: online.has(p.id) }));
    for (const [ws, id] of this.socks) {
      const me = this.players[id];
      try { ws.send(JSON.stringify({ t: "state", me: { ...me, tekke: Math.floor(me.tekke) }, all: pub, log: this.log })); } catch {}
    }
  }
}
