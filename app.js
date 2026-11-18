/* TeaTime TV prototype — vanilla JS. One 1920×1080 stage, hash routes, D-pad focus. See UX.md for the behaviour spec. */
(function () {
  "use strict";

  /* ---------------- Data ---------------- */
  const A = (f) => "assets/" + f;
  const PEOPLE = {
    sarah: { name: "Sarah", avatar: A("avatar-sarah.jpg") },
    ed: { name: "Ed", avatar: A("avatar-ed.jpg") },
    may: { name: "May", avatar: A("avatar-may.jpg") },
    tom: { name: "Tom", avatar: A("avatar-tom.jpg") },
    linh: { name: "Linh", avatar: A("avatar-linh.jpg") },
    nam: { name: "Nam", avatar: A("avatar-may.jpg") },
    mai: { name: "Mai", avatar: A("avatar-sarah.jpg") },
    henry: { name: "Henry", avatar: A("avatar-ed.jpg") },
    grace: { name: "Grace", avatar: A("avatar-grace.jpg") },
  };
  const FAMILIES = [
    { id: "johnsons", name: "The Johnsons", since: "12 March 2026", moments: 35, members: [["sarah", 14, true], ["ed", 9], ["may", 9], ["tom", 3]] },
    { id: "nguyens", name: "The Nguyens", since: "2 May 2026", moments: 17, members: [["linh", 9, true], ["nam", 5], ["mai", 3]] },
    { id: "wilsons", name: "The Wilsons", since: "20 July 2026", moments: 19, members: [["henry", 12, true], ["grace", 7]] },
  ];
  const TV = { name: "Lisa’s TV", owner: A("avatar-lisa.png"), since: "March 2026" };
  const PIN_OK = "482917";

  // Each moment: who, date, caption, items (photo/video, orientation). `isNew` = not watched yet.
  const P = (src, o) => ({ type: "photo", src: A(src), o: o || "l" });
  const MOMENTS = {
    "m-may": { by: "may", date: "12 Oct 2026", caption: "We always enjoy regular visits from Leckie — the kids love the lake!", isNew: true,
      items: [P("photo-kids-path.jpg"), P("photo-autumn-dog.jpg"), P("photo-sarah-3.jpg", "p"), P("photo-beach.jpg"), P("photo-ed-1.jpg")] },
    "m-ed-video": { by: "ed", date: "11 Oct 2026", caption: "Sunday lunch at ours — Lisa, you were missed! Here’s the toast.",
      items: [{ type: "video", src: A("photo-sofa-dog.jpg"), o: "l", dur: 70 }], thumb: A("photo-beach.jpg") },
    "m-cake": { by: "sarah", date: "11 Oct 2026", caption: "Six candles, one big breath — happy birthday, Leo!", items: [P("photo-birthday.jpg")] },
    "m-autumn": { by: "tom", date: "10 Oct 2026", caption: "Biscuit’s first proper walk in the leaves.", items: [P("photo-autumn-dog.jpg")] },
    "m-drawing": { by: "sarah", date: "9 Oct 2026", caption: "Mia drew our whole family for you, Grandma — that’s you in the middle!", items: [P("photo-drawing.jpg", "p")] },
    "m-dinner": { by: "ed", date: "4 Oct 2026", caption: "Everyone round the table for Dad’s birthday.", items: [P("photo-ed-1.jpg")] },
    "m-may-sofa": { by: "may", date: "4 Oct 2026", caption: "Rosie has claimed the couch again.", items: [P("photo-sofa-dog.jpg")] },
    "m-newborn": { by: "sarah", date: "18 Sep 2026", caption: "Quiet morning with the little one.", items: [P("photo-sarah-3.jpg", "p")] },
    "m-tom-new": { by: "tom", date: "Today", caption: "Got the science prize at school today!", items: [P("photo-tom-grad.jpg", "p")], isNew: true, hidden: true },
  };
  const FAMILY_OF = () => "The Johnsons";
  const thumbOf = (m) => m.thumb || m.items[0].src;
  const countLabel = (m) => {
    if (m.items[0].type === "video") return "Video";
    return m.items.length === 1 ? "1 photo" : m.items.length + " photos";
  };

  function buildRows() {
    const visible = Object.keys(MOMENTS).filter((id) => !MOMENTS[id].hidden);
    const recent = ["m-tom-new", "m-may", "m-ed-video", "m-cake", "m-autumn", "m-drawing", "m-dinner", "m-may-sofa", "m-newborn"].filter((id) => visible.includes(id));
    const byPerson = (p) => recent.filter((id) => MOMENTS[id].by === p);
    return [
      { title: "Recent from everyone", ids: recent },
      { title: "Sarah’s moments", ids: byPerson("sarah") },
      { title: "Ed’s moments", ids: byPerson("ed") },
      { title: "May’s moments", ids: byPerson("may") },
      { title: "Tom’s moments", ids: byPerson("tom") },
    ].filter((r) => r.ids.length);
  }

  /* ---------------- Storage (per-viewer convenience only) ---------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("teatime.tv." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("teatime.tv." + k, JSON.stringify(v)); } catch (e) {} },
  };

  /* ---------------- Helpers ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const stage = $("#stage");
  const pad = (n) => String(n).padStart(2, "0");
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const clock12 = (d) => (d.getHours() % 12 || 12) + ":" + pad(d.getMinutes());
  const timeLabel = (d) => clock12(d) + " " + (d.getHours() < 12 ? "am" : "pm");
  const dateLabel = (d) => DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  const mmss = (s) => Math.floor(s / 60) + ":" + pad(Math.floor(s % 60));
  const DOT = "  ·  ";

  const glows = '<div class="glow-purple"></div><div class="glow-coral"></div>';
  const brand = '<div class="brand"><img src="' + A("logo-emblem.svg") + '" alt=""><span>TeaTime</span></div>';
  const chip = (focusable) =>
    '<div class="chip"' + (focusable ? ' data-f data-act="thistv" id="chip"' : "") + '><span class="sep" data-clock>' + timeLabel(new Date()) + DOT + TV.name + '</span><img src="' + TV.owner + '" alt=""></div>';
  const topbar = (withChip, focusableChip) => '<div class="topbar">' + brand + (withChip ? chip(focusableChip) : "") + "</div>";
  const topbarCompact = '<div class="topbar compact">' + brand + "</div>";
  const chev = '<img src="' + A("icon-chevron-left.svg") + '" alt="">';
  const steps = (list) => '<div class="steps">' + list.map((t, i) => '<div class="step"><b>' + (i + 1) + "</b>" + t + "</div>").join("") + "</div>";

  /* ---------------- Focus engine (spatial D-pad navigation) ---------------- */
  let focused = null;
  function setFocus(el) {
    if (!el || el === focused) return;
    if (focused) focused.classList.remove("is-focus");
    focused = el;
    el.classList.add("is-focus");
    if (screen && screen.onFocus) screen.onFocus(el);
  }
  function focusables() { return $$("[data-f]", stage).filter((el) => el.offsetParent !== null && !el.closest("[hidden]")); }
  function moveFocus(dir) {
    const scope = $(".dialog-back", stage) || stage;
    const list = $$("[data-f]", scope).filter((el) => el !== focused && el.offsetParent !== null);
    if (!focused) { if (list[0]) setFocus(list[0]); return; }
    const r = focused.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bestScore = Infinity;
    for (const el of list) {
      const b = el.getBoundingClientRect();
      const x = b.left + b.width / 2, y = b.top + b.height / 2;
      const dx = x - cx, dy = y - cy;
      let main, cross;
      if (dir === "left") { if (b.right > r.left + 2) continue; main = -dx; cross = Math.abs(dy); }
      else if (dir === "right") { if (b.left < r.right - 2) continue; main = dx; cross = Math.abs(dy); }
      else if (dir === "up") { if (b.bottom > r.top + 2) continue; main = -dy; cross = Math.abs(dx); }
      else { if (b.top < r.bottom - 2) continue; main = dy; cross = Math.abs(dx); }
      const score = main + cross * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) setFocus(best);
    return !!best;
  }
  function press(el) {
    if (!el) return;
    el.classList.add("is-press");
    setTimeout(() => el.classList.remove("is-press"), 140);
    if (screen && screen.act) screen.act(el.dataset.act, el);
  }

  /* ---------------- Toasts ---------------- */
  let toastTimer = null;
  function clearToast(animate) {
    clearTimeout(toastTimer);
    const t = $(".toast", stage);
    if (!t) return;
    if (animate) { t.classList.add("is-out"); setTimeout(() => t.remove(), 350); } else t.remove();
  }
  function simpleToast(title, sub, ms) {
    clearToast();
    const t = document.createElement("div");
    t.className = "toast simple";
    t.innerHTML = "<div><b>" + title + "</b>" + (sub ? "<span>" + sub + "</span>" : "") + "</div>";
    stage.appendChild(t);
    toastTimer = setTimeout(() => clearToast(true), ms || 3000);
  }

  /* ---------------- Screens ---------------- */
  const S = {};
  let screen = null;
  let paired = store.get("paired", false);

  S.splash = {
    html: () => '<div class="scr">' + glows + '<div class="splash-brand"><img src="' + A("logo-emblem.svg") + '" alt=""><div><div class="name">TeaTime</div><div class="tag">Your family is waiting</div></div></div></div>',
    mount() { this.t = setTimeout(() => go(paired ? "home" : "welcome", true), 2200); },
    unmount() { clearTimeout(this.t); },
    key: () => true, // the splash ignores the remote
  };

  S.welcome = {
    html: () =>
      '<div class="scr">' + glows +
      '<div class="photo-wash" style="left:600px;width:1320px;background-image:url(' + A("photo-kids-path.jpg") + ');background-size:auto 100%;background-position:241px 0"></div>' +
      '<div class="abs" style="left:654px;top:0;width:1176px;height:1080px;background:linear-gradient(88.27deg,#1a1226 4.8%,#1a1226 23%,rgba(26,18,38,.4) 50.3%,rgba(26,18,38,0) 87.6%)"></div>' +
      '<div class="wash-bottom"></div>' + topbarCompact +
      '<div class="setup-copy" style="width:1064px;gap:56px">' +
      '<div><div class="t-hero" style="width:900px">Bring your <span class="pink">family’s moments</span> to this TV</div>' +
      '<p class="t-body muted" style="font-size:36px;line-height:44px;margin:28px 0 0">Photos and videos from the people you love, playing here by themselves. Set it up once from the TeaTime app on a phone — nothing to type on the TV.</p></div>' +
      '<div><span class="btn primary" data-f data-act="start" id="first">Get started</span></div></div></div>',
    act(a) { if (a === "start") go("pair"); },
    key(k) { return k === "back"; }, // first screen: Back has nowhere to go
  };

  const codeHtml = (code, cls) => '<div class="code ' + (cls || "") + '">' + code.split("").map((d) => '<div class="digit">' + d + "</div>").join("") + "</div>";
  const newCode = () => String(1000 + Math.floor(Math.random() * 9000));

  S.pair = {
    html() {
      this.code = this.code || "4829";
      return '<div class="scr">' + glows +
        '<div class="photo-wash" style="left:723px;width:1197px;background-image:url(' + A("photo-kids-path.jpg") + ');background-size:1961px auto;background-position:0 center"></div>' +
        '<div class="abs" style="left:600px;top:0;width:1320px;height:1080px;background:linear-gradient(89deg,#1a1226 2.3%,#1a1226 20%,rgba(26,18,38,.35) 46.7%,rgba(26,18,38,0) 83%)"></div>' +
        '<div class="wash-bottom"></div>' + topbarCompact +
        '<div class="setup-copy" style="width:1076px;gap:126px"><div style="display:flex;flex-direction:column;gap:64px">' +
        '<div style="display:flex;flex-direction:column;gap:32px"><div class="t-headline">Enter this code in the TeaTime app on your phone</div>' +
        '<div id="code">' + codeHtml(this.code) + '</div>' +
        '<div class="t-small muted-2 sep">The code belongs to this TV only' + DOT + 'It refreshes every <span id="mins">10 minutes</span></div></div>' +
        steps(["Open TeaTime on the phone", "Tap  Set up the TV", "Type the code  →  this TV joins the family"]) +
        '</div><div><span class="btn" data-f data-act="other" id="first">' + chev + "Other ways to connect</span></div></div></div>";
    },
    mount() {
      // The code refreshes every 10 minutes; the new one slides in where the old one was.
      this.left = 600;
      this.t = setInterval(() => {
        this.left -= 1;
        const m = $("#mins", stage);
        if (m) m.textContent = Math.ceil(this.left / 60) + (Math.ceil(this.left / 60) === 1 ? " minute" : " minutes");
        if (this.left <= 0) { this.left = 600; this.code = newCode(); $("#code", stage).innerHTML = codeHtml(this.code, "refresh"); }
      }, 1000);
    },
    unmount() { clearInterval(this.t); },
    act(a) { if (a === "other") go("pin"); },
    key(k) { if (k === "back") { go("welcome"); return true; } },
  };

  S.pin = {
    digits: "",
    html() {
      const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];
      return '<div class="scr">' + glows +
        '<div class="photo-wash" style="left:600px;width:1320px;background-image:url(' + A("photo-birthday.jpg") + ');background-size:auto 100%;background-position:-49px 0"></div>' +
        '<div class="abs" style="left:600px;top:0;width:1320px;height:1080px;background:linear-gradient(90deg,#1a1226 0%,rgba(26,18,38,.95) 22%,rgba(26,18,38,.35) 55%,rgba(26,18,38,0) 100%)"></div>' +
        '<div class="wash-bottom"></div>' + topbarCompact +
        '<div class="setup-copy" style="width:1920px;gap:56px;padding-bottom:60px"><div style="display:flex;flex-direction:column;gap:40px">' +
        '<div><div class="t-title">Connect with a family PIN</div><p class="t-body muted" style="width:900px;margin:24px 0 0">Ask the family’s admin to open TeaTime → Families → Add a TV, and read you the 6-digit PIN. Joins one family at a time.</p></div>' +
        '<div style="display:flex;flex-direction:column;gap:16px"><div class="pin-boxes" id="boxes"></div><div class="pin-msg" id="pinmsg"></div>' +
        '<div class="keypad">' + keys.map((k) => '<div class="key" data-f data-act="key" data-k="' + k + '"' + (k === "5" ? ' id="first"' : "") + ">" + k + "</div>").join("") + "</div></div></div>" +
        '<div class="btn-row"><span class="btn" data-f data-act="back">' + chev + 'Back</span><span class="btn primary" data-f data-act="submit" id="submit">Submit</span><span class="btn" data-f data-act="qr">' + chev + "Scan a QR code instead</span></div></div></div>";
    },
    mount() { this.digits = ""; this.error = false; this.paint(); },
    paint(msg, isErr) {
      const b = $("#boxes", stage); if (!b) return;
      let h = "";
      for (let i = 0; i < 6; i++) {
        if (i === 3) h += '<div class="gap"></div>';
        const d = this.digits[i];
        h += '<div class="pin-box' + (i === this.digits.length && !this.error ? " is-next" : "") + '">' + (d ? d : '<span class="dot"></span>') + "</div>";
      }
      b.innerHTML = h;
      b.classList.toggle("is-error", !!isErr);
      const m = $("#pinmsg", stage); m.textContent = msg || ""; m.classList.toggle("is-error", !!isErr);
      $("#submit", stage).classList.toggle("is-dim", this.digits.length < 6);
    },
    type(k) {
      if (k === "⌫") { this.digits = this.digits.slice(0, -1); this.error = false; this.paint(); return; }
      if (k === "✓") return this.submit();
      if (this.error) { this.digits = ""; this.error = false; }
      if (this.digits.length < 6) this.digits += k;
      this.paint();
    },
    submit() {
      if (this.digits.length < 6) return this.paint("Enter all 6 digits", false);
      if (this.digits === PIN_OK) { connect("Connected to The Johnsons"); return; }
      this.error = true;
      this.paint("That PIN doesn’t match a family. Check it with the family’s admin.", true);
    },
    act(a, el) {
      if (a === "key") this.type(el.dataset.k);
      else if (a === "submit") this.submit();
      else if (a === "back") go("pair");
      else if (a === "qr") go("qr");
    },
    key(k) {
      if (/^\d$/.test(k)) { const el = $('[data-k="' + k + '"]', stage); setFocus(el); press(el); return true; }
      if (k === "delete") { if (this.digits.length) { this.type("⌫"); return true; } go("pair"); return true; }
      if (k === "back") { go("pair"); return true; }
    },
  };

  S.qr = {
    html: () =>
      '<div class="scr">' + glows + topbarCompact +
      '<div class="qr-card"><img src="' + A("qr-card.svg") + '" alt="QR code to connect this TV"></div>' +
      '<div class="setup-copy" style="width:996px;gap:80px"><div style="display:flex;flex-direction:column;gap:64px">' +
      '<div><div class="t-title">Scan to connect</div><p class="t-body muted" style="width:860px;margin:40px 0 0">Open TeaTime on your phone and scan this code. Every family on that phone joins this TV at once.</p></div>' +
      steps(["Open TeaTime on your phone", "Families  →  Scan a TV code", "Point the camera at this screen"]) +
      '</div><div class="btn-row"><span class="btn" data-f data-act="back" id="first">' + chev + 'Back</span><span class="btn" data-f data-act="pin">' + chev + "Use a family PIN instead</span></div></div></div>",
    act(a) { if (a === "back") go("pair"); if (a === "pin") go("pin"); },
    key(k) { if (k === "back") { go("pair"); return true; } },
  };

  S.community = {
    html: () =>
      '<div class="scr"><div class="abs" style="left:780px;top:80px;width:2240px;height:2240px;background:radial-gradient(closest-side,rgba(228,26,104,.08),rgba(228,26,104,0))"></div>' +
      '<div class="photo-wash" style="left:839px;width:1081px;background-image:url(' + A("photo-birthday.jpg") + ');background-size:auto 100%;background-position:-427px 0"></div>' +
      '<div class="abs" style="left:685px;top:0;width:1292px;height:1080px;background:linear-gradient(90deg,#1a1226 0%,rgba(26,18,38,.95) 22%,rgba(26,18,38,.35) 55%,rgba(26,18,38,0) 100%)"></div>' +
      '<div class="wash-bottom"></div>' + topbar(true, false) +
      '<div class="abs" style="left:0;top:196px;width:1068px;padding:0 80px;display:flex;flex-direction:column;gap:40px">' +
      '<div style="display:flex;flex-direction:column;gap:24px"><div><span class="pill-glass">Care community TV</span></div><div class="t-headline">Care home staff: enter this code on the TeaTime admin website</div></div>' +
      '<div style="display:flex;flex-direction:column;gap:24px">' + codeHtml("7305") + '<div class="t-small muted-2">This is a room TV — staff choose the resident it belongs to  ·  The code refreshes every 10 minutes</div></div>' +
      '<div style="margin-top:24px">' + steps(["Open the TeaTime admin website", "Choose the resident and their room", "Type the code  →  this TV joins their community"]) + "</div>" +
      '<div><span class="btn" data-f data-act="other" id="first">' + chev + "Other ways to connect</span></div></div></div>",
    act(a) { if (a === "other") go("pair"); },
    key(k) { if (k === "back") { go("pair"); return true; } },
  };

  /* ----- Home: immersive list ----- */
  const home = { rows: [], row: 0, cols: [], offsets: [], onChip: false };
  function cardHtml(id, ri, ci) {
    const m = MOMENTS[id];
    const video = m.items[0].type === "video";
    return '<div class="card" data-f data-act="open" data-r="' + ri + '" data-c="' + ci + '" data-id="' + id + '" style="background-image:url(' + thumbOf(m) + ')">' +
      '<div class="scrim"></div>' + (m.isNew ? '<div class="pill-new">New</div>' : "") +
      (video ? '<div class="badge-video"><img src="' + A("icon-play.svg") + '" alt=""></div>' : "") +
      '<div class="cap"><b>' + PEOPLE[m.by].name + "</b><span>" + m.date + "</span></div></div>";
  }
  S.home = {
    html() {
      home.rows = buildRows();
      if (home.cols.length !== home.rows.length) { home.cols = home.rows.map(() => 0); home.offsets = home.rows.map(() => 0); }
      home.row = Math.min(home.row, home.rows.length - 1);
      return '<div class="scr home"><div class="hero-layer" id="heroA"></div><div class="hero-layer" id="heroB" style="opacity:0"></div>' +
        '<div class="fade-left"></div><div class="fade-bottom"></div><div class="fade-top"></div>' + topbar(true, true) +
        '<div class="home-hero"><div class="hero-copy" id="heroCopy"></div><div class="dots" id="heroDots"></div></div>' +
        '<div class="rows" id="rows">' + home.rows.map((r, ri) =>
          '<section class="row" data-row="' + ri + '"><h2>' + r.title + '</h2><div class="tiles">' + r.ids.map((id, ci) => cardHtml(id, ri, ci)).join("") + "</div></section>").join("") +
        "</div></div>";
    },
    mount() {
      this.heroFront = "heroA";
      this.lastHero = null;
      const card = this.cardAt(home.row, home.cols[home.row]) || this.cardAt(0, 0);
      setFocus(home.onChip ? $("#chip", stage) : card);
      this.hero(card.dataset.id);
      this.layout(true);
    },
    cardAt(r, c) { return $('.card[data-r="' + r + '"][data-c="' + c + '"]', stage); },
    onFocus(el) {
      home.onChip = el.id === "chip";
      if (el.classList.contains("card")) {
        home.row = +el.dataset.r; home.cols[home.row] = +el.dataset.c;
        this.layout(); this.hero(el.dataset.id);
      }
    },
    layout(instant) {
      // Vertical: the focused row sits right under the hero; rows above fade out underneath it.
      const rows = $$(".row", stage);
      let y = 0;
      rows.forEach((r, i) => { r.classList.toggle("is-past", i < home.row); if (i < home.row) y += r.offsetHeight + 44; });
      const rowsEl = $("#rows", stage);
      if (instant) rowsEl.style.transition = "none";
      rowsEl.style.transform = "translateY(" + -y + "px)";
      // Horizontal: scroll a row only when the focused card would leave the safe area (80…1840).
      rows.forEach((r, i) => {
        const tiles = $(".tiles", r), c = home.cols[i];
        const left = c * (330 + 24), w = i === home.row && !home.onChip ? 356 : 330;
        let off = home.offsets[i];
        if (left - off < 0) off = left;
        if (left + w - off > 1760) off = left + w - 1760;
        home.offsets[i] = off;
        if (instant) tiles.style.transition = "none";
        tiles.style.transform = "translateX(" + -off + "px)";
      });
      if (instant) requestAnimationFrame(() => { rowsEl.style.transition = ""; $$(".tiles", stage).forEach((t) => (t.style.transition = "")); });
    },
    hero(id) {
      if (id === this.lastHero) return;
      this.lastHero = id;
      const m = MOMENTS[id], who = PEOPLE[m.by];
      const back = this.heroFront === "heroA" ? "heroB" : "heroA";
      const b = $("#" + back, stage), f = $("#" + this.heroFront, stage);
      b.style.backgroundImage = "url(" + (m.items[0].type === "video" ? thumbOf(m) : m.items[0].src) + ")";
      b.classList.toggle("is-portrait", m.items[0].o === "p");
      b.style.opacity = 1; f.style.opacity = 0; this.heroFront = back;
      const copy = $("#heroCopy", stage);
      const fill = () => {
        copy.innerHTML = '<div class="who"><img src="' + who.avatar + '" alt=""><span class="t-title">' + who.name + "</span></div>" +
          '<div class="hero-meta t-body sep">' + FAMILY_OF() + DOT + countLabel(m) + DOT + m.date + "</div>" +
          '<div class="hero-quote">“' + m.caption + "”</div>";
        copy.classList.remove("is-swapping");
      };
      if (copy.innerHTML) { copy.classList.add("is-swapping"); clearTimeout(this.swapT); this.swapT = setTimeout(fill, 160); } else fill();
      const n = Math.min(5, m.items.length), dots = $("#heroDots", stage);
      dots.style.visibility = n > 1 ? "visible" : "hidden";
      dots.innerHTML = Array.from({ length: n }, (_, i) => "<i" + (i === 0 ? ' class="on"' : "") + "></i>").join("");
    },
    act(a, el) {
      if (a === "thistv") return go("thistv");
      if (a === "open") openViewer(home.rows[+el.dataset.r].ids, +el.dataset.c, { row: +el.dataset.r });
    },
    key(k) {
      if (toastState.countdown && ["up", "down", "left", "right"].includes(k)) cancelArrival();
      if (k === "back") { if ($(".toast", stage)) { cancelArrival(); return true; } return true; } // Home is the root: Back stays
      if (k === "ok" && toastState.countdown) { playArrival(); return true; }
      if (home.onChip) { if (k === "down") { setFocus(this.cardAt(home.row, home.cols[home.row])); return true; } if (k === "up" || k === "left" || k === "right") return true; return; }
      const r = home.row, c = home.cols[r];
      if (k === "left" || k === "right") { const n = c + (k === "left" ? -1 : 1); const el = this.cardAt(r, n); if (el) setFocus(el); return true; }
      if (k === "up") { if (r === 0) { setFocus($("#chip", stage)); this.layout(); } else setFocus(this.cardAt(r - 1, home.cols[r - 1])); return true; }
      if (k === "down") { if (r < home.rows.length - 1) setFocus(this.cardAt(r + 1, home.cols[r + 1])); return true; }
    },
  };

  /* ----- New moment arriving (toast on Home only) ----- */
  const toastState = { countdown: false };
  function newMoment() {
    const m = MOMENTS["m-tom-new"];
    m.hidden = false; m.isNew = true;
    if (current !== "home") return false; // never steal focus outside Home: it waits in Recent with a New pill
    rerenderHome();
    clearToast();
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<div class="thumb" style="background-image:url(' + m.items[0].src + ')"></div><div><b>New from Tom</b><span>Plays in 5 s' + DOT + 'press Back to stay here</span></div><div class="drain"></div>';
    stage.appendChild(t);
    setTimeout(() => { const d = $(".drain", t); if (d) d.classList.add("is-run"); }, 600);
    toastState.countdown = true;
    toastTimer = setTimeout(playArrival, 5600);
    return true;
  }
  function cancelArrival() { toastState.countdown = false; clearToast(true); }
  function playArrival() {
    toastState.countdown = false; clearToast();
    home.row = 0; home.cols[0] = 0;
    openViewer(buildRows()[0].ids, 0, { row: 0 });
  }
  function rerenderHome() {
    const keepId = focused && focused.dataset.id;
    stage.innerHTML = S.home.html();
    focused = null;
    if (keepId) { const rows = buildRows(); const c = rows[home.row].ids.indexOf(keepId); if (c >= 0) home.cols[home.row] = c; }
    S.home.mount();
  }

  /* ----- Viewer ----- */
  const V = { list: [], mi: 0, pi: 0, t: 0, paused: false, from: null };
  const PHOTO_SECONDS = 6;
  function openViewer(list, mi, from) { V.list = list.slice(); V.mi = mi; V.pi = 0; V.t = 0; V.paused = false; V.from = from || null; go("viewer/" + list[mi]); }
  S.viewer = {
    html() {
      return '<div class="scr viewer" id="viewer"></div>';
    },
    mount(arg) {
      if (!V.list.length || V.list[V.mi] !== arg) { // opened from a link: play that moment, then the Recent row
        const ids = buildRows()[0].ids; const i = Math.max(0, ids.indexOf(arg));
        V.list = ids; V.mi = i; V.pi = 0; V.t = 0; V.paused = false; V.from = { row: 0 };
      }
      this.paint();
      this.wake();
      let last = performance.now();
      const tick = (now) => {
        const dt = (now - last) / 1000; last = now;
        if (!V.paused && !$(".dialog-back", stage)) {
          const item = this.item();
          V.t += dt / (item.type === "video" ? item.dur : PHOTO_SECONDS);
          if (V.t >= 1) { this.step(1, true); } else this.progress();
        }
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    },
    unmount() { cancelAnimationFrame(this.raf); clearTimeout(this.quietT); },
    moment() { return MOMENTS[V.list[V.mi]]; },
    item() { return this.moment().items[V.pi]; },
    paint() {
      const m = this.moment(), it = this.item(), who = PEOPLE[m.by];
      m.isNew = false;
      const n = m.items.length, vid = it.type === "video";
      // Pill: photo position inside a multi-photo moment, otherwise the moment's position in what's playing.
      const count = vid ? "Video" + DOT + (V.mi + 1) + " of " + V.list.length : n > 1 ? (V.pi + 1) + " / " + n : (V.mi + 1) + " / " + V.list.length;
      const meta = FAMILY_OF() + DOT + m.date + (vid ? DOT + "Video" : n > 1 ? DOT + "Photo " + (V.pi + 1) + " of " + n : "");
      const ctrls = '<div class="ctrls"><div class="ring" data-f data-act="prev"><img src="' + A("icon-chev-left-39.svg") + '" alt="Previous"></div>' +
        '<div class="ring" data-f data-act="pause" id="pp"><img src="' + A(V.paused ? "icon-play-39.svg" : "icon-pause.svg") + '" alt=""></div>' +
        '<div class="ring" data-f data-act="next"><img src="' + A("icon-chev-right-39.svg") + '" alt="Next"></div></div>';
      const from = '<div class="v-from"><img src="' + who.avatar + '" alt=""><div><div class="t-title">' + who.name + '</div><div class="meta t-body">' + meta + "</div></div></div>";
      let h;
      if (it.o === "p") {
        h = '<div class="v-backdrop" style="background-image:url(' + it.src + ')"></div><div class="v-dim-p"></div>' +
          '<div class="v-pframe" style="background-image:url(' + it.src + ')"><div class="v-count">' + count + "</div></div>" +
          '<div class="v-ptext">' + from + '<div class="v-caption t-body">' + m.caption + "</div></div>" +
          '<div class="v-pctrls">' + ctrls + '</div><div class="v-progress v-p-progress"><i id="bar"></i></div>';
      } else {
        h = '<div class="v-photo" style="background-image:url(' + it.src + ')"></div>' + (vid ? '<div class="v-dim"></div>' : "") +
          '<div class="v-scrim-b"></div><div class="v-scrim-t"></div><div class="v-count">' + count + "</div>" +
          '<div class="v-info"><div>' + from + '<div class="v-caption t-body">' + m.caption + "</div></div>" + ctrls + "</div>" +
          (vid ? '<div class="v-time"><span class="t-small" id="tcur">0:00</span><div class="track"><i id="bar"></i><em id="head"></em></div><span class="t-small muted-2">' + mmss(it.dur) + "</span></div>"
            : '<div class="v-progress"><i id="bar"></i></div>');
      }
      const v = $("#viewer", stage);
      v.innerHTML = h;
      focused = null;
      setFocus($(this.lastCtrl ? '[data-act="' + this.lastCtrl + '"]' : "#pp", v) || $("#pp", v));
      this.progress();
    },
    progress() {
      const bar = $("#bar", stage); if (!bar) return;
      const m = this.moment(), it = this.item();
      if (it.type === "video") {
        bar.style.width = V.t * 100 + "%"; $("#head", stage).style.left = V.t * 100 + "%";
        $("#tcur", stage).textContent = mmss(V.t * it.dur);
      } else bar.style.width = ((V.pi + V.t) / m.items.length) * 100 + "%";
    },
    step(d, auto) {
      const m = this.moment();
      V.t = 0;
      if (d > 0) {
        if (V.pi < m.items.length - 1) V.pi++;
        else if (V.mi < V.list.length - 1) { V.mi++; V.pi = 0; }
        else return this.exit(); // end of the row: back to Home on that card
      } else {
        if (V.pi > 0) V.pi--;
        else if (V.mi > 0) { V.mi--; V.pi = 0; }
      }
      if (!auto) V.paused = false;
      const quiet = $("#viewer", stage).classList.contains("is-quiet");
      this.paint();
      if (!auto) this.wake(); else if (quiet) $("#viewer", stage).classList.add("is-quiet"); // auto-advance keeps the quiet view
    },
    togglePause() {
      V.paused = !V.paused;
      const pp = $("#pp img", stage); if (pp) pp.src = A(V.paused ? "icon-play-39.svg" : "icon-pause.svg");
      if (this.item().type === "video" && V.paused) {
        const r = document.createElement("div"); r.className = "big-ring"; r.innerHTML = '<img src="' + A("icon-play-77.svg") + '" alt="">';
        $("#viewer", stage).appendChild(r); setTimeout(() => r.remove(), 1000);
      }
      this.wake();
    },
    wake() {
      const v = $("#viewer", stage); if (!v) return;
      v.classList.remove("is-quiet");
      clearTimeout(this.quietT);
      this.quietT = setTimeout(() => { if (!V.paused) v.classList.add("is-quiet"); else this.wake(); }, 4000);
    },
    exit() {
      const id = V.list[V.mi];
      if (V.from) { const rows = buildRows(); const r = Math.min(V.from.row, rows.length - 1); home.row = r; const c = rows[r].ids.indexOf(id); if (c >= 0) home.cols[r] = c; home.onChip = false; }
      go("home");
    },
    act(a, el) {
      this.lastCtrl = a;
      if (a === "prev") this.step(-1); else if (a === "next") this.step(1); else if (a === "pause") this.togglePause();
    },
    key(k) {
      const v = $("#viewer", stage), quiet = v && v.classList.contains("is-quiet");
      if (k === "back") { this.exit(); return true; }
      if (k === "left" || k === "right") { const a = k === "left" ? "prev" : "next"; this.lastCtrl = a; press($('[data-act="' + a + '"]', stage)); return true; }
      if (k === "ok") { if (quiet) { this.wake(); return true; } this.lastCtrl = focused && focused.dataset.act; if (focused) press(focused); return true; }
      if (k === "up" || k === "down") { this.wake(); return true; }
    },
  };

  /* ----- Ambient (after 20 s idle on Home) ----- */
  S.ambient = {
    html() {
      return '<div class="scr"><div class="amb-photo" id="ambA"></div><div class="amb-photo" id="ambB" style="opacity:0"></div><div class="amb-dim"></div><div class="amb-scrim"></div>' +
        topbar(true, false) + '<div class="amb-clock"><div class="t-display" id="ambTime"></div><div class="date t-body" id="ambDate"></div></div>' +
        '<div class="amb-chip" id="ambChip"></div><div class="amb-dots" id="ambDots"></div></div>';
    },
    mount() {
      const ids = buildRows()[0].ids;
      this.slides = [];
      ids.forEach((id) => MOMENTS[id].items.forEach((it) => { if (it.type === "photo" && it.o !== "p") this.slides.push({ id, src: it.src }); }));
      this.i = 0; this.front = "ambA";
      this.show(true);
      this.t = setInterval(() => { this.i = (this.i + 1) % this.slides.length; this.show(); }, 8000);
      this.clock();
      this.c = setInterval(() => this.clock(), 5000);
    },
    unmount() { clearInterval(this.t); clearInterval(this.c); },
    clock() { const d = new Date(); const t = $("#ambTime", stage); if (t) { t.textContent = clock12(d); $("#ambDate", stage).textContent = dateLabel(d); } },
    show(first) {
      const s = this.slides[this.i], m = MOMENTS[s.id];
      const back = first ? this.front : this.front === "ambA" ? "ambB" : "ambA";
      $("#" + back, stage).style.backgroundImage = "url(" + s.src + ")";
      if (!first) { $("#" + back, stage).style.opacity = 1; $("#" + this.front, stage).style.opacity = 0; this.front = back; }
      const chipEl = $("#ambChip", stage);
      chipEl.innerHTML = "<b>" + PEOPLE[m.by].name + DOT + FAMILY_OF() + DOT + m.date + "</b><p>" + m.caption + "</p>";
      const n = Math.min(8, this.slides.length);
      $("#ambDots", stage).innerHTML = Array.from({ length: n }, (_, i) => "<i" + (i === this.i % n ? ' class="on"' : "") + "></i>").join("");
    },
    key() { go("home"); return true; }, // any key wakes, and is not acted on
    click() { go("home"); },
  };

  /* ----- This TV ----- */
  S.thistv = {
    html() {
      const total = FAMILIES.reduce((s, f) => s + f.moments, 0);
      return '<div class="scr">' + glows + topbar(true, false) + '<div class="page" style="display:flex;flex-direction:column;gap:80px">' +
        '<div class="head"><div class="tv-avatar"><img src="' + A("icon-tv.svg") + '" alt=""></div><div><div class="t-title">' + TV.name + '</div><div class="t-body sep" style="color:rgba(255,255,255,.78);margin-top:4px">Connected since ' + TV.since + DOT + FAMILIES.length + " families" + DOT + total + " moments</div></div></div>" +
        '<div><p class="section-label">Families on this TV</p><div class="fam-cards">' + FAMILIES.map((f, i) =>
          '<div class="fam" data-f data-act="family" data-fam="' + f.id + '"' + (i === 0 ? ' id="first"' : "") + '><div class="stack">' + f.members.map((m) => '<img src="' + PEOPLE[m[0]].avatar + '" alt="">').join("") + "</div>" +
          '<div><div class="t-headline">' + f.name + '</div><div class="meta">' + f.members.length + " members" + DOT + f.moments + " moments</div></div></div>").join("") + "</div></div>" +
        '<div><p class="section-label">Manage</p><div class="row-btn" data-f data-act="signout"><span class="ic"><img src="' + A("icon-log-out.svg") + '" alt=""></span>Sign out of this TV</div></div></div></div>';
    },
    mount(arg) { if (this.lastFam) { const el = $('[data-fam="' + this.lastFam + '"]', stage); if (el) setFocus(el); } },
    act(a, el) {
      if (a === "family") { this.lastFam = el.dataset.fam; go("family/" + el.dataset.fam); }
      if (a === "signout") confirmSignOut();
      if (a === "cancel") closeDialog();
      if (a === "dosignout") { closeDialog(); paired = false; store.set("paired", false); go("welcome"); }
    },
    key(k) {
      if ($(".dialog-back", stage)) { if (k === "back") { closeDialog(); return true; } return; }
      if (k === "back") { this.lastFam = null; go("home"); return true; }
    },
  };
  function confirmSignOut() {
    const d = document.createElement("div");
    d.className = "dialog-back";
    d.innerHTML = '<div class="dialog"><div class="t-title">Sign out of ' + TV.name + '?</div><p class="t-body muted">Moments stop playing on this TV. Families keep everything on their phones, and can connect again with a new code.</p>' +
      '<div class="btn-row"><span class="btn" data-f data-act="cancel" id="cancel">Cancel</span><span class="btn" data-f data-act="dosignout">Sign out</span></div></div>';
    stage.appendChild(d);
    S.thistv.returnFocus = focused;
    setFocus($("#cancel", d));
  }
  function closeDialog() { const d = $(".dialog-back", stage); if (d) d.remove(); focused = null; setFocus(S.thistv.returnFocus || $("#first", stage)); }

  S.family = {
    html(arg) {
      const f = FAMILIES.find((x) => x.id === arg) || FAMILIES[0];
      return '<div class="scr">' + glows + topbar(true, false) + '<div class="page" style="display:flex;flex-direction:column;gap:56px">' +
        '<div><div class="t-title">' + f.name + '</div><div class="t-body sep" style="color:rgba(255,255,255,.78);margin-top:12px">On ' + TV.name + " since " + f.since + DOT + f.members.length + " members" + DOT + f.moments + " moments</div></div>" +
        '<div><p class="section-label" style="margin-bottom:24px">Members</p><div class="people">' + f.members.map((m, i) =>
          '<div class="person" data-f' + (i === 0 ? ' id="first"' : "") + '><div class="av"><img src="' + PEOPLE[m[0]].avatar + '" alt="">' +
          (m[2] ? '<span class="crown" title="Admin"><img src="' + A("icon-crown.svg") + '" alt="Admin"></span>' : "") + "</div><div><b>" + PEOPLE[m[0]].name + "</b><span>" + m[1] + " moments</span></div></div>").join("") +
        "</div></div></div></div>";
    },
    key(k) { if (k === "back") { go("thistv"); return true; } },
  };

  /* ---------------- Router ---------------- */
  let current = null;
  let pendingToast = null;
  function connect(msg) {
    paired = true; store.set("paired", true);
    home.row = 0; home.cols = []; home.onChip = false;
    pendingToast = [msg, "Moments will start arriving here", 3200];
    go("home");
  }
  function go(route, replace) {
    const h = "#" + route;
    if (location.hash === h) render();
    else if (replace) { history.replaceState(null, "", h); render(); }
    else location.hash = h;
  }
  function render() {
    let [name, arg] = location.hash.replace(/^#/, "").split("/");
    if (!S[name]) name = "splash";
    if (screen && screen.unmount) screen.unmount();
    clearToast(); toastState.countdown = false;
    current = name; screen = S[name];
    stage.innerHTML = screen.html(arg);
    focused = null;
    if (screen.mount) screen.mount(arg);
    if (!focused) { const f = $("#first", stage) || focusables()[0]; if (f) setFocus(f); }
    if (pendingToast) { simpleToast.apply(null, pendingToast); pendingToast = null; }
    $$(".review a").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === location.hash || a.getAttribute("href") === "#" + name));
    resetIdle();
  }
  window.addEventListener("hashchange", render);

  /* ---------------- Input ---------------- */
  const KEYMAP = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", Enter: "ok", " ": "ok", Escape: "back", Backspace: "delete", GoBack: "back", BrowserBack: "back" };
  document.addEventListener("keydown", (e) => {
    let k = KEYMAP[e.key] || (/^\d$/.test(e.key) ? e.key : null);
    if (!k || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    resetIdle();
    if (k === "delete" && current !== "pin") k = "back";
    if (screen && screen.key && screen.key(k)) return;
    if (k === "delete") k = "back";
    if (["up", "down", "left", "right"].includes(k)) moveFocus(k);
    else if (k === "ok") press(focused);
  });
  stage.addEventListener("mouseover", (e) => { const el = e.target.closest("[data-f]"); if (el && current !== "ambient") setFocus(el); });
  stage.addEventListener("click", (e) => {
    resetIdle();
    if (current === "ambient") return screen.click();
    if (current === "home" && e.target.closest(".toast") && toastState.countdown) return playArrival();
    const el = e.target.closest("[data-f]");
    if (el) { setFocus(el); press(el); }
  });

  /* Idle → ambient after 20 s on Home (only when nothing is counting down) */
  let idleT = null;
  function resetIdle() {
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (current === "home" && !toastState.countdown && !document.hidden) go("ambient"); }, 20000);
  }
  document.addEventListener("mousemove", () => { if (current !== "ambient") resetIdle(); }, { passive: true });

  /* Live clock in the profile chip */
  setInterval(() => $$("[data-clock]", stage).forEach((el) => (el.textContent = timeLabel(new Date()) + DOT + TV.name)), 10000);

  /* ---------------- Review panel ---------------- */
  document.addEventListener("click", (e) => {
    if (e.target.closest(".review") && document.activeElement && document.activeElement.blur) setTimeout(() => document.activeElement.blur(), 0); // keep the arrows for the TV
    const b = e.target.closest("[data-sim]");
    if (b) {
      const s = b.dataset.sim;
      if (s === "paired") connect("Connected to The Johnsons");
      if (s === "newmoment") {
        if (!newMoment()) { // not on Home: no toast, it waits in Recent
          const label = b.textContent; b.textContent = "Added to Recent (no toast off Home)";
          setTimeout(() => (b.textContent = label), 2500);
        }
      }
      if (s === "reset") { paired = false; store.set("paired", false); MOMENTS["m-tom-new"].hidden = true; home.cols = []; go("splash"); }
    }
    if (e.target.closest(".review-toggle")) document.body.classList.add("panel-hidden"), document.body.classList.remove("panel-shown"), fit();
    if (e.target.closest(".review-show")) document.body.classList.remove("panel-hidden"), document.body.classList.add("panel-shown"), fit();
  });

  /* ---------------- Fit the 1920×1080 stage to the window ---------------- */
  function fit() {
    const vp = $(".viewport");
    requestAnimationFrame(() => {
      const r = vp.getBoundingClientRect(), m = 24;
      const s = Math.min((r.width - m * 2) / 1920, (r.height - m * 2) / 1080);
      stage.style.transform = "scale(" + s + ") translate(-50%, -50%)";
    });
  }
  window.addEventListener("resize", fit);
  $(".viewport").addEventListener("transitionend", fit);
  fit();

  if (!location.hash) history.replaceState(null, "", "#splash");
  render();
})();
