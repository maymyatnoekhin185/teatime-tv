/* TeaTime TV prototype — vanilla JS. One 1920×1080 stage, hash routes, D-pad focus. See UX.md for the behaviour spec. */
(function () {
  "use strict";

  /* ================= Data ================= */
  const A = (f) => "assets/" + f;
  // People. `face` = [photo, x%, y%, zoom%]: a face cut from a family photo, like a phone's People album.
  const PEOPLE = {
    sarah: { name: "Sarah", avatar: A("avatar-sarah.jpg"), face: ["xmas-baking.jpg", 27, 14, 420] },
    ed: { name: "Ed", avatar: A("avatar-ed.jpg"), face: ["xmas-beach.jpg", 19, 25, 380] },
    may: { name: "May", avatar: A("avatar-may.jpg") },
    tom: { name: "Tom", avatar: A("avatar-tom.jpg"), face: ["photo-tom-grad.jpg", 52, 31, 520] },
    lily: { name: "Lily", face: ["xmas-nan-hug.jpg", 60, 36, 560] },
    leo: { name: "Leo", face: ["xmas-presents.jpg", 33, 19, 430] },
    mia: { name: "Mia", face: ["photo-drawing.jpg", 50, 26, 520] },
    lisa: { name: "Lisa", you: true, avatar: A("avatar-lisa.png"), face: ["xmas-nan-hug.jpg", 40, 31, 470] },
    linh: { name: "Linh", avatar: A("avatar-linh.jpg") },
    nam: { name: "Nam", avatar: A("avatar-may.jpg") },
    mai: { name: "Mai", avatar: A("avatar-sarah.jpg") },
    henry: { name: "Henry", avatar: A("avatar-ed.jpg") },
    grace: { name: "Grace", avatar: A("avatar-grace.jpg") },
    // Care home staff who post for residents (care community TV only)
    activities: { name: "Activities team", avatar: A("avatar-community.svg") },
    priya: { name: "Nurse Priya", avatar: A("avatar-grace.jpg") },
  };
  const FAMILIES = [
    { id: "johnsons", name: "The Johnsons", since: "12 March 2026", moments: 35, members: [["sarah", 14, true], ["ed", 9], ["may", 9], ["tom", 3]] },
    { id: "nguyens", name: "The Nguyens", since: "2 May 2026", moments: 17, members: [["linh", 9, true], ["nam", 5], ["mai", 3]] },
    { id: "wilsons", name: "The Wilsons", since: "20 July 2026", moments: 19, members: [["henry", 12, true], ["grace", 7]] },
  ];
  // Two kinds of TV (review panel → "This TV"). A care community TV is just a TV whose family is a care family:
  // the family was made for a resident on the phone (E6/E7) and linked to the care home, so the care home's posts play here too.
  const TVS = {
    home: { kind: "home", name: "Lisa’s TV", owner: A("avatar-lisa.png"), since: "March 2026" },
    care: { kind: "care", name: "Margaret’s TV", owner: A("avatar-margaret.svg"), since: "17 November 2026", resident: "Margaret", room: "Room 12 · Lakeside wing", community: "Cheltenham Manor" },
  };
  let TV = TVS.home;
  const isCare = () => TV.kind === "care";
  // Margaret's family on her TV (the Johnsons, shown as "Margaret's family"). The layout stays stacked, so more families can be added.
  const CARE_FAMILIES = () => FAMILIES.filter((f) => f.id === "johnsons");

  // The family's photo library: when each was taken (photo date), where, and who is in it (named on the phones).
  const PH = {
    "autumn-dog": { src: "photo-autumn-dog.jpg", date: "10 May 2026", m: "2026-05", place: "Daylesford", people: ["leo", "mia"] },
    "kids-path": { src: "photo-kids-path.jpg", date: "11 May 2026", m: "2026-05", place: "Daylesford", people: ["leo"] },
    "newborn": { src: "photo-sarah-3.jpg", o: "p", date: "18 Jun 2026", m: "2026-06", people: ["sarah"] },
    "sofa-dog": { src: "photo-sofa-dog.jpg", date: "21 Jun 2026", m: "2026-06", people: ["mia", "leo"] },
    "beach": { src: "photo-beach.jpg", date: "14 Jul 2026", m: "2026-07", place: "Torquay", people: ["ed", "sarah", "mia"] },
    "drawing": { src: "photo-drawing.jpg", o: "p", date: "9 Sep 2026", m: "2026-09", people: ["mia"] },
    "dinner": { src: "photo-ed-1.jpg", date: "4 Oct 2026", m: "2026-10", people: ["ed", "sarah", "tom"] },
    "birthday": { src: "photo-birthday.jpg", date: "25 Oct 2026", m: "2026-10", people: ["lily", "leo"] },
    "tom-grad": { src: "photo-tom-grad.jpg", o: "p", date: "17 Nov 2026", m: "2026-11", people: ["tom"] },
    "xmas-tree": { src: "xmas-tree.jpg", date: "20 Dec 2025", m: "2025-12", people: ["sarah", "leo", "lily"] },
    "xmas-baking": { src: "xmas-baking.jpg", date: "22 Dec 2025", m: "2025-12", people: ["sarah", "lily"] },
    "xmas-star": { src: "xmas-star.jpg", o: "p", date: "24 Dec 2025", m: "2025-12", people: ["ed", "lily"] },
    "xmas-presents": { src: "xmas-presents.jpg", date: "25 Dec 2025", m: "2025-12", people: ["leo", "lily"] },
    "xmas-dinner": { src: "xmas-dinner.jpg", date: "25 Dec 2025", m: "2025-12", people: ["lisa", "leo", "lily", "ed"] },
    "xmas-nan-hug": { src: "xmas-nan-hug.jpg", o: "p", date: "25 Dec 2025", m: "2025-12", people: ["lisa", "lily"] },
    "xmas-beach": { src: "xmas-beach.jpg", date: "26 Dec 2025", m: "2025-12", place: "Torquay", people: ["ed", "sarah", "leo", "lily"] },
  };
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthLabel = (m) => MONTHS[+m.slice(5) - 1] + " " + m.slice(0, 4);
  const phSrc = (id) => A(PH[id].src);

  // Memories: made by TeaTime from ALL the family's photos (not per upload). ai = needs face/scene AI (People, Events); the rest is photo metadata (date, GPS).
  const MEM = {
    "ev-lily": { kind: "event", label: "Party", ai: true, title: "Lily’s 6th birthday", when: "25 Oct 2026", photos: ["birthday", "sofa-dog", "drawing"], from: ["sarah", "ed"], isNew: true },
    "ev-xmas": { kind: "event", label: "Party", ai: true, title: "Christmas 2025", when: "December 2025", photos: ["xmas-tree", "xmas-baking", "xmas-star", "xmas-presents", "xmas-dinner", "xmas-nan-hug", "xmas-beach"], from: ["sarah", "ed"] },
    "ev-out": { kind: "event", label: "Outdoors", ai: true, title: "Out and about", when: "Dec 2025 – Jul 2026", photos: ["autumn-dog", "kids-path", "beach", "xmas-beach"], from: ["sarah", "ed"] },
    "ev-tom": { kind: "event", label: "Event", ai: true, title: "Tom’s prize day", when: "17 Nov 2026", photos: ["tom-grad", "dinner"], from: ["tom", "ed"], isNew: true, hidden: true },
    "pl-daylesford": { kind: "place", label: "Place", title: "A weekend in Daylesford", when: "May 2026", photos: ["autumn-dog", "kids-path"], from: ["sarah"], isNew: true },
    "pl-torquay": { kind: "place", label: "Place", title: "Torquay", when: "Dec 2025 and Jul 2026", photos: ["xmas-beach", "beach"], from: ["ed", "sarah"] },
    // "Looking back" (date-only memories), in rail order: A year ago first, then the Story, then one Month card per finished month (added below).
    "tl-xmas": { kind: "timeline", label: "A year ago", title: "This time last year", when: "December 2025", photos: ["xmas-tree", "xmas-baking", "xmas-presents", "xmas-beach"], from: ["sarah", "ed"] },
    "tl-six": { kind: "timeline", label: "Story", title: "Six months with the Johnsons", when: "May – Oct 2026", photos: ["autumn-dog", "kids-path", "newborn", "sofa-dog", "beach", "drawing", "dinner", "birthday"], from: ["sarah"], isNew: true, chapters: true },
  };
  // A Month memory for every finished month with 2+ photos, newest first. The current month (November 2026) gets one once it ends; quiet months are skipped.
  const THIS_MONTH = "2026-11", MONTH_FROM = { "2026-10": ["ed", "sarah"], "2025-12": ["sarah", "ed"] };
  [...new Set(Object.values(PH).map((p) => p.m))].filter((m) => m < THIS_MONTH).sort().reverse().forEach((m) => {
    const photos = Object.keys(PH).filter((id) => PH[id].m === m);
    if (photos.length < 2) return;
    MEM["tl-" + m] = { kind: "timeline", label: "Month", title: monthLabel(m), when: monthLabel(m), photos, from: MONTH_FROM[m] || ["sarah"] };
  });
  // When the date is already the title (Month cards), don't repeat it underneath.
  const whenOf = (m) => (m.when === m.title ? "" : m.when);
  const memSub = (m) => [whenOf(m), m.photos.length + " photos", !whenOf(m) && m.from.length ? "from " + names(m.from) : ""].filter(Boolean);
  // One person memory for everyone named on the phones who is in 2+ photos.
  ["lily", "leo", "mia", "sarah", "ed", "tom", "lisa"].forEach((p) => {
    const photos = Object.keys(PH).filter((id) => PH[id].people.includes(p));
    if (photos.length < 2) return;
    const ms = photos.map((id) => PH[id].m).sort(), short = (m) => MONTHS[+m.slice(5) - 1].slice(0, 3) + " " + m.slice(0, 4);
    MEM["p-" + p] = { kind: "person", label: "Person", ai: true, person: p, title: PEOPLE[p].you ? "You, Lisa" : PEOPLE[p].name, when: ms[0] === ms[ms.length - 1] ? short(ms[0]) : short(ms[0]) + " – " + short(ms[ms.length - 1]), photos, from: [] };
  });
  const memOrder = { person: 0, event: 1, place: 2, timeline: 3 };

  // Moments = what someone sent (unchanged by memories). The bulk upload is one moment with 100 photos.
  const P = (src, o) => ({ type: "photo", src: A(src), o: o || "l" });
  // A video: a real clip in assets/ (placeholder 10 s clips made from family photos; swap in real phone videos any time) + its first frame as the poster.
  const VID = (clip, poster, o) => ({ type: "video", src: A(clip), poster: A(poster), o: o || "l", dur: 10 });
  const MOMENTS = {
    "m-bulk": { by: "sarah", date: "Yesterday", caption: "Six months of us, in one go.", isNew: true, bulk: true, range: "May – Oct 2026",
      memories: ["tl-six", "pl-daylesford", "ev-lily", "ev-out"], items: [] },
    "m-may": { by: "may", date: "12 Oct 2026", caption: "We always enjoy regular visits from Leckie — the kids love the lake!",
      items: [P("photo-kids-path.jpg"), P("photo-autumn-dog.jpg"), P("photo-sarah-3.jpg", "p"), P("photo-beach.jpg"), P("photo-ed-1.jpg")] },
    "m-ed-video": { by: "ed", date: "11 Oct 2026", caption: "Sunday lunch at ours — Lisa, you were missed! Here’s the toast.",
      items: [VID("clip-lunch-l.webm", "photo-ed-1.jpg")] },
    "m-cake": { by: "sarah", date: "25 Oct 2026", caption: "Six candles, one big breath — happy birthday, Lily!", items: [P("photo-birthday.jpg")] },
    "m-autumn": { by: "tom", date: "10 Oct 2026", caption: "Biscuit’s first proper walk in the leaves.", items: [P("photo-autumn-dog.jpg")] },
    "m-drawing": { by: "sarah", date: "9 Oct 2026", caption: "Mia drew our whole family for you, Grandma — that’s you in the middle!", items: [P("photo-drawing.jpg", "p")] },
    "m-dinner": { by: "ed", date: "4 Oct 2026", caption: "Everyone round the table for Dad’s birthday.", items: [P("photo-ed-1.jpg")] },
    "m-may-sofa": { by: "may", date: "4 Oct 2026", caption: "Rosie has claimed the couch again.", items: [P("photo-sofa-dog.jpg")] },
    "m-newborn": { by: "sarah", date: "18 Sep 2026", caption: "Quiet morning with the little one.", items: [P("photo-sarah-3.jpg", "p")] },
    "m-tom-new": { by: "tom", date: "Today", caption: "Got the science prize at school today!", items: [P("photo-tom-grad.jpg", "p")], isNew: true, hidden: true },
    // Longest captions allowed on the phone (250 characters): one landscape, one portrait.
    "m-long-l": { by: "may", date: "15 Nov 2026", caption: "Mum, we finally made it back to the little beach near Anglesea where you used to take us every summer. The kids built a sandcastle with a moat, Ed fell asleep under the umbrella, and we all agreed the fish and chips are still the best on the coast!", items: [P("photo-beach.jpg"), P("xmas-beach.jpg")] },
    "m-long-p": { by: "sarah", date: "13 Nov 2026", caption: "Found this one from Christmas and it made me cry a little. Lily still talks about that big hug every time we drive past your street. She asked if we can visit again before the holidays, so of course I said yes. Love you heaps, see you very soon.", items: [P("xmas-nan-hug.jpg", "p")] },
    "m-vid-p": { by: "tom", date: "16 Nov 2026", caption: "Going up on stage for the science prize — Mum filmed it!", items: [VID("clip-tom-p.webm", "photo-tom-grad.jpg", "p")] },
    "m-mix": { by: "sarah", date: "15 Nov 2026", caption: "Our weekend away: a few photos and a couple of videos.", items: [P("photo-autumn-dog.jpg"), VID("clip-dog-l.webm", "photo-kids-path.jpg"), P("photo-sarah-3.jpg", "p"), VID("clip-drawing-p.webm", "photo-drawing.jpg", "p"), P("photo-beach.jpg")] },
    // Every shape a phone sends, in one moment: 16:9, 4:3, 3:2, square, 3:4, 9:16, panorama.
    "m-shapes": { by: "may", date: "14 Nov 2026", caption: "All sorts of shapes from our trip — the TV shows each one whole.", items: [P("photo-kids-path.jpg"), P("shape-43.jpg"), P("photo-sofa-dog.jpg"), P("xmas-tree.jpg"), P("photo-drawing.jpg", "p"), P("xmas-star.jpg", "p"), P("shape-pano.jpg")] },
    "m-tom-video": { by: "tom", date: "2 Nov 2026", caption: "Biscuit learning to fetch (sort of).", items: [VID("clip-dog-l.webm", "photo-autumn-dog.jpg")] },
    "m-may-video": { by: "may", date: "19 Oct 2026", caption: "Mia showing you her drawing — she made you a card too!", items: [VID("clip-drawing-p.webm", "photo-drawing.jpg", "p")] },
    // Last Christmas: older moments, further back than Recent.
    "m-xmas-tree": { by: "sarah", date: "20 Dec 2025", caption: "Tree’s up! Lily put the star on (with a little help).", items: [P("xmas-tree.jpg"), P("xmas-star.jpg", "p")] },
    "m-xmas-baking": { by: "may", date: "22 Dec 2025", caption: "The gingerbread production line is open.", items: [P("xmas-baking.jpg")] },
    "m-xmas-day": { by: "ed", date: "25 Dec 2025", caption: "Christmas lunch at Mum’s — what a feast.", items: [P("xmas-dinner.jpg"), P("xmas-presents.jpg"), P("xmas-nan-hug.jpg", "p")] },
    "m-xmas-video": { by: "ed", date: "25 Dec 2025", caption: "Leo opening the big present. Worth the wait!", items: [VID("clip-presents-l.webm", "xmas-presents.jpg")] },
    "m-boxing": { by: "tom", date: "26 Dec 2025", caption: "Boxing Day swim at Torquay — freezing!", items: [P("xmas-beach.jpg")] },
    // Cheltenham Manor's posts for Margaret (care community TV only; placeholder photos repeat).
    "c-concert": { fam: "community", by: "activities", date: "17 Nov 2026", caption: "Margaret enjoyed the garden concert this afternoon — a lovely sing-along!", items: [P("photo-ed-1.jpg")], isNew: true },
    "c-scones": { fam: "community", by: "activities", date: "14 Nov 2026", caption: "Scone morning in the Lakeside kitchen. Margaret was in charge of the jam!", items: [P("xmas-baking.jpg")] },
    "c-dog": { fam: "community", by: "priya", date: "11 Nov 2026", caption: "Biscuit the therapy dog came to visit. Margaret didn’t want to let him go.", items: [P("photo-sofa-dog.jpg")] },
    "c-music": { fam: "community", by: "activities", date: "6 Nov 2026", caption: "Music afternoon in the lounge — Margaret led the singing.", items: [VID("clip-lunch-l.webm", "photo-ed-1.jpg")] },
    // The other two families on this TV (placeholder photos repeat).
    "m-linh-1": { fam: "nguyens", by: "linh", date: "16 Nov 2026", caption: "Bánh xèo night — the kids flipped their own!", items: [P("xmas-dinner.jpg"), P("xmas-baking.jpg")] },
    "m-nam-1": { fam: "nguyens", by: "nam", date: "8 Nov 2026", caption: "Morning walk before the rain came in.", items: [P("photo-kids-path.jpg")] },
    "m-mai-video": { fam: "nguyens", by: "mai", date: "1 Nov 2026", caption: "Bà, this song is for you!", items: [VID("clip-drawing-p.webm", "photo-drawing.jpg", "p")] },
    "m-linh-2": { fam: "nguyens", by: "linh", date: "20 Oct 2026", caption: "Mai’s first day at big school.", items: [P("photo-sarah-3.jpg", "p")] },
    "m-henry-1": { fam: "wilsons", by: "henry", date: "14 Nov 2026", caption: "Back on the boat for the first time since winter.", items: [P("photo-beach.jpg"), P("xmas-beach.jpg")] },
    "m-grace-1": { fam: "wilsons", by: "grace", date: "3 Nov 2026", caption: "The garden is finally blooming.", items: [P("photo-autumn-dog.jpg")] },
    "m-henry-video": { fam: "wilsons", by: "henry", date: "24 Oct 2026", caption: "Grandpa’s famous card trick, filmed at last.", items: [VID("clip-lunch-l.webm", "photo-ed-1.jpg")] },
  };
  // Sarah's 100 photos, May – Oct 2026 (placeholder photos repeat). Grouped by month for the opened view.
  const BULK_MONTHS = [["2026-10", 18], ["2026-09", 21], ["2026-08", 17], ["2026-07", 16], ["2026-06", 14], ["2026-05", 14]];
  (function () {
    const pool = ["beach", "autumn-dog", "dinner", "sofa-dog", "birthday", "kids-path", "drawing", "newborn"];
    let k = 0;
    BULK_MONTHS.forEach(([m, n]) => {
      for (let i = 0; i < n; i++) {
        const ph = PH[pool[k++ % pool.length]];
        const day = Math.max(1, 28 - Math.floor((i * 27) / n));
        MOMENTS["m-bulk"].items.push({ type: "photo", src: A(ph.src), o: ph.o || "l", date: day + " " + MONTHS[+m.slice(5) - 1].slice(0, 3) + " " + m.slice(0, 4), m, idx: MOMENTS["m-bulk"].items.length });
      }
    });
  })();
  // On Margaret's TV the Johnsons are "Margaret's family" (the phone names a care family after the resident).
  const famName = (fam) => (isCare() && fam.id === "johnsons" ? "Margaret’s family" : fam.name);
  const FAMILY_OF = (m) => (m && m.fam === "community" ? TV.community : famName(FAMILIES.find((f) => f.id === ((m && m.fam) || "johnsons")) || FAMILIES[0]));
  const thumbOf = (m) => m.thumb || m.items[0].poster || m.items[0].src;
  // "1 photo", "5 photos", "Video", "3 photos · 2 videos"
  const countLabel = (m) => {
    const v = m.items.filter((x) => x.type === "video").length, p = m.items.length - v;
    if (!p) return v === 1 ? "Video" : v + " videos";
    return (p === 1 ? "1 photo" : p + " photos") + (v ? " · " + (v === 1 ? "1 video" : v + " videos") : "");
  };

  /* ================= Storage + design options ================= */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("teatime.tv." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("teatime.tv." + k, JSON.stringify(v)); } catch (e) {} },
  };
  const CONCEPTS = { A: "Rails on Home", B: "Memories space", C: "Featured + one rail" };
  const q = new URLSearchParams(location.search);
  // 19 Nov: the old C (channels on Home) was dropped and its channels became a rail; the old D (Featured + one rail) is now C.
  let concept = q.get("concept") || store.get("concept", "C");
  if (concept === "D") concept = "C";
  if (!CONCEPTS[concept]) concept = "C";
  let launch = q.has("launch") ? q.get("launch") === "1" : store.get("launch", false); // launch = no AI yet: no People, no Events
  TV = TVS[q.get("tv") === "care" || (!q.has("tv") && store.get("tv", "home") === "care") ? "care" : "home"];
  const visibleMem = (id) => MEM[id] && !MEM[id].hidden && (!launch || !MEM[id].ai);
  const memIds = (kind) => Object.keys(MEM).filter((id) => visibleMem(id) && (!kind || MEM[id].kind === kind));
  const newestMems = () => memIds().sort((a, b) => (MEM[b].madeAt || 0) - (MEM[a].madeAt || 0) || (MEM[b].isNew ? 1 : 0) - (MEM[a].isNew ? 1 : 0));

  /* ================= Helpers ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const stage = $("#stage");
  const pad = (n) => String(n).padStart(2, "0");
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const clock12 = (d) => (d.getHours() % 12 || 12) + ":" + pad(d.getMinutes());
  const timeLabel = (d) => clock12(d) + " " + (d.getHours() < 12 ? "am" : "pm");
  const dateLabel = (d) => DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  const mmss = (s) => Math.floor(s / 60) + ":" + pad(Math.floor(s % 60));
  const DOT = "  ·  ";
  const names = (ids) => { const n = ids.map((p) => PEOPLE[p].name); return n.length < 2 ? n.join("") : n.slice(0, -1).join(", ") + " and " + n[n.length - 1]; };
  const faceStyle = (p) => { const f = PEOPLE[p].face; return f ? "background-image:url(" + A(f[0]) + ");background-size:" + f[3] + "%;background-position:" + f[1] + "% " + f[2] + "%" : "background-image:url(" + PEOPLE[p].avatar + ");background-size:cover"; };

  const glows = '<div class="glow-purple"></div><div class="glow-coral"></div>';
  const brand = '<div class="brand"><img src="' + A("logo-emblem.svg") + '" alt=""><span>TeaTime</span></div>';
  const chip = (focusable) =>
    '<div class="chip"' + (focusable ? ' data-f data-act="thistv" id="chip"' : "") + '><span class="sep" data-clock>' + timeLabel(new Date()) + DOT + TV.name + '</span><img src="' + TV.owner + '" alt=""></div>';
  const topbar = (withChip, focusableChip) => '<div class="topbar">' + brand + (withChip ? chip(focusableChip) : "") + "</div>";
  const topbarCompact = '<div class="topbar compact">' + brand + "</div>";
  const chev = '<img src="' + A("icon-chevron-left.svg") + '" alt="">';
  const playIc = '<img src="' + A("icon-play.svg") + '" alt="" style="width:26px;height:26px">';
  const steps = (list) => '<div class="steps">' + list.map((t, i) => '<div class="step"><b>' + (i + 1) + "</b>" + t + "</div>").join("") + "</div>";

  /* ================= Focus engine (spatial, for simple screens) ================= */
  let focused = null;
  function setFocus(el) {
    if (!el || el === focused) return;
    if (focused) focused.classList.remove("is-focus");
    focused = el;
    el.classList.add("is-focus");
    keepInView(el);
    if (screen && screen.onFocus) screen.onFocus(el);
  }
  // Simple list screens (This TV, a family) slide up when the focused item would go below the bottom edge, and back down
  // when it goes above the top bar — so a long list (many families, many members) is never cut off.
  function keepInView(el) {
    const page = el.closest(".page"); if (!page || el.closest(".dialog-back")) return;
    const st = stage.getBoundingClientRect(), s = st.height / 1080, r = el.getBoundingClientRect();
    const top = (r.top - st.top) / s, bottom = (r.bottom - st.top) / s, cur = page._dy || 0;
    let dy = cur;
    // Back on the top row → back to the very top, so the screen's title shows again
    const above = $$("[data-f]", page).some((x) => x !== el && x.getBoundingClientRect().bottom <= r.top + 2);
    if (!above) dy = 0;
    else if (bottom > 1016) dy = cur - (bottom - 1016);
    else if (top < 210) dy = Math.min(0, cur + (210 - top));
    if (dy !== cur) { page._dy = dy; page.style.transform = "translateY(" + dy + "px)"; }
  }
  function focusables() { return $$("[data-f]", stage).filter((el) => el.offsetParent !== null); }
  function moveFocus(dir) {
    const scope = $(".dialog-back", stage) || stage;
    const list = $$("[data-f]", scope).filter((el) => el !== focused && el.offsetParent !== null);
    if (!focused) { if (list[0]) setFocus(list[0]); return; }
    const r = focused.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bestScore = Infinity;
    for (const el of list) {
      const b = el.getBoundingClientRect();
      const dx = b.left + b.width / 2 - cx, dy = b.top + b.height / 2 - cy;
      let main, cross;
      if (dir === "left") { if (b.right > r.left + 2) continue; main = -dx; cross = Math.abs(dy); }
      else if (dir === "right") { if (b.left < r.right - 2) continue; main = dx; cross = Math.abs(dy); }
      else if (dir === "up") { if (b.bottom > r.top + 2) continue; main = -dy; cross = Math.abs(dx); }
      else { if (b.top < r.bottom - 2) continue; main = dy; cross = Math.abs(dx); }
      const score = main + cross * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) setFocus(best);
  }
  function press(el) {
    if (!el) return;
    el.classList.add("is-press");
    setTimeout(() => el.classList.remove("is-press"), 140);
    if (screen && screen.act) screen.act(el.dataset.act, el);
  }

  /* ================= Toasts ================= */
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

  /* ================= Setup screens ================= */
  const S = {};
  let screen = null;
  let paired = store.get("paired", false);

  S.splash = {
    html: () => '<div class="scr">' + glows + '<div class="splash-brand"><img src="' + A("logo-emblem.svg") + '" alt=""><div><div class="name">TeaTime</div><div class="tag">Your family is waiting</div></div></div></div>',
    mount() { this.t = setTimeout(() => go(paired ? "home" : "connect", true), 2200); },
    unmount() { clearTimeout(this.t); },
    key: () => true,
  };

  // First screen when this TV isn't connected. Scanning with any phone camera opens TeaTime (or the app store), signs in,
  // and goes to "Name your family" (or picks the family) — then this TV is connected. Nothing to type on the TV.
  S.connect = {
    html: () =>
      '<div class="scr">' + glows + topbarCompact +
      '<div class="qr-card connect-qr"><img src="' + A("qr-card.svg") + '" alt="QR code to connect this TV"></div>' +
      '<div class="setup-copy" style="width:1000px;gap:56px">' +
      '<div><div class="t-hero" style="width:860px">Scan to send photos to this TV</div>' +
      '<p class="t-body muted" style="font-size:36px;line-height:44px;margin:28px 0 0">Point your phone camera at the code.</p></div>' +
      '<div><span class="btn" data-f data-act="code" id="first">Got a code from family?</span></div></div></div>',
    act(a) { if (a === "code") go("code"); },
    key(k) { return k === "back"; }, // first screen: Back does nothing
  };

  // "Got a code from family?": when the family isn't in front of this TV, the phone sends a set-up message with a 4-digit
  // PIN for the TV (Figma flow B5 → B6). Typing it here connects this TV to that family. The 4th digit checks it — no Submit to find.
  const CODE_OK = "2580", CODE_LEN = 4;
  S.code = {
    digits: "",
    html() {
      const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];
      return '<div class="scr">' + glows +
        '<div class="photo-wash" style="left:600px;width:1320px;background-image:url(' + A("photo-birthday.jpg") + ');background-size:auto 100%;background-position:-49px 0"></div>' +
        '<div class="abs" style="left:600px;top:0;width:1320px;height:1080px;background:linear-gradient(90deg,#1a1226 0%,rgba(26,18,38,.95) 22%,rgba(26,18,38,.35) 55%,rgba(26,18,38,0) 100%)"></div>' +
        '<div class="wash-bottom"></div>' + topbarCompact +
        '<div class="setup-copy" style="width:1920px;gap:56px;padding-bottom:60px"><div style="display:flex;flex-direction:column;gap:40px">' +
        '<div><div class="t-title">Enter the code from your family</div><p class="t-body muted" style="width:900px;margin:24px 0 0;line-height:44px">It’s in the set-up message your family sent from the TeaTime app. At a care home, staff can help type it in.</p></div>' +
        '<div style="display:flex;flex-direction:column;gap:16px"><div class="pin-boxes" id="boxes"></div><div class="pin-msg" id="pinmsg"></div>' +
        '<div class="keypad">' + keys.map((k) => '<div class="key" data-f data-act="key" data-k="' + k + '"' + (k === "5" ? ' id="first"' : "") + ">" + k + "</div>").join("") + "</div></div></div>" +
        '<div class="btn-row"><span class="btn" data-f data-act="back">' + chev + "Back to the QR code</span></div></div></div>";
    },
    mount() { this.digits = ""; this.error = false; this.paint(); },
    paint(msg, isErr) {
      const b = $("#boxes", stage); if (!b) return;
      let h = "";
      for (let i = 0; i < CODE_LEN; i++) {
        const d = this.digits[i];
        h += '<div class="pin-box' + (i === this.digits.length && !this.error ? " is-next" : "") + '">' + (d ? d : '<span class="dot"></span>') + "</div>";
      }
      b.innerHTML = h;
      b.classList.toggle("is-error", !!isErr);
      const m = $("#pinmsg", stage); m.textContent = msg || ""; m.classList.toggle("is-error", !!isErr);
    },
    type(k) {
      if (k === "⌫") { this.digits = this.digits.slice(0, -1); this.error = false; this.paint(); return; }
      if (k === "✓") return this.submit();
      if (this.error) { this.digits = ""; this.error = false; }
      if (this.digits.length < CODE_LEN) this.digits += k;
      this.paint();
      if (this.digits.length === CODE_LEN) { clearTimeout(this.chk); this.chk = setTimeout(() => this.submit(), 350); } // a beat to see the 4th digit land
    },
    submit() {
      if (this.digits.length < CODE_LEN) return this.paint("Enter all 4 digits", false);
      if (this.digits === CODE_OK) { connect("Connected to The Johnsons"); return; }
      this.error = true;
      this.paint("That code didn’t work. Check the message, or ask your family to send a new one.", true);
    },
    unmount() { clearTimeout(this.chk); },
    act(a, el) {
      if (a === "key") this.type(el.dataset.k);
      else if (a === "back") go("connect");
    },
    key(k) {
      if (/^\d$/.test(k)) { const el = $('[data-k="' + k + '"]', stage); setFocus(el); press(el); return true; }
      if (k === "delete") { if (this.digits.length) { this.type("⌫"); return true; } go("connect"); return true; }
      if (k === "back") { go("connect"); return true; }
    },
  };

  /* ================= Rails (immersive list) — shared by Home, Memories and the opened 100-photo moment ================= */
  // Card sizes [w, h, focused w, focused h]
  const SIZE = { moment: [330, 440, 356, 475], memory: [560, 315, 600, 338], door: [560, 315, 600, 338], channel: [560, 315, 600, 338], person: [240, 300, 240, 300], photo: [352, 198, 380, 214] };
  const LSTATE = {};
  const lstate = (key) => (LSTATE[key] = LSTATE[key] || { row: 0, cols: {}, offs: {}, onChip: false, focusId: null });

  const kindChip = (m) => '<span class="kind kind-' + m.kind + '">' + m.label + "</span>";
  function cardHtml(it, r, c) {
    const at = ' data-f data-act="open" data-r="' + r + '" data-c="' + c + '" data-key="' + it.key + '"';
    if (it.t === "moment") {
      const m = MOMENTS[it.id], video = m.items[0].type === "video";
      return '<div class="card"' + at + ' style="background-image:url(' + thumbOf(m) + ')"><div class="scrim"></div>' +
        (m.isNew ? '<div class="pill-new">New</div>' : "") + (m.bulk ? '<div class="pill-count">' + m.items.length + " photos</div>" : "") +
        (video ? '<div class="badge-video"><img src="' + A("icon-play.svg") + '" alt=""></div>' : "") +
        '<div class="cap"><b>' + PEOPLE[m.by].name + "</b><span>" + (m.bulk ? m.range : m.date) + "</span></div></div>";
    }
    if (it.t === "memory" || it.t === "channel") {
      const m = MEM[it.id], ch = it.t === "channel";
      return '<div class="mcard' + (ch ? " is-channel" : "") + '"' + at + ' style="background-image:url(' + phSrc(m.photos[0]) + ')"><div class="scrim"></div>' +
        '<div class="mtags">' + (ch ? '<span class="kind kind-channel"><i class="live"></i>Channel</span>' : kindChip(m)) + (m.isNew && !ch ? '<span class="pill-new static">New</span>' : "") + "</div>" +
        '<div class="badge-video"><img src="' + A("icon-play.svg") + '" alt=""></div>' +
        '<div class="cap"><b>' + m.title + "</b><span>" + (ch ? "Plays non-stop" : memSub(m).slice(0, 2).join(" · ")) + "</span></div></div>";
    }
    if (it.t === "channelAll") {
      return '<div class="mcard is-channel"' + at + ' style="background-image:url(' + phSrc("xmas-beach") + ')"><div class="scrim"></div>' +
        '<div class="mtags"><span class="kind kind-channel"><i class="live"></i>Channel</span></div><div class="badge-video"><img src="' + A("icon-play.svg") + '" alt=""></div>' +
        '<div class="cap"><b>Everything, newest first</b><span>Plays non-stop</span></div></div>';
    }
    if (it.t === "person") {
      const m = MEM[it.id];
      return '<div class="pcard"' + at + '><div class="face" style="' + faceStyle(m.person) + '"></div><b>' + m.title + "</b><span>" + m.photos.length + " photos</span></div>";
    }
    if (it.t === "door") {
      const ids = newestMems(), n = ids.filter((id) => MEM[id].isNew).length;
      return '<div class="mcard door"' + at + '><div class="collage">' + ids.slice(0, 4).map((id) => '<i style="background-image:url(' + phSrc(MEM[id].photos[0]) + ')"></i>').join("") + '</div><div class="scrim"></div>' +
        '<div class="mtags"><span class="kind kind-door">Memories</span>' + (n ? '<span class="pill-new static">' + n + " new</span>" : "") + "</div>" +
        '<div class="cap"><b>' + (it.label || "All memories") + "</b><span>" + ids.length + " memories · people, events, places</span></div></div>";
    }
    if (it.t === "photo") {
      const ph = MOMENTS["m-bulk"].items[it.idx];
      return '<div class="phcard"' + at + ' style="background-image:url(' + ph.src + ')"></div>';
    }
    return "";
  }

  // What the hero (top-left copy + full background) shows for the focused item.
  // Four lines, each with one job (big to small): eyebrow (status · kind, small text, no pills) → title → one line of facts → the caption or a short description.
  // Nothing is said twice (e.g. "from Sarah and Ed" lives only in the facts line).
  const NEWTAG = (t) => '<b class="new">' + t + "</b>";
  const LIVE = '<i class="live"></i>Channel';
  const eyebrow = (...parts) => parts.filter(Boolean).join('<span class="dot">·</span>');
  function heroFor(it) {
    if (it.t === "moment" && MOMENTS[it.id].fam === "community") {
      const m = MOMENTS[it.id];
      return { bg: [thumbOf(m)], portrait: m.items[0].o === "p", eyebrow: eyebrow(m.isNew ? NEWTAG("New") : "", "Care community"),
        who: '<img src="' + A("avatar-community.svg") + '" alt=""><span class="hero-title">' + TV.community + "</span>",
        meta: PEOPLE[m.by].name + DOT + countLabel(m) + DOT + m.date, quote: "“" + m.caption + "”", caption: true, dots: Math.min(5, m.items.length) };
    }
    if (it.t === "moment") {
      const m = MOMENTS[it.id], who = PEOPLE[m.by];
      return { bg: [m.items[0].type === "video" ? thumbOf(m) : m.items[0].src], portrait: m.items[0].o === "p",
        eyebrow: m.isNew ? NEWTAG(m.bulk ? "New · big upload" : "New") : "",
        who: '<img src="' + who.avatar + '" alt=""><span class="hero-title">' + who.name + "</span>",
        meta: FAMILY_OF(m) + DOT + (m.bulk ? m.items.length + " photos" + DOT + m.range : countLabel(m) + DOT + m.date), quote: "“" + m.caption + "”", caption: true, dots: Math.min(5, m.items.length) };
    }
    if (it.t === "memory" || it.t === "channel" || it.t === "featured") {
      const m = MEM[it.id], ch = it.t === "channel";
      return { bg: m.photos.map(phSrc), portrait: PH[m.photos[0]].o === "p", preview: true,
        eyebrow: ch ? LIVE : eyebrow(m.isNew ? NEWTAG("New memory") : it.t === "featured" ? "A memory for you" : "", m.label),
        who: '<span class="hero-title">' + m.title + "</span>",
        meta: [whenOf(m), m.photos.length + " photos", m.from.length ? "from " + names(m.from) : ""].filter(Boolean).join(DOT),
        quote: ch ? "Plays by itself, one memory after another. Left and right change channel." : m.kind === "person" ? "Every photo with " + (PEOPLE[m.person].you ? "you" : PEOPLE[m.person].name) + ", from everyone in the family." : m.chapters ? "Told month by month." : "" };
    }
    if (it.t === "channelAll") return { bg: Object.keys(PH).reverse().map(phSrc), preview: true, eyebrow: LIVE, who: '<span class="hero-title">Everything, newest first</span>', meta: "Every photo the family has sent", quote: "Plays by itself. Left and right change channel." };
    if (it.t === "person") {
      const m = MEM[it.id], p = PEOPLE[m.person];
      return { bg: m.photos.map(phSrc), preview: true, eyebrow: "Person",
        who: '<span class="face sm" style="' + faceStyle(m.person) + '"></span><span class="hero-title">' + m.title + "</span>",
        meta: m.photos.length + " photos" + DOT + m.when, quote: "Every photo with " + (p.you ? "you" : p.name) + ", from everyone in the family." };
    }
    if (it.t === "door") {
      const ids = newestMems(), n = ids.filter((id) => MEM[id].isNew).length;
      return { bg: ids.slice(0, 5).map((id) => phSrc(MEM[id].photos[0])), preview: true, eyebrow: n ? NEWTAG(n + " new") : "",
        who: '<span class="hero-title">' + (it.label || "All memories") + "</span>",
        meta: ids.length + " memories", quote: launch ? "Places and months, made by TeaTime from your family’s photos." : "People, events, places and months — made by TeaTime from your family’s photos." };
    }
    if (it.t === "photo" || it.t === "bulkhead") {
      const m = MOMENTS["m-bulk"], ph = m.items[it.idx || 0];
      return { bg: [ph.src], portrait: ph.o === "p", eyebrow: it.t === "photo" ? "Photo " + (it.idx + 1) + " of " + m.items.length : "",
        who: '<img src="' + PEOPLE.sarah.avatar + '" alt=""><span class="hero-title">Sarah</span>',
        meta: FAMILY_OF(m) + DOT + (it.t === "photo" ? ph.date : m.items.length + " photos" + DOT + m.range), quote: "“" + m.caption + "”", caption: true };
    }
    return { bg: [], who: "", meta: "", quote: "" };
  }

  // A rail screen. cfg.rows() → [{title, type, items}] ; a row with type "buttons" lives in the hero (D's featured memory, the moment's Play all).
  function railScreen(key, cfg) {
    return {
      sname: key,
      html(arg) {
        this.arg = arg;
        this.rows = cfg.rows(arg).filter((r) => r.items.length);
        const st = lstate(key);
        const hasBtns = this.rows[0] && this.rows[0].type === "buttons";
        this.base = hasBtns ? 650 : 562;
        let rowsHtml = "", btnHtml = "";
        this.rows.forEach((r, ri) => {
          if (r.type === "buttons") { btnHtml = '<div class="hero-btns" id="heroBtns">' + r.items.map((it, ci) => '<span class="btn' + (ci === 0 ? " primary" : "") + '" data-f data-act="open" data-r="' + ri + '" data-c="' + ci + '" data-key="' + it.key + '">' + (ci === 0 ? playIc : "") + it.label + "</span>").join("") + "</div>"; return; }
          const t = r.items[0].t, sz = SIZE[t === "channelAll" ? "channel" : t] || SIZE.moment;
          rowsHtml += '<section class="row row-' + t + '" data-row="' + ri + '"><h2>' + r.title + (r.hint ? '<span class="row-hint">' + r.hint + "</span>" : "") + '</h2><div class="tiles" style="height:' + sz[3] + 'px">' + r.items.map((it, ci) => cardHtml(it, ri, ci)).join("") + "</div></section>";
        });
        if (st.row >= this.rows.length) st.row = 0;
        return '<div class="scr home rails"><div class="hero-layer" id="heroA"></div><div class="hero-layer" id="heroB" style="opacity:0"></div>' +
          '<div class="fade-left"></div><div class="fade-bottom"></div><div class="fade-top"></div>' + topbar(true, true) +
          (cfg.crumb ? '<div class="crumb">' + cfg.crumb + "</div>" : "") +
          '<div class="home-hero' + (hasBtns ? " with-btns" : "") + '"><div class="hero-copy" id="heroCopy"></div><div class="dots" id="heroDots"></div></div>' + btnHtml +
          '<div class="rows" id="rows" style="top:' + this.base + 'px">' + rowsHtml + "</div>" +
          // Row map: shows where you are in the list; click a dot to jump there.
          (this.rows.length > 2 ? '<div class="row-map" id="rowMap">' + this.rows.map((r, ri) => '<i data-jump="' + ri + '"><b>' + (r.type === "buttons" ? r.items[0].label : r.title) + "</b></i>").join("") + "</div>" : "") +
          "</div>";
      },
      mount() {
        const st = lstate(key);
        this.heroFront = "heroA"; this.lastHero = null;
        if (st.focusId) { // come back to the card that was playing: same row if it's there, otherwise the first row that has it
          let hit = null;
          this.rows.forEach((r, ri) => r.items.forEach((it, ci) => { if (it.key === st.focusId && (!hit || (ri === st.row && hit[0] !== st.row))) hit = [ri, ci]; }));
          if (hit) { st.row = hit[0]; st.cols[hit[0]] = hit[1]; st.onChip = false; }
          st.focusId = null;
        }
        const el = this.el(st.row, st.cols[st.row] || 0) || this.el(0, 0);
        setFocus(st.onChip ? $("#chip", stage) : el);
        if (st.onChip) this.hero(this.item(st.row, st.cols[st.row] || 0));
        this.layout(true);
      },
      unmount() { clearInterval(this.pv); clearTimeout(this.pvT); },
      item(r, c) { return this.rows[r] && this.rows[r].items[c]; },
      el(r, c) { return $('[data-r="' + r + '"][data-c="' + c + '"]', stage); },
      onFocus(el) {
        const st = lstate(key);
        st.onChip = el.id === "chip";
        if (el.dataset.r != null) { st.row = +el.dataset.r; st.cols[st.row] = +el.dataset.c; this.layout(); this.hero(this.rows[st.row].type === "buttons" ? cfg.featured(this.arg) : this.item(st.row, st.cols[st.row])); }
      },
      layout(instant) {
        const st = lstate(key);
        const rowsEl = $("#rows", stage), btns = $("#heroBtns", stage);
        const onBtns = this.rows[st.row] && this.rows[st.row].type === "buttons" && !st.onChip;
        if (btns) btns.classList.toggle("is-away", !onBtns && !st.onChip);
        let y = 0;
        $$(".row", stage).forEach((r) => {
          const ri = +r.dataset.row;
          r.classList.toggle("is-past", ri < st.row);
          if (ri === st.row) y = this.base - 562 + r.offsetTop;
        });
        if (instant) rowsEl.style.transition = "none";
        rowsEl.style.transform = "translateY(" + (onBtns || st.onChip ? 0 : -y) + "px)";
        $$(".row", stage).forEach((r) => {
          const ri = +r.dataset.row, items = this.rows[ri].items, t = items[0].t, sz = SIZE[t === "channelAll" ? "channel" : t] || SIZE.moment;
          const c = st.cols[ri] || 0, left = c * (sz[0] + 24), w = ri === st.row && !st.onChip ? sz[2] : sz[0];
          let off = st.offs[ri] || 0;
          if (left - off < 0) off = left;
          if (left + w - off > 1760) off = left + w - 1760;
          st.offs[ri] = off;
          const tiles = $(".tiles", r);
          if (instant) tiles.style.transition = "none";
          tiles.style.transform = "translateX(" + -off + "px)";
        });
        if (instant) requestAnimationFrame(() => { rowsEl.style.transition = ""; $$(".tiles", stage).forEach((t) => (t.style.transition = "")); });
        $$("#rowMap i", stage).forEach((d) => d.classList.toggle("on", !st.onChip && +d.dataset.jump === st.row));
      },
      jump(ri) { const st = lstate(key); const el = this.el(ri, Math.min(st.cols[ri] || 0, this.rows[ri].items.length - 1)); if (el) setFocus(el); },
      hero(it) {
        if (!it) return;
        const k = it.t + ":" + (it.id || it.idx || it.key);
        if (k === this.lastHero) return;
        this.lastHero = k;
        const h = heroFor(it);
        clearInterval(this.pv); clearTimeout(this.pvT);
        this.bg(h.bg[0], h.portrait);
        // Memories preview themselves: after a moment the background starts stepping through their photos.
        if (h.preview && h.bg.length > 1) {
          let i = 0;
          this.pvT = setTimeout(() => { this.pv = setInterval(() => { i = (i + 1) % h.bg.length; this.bg(h.bg[i], false, true); }, 3200); }, 1400);
        }
        const copy = $("#heroCopy", stage);
        const fill = () => {
          copy.innerHTML = (h.eyebrow ? '<div class="eyebrow">' + h.eyebrow + "</div>" : "") + '<div class="who">' + h.who + "</div>" + '<div class="hero-meta sep">' + h.meta + "</div>" +
            (h.quote ? '<div class="hero-quote' + (h.caption ? " is-caption" : "") + '">' + h.quote + "</div>" : "");
          copy.classList.remove("is-swapping");
        };
        if (copy.innerHTML) { copy.classList.add("is-swapping"); clearTimeout(this.swapT); this.swapT = setTimeout(fill, 160); } else fill();
        const dots = $("#heroDots", stage), n = h.dots || 0;
        dots.style.visibility = n > 1 ? "visible" : "hidden";
        dots.innerHTML = Array.from({ length: n }, (_, i) => "<i" + (i === 0 ? ' class="on"' : "") + "></i>").join("");
      },
      bg(src, portrait, kb) {
        const back = this.heroFront === "heroA" ? "heroB" : "heroA";
        const b = $("#" + back, stage), f = $("#" + this.heroFront, stage);
        if (!b) return;
        b.style.backgroundImage = "url(" + src + ")";
        b.classList.toggle("is-portrait", !!portrait);
        b.classList.toggle("kb", !!kb);
        b.style.opacity = 1; f.style.opacity = 0; this.heroFront = back;
      },
      act(a, el) {
        if (a === "thistv") return go("thistv");
        const it = this.item(+el.dataset.r, +el.dataset.c);
        if (it) activate(it, this, +el.dataset.r);
      },
      key(k) {
        const st = lstate(key);
        if (cfg.home) {
          if (toastState.countdown && ["up", "down", "left", "right"].includes(k)) cancelArrival();
          if (k === "ok" && toastState.countdown) { playArrival(); return true; }
          if (k === "back" && $(".toast", stage)) { cancelArrival(); return true; }
        }
        if (k === "back") { if (cfg.back) go(cfg.back); return true; }
        if (st.onChip) {
          if (k === "down") { setFocus(this.el(st.row, st.cols[st.row] || 0)); this.layout(); return true; }
          if (k !== "ok") return true;
          return;
        }
        const r = st.row, c = st.cols[r] || 0;
        if (k === "left" || k === "right") { const el = this.el(r, c + (k === "left" ? -1 : 1)); if (el) setFocus(el); return true; }
        if (k === "up") { if (r === 0) { setFocus($("#chip", stage)); this.layout(); } else setFocus(this.el(r - 1, Math.min(st.cols[r - 1] || 0, this.rows[r - 1].items.length - 1))); return true; }
        if (k === "down") { if (r < this.rows.length - 1) setFocus(this.el(r + 1, st.cols[r + 1] || 0)); return true; }
      },
    };
  }

  // What OK does on each kind of card.
  function activate(it, scr, r) {
    const st = lstate(scr.sname);
    const back = scr.sname === "moment" ? "moment/" + scr.arg : scr.sname;
    if (it.t === "moment") {
      const m = MOMENTS[it.id];
      if (m.bulk) { LSTATE.moment = null; return go("moment/" + it.id); } // a big upload opens month by month first (Play all is focused)
      const ids = scr.rows[r].items.filter((x) => x.t === "moment" && !MOMENTS[x.id].bulk).map((x) => x.id);
      return openViewer(ids, Math.max(0, ids.indexOf(it.id)), { route: back, key: scr.sname, focusId: it.key });
    }
    if (it.t === "photo") return openViewer(["m-bulk"], 0, { route: back, key: scr.sname, focusId: it.key }, it.idx);
    if (it.t === "memory" || it.t === "person" || it.t === "featured") {
      const queue = it.t === "featured" ? newestMems() : scr.rows[r].items.filter((x) => x.t === "memory" || x.t === "person").map((x) => x.id);
      return playMemory(it.id, queue, { route: back, key: scr.sname });
    }
    if (it.t === "channel" || it.t === "channelAll") { st.focusId = it.key; PL.chFrom = { route: back, key: scr.sname }; return go("channel/" + (it.id || "all")); }
    if (it.t === "door") return go("memories");
    if (it.t === "btn") {
      if (it.act === "playall") return openViewer(["m-bulk"], 0, { route: back, key: scr.sname, focusId: it.key }, 0);
      if (it.act === "playfeatured") return playMemory(it.id, newestMems(), { route: back, key: scr.sname });
      if (it.act === "seeall") return go("memories");
    }
  }

  /* ----- Row builders ----- */
  const M = (id) => ({ t: "moment", id, key: "mo:" + id });
  const MM = (id) => ({ t: MEM[id].kind === "person" ? "person" : "memory", id, key: "me:" + id }); // People rail: faces
  const MC = (id) => ({ t: "memory", id, key: "me:" + id }); // mixed rails: everything as a wide memory card
  function momentRows() {
    const visible = Object.keys(MOMENTS).filter((id) => !MOMENTS[id].hidden);
    const care = isCare();
    // On a care TV the care home's posts mix into Recent by date, as in Figma 11-A.
    const recent = (care ? ["m-tom-new", "c-concert", "m-bulk", "m-vid-p", "m-long-l", "m-mix", "m-shapes", "c-scones", "m-long-p", "c-dog", "c-music", "m-tom-video", "m-cake", "m-may-video", "m-may", "m-ed-video", "m-autumn", "m-drawing", "m-dinner", "m-may-sofa", "m-newborn"]
      : ["m-tom-new", "m-bulk", "m-vid-p", "m-long-l", "m-mix", "m-shapes", "m-long-p", "m-tom-video", "m-cake", "m-may-video", "m-may", "m-ed-video", "m-autumn", "m-drawing", "m-dinner", "m-may-sofa", "m-newborn"]).filter((id) => visible.includes(id));
    const older = ["m-boxing", "m-xmas-video", "m-xmas-day", "m-xmas-baking", "m-xmas-tree"];
    const mine = recent.concat(older);
    const byPerson = (p) => mine.filter((id) => MOMENTS[id].by === p).map(M);
    const isFam = (id) => MOMENTS[id].fam !== "community";
    const fam = (f) => Object.keys(MOMENTS).filter((id) => MOMENTS[id].fam === f && !MOMENTS[id].hidden).map(M);
    const isVid = (id) => MOMENTS[id].items[0].type === "video";
    return {
      recent: { title: "Recent from everyone", items: recent.map(M) },
      // Care TV: the care home's own rail, straight after Recent (Figma 11-A "From Cheltenham Manor · Community").
      community: care ? { title: "From " + TV.community, items: fam("community"), hint: "posts from the care home" } : null,
      // After the family member rails: videos, last Christmas, then the other families on this TV (home TV only; Margaret has one family).
      members: [["sarah", "Sarah’s moments"], ["ed", "Ed’s moments"], ["may", "May’s moments"], ["tom", "Tom’s moments"]].map(([p, t]) => ({ title: t, items: byPerson(p) }))
        .concat([
          { title: "Videos", items: mine.filter((id) => isVid(id) && isFam(id)).map(M) },
          { title: "Last Christmas", items: older.map(M), hint: "December 2025" },
        ].concat(care ? [] : [
          { title: "From The Nguyens", items: fam("nguyens"), hint: "also on this TV" },
          { title: "From The Wilsons", items: fam("wilsons"), hint: "also on this TV" },
        ])),
    };
  }
  function memoryRows() {
    const fresh = memIds().filter((id) => MEM[id].isNew);
    return [
      { title: "New memories", items: fresh.map(MC), hint: "made by TeaTime from the family’s photos" },
      { title: "People", items: memIds("person").map(MM) },
      { title: "Events", items: memIds("event").map(MM) },
      { title: "Places", items: memIds("place").map(MM) },
      { title: "Looking back", items: memIds("timeline").map(MM) },
      { title: "Memory channels", items: channelItems(), hint: "pick one and leave it playing" },
    ];
  }
  function channelItems() {
    const ids = memIds().sort((a, b) => memOrder[MEM[a].kind] - memOrder[MEM[b].kind]);
    return [{ t: "channelAll", key: "ch:all" }].concat(ids.map((id) => ({ t: "channel", id, key: "ch:" + id })));
  }
  const featuredId = () => newestMems()[0];
  function homeRows() {
    const { recent, members, community } = momentRows();
    const top = community ? [recent, community] : [recent];
    if (concept === "A") return top.concat(memoryRows(), members);
    if (concept === "B") return top.concat([{ title: "Memories", items: [{ t: "door", key: "door", label: "Memories" }] }], members);
    const f = featuredId();
    return [
      { type: "buttons", items: [{ t: "btn", act: "playfeatured", id: f, label: "Play memory", key: "btn:play" }, { t: "btn", act: "seeall", label: "See all memories", key: "btn:all" }] },
    ].concat(top, [
      { title: "Memories", items: newestMems().slice(0, 6).map(MC).concat([{ t: "door", key: "door", label: "See all memories" }]) },
    ], members);
  }

  S.home = railScreen("home", { chip: true, home: true, rows: homeRows, featured: () => ({ t: "featured", id: featuredId() }) });
  S.memories = railScreen("memories", { back: "home", crumb: "Memories", rows: memoryRows });
  S.moment = railScreen("moment", {
    back: "home",
    rows(id) {
      const m = MOMENTS[id] || MOMENTS["m-bulk"];
      const rows = [{ type: "buttons", items: [{ t: "btn", act: "playall", label: "Play all " + m.items.length, key: "btn:playall" }] },
        { title: "Memories from this upload", items: (m.memories || []).filter(visibleMem).map(MC) }];
      BULK_MONTHS.forEach(([mo]) => {
        const items = m.items.filter((x) => x.m === mo);
        rows.push({ title: monthLabel(mo) + DOT + items.length + " photos", items: items.map((x) => ({ t: "photo", idx: x.idx, key: "ph:" + x.idx })) });
      });
      return rows;
    },
    featured: () => ({ t: "bulkhead", idx: 0 }),
  });

  /* ================= New moment arriving (toast on Home only) ================= */
  const toastState = { countdown: false };
  function newMoment() {
    const m = MOMENTS["m-tom-new"];
    m.hidden = false; m.isNew = true;
    if (current !== "home") return false; // never steal focus outside Home: it waits in Recent with a New pill
    rerender();
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
    openViewer(["m-tom-new"], 0, { route: "home", key: "home", focusId: "mo:m-tom-new" });
  }
  function rerender() { // redraw the current rail screen in place, keeping focus on the same card
    if (!screen || !screen.rows) return;
    const st = lstate(screen.sname);
    if (focused && focused.dataset.key) st.focusId = focused.dataset.key;
    screen.unmount && screen.unmount();
    stage.innerHTML = screen.html(screen.arg);
    focused = null;
    screen.mount(screen.arg);
  }

  /* ================= Photo shapes ================= */
  // Every photo and video is shown whole (never cropped by more than a sliver). Its real shape, measured from the file, picks the layout:
  //   wide (16:9-ish)          → full screen
  //   std  (4:3, 3:2)          → whole photo, full height, centred; blurred copy fills the sides; text over the bottom
  //   tall (square → 9:16)     → framed on the right, sized to its shape; sender and caption on the left
  //   pano (wider than 2.2:1)  → whole photo across the top; blurred copy fills the rest; text below
  const RATIO = {}, measuring = {};
  function measure(it) {
    if (it.type === "video" || RATIO[it.src] || measuring[it.src]) return measuring[it.src] || Promise.resolve();
    return (measuring[it.src] = new Promise((ok) => { const i = new Image(); i.onload = () => { RATIO[it.src] = i.naturalWidth / i.naturalHeight; ok(); }; i.onerror = ok; i.src = it.src; }));
  }
  const ratioOf = (it) => (it.type === "video" ? (it.o === "p" ? 9 / 16 : 16 / 9) : RATIO[it.src] || (it.o === "p" ? 0.75 : 16 / 9));
  const shapeOf = (r) => (r > 2.2 ? "pano" : r >= 1.6 ? "wide" : r >= 1.2 ? "std" : "tall");
  setTimeout(() => { Object.values(MOMENTS).forEach((m) => m.items.forEach(measure)); Object.keys(PH).forEach((id) => measure({ src: phSrc(id) })); }, 300); // know every shape before it's needed
  // For full-screen places without a text column (memory player, ambient): a wide photo fills the screen; any other shape
  // sits whole in the middle, full height (or full width for a panorama), over a blurred copy of itself.
  function wholePhotoHtml(src) {
    const r = RATIO[src] || 16 / 9;
    if (shapeOf(r) === "wide") return null;
    const fw = Math.min(1920, 1080 * r), fh = fw / r;
    return '<div class="pf-blur" style="background-image:url(' + src + ')"></div><div class="pf-dim"></div>' +
      '<div class="pf-img" style="left:' + Math.round((1920 - fw) / 2) + "px;top:" + Math.round((1080 - fh) / 2) + "px;width:" + Math.round(fw) + "px;height:" + Math.round(fh) + "px;background-image:url(" + src + ')"></div>';
  }
  function setWholePhoto(el, src) { const h = wholePhotoHtml(src); el.innerHTML = h || ""; el.style.backgroundImage = h ? "none" : "url(" + src + ")"; }

  /* ================= Moment viewer ================= */
  const V = { list: [], mi: 0, pi: 0, t: 0, paused: false, from: null };
  const PHOTO_SECONDS = 6;
  // Time to read a caption at a relaxed pace (about 130 words a minute, for older eyes across the room), plus a moment to look up.
  const readSecs = (t) => ((t || "").trim() ? t.trim().split(/\s+/).length / 2.2 + 2 : 0);
  function openViewer(list, mi, from, pi) { V.list = list.slice(); V.mi = mi; V.pi = pi || 0; V.t = 0; V.paused = false; V.from = from || null; go("viewer/" + list[mi]); }
  S.viewer = {
    html() { return '<div class="scr viewer" id="viewer"></div>'; },
    mount(arg) {
      if (!V.list.length || V.list[V.mi] !== arg) { const ids = momentRows().recent.items.map((x) => x.id).filter((id) => !MOMENTS[id].bulk); V.list = ids; V.mi = Math.max(0, ids.indexOf(arg)); V.pi = 0; V.t = 0; V.paused = false; V.from = { route: "home", key: "home" }; }
      this.paint(); this.wake(this.readMs());
      let last = performance.now();
      this.tick = setInterval(() => {
        const now = performance.now(), dt = Math.min(1, (now - last) / 1000); last = now;
        if (V.paused) return;
        const item = this.item();
        if (item.type === "video") { const el = $("#vid", stage); if (el) { V.t = Math.min(1, el.currentTime / this.vidDur()); this.progress(); } return; }
        if (document.hidden) return;
        V.t += dt / this.photoSecs(); if (V.t >= 1) this.step(1, true); else this.progress();
      }, 100);
    },
    unmount() { clearInterval(this.tick); clearTimeout(this.quietT); },
    moment() { return MOMENTS[V.list[V.mi]]; },
    // A long caption gets the time to be read: the moment's photos share its reading time (never less than 6 s each),
    // and the caption stays on screen at least that long before the controls fade.
    photoSecs() { const m = this.moment(); return Math.max(PHOTO_SECONDS, readSecs(m.caption) / m.items.length); },
    readMs() { return Math.max(4000, readSecs(this.moment().caption) * 1000); },
    item() { return this.moment().items[V.pi]; },
    // Clip length from the file when the browser knows it, otherwise the length in the data
    vidDur() { const el = $("#vid", stage), d = el && el.duration; return d && isFinite(d) ? d : this.item().dur; },
    paint() {
      const m = this.moment(), it = this.item(), who = PEOPLE[m.by];
      m.isNew = false;
      const n = m.items.length, vid = it.type === "video";
      const count = n > 1 ? (V.pi + 1) + " / " + n : vid ? "Video" + DOT + (V.mi + 1) + " of " + V.list.length : (V.mi + 1) + " / " + V.list.length;
      const meta = FAMILY_OF(m) + DOT + (it.date || m.date) + (n > 1 ? DOT + (vid ? "Video " : "Photo ") + (V.pi + 1) + " of " + n : vid ? DOT + "Video" : "");
      const still = vid ? it.poster : it.src;
      const media = (cls) => vid ? '<video class="' + cls + '" id="vid" src="' + it.src + '" poster="' + it.poster + '" muted playsinline autoplay preload="auto"></video>' : "";
      const timeRow = '<div class="v-time"><span class="t-small" id="tcur">0:00</span><div class="track"><i id="bar"></i><em id="head"></em></div><span class="t-small muted-2" id="tdur">' + mmss(it.dur) + "</span></div>";
      const ctrls = '<div class="ctrls"><div class="ring" data-f data-act="prev"><img src="' + A("icon-chev-left-39.svg") + '" alt="Previous"></div>' +
        '<div class="ring" data-f data-act="pause" id="pp"><img src="' + A(V.paused ? "icon-play-39.svg" : "icon-pause.svg") + '" alt=""></div>' +
        '<div class="ring" data-f data-act="next"><img src="' + A("icon-chev-right-39.svg") + '" alt="Next"></div></div>';
      const from = '<div class="v-from"><img src="' + who.avatar + '" alt=""><div><div class="t-title">' + who.name + '</div><div class="meta t-body">' + meta + "</div></div></div>";
      if (!vid && !RATIO[it.src]) measure(it).then(() => { if (current === "viewer" && this.item() === it && RATIO[it.src]) this.paint(); }); // first time only
      const r = ratioOf(it), shape = shapeOf(r);
      let h;
      if (shape === "tall") {
        // Framed on the right, inside x 1000–1824 and y 56–1024, sized to the photo's own shape
        const fw = Math.min(824, 968 * r), fh = fw / r, box = "left:" + Math.round(1000 + (824 - fw) / 2) + "px;top:" + Math.round(56 + (968 - fh) / 2) + "px;width:" + Math.round(fw) + "px;height:" + Math.round(fh) + "px;--cx:" + Math.round((1920 - fw) / 2) + "px;";
        h = '<div class="v-backdrop" style="background-image:url(' + still + ')"></div><div class="v-dim-p"></div>' +
          '<div class="v-pframe' + (vid ? " has-video" : "") + '" style="' + box + "background-image:url(" + still + ')">' + media("v-pvideo") + '<div class="v-count">' + count + "</div></div>" +
          '<div class="v-ptext">' + from + '<div class="v-caption t-body' + (m.caption.length > 260 ? " is-long" : "") + '">' + m.caption + "</div></div>" +
          '<div class="v-pctrls">' + ctrls + "</div>" + (vid ? timeRow : '<div class="v-progress v-p-progress"><i id="bar"></i></div>');
      } else {
        let pic;
        if (shape === "wide") pic = vid ? media("v-photo v-video") : '<div class="v-photo" style="background-image:url(' + it.src + ')"></div>';
        else { // std or pano: the whole photo, with its own blurred copy filling the rest of the screen
          const fw = shape === "std" ? 1080 * r : 1920, fh = fw / r, top = shape === "std" ? 0 : Math.max(60, (760 - fh) / 2);
          pic = '<div class="v-backdrop" style="background-image:url(' + still + ')"></div><div class="v-dim-p"></div>' +
            '<div class="v-fit" style="left:' + Math.round((1920 - fw) / 2) + "px;top:" + Math.round(top) + "px;width:" + Math.round(fw) + "px;height:" + Math.round(fh) + "px;background-image:url(" + still + ')">' + media("v-fitvideo") + "</div>";
        }
        h = pic +
          '<div class="v-scrim-b"></div><div class="v-scrim-t"></div><div class="v-count">' + count + "</div>" +
          '<div class="v-info"><div>' + from + '<div class="v-caption t-body' + (m.caption.length > 260 ? " is-long" : "") + '">' + m.caption + "</div></div></div>" + '<div class="v-pctrls">' + ctrls + "</div>" +
          (vid ? timeRow : '<div class="v-progress"><i id="bar"></i></div>');
      }
      const v = $("#viewer", stage);
      v.innerHTML = h;
      v.dataset.shape = shape;
      const el = $("#vid", v);
      if (el) {
        el.addEventListener("ended", () => { if ($("#vid", stage) === el) this.step(1, true); }); // the clip finished → next item
        el.addEventListener("loadedmetadata", () => { const d = el.duration; if (d && isFinite(d)) { const t = $("#tdur", stage); if (t) t.textContent = mmss(d); } });
        if (V.paused) el.pause(); else { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
      }
      focused = null;
      setFocus($(this.lastCtrl ? '[data-act="' + this.lastCtrl + '"]' : "#pp", v) || $("#pp", v));
      this.progress();
    },
    progress() {
      const bar = $("#bar", stage); if (!bar) return;
      const m = this.moment(), it = this.item();
      if (it.type === "video") { bar.style.width = V.t * 100 + "%"; $("#head", stage).style.left = V.t * 100 + "%"; $("#tcur", stage).textContent = mmss(V.t * this.vidDur()); }
      else bar.style.width = ((V.pi + V.t) / m.items.length) * 100 + "%";
    },
    step(d, auto) {
      const m = this.moment(), mi0 = V.mi;
      V.t = 0;
      if (d > 0) {
        if (V.pi < m.items.length - 1) V.pi++;
        else if (V.mi < V.list.length - 1) { V.mi++; V.pi = 0; }
        else return this.exit();
      } else {
        if (V.pi > 0) V.pi--;
        else if (V.mi > 0) { V.mi--; V.pi = 0; }
      }
      if (!auto) V.paused = false;
      const quiet = $("#viewer", stage).classList.contains("is-quiet");
      this.paint();
      if (V.mi !== mi0) this.wake(this.readMs()); // a new moment: show who sent it and the whole caption, long enough to read
      else if (!auto) this.wake(); else if (quiet) $("#viewer", stage).classList.add("is-quiet");
    },
    togglePause() {
      V.paused = !V.paused;
      const pp = $("#pp img", stage); if (pp) pp.src = A(V.paused ? "icon-play-39.svg" : "icon-pause.svg");
      const el = $("#vid", stage); if (el) { if (V.paused) el.pause(); else { const p = el.play(); if (p && p.catch) p.catch(() => {}); } }
      if (this.item().type === "video" && V.paused) {
        const r = document.createElement("div"); r.className = "big-ring"; r.innerHTML = '<img src="' + A("icon-play-77.svg") + '" alt="">';
        $("#viewer", stage).appendChild(r); setTimeout(() => r.remove(), 1000);
      }
      this.wake();
    },
    wake(ms) {
      const v = $("#viewer", stage); if (!v) return;
      v.classList.remove("is-quiet");
      clearTimeout(this.quietT);
      this.quietT = setTimeout(() => { if (!V.paused) v.classList.add("is-quiet"); else this.wake(); }, ms || 4000);
    },
    exit() {
      const f = V.from || { route: "home", key: "home" };
      const m = this.moment();
      const st = lstate(f.key);
      st.focusId = m.bulk ? "ph:" + V.pi : f.focusId && f.focusId.startsWith("mo:") ? "mo:" + V.list[V.mi] : f.focusId;
      go(f.route);
    },
    act(a) { this.lastCtrl = a; if (a === "prev") this.step(-1); else if (a === "next") this.step(1); else if (a === "pause") this.togglePause(); },
    key(k) {
      const v = $("#viewer", stage), quiet = v && v.classList.contains("is-quiet");
      if (k === "back") { this.exit(); return true; }
      if (k === "left" || k === "right") {
        const a = k === "left" ? "prev" : "next"; this.lastCtrl = a;
        press($('[data-act="' + a + '"]', stage));
        return true;
      }
      if (k === "ok") { if (quiet) { this.wake(); return true; } if (focused) press(focused); return true; }
      if (k === "up" || k === "down") { this.wake(); return true; }
    },
  };

  /* ================= Memory player (a memory plays as a short clip) + channels ================= */
  const PL = { id: null, queue: [], from: null, i: 0, t: 0, phase: "title", paused: false, mode: "memory", ch: 0 };
  const SECS = 3.6, TITLE_SECS = 2.8, NEXT_SECS = 5;
  function playMemory(id, queue, from) { PL.id = id; PL.queue = queue && queue.length ? queue : [id]; PL.from = from || { route: "home", key: "home" }; lstate(PL.from.key).focusId = "me:" + id; go("play/" + id); }
  function chapterOf(m, i) {
    if (!m.chapters) return null;
    const months = [...new Set(m.photos.map((p) => PH[p].m))];
    const mo = PH[m.photos[i]].m, inMonth = m.photos.filter((p) => PH[p].m === mo);
    return { months, idx: months.indexOf(mo), label: monthLabel(mo), pos: inMonth.indexOf(m.photos[i]) + 1, n: inMonth.length };
  }
  const CHANNELS = () => ["all"].concat(memIds().sort((a, b) => memOrder[MEM[a].kind] - memOrder[MEM[b].kind]));
  const chTitle = (id) => (id === "all" ? "Everything" : MEM[id].title);
  const chPhotos = (id) => (id === "all" ? Object.keys(PH).reverse() : MEM[id].photos);

  function playerScreen(mode) {
    return {
      html() { return '<div class="scr player" id="player"></div>'; },
      mount(arg) {
        PL.mode = mode;
        if (mode === "memory") { if (!MEM[arg]) return go("home"); PL.id = arg; if (!PL.queue.includes(arg)) { PL.queue = newestMems(); PL.from = { route: "home", key: "home" }; } PL.phase = "title"; }
        else { const list = CHANNELS(); PL.ch = Math.max(0, list.indexOf(arg)); PL.id = list[PL.ch]; PL.phase = "play"; PL.from = PL.chFrom || { route: "home", key: "home" }; PL.chFrom = null; }
        PL.i = 0; PL.t = 0; PL.paused = false; PL.elapsed = 0;
        this.build();
        let last = performance.now();
        this.tick = setInterval(() => { // real elapsed time, so slow TV hardware keeps the same pace
          const now = performance.now(), dt = Math.min(1, (now - last) / 1000); last = now;
          if (!PL.paused && !document.hidden) this.advance(dt);
        }, 100);
      },
      unmount() { clearInterval(this.tick); clearTimeout(this.quietT); clearTimeout(this.stripT); },
      photos() { return mode === "channel" ? chPhotos(PL.id) : MEM[PL.id].photos; },
      advance(dt) {
        PL.elapsed += dt;
        if (PL.phase === "title") { if (PL.elapsed > TITLE_SECS) { PL.phase = "play"; PL.elapsed = 0; this.build(); } return; }
        if (PL.phase === "next") { if (PL.elapsed > NEXT_SECS) this.playNext(); return; }
        PL.t += dt / SECS;
        if (PL.t >= 1) this.step(1, true); else this.progress();
      },
      // Whole player redraw (on start, after the title card, on channel change).
      build() {
        const p = $("#player", stage); if (!p) return;
        const photos = this.photos();
        if (mode === "memory" && PL.phase === "title") {
          const m = MEM[PL.id];
          p.innerHTML = '<div class="pl-photo kb kb-a" style="background-image:url(' + phSrc(photos[0]) + ')"></div><div class="pl-title-dim"></div>' +
            '<div class="pl-title">' + kindChip(m) + "<h1>" + m.title + "</h1><p>" + [whenOf(m), photos.length + " photos", m.from.length ? "from " + names(m.from) : ""].filter(Boolean).join(DOT) + "</p></div>";
          return;
        }
        const m = mode === "memory" ? MEM[PL.id] : null;
        const ctrls = '<div class="ctrls"><div class="ring" data-f data-act="prev"><img src="' + A("icon-chev-left-39.svg") + '" alt="Previous"></div>' +
          '<div class="ring" data-f data-act="pause" id="pp"><img src="' + A("icon-pause.svg") + '" alt=""></div>' +
          '<div class="ring" data-f data-act="next"><img src="' + A("icon-chev-right-39.svg") + '" alt="Next"></div></div>';
        const avatars = m ? (m.kind === "person" ? '<span class="face sm" style="' + faceStyle(m.person) + '"></span>' : '<div class="stack">' + m.from.map((f) => '<img src="' + (PEOPLE[f].avatar || "") + '" alt="">').join("") + "</div>") : "";
        p.innerHTML = '<div id="plPhotos"></div><div class="v-scrim-b"></div><div class="v-scrim-t"></div>' +
          '<div class="story-chip" id="storyChip"></div><div class="segs" id="segs"></div>' +
          (mode === "channel" ? '<div class="ch-strip" id="chStrip"></div>' : "") +
          '<div class="v-info"><div><div class="v-from">' + avatars + '<div><div class="t-title">' + (m ? m.title : chTitle(PL.id)) + '</div><div class="meta t-body" id="plMeta"></div></div></div>' +
          '<div class="v-caption t-body" id="plCap"></div></div></div>' + '<div class="v-pctrls">' + ctrls + "</div>" + '<div class="v-progress"><i id="bar"></i></div>';
        focused = null; setFocus($("#pp", p));
        this.show(true);
        this.wake();
        if (mode === "channel") this.strip();
      },
      show(first) {
        const photos = this.photos(), id = photos[PL.i], ph = PH[id];
        const wrap = $("#plPhotos", stage); if (!wrap) return;
        const d = document.createElement("div");
        d.className = "pl-photo kb " + (PL.i % 2 ? "kb-b" : "kb-a") + (first ? "" : " fade-in");
        setWholePhoto(d, phSrc(id)); // never cropped: portraits and squares sit whole over a blurred copy
        wrap.appendChild(d);
        while (wrap.children.length > 2) wrap.firstChild.remove();
        const m = mode === "memory" ? MEM[PL.id] : null;
        const ch = m && chapterOf(m, PL.i);
        $("#storyChip", stage).innerHTML = '<b>' + (m ? m.label : LIVE) + '</b><span class="sep">' +
          (ch ? ch.label + DOT + ch.pos + " of " + ch.n + " this month" : m ? "Photo " + (PL.i + 1) + " of " + photos.length : chTitle(PL.id)) + "</span>";
        const segN = ch ? ch.months.length : Math.min(photos.length, 12);
        const segOn = ch ? ch.idx : Math.min(PL.i, 11);
        $("#segs", stage).innerHTML = photos.length > 12 && !ch ? "" : Array.from({ length: segN }, (_, i) => '<i class="' + (i < segOn ? "done" : i === segOn ? "on" : "") + '"><b></b></i>').join("");
        $("#plMeta", stage).textContent = m ? [m.label, whenOf(m), m.from.length ? "from " + names(m.from) : ""].filter(Boolean).join(DOT) : "Channel  ·  plays non-stop";
        $("#plCap", stage).textContent = ph.date + (ph.place ? " — " + ph.place : "");
        this.progress();
      },
      progress() {
        const n = this.photos().length, bar = $("#bar", stage);
        if (bar) bar.style.width = ((PL.i + PL.t) / n) * 100 + "%";
        const seg = $("#segs i.on b", stage);
        if (seg) { const m = mode === "memory" ? MEM[PL.id] : null, ch = m && chapterOf(m, PL.i); seg.style.width = (ch ? ((ch.pos - 1 + PL.t) / ch.n) * 100 : PL.t * 100) + "%"; }
      },
      step(d, auto) {
        if (PL.phase !== "play") return;
        const n = this.photos().length;
        PL.t = 0;
        if (d > 0) {
          if (PL.i < n - 1) PL.i++;
          else if (mode === "channel") PL.i = 0; // a channel never ends
          else return this.upNext();
        } else if (PL.i > 0) PL.i--;
        if (!auto) PL.paused = false;
        this.show();
        if (!auto) this.wake();
      },
      upNext() {
        const q = PL.queue.filter(visibleMem), next = q[q.indexOf(PL.id) + 1];
        if (!next) return this.exit();
        PL.phase = "next"; PL.elapsed = 0; PL.nextId = next;
        const n = MEM[next], p = $("#player", stage);
        const card = document.createElement("div");
        card.className = "upnext";
        card.innerHTML = '<p class="t-small muted">Up next</p><div class="un-row"><div class="un-thumb" style="background-image:url(' + phSrc(n.photos[0]) + ')"></div><div>' + kindChip(n) + "<b>" + n.title + "</b><span>" + memSub(n).join(DOT) + "</span></div></div>" +
          '<p class="t-small muted">Plays in 5 s' + DOT + "OK to play now" + DOT + "Back to stop</p><div class=\"drain is-run\"></div>";
        p.classList.remove("is-quiet");
        p.appendChild(card);
      },
      playNext() { PL.id = PL.nextId; PL.i = 0; PL.t = 0; PL.phase = "title"; PL.elapsed = 0; lstate(PL.from.key).focusId = "me:" + PL.id; history.replaceState(null, "", "#play/" + PL.id); this.build(); },
      switchChannel(d) {
        const list = CHANNELS();
        PL.ch = (PL.ch + d + list.length) % list.length; PL.id = list[PL.ch]; PL.i = 0; PL.t = 0;
        lstate(PL.from.key).focusId = "ch:" + (PL.id === "all" ? "all" : PL.id);
        history.replaceState(null, "", "#channel/" + PL.id);
        this.build();
      },
      strip() {
        const list = CHANNELS(), s = $("#chStrip", stage); if (!s) return;
        const at = (d) => chTitle(list[(PL.ch + d + list.length) % list.length]);
        s.innerHTML = '<span class="prev">◀  ' + at(-1) + '</span><span class="cur">' + at(0) + '</span><span class="next">' + at(1) + "  ▶</span>";
        s.classList.add("is-on"); clearTimeout(this.stripT); this.stripT = setTimeout(() => s.classList.remove("is-on"), 3000);
      },
      togglePause() { PL.paused = !PL.paused; const pp = $("#pp img", stage); if (pp) pp.src = A(PL.paused ? "icon-play-39.svg" : "icon-pause.svg"); $$(".pl-photo", stage).forEach((e) => (e.style.animationPlayState = PL.paused ? "paused" : "running")); this.wake(); },
      wake() {
        const p = $("#player", stage); if (!p) return;
        p.classList.remove("is-quiet"); clearTimeout(this.quietT);
        this.quietT = setTimeout(() => { if (!PL.paused && PL.phase === "play") p.classList.add("is-quiet"); }, 4000);
      },
      exit() { go(PL.from.route); },
      act(a) {
        if (a === "prev") this.step(-1); else if (a === "next") this.step(1); else if (a === "pause" && PL.phase === "play") this.togglePause();
      },
      key(k) {
        if (k === "back") { this.exit(); return true; }
        if (PL.phase === "title") { if (k === "ok") { PL.phase = "play"; PL.elapsed = 0; this.build(); } return true; }
        if (PL.phase === "next") { if (k === "ok") this.playNext(); return true; }
        const quiet = $("#player", stage).classList.contains("is-quiet");
        if (k === "left" || k === "right") {
          const a = k === "left" ? "prev" : "next";
          if (mode === "channel") { this.switchChannel(k === "left" ? -1 : 1); return true; }
          press($('[data-act="' + a + '"]', stage));
          return true;
        }
        if (k === "ok") { if (quiet) { this.wake(); return true; } this.togglePause(); return true; }
        if (k === "up" || k === "down") { this.wake(); if (mode === "channel") this.strip(); return true; }
      },
    };
  }
  S.play = playerScreen("memory");
  S.channel = playerScreen("channel");

  /* ================= Ambient (after 20 s idle on Home) ================= */
  S.ambient = {
    html() {
      return '<div class="scr"><div class="amb-photo" id="ambA"></div><div class="amb-photo" id="ambB" style="opacity:0"></div><div class="amb-dim"></div><div class="amb-scrim"></div>' +
        topbar(true, false) + '<div class="amb-clock"><div class="t-display" id="ambTime"></div><div class="date t-body" id="ambDate"></div></div>' +
        '<div class="amb-chip" id="ambChip"></div><div class="amb-dots" id="ambDots"></div></div>';
    },
    mount() {
      this.slides = [];
      if (concept === "C") { // ambient becomes a memory channel
        newestMems().forEach((id) => MEM[id].photos.forEach((p) => { this.slides.push({ src: phSrc(p), title: MEM[id].label + DOT + MEM[id].title, cap: PH[p].date + (PH[p].place ? " — " + PH[p].place : "") }); }));
      } else {
        momentRows().recent.items.forEach(({ id }) => { const m = MOMENTS[id]; if (m.bulk) return; m.items.forEach((it) => { if (it.type === "photo") this.slides.push({ src: it.src, title: PEOPLE[m.by].name + DOT + FAMILY_OF(m) + DOT + m.date, cap: m.caption }); }); });
      }
      this.i = 0; this.front = "ambA";
      this.show(true);
      const next = () => { this.t = setTimeout(() => { this.i = (this.i + 1) % this.slides.length; this.show(); next(); }, Math.max(8, readSecs(this.slides[this.i].cap) + 3) * 1000); };
      next();
      this.clock(); this.c = setInterval(() => this.clock(), 5000);
    },
    unmount() { clearTimeout(this.t); clearInterval(this.c); },
    clock() { const d = new Date(); const t = $("#ambTime", stage); if (t) { t.textContent = clock12(d); $("#ambDate", stage).textContent = dateLabel(d); } },
    show(first) {
      const s = this.slides[this.i];
      const back = first ? this.front : this.front === "ambA" ? "ambB" : "ambA";
      setWholePhoto($("#" + back, stage), s.src);
      if (!first) { $("#" + back, stage).style.opacity = 1; $("#" + this.front, stage).style.opacity = 0; this.front = back; }
      $("#ambChip", stage).innerHTML = '<b class="sep">' + s.title + "</b><p>" + s.cap + "</p>";
      const n = Math.min(8, this.slides.length);
      $("#ambDots", stage).innerHTML = Array.from({ length: n }, (_, i) => "<i" + (i === this.i % n ? ' class="on"' : "") + "></i>").join("");
    },
    key() { go("home"); return true; },
    click() { go("home"); },
  };

  /* ================= This TV / family ================= */
  S.thistv = {
    html() {
      const fams = isCare() ? CARE_FAMILIES() : FAMILIES; // a resident can have more than one family (son's, daughter's…)
      const total = fams.reduce((s, f) => s + f.moments, 0);
      const sub = isCare() ? TV.room + DOT + TV.community + DOT + "connected " + TV.since : "Connected since " + TV.since + DOT + fams.length + " families" + DOT + total + " moments";
      // Care TV: Families on this TV, then the care home, then Manage — stacked, because a resident may have several families.
      // Down slides the page so nothing is cut off (keepInView).
      const careCard = isCare() ? '<div><p class="section-label">Care community</p><div class="fam-cards"><div class="fam fam-care" data-f data-act="community"><div class="stack"><img src="' + A("avatar-community.svg") + '" alt=""></div>' +
        '<div><div class="t-headline">' + TV.community + '</div><div class="meta">Activities team and nurses post here</div><div class="meta">Managed by the care home</div></div></div></div></div>' : "";
      return '<div class="scr">' + glows + topbar(true, false) + '<div class="page" style="display:flex;flex-direction:column;gap:80px">' +
        '<div class="head"><div class="tv-avatar"><img src="' + A("icon-tv.svg") + '" alt=""></div><div><div class="t-title">' + TV.name + '</div><div class="t-body sep" style="color:rgba(255,255,255,.78);margin-top:4px">' + sub + "</div></div></div>" +
        '<div><p class="section-label">Families on this TV</p><div class="fam-cards">' + fams.map((f, i) =>
          '<div class="fam" data-f data-act="family" data-fam="' + f.id + '"' + (i === 0 ? ' id="first"' : "") + '><div class="stack">' + f.members.map((m) => '<img src="' + PEOPLE[m[0]].avatar + '" alt="">').join("") + "</div>" +
          '<div><div class="t-headline">' + famName(f) + '</div><div class="meta">' + f.members.length + " members" + DOT + f.moments + " moments</div></div></div>").join("") + "</div></div>" + careCard +
        '<div><p class="section-label">Manage</p><div class="row-btn" data-f data-act="signout"><span class="ic"><img src="' + A("icon-log-out.svg") + '" alt=""></span>Sign out of this TV</div></div></div></div>';
    },
    mount() { if (this.lastFam) { const el = $('[data-fam="' + this.lastFam + '"]', stage); if (el) setFocus(el); } },
    act(a, el) {
      if (a === "family") { this.lastFam = el.dataset.fam; go("family/" + el.dataset.fam); }
      if (a === "signout") confirmSignOut();
      if (a === "community") simpleToast(TV.community + " looks after this", "Ask the staff if something needs changing", 3200);
      if (a === "cancel") closeDialog();
      if (a === "dosignout") { closeDialog(); paired = false; store.set("paired", false); go("connect"); }
    },
    key(k) {
      if ($(".dialog-back", stage)) { if (k === "back") { closeDialog(); return true; } return; }
      if (k === "back") { this.lastFam = null; go(this.backTo || "home"); return true; } // back to the screen whose chip opened it
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
      return '<div class="scr">' + glows + topbar(true, true) + '<div class="page" style="display:flex;flex-direction:column;gap:56px">' +
        '<div><div class="t-title">' + famName(f) + '</div><div class="t-body sep" style="color:rgba(255,255,255,.78);margin-top:12px">On ' + TV.name + " since " + f.since + DOT + f.members.length + " members" + DOT + f.moments + " moments</div></div>" +
        '<div><p class="section-label" style="margin-bottom:24px">Members</p><div class="people">' + f.members.map((m, i) =>
          '<div class="person" data-f' + (i === 0 ? ' id="first"' : "") + '><div class="av"><img src="' + PEOPLE[m[0]].avatar + '" alt="">' +
          (m[2] ? '<span class="crown" title="Admin"><img src="' + A("icon-crown.svg") + '" alt="Admin"></span>' : "") + "</div><div><b>" + PEOPLE[m[0]].name + "</b><span>" + m[1] + " moments</span></div></div>").join("") +
        "</div></div></div></div>";
    },
    act(a) { if (a === "thistv") go("thistv"); },
    key(k) { if (k === "back") { go("thistv"); return true; } },
  };

  /* ================= Router ================= */
  let current = null, currentRoute = "";
  let pendingToast = null;
  function connect(msg) {
    paired = true; store.set("paired", true);
    LSTATE.home = null;
    pendingToast = isCare() ? ["Connected to Margaret’s family", TV.community + "’s posts will show here too", 3600] : [msg, "Moments will start arriving here", 3200];
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
    name = { welcome: "connect", pair: "connect", qr: "connect", pin: "code", community: "connect" }[name] || name; // screens replaced on 19 Nov
    if (!S[name]) name = "splash";
    if (screen && screen.unmount) screen.unmount();
    clearToast(); toastState.countdown = false;
    // Remember where This TV was opened from (its own family screens don't count), so Back goes there.
    if (name === "thistv" && current && current !== "thistv" && current !== "family") S.thistv.backTo = currentRoute;
    current = name; screen = S[name]; currentRoute = location.hash.replace(/^#/, "");
    stage.innerHTML = screen.html(arg);
    focused = null;
    if (screen.mount) screen.mount(arg);
    if (!focused) { const f = $("#first", stage) || focusables()[0]; if (f) setFocus(f); }
    if (pendingToast) { simpleToast.apply(null, pendingToast); pendingToast = null; }
    $$(".review a").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === location.hash));
    resetIdle();
  }
  window.addEventListener("hashchange", render);

  /* ================= Input ================= */
  const KEYMAP = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", Enter: "ok", " ": "ok", Escape: "back", Backspace: "delete", GoBack: "back", BrowserBack: "back" };
  // Every way of moving (remote, keyboard, mouse wheel, trackpad, swipe) goes through input(), so they all behave the same.
  function input(k) {
    resetIdle();
    if (k === "delete" && current !== "pin") k = "back";
    if (screen && screen.key && screen.key(k)) return;
    if (k === "delete") k = "back";
    if (["up", "down", "left", "right"].includes(k)) moveFocus(k);
    else if (k === "ok") press(focused);
  }
  document.addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("select")) return; // the review panel's dropdown keeps its own keys
    const k = KEYMAP[e.key] || (/^\d$/.test(e.key) ? e.key : null);
    if (!k || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    input(k);
  });
  // Mouse wheel / trackpad: one notch or flick = one step. After a flick a trackpad keeps sending smaller and smaller deltas (inertia); those are ignored.
  const vpEl = $(".viewport");
  const WH = { acc: 0, lock: 0, last: 0, lastAbs: 0 };
  vpEl.addEventListener("wheel", (e) => {
    if (e.ctrlKey) return; // pinch-zoom
    e.preventDefault();
    const horiz = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
    let d = horiz && Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (e.deltaMode === 1) d *= 40;
    const now = performance.now(), abs = Math.abs(d);
    const inertia = now - WH.last < 120 && abs < WH.lastAbs * 0.92;
    if (now - WH.last > 250) WH.acc = 0;
    WH.last = now; WH.lastAbs = abs;
    if (now < WH.lock || inertia) return;
    WH.acc += d;
    if (Math.abs(WH.acc) < 30) return;
    const k = horiz ? (WH.acc > 0 ? "right" : "left") : WH.acc > 0 ? "down" : "up";
    WH.acc = 0; WH.lock = now + (horiz ? 140 : 260);
    input(k);
  }, { passive: false });
  // Touch: swipe like on a phone (drag up = next row, drag left = next card). A tap is still a click.
  let touch0 = null;
  vpEl.addEventListener("touchstart", (e) => { touch0 = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
  vpEl.addEventListener("touchmove", (e) => { if (touch0) e.preventDefault(); }, { passive: false });
  vpEl.addEventListener("touchend", (e) => {
    if (!touch0) return;
    const t = e.changedTouches[0], dx = t.clientX - touch0.x, dy = t.clientY - touch0.y;
    touch0 = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
    e.preventDefault(); // no click after a swipe
    const across = Math.abs(dx) > Math.abs(dy), n = across ? Math.min(4, Math.round(Math.abs(dx) / 140) || 1) : 1;
    for (let i = 0; i < n; i++) input(across ? (dx < 0 ? "right" : "left") : dy < 0 ? "down" : "up");
  });
  // Hover focuses only when the mouse really moves (rows sliding under a still pointer must not steal focus).
  stage.addEventListener("mousemove", (e) => { const el = e.target.closest("[data-f]"); if (el && current !== "ambient" && !el.closest(".is-away")) setFocus(el); });
  stage.addEventListener("click", (e) => {
    resetIdle();
    if (current === "ambient") return screen.click();
    const j = e.target.closest("[data-jump]");
    if (j && screen && screen.jump) return screen.jump(+j.dataset.jump);
    if (current === "home" && e.target.closest(".toast") && toastState.countdown) return playArrival();
    const el = e.target.closest("[data-f]");
    if (el) { setFocus(el); press(el); }
  });

  let idleT = null;
  function resetIdle() {
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (current === "home" && !toastState.countdown && !document.hidden) go("ambient"); }, 20000);
  }
  document.addEventListener("mousemove", () => { if (current !== "ambient") resetIdle(); }, { passive: true });
  // Browsers pause a video while the page is hidden; carry on when it's back (unless the viewer paused it on purpose).
  document.addEventListener("visibilitychange", () => {
    const el = $("#vid", stage);
    if (!document.hidden && el && el.paused && current === "viewer" && !V.paused) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
  });
  setInterval(() => $$("[data-clock]", stage).forEach((el) => (el.textContent = timeLabel(new Date()) + DOT + TV.name)), 10000);

  /* ================= Review panel ================= */
  const sel = $("#concept"), chk = $("#launch");
  const syncUrl = () => history.replaceState(null, "", "?concept=" + concept + (launch ? "&launch=1" : "") + (isCare() ? "&tv=care" : "") + location.hash); // a copied link opens the same options
  const tvSel = $("#tvkind");
  if (tvSel) {
    tvSel.value = TV.kind;
    tvSel.addEventListener("change", () => {
      TV = TVS[tvSel.value]; store.set("tv", TV.kind);
      Object.keys(LSTATE).forEach((k) => (LSTATE[k] = null));
      syncUrl();
      if (screen && screen.rows) rerender(); else render(); // stay on the same screen, redrawn for the other TV
    });
  }
  if (sel) { sel.value = concept; sel.addEventListener("change", () => { concept = sel.value; store.set("concept", concept); LSTATE.home = null; syncUrl(); describe(); go("home"); }); }
  if (chk) { chk.checked = launch; chk.addEventListener("change", () => { launch = chk.checked; store.set("launch", launch); LSTATE.home = null; LSTATE.memories = null; syncUrl(); describe(); if (screen && screen.rows) rerender(); else go("home"); }); }
  function describe() {
    const d = $("#conceptNote"); if (!d) return;
    d.textContent = {
      A: "Every memory type gets its own rail on Home: New memories, People, Events, Places, Looking back, Memory channels.",
      B: "Home stays as it was, plus one Memories card. It opens a Memories screen with all the rails.",
      C: "Home leads with one featured memory, then one Memories rail ending in See all. Idle → memory channel.",
    }[concept] + (launch ? " Launch version: no People or Events yet." : "");
  }
  describe();
  document.addEventListener("click", (e) => {
    if (e.target.closest(".review") && !e.target.closest("select,input,label") && document.activeElement && document.activeElement.blur) setTimeout(() => document.activeElement.blur(), 0);
    const b = e.target.closest("[data-sim]");
    if (b) {
      const s = b.dataset.sim;
      if (s === "paired") connect("Connected to The Johnsons");
      if (s === "newmoment") {
        if (!newMoment()) { const label = b.textContent; b.textContent = "Added to Recent (no toast off Home)"; setTimeout(() => (b.textContent = label), 2500); }
      }
      if (s === "newmemory") { // a new memory arrives quietly: New memories rail / featured, no pop-up
        MEM["ev-tom"].hidden = false; MEM["ev-tom"].isNew = true; MEM["ev-tom"].madeAt = Date.now();
        if (screen && screen.rows) rerender();
        const label = b.textContent; b.textContent = launch ? "Made, but hidden (launch version has no AI events)" : "Added quietly to memories"; setTimeout(() => (b.textContent = label), 2500);
      }
      if (s === "reset") { paired = false; store.set("paired", false); MOMENTS["m-tom-new"].hidden = true; MEM["ev-tom"].hidden = true; Object.keys(LSTATE).forEach((k) => (LSTATE[k] = null)); go("splash"); }
    }
    if (e.target.closest(".review-toggle")) { document.body.classList.add("panel-hidden"); document.body.classList.remove("panel-shown"); fit(); }
    if (e.target.closest(".review-show")) { document.body.classList.remove("panel-hidden"); document.body.classList.add("panel-shown"); fit(); }
  });

  /* ================= Fit the 1920×1080 stage to the window ================= */
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
