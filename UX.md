# TeaTime TV — UX spec

Source: Figma `Uk1zH52TS6WFucHkYVFKJY`, section `13283:30526` "TV UI Final" (Option 1 · Immersive list, v2 Moments cards, 16 Oct). Connect flow: Figma `13903:5026` "Onboarding v2.1 flowchart" + "TV QR Family Photo Onboarding Pipeline" (17 Nov).
Built at the design's full frame size, **1920 × 1080** (Android TV 960 × 540 dp at 2×), scaled to fit the browser window.

## Who and where
- **The viewer** is often a grandparent (e.g. Lisa) sitting across the room with a remote: D-pad, OK, Back. No keyboard, no touch, sometimes poor eyesight. The TV may be left on for hours.
- **The family** set the TV up from their phones (mobile repo). Nothing is typed on the TV except, at most, a 4-digit code the family sends in a set-up message.
- **Care home staff** can help a resident type the 4-digit family code on a room TV (see "Care community TV"). There is no separate staff set-up any more.

## Layout rules (from Figma)
- 96 px side / 56 px top-bottom safe margins; 12-column grid.
- Focus = scale ~1.05 + white outline + pink glow. Exactly one thing is focused at a time, always visible.
- No navigation bar. **Back on the remote always goes back** one step.
- Surfaces are deep plum (`#1a1226`) with a soft purple/coral glow, never black.

## Remote mapping (prototype)
| Remote | Keyboard | Mouse |
|---|---|---|
| D-pad | Arrow keys | Hover moves focus (only when the mouse actually moves, so rows sliding under a still pointer don't steal focus) |
| D-pad Up/Down | Arrow Up/Down | Mouse wheel or two-finger scroll: one notch or flick = one row. Trackpad inertia is ignored, so one flick never skips several rows. Touch: drag up = next row. |
| D-pad Left/Right | Arrow Left/Right | Shift + wheel or sideways two-finger scroll = one card. Touch: drag left = next card (a long drag moves up to 4). |
| OK | Enter or Space | Click (or tap) |
| Back | Esc or Backspace (on the code screen Backspace deletes a digit first) | — |
| Number keys | 0–9 (code screen only) | — |

Wheel, trackpad and swipe all behave exactly like the remote on every screen (rails, viewer, player, channels, This TV, family, code keypad), because they all go through one `input()` path.

## Screen map
| Route | Screen (Figma) | Behaviour |
|---|---|---|
| `#splash` | 1 Splash | Logo draws in, name fades up, ~2 s → Home if this TV is connected, otherwise Welcome. |
| `#connect` | 2 Scan to send photos (new 19 Nov) | **The first screen when the TV isn't connected.** "Scan to send photos to this TV · Point your phone camera at the code." Big QR on the right (the TV's id is in the link). Any phone camera works: it opens TeaTime or the app store → sign in → Name your family (or join one) → this TV pairs itself → "Connected" toast → Home. One button: **Got a code from family?** Back does nothing (first screen). |
| `#code` | 3 Got a code from family? (new 19 Nov) | For when the family isn't in front of the TV: their phone sends a **set-up message with a 4-digit code** for the TV (Figma flow B5 → B6). 4 boxes + on-screen keypad (focus starts on 5; number keys on the remote work too). **The 4th digit checks it** — no Submit button to find. Right code (`2580` in the prototype) → "Connected to The Johnsons" → Home. Wrong → boxes turn red, "That code didn't work. Check the message, or ask your family to send a new one." The next digit clears it. Back → the QR screen. |

Replaced on 19 Nov: Welcome ("Get started"), the TV-made pairing code, the 6-digit family PIN on the TV and the second QR screen. The care home screen (staff typing a TV code into an admin website) went too: a care TV connects the same two ways (see "Care community TV"). Old links (`#welcome`, `#pair`, `#qr`, `#pin`, `#community`) open the new screens. The 6-digit family PIN still exists, but only on the phone (a person joining a family, Figma E2).
| `#home` | 5 / 5b / 5c-Cp / 7 Home | Immersive list (below). |
| `#viewer` | 6 / 6p / 6v / 6f Moment viewer | Plays a moment and then the rest of its row (below). |
| `#ambient` | 8 Ambient | After 20 s idle on Home. Slideshow with clock and caption. Any key or click wakes it back to Home, on the same card, without acting on that key. |
| `#thistv` | 9 This TV | Families on this TV + Sign out. Reached from the **profile chip** (top right: time · TV name · picture) on every screen that shows it: Home, Memories, the opened 100-photo moment and a family's screen. Click it, or Up from the top row onto it, then OK. On This TV itself the chip is just a picture (you're already there). Back returns to the screen you opened it from. |
| `#family` | 9a A family opened | Members (admin has the crown). Back → This TV. |

## Home — immersive list
- Rows: **Recent from everyone**, the Memories rail(s) for the chosen concept, then one row per member (Sarah's, Ed's, May's, Tom's moments, including older ones), **Videos**, **Last Christmas** (December 2025, older than Recent), **From The Nguyens** and **From The Wilsons** (the other two families on this TV). Placeholder photos repeat across families. Rows bleed off the right edge to show they scroll.
- **Row map** (right edge): one dot per row, the current row is a pink bar. It shows how far down the list you are and that there's more below. With a mouse, hover a dot to see the row name and click to jump there. Shown on Home, Memories and the 100-photo moment.
- The memory rails always end with **Memory channels** ("pick one and leave it playing"): on Home in A, on the Memories screen in A, B and C. A channel plays one memory after another without stopping; Left/Right changes channel (a strip shows the channels either side); Back returns to the screen it was opened from, on the channel you ended on. "Channels" is a word every TV viewer already knows (replaced "Play non-stop", 19 Nov).
- The focused card's photo becomes the background, with the text described in "Text hierarchy" below. Portrait photos use the "hero treatment" (photo framed on the face).
- Left/Right moves along a row; the row scrolls only when the focused card would leave the safe area. Up/Down changes row; each row remembers its own position. Rows above the focused row fade out under the hero.
- OK opens the viewer at that card. Up from the top row → profile chip (time · TV name) → OK opens This TV.
- New moments wear a pink **New** pill until watched.

## Viewer
- **Photo shapes (19 Nov): every photo and video is shown whole; its real shape picks the layout.** Phones send all sorts: landscape photos are usually 4:3 (not 16:9), portrait 3:4, plus squares, 9:16, screenshots and panoramas. Before, a 4:3 photo shown full screen lost about a quarter of its height (often the tops of heads), and square Christmas photos were cropped. Now the TV measures each photo when it loads and never crops more than a sliver:
  | Shape (width ÷ height) | Examples | Layout |
  |---|---|---|
  | **Wide** (1.6–2.2) | 16:9 photos and videos | Full screen; text bottom-left over a dark fade |
  | **Standard landscape** (1.2–1.6) | 4:3 and 3:2 phone photos | Whole photo, full height, centred; a blurred copy of it fills the sides; text bottom-left over a dark fade |
  | **Square to tall** (under 1.2) | 1:1, 3:4, 9:16, screenshots | Framed on the right (inside 824 × 968), sized to its own shape, with the sender and full caption on the left. **When the text fades, the photo glides to the centre** (never a half-empty screen); any key brings the text back and the photo glides right again. Same for portrait videos (production centres videos but not photos; here both behave the same) |
  | **Panorama** (over 2.2) | 3:1 | Whole photo across the top; blurred copy fills the rest; text underneath |
  Controls stay bottom-left and the whole caption shows in every layout. The **memory player** and **ambient** follow the same rule: a wide photo fills the screen, any other shape sits whole in the middle over a blurred copy of itself (portraits and squares used to be cropped there; ambient now also uses portrait photos). Test: review panel → **6s · Every photo shape** (16:9, 4:3, 3:2, square, 3:4, 9:16, panorama). Sample `shape-43.jpg` and `shape-pano.jpg` are cut from the family photos.
- **Every case, and videos really play** (review panel → Watching):
  | Case | Link | Layout |
  |---|---|---|
  | Landscape photo | `#viewer/m-cake` | Full screen with scrims (16:9) |
  | Portrait photo | `#viewer/m-drawing` | Blurred backdrop, photo framed on the right at its own shape, text on the left |
  | Landscape video | `#viewer/m-ed-video` | Plays full screen; time row (0:03 / 0:10) instead of the progress line |
  | Portrait video | `#viewer/m-vid-p` | Plays inside the portrait frame on the right; same time row |
  | Mixed moment | `#viewer/m-mix` | Landscape photo → landscape video → portrait photo → portrait video → landscape photo. Each item uses its own layout; the counter says "Photo 1 of 5" / "Video 2 of 5"; the buttons never move |
- Videos are real `<video>` files: a photo gets its time on screen, a video plays to its end and then the viewer moves on. OK pauses and resumes the video itself; Left/Right skip. The clip's poster (first frame) is the card and hero image on Home. Cards count "3 photos · 2 videos".
- The clips in `assets/clip-*.webm` are placeholders: 10 s, 30 fps, made in the browser from the family's photos (slow pan and zoom with a fade), landscape 1280×720 and portrait 720×1280, no sound. Drop real phone videos in with the same names to replace them. A browser pauses video while the page is hidden; the viewer resumes it when the page is shown again.
- The dev server answers video byte-range requests, so videos load and seek like on a real server.
- Photos advance every 6 s through the moment's photos, then on to the next card in the row; after the last card it returns to Home on that card. A long caption slows this down (see "Long captions").
- Left/Right = previous/next photo at any time. OK = pause/play (video shows the big play ring for 1 s). Up/Down just shows the controls.
- **Controls stay in one place**: previous · pause · next, bottom-left above the progress line, on every photo (landscape, portrait, video) and in the memory player. Skipping from a landscape photo to a portrait one never moves the button you're pressing (before, they jumped from bottom-right to bottom-left). The sender and caption sit above them. Left/Right step at any time, OK presses the focused button.
  - Tried and dropped on 19 Nov: arrows on the screen edges (option 2) and arrows beside a portrait photo (option 3). Old `&ctrls=` links are ignored.
- Controls hide after 4 s while playing (6f: only the thin progress line stays), or after the caption's reading time if that's longer. Paused keeps them visible. When the next moment starts by itself, the sender and caption come back for its reading time.
- Back → Home, focused on the card that was playing.

## Care community TV (19 Nov)
Switch with **This TV** in the review panel ("Margaret's TV, at a care home"; `&tv=care` in the link). Based on Figma 11-A "Community home" and the onboarding flowchart (care home poster → E5 → E6/E7 → "Later: connect the room TV — scan its code, or a PIN staff help enter").

**The idea: a care TV isn't a different kind of TV, it's a TV whose family is a care family.** On the phone the family is made *for a resident* (E6 "Is this Margaret?" → "Margaret's family") and linked to the care home. Whichever TV that family connects becomes a care TV, so the TV needs no special set-up mode.

**Who's who**
| | Home TV (Lisa) | Care TV (Margaret) |
|---|---|---|
| Who watches | Lisa, at home | Margaret, in Room 12 at Cheltenham Manor. Often frailer; staff are around |
| Who helps set it up | Family on a visit (QR), or Lisa types the family's code | Family on a visit (QR), or **staff help type the family's code** (the code screen says so) |
| Families on it | Any number (Johnsons, Nguyens, Wilsons) | Her family (one in the prototype; the layout allows more) **+ the care home** |
| What plays | Family moments and memories | The same, **plus the care home's posts** (activities team, nurses) |
| Top-right chip | "Lisa's TV" | "Margaret's TV" with her initial |
| Paywall | From the 4th upload | None (care families skip it, as on mobile) |

**Connecting** (same two ways as every TV):
1. **Family visiting Margaret** → scans the QR on her TV → signs in → care home poster flow or E1 → Care community → E4/E5/E6 → TV connected.
2. **Family far away** → on the phone, "Where should they play?" → Somewhere else → the set-up message with a 4-digit code goes to the care home (or Margaret). **Staff type it with the remote.**
Toast after connecting: "Connected to Margaret's family · Cheltenham Manor's posts will show here too".

**What changes on Margaret's TV**
- **Recent from everyone** mixes the care home's posts in by date (Figma 11-A).
- **From Cheltenham Manor** rail straight after Recent (or after the Play memory buttons in C): the care home's posts. Its hero says **Care community** (eyebrow) → **Cheltenham Manor** (title, care home badge) → "Activities team · 1 photo · 17 Nov 2026" → the post as a quote. Each card is captioned with who posted it (Activities team, Nurse Priya).
- Family rails as usual; no other families' rails. The Johnsons show as **Margaret's family** (the phone names care families after the resident).
- Memories are made from the family's photos only, never the care home's posts (other residents may be in them).
- **This TV**: "Margaret's TV · Room 12 · Lakeside wing · Cheltenham Manor"; sections **stacked**, never side by side, because a resident can have several families: **Families on this TV** (Margaret's family) → **Care community** (Cheltenham Manor: "Activities team and nurses post here" / "Managed by the care home", text wraps inside the card) → **Manage**. Down slides the page up so nothing below the edge is out of reach (all list screens do this). OK on it says "Cheltenham Manor looks after this · Ask the staff if something needs changing". Sign out as usual.
- Ambient, viewer, new-moment toast: unchanged; the care home's posts take part like any moment.
- Not confirmed yet (E7, no resident match): the TV plays the family's moments only. The care home's rail appears once staff confirm Margaret. The TV never shows "waiting" or admin messages to the resident.

**To confirm with Ed**: do care homes ever set up room TVs *before* any family exists (then staff need their own way, like the old admin-website code)? Should Sign out be hidden or need staff on a care TV, so a resident can't remove it by accident? Can the care home's posts show other residents (privacy and consent)?

## Text hierarchy (19 Nov)
Problem: chips, title, facts and caption sat side by side at similar sizes, so nothing led the eye ("New memory" pill + "Party" pill + title on one line; a bold caption that looked like a second title; "from Sarah and Ed" said twice).
Rule: **one job per line, big to small, nothing said twice, one coloured thing at a time.**
| Line | Style | Example |
|---|---|---|
| Eyebrow: status · kind | small text (26 px), no pills; "New" in pink | **New memory** · Party |
| Title | biggest (64 px, semibold, white, one line) | Lily's 6th birthday |
| Facts | one line, dimmer (28 px, 70% white) | 25 Oct 2026 · 3 photos · from Sarah and Ed |
| Caption / description | regular weight, easy to read (32 px / 44 px line height) | the sender's words, or a short line only when it adds something (a person, a channel, a Story) |
- Memory hero no longer says "Made by TeaTime from photos Sarah and Ed sent" (the facts line already says who).
- Kind chips on cards and in the player are neutral glass; only **New** is pink, so it's the one thing that stands out.
- Player top-left chip is plain text ("Party · Photo 1 of 3"), no pill inside a pill.

## Long captions
Captions can be up to **250 characters** on the phone. They're always shown in full where someone is watching, with no "See more" button (no extra steps for older viewers).
| Where | What shows | Room for 250 characters |
|---|---|---|
| Home hero (card focused) | The first 2 lines, ending in "…" | It's a preview; opening the moment shows it all |
| Viewer, landscape | The whole caption, under the sender, growing upwards from the bottom | 1,320 px wide → 3–4 lines |
| Viewer, portrait | The whole caption beside the photo, growing upwards above the controls | 820 px wide (was 623) → 5–6 lines |
| Ambient | The whole caption in the bottom-right card | 1,120 px wide (was 864, and cut at 2 lines) → 4 lines |
- **Reading time**: about 130 words a minute plus 2 s (relaxed pace for older eyes across the room). The moment's photos share that time (never under 6 s each), the caption stays on screen at least that long before the controls fade, and an ambient slide stays up at least that long plus 3 s (never under 8 s). A 49-word caption ≈ 24 s.
- Safety net: anything over the limit (260+ characters) drops a size (29 px) instead of running off screen.
- Test them: review panel → "6L · Longest caption, landscape" and "6Lp · … portrait" (also first in Recent and in ambient for A and B).

## New moment arriving (7 + notification K1–K4)
- **On Home, idle:** toast grows in top-right ("New from Tom · Plays in 5 s · press Back to stay here"), countdown drains over 5 s, then the moment plays. OK plays it now. Back dismisses it and stays.
- **On Home, browsing:** any arrow key cancels the countdown (the toast fades). We never pull someone away mid-browse. The moment is first in Recent with a New pill.
- **In the viewer, ambient or setup screens:** no toast (no focus-stealing). The moment joins Recent with a New pill.

## Memories (18 Nov, for review)
Source: May's Figma section `14088:6734` "TV · Bulk upload & Stories" (T1–T4), the 17 Nov meeting notes ("TT onboarding", "TT onboarding flow walkthrough") and Ed's rail idea.

**Agreed with May (18 Nov)**
- The word on screen is **Memories** (TV and mobile). Not Stories or Collections.
- Memories are made from **all of the family's photos**, not per upload. So a 1-photo upload can join "Lily's 6th birthday", and 100 photos work the same way. The memories from one upload still show inside that moment.
- A **big moment** (Sarah's 100 photos) stays one card in Recent with a "100 photos" pill. OK opens it **month by month first** (May's T4), with **Play all** focused, so OK twice plays it.
- A **new memory arrives quietly**: New pill, featured in C, no pop-up, no auto-play.

**Kinds** (each card has a pink kind chip)
| Kind | Made from | Needs AI | Example |
|---|---|---|---|
| Person | faces named by the family on their phones (unknown faces are never shown) | yes | Lily, Leo, "You, Lisa" |
| Event | scenes: parties, outdoors | yes | Lily's 6th birthday, Christmas 2025 |
| Place | photo GPS | no | A weekend in Daylesford |
| Looking back (date) | photo date | no | This time last year, Six months with the Johnsons, October 2026 |

**Looking back** rail (date-only memories), in this order:
| Chip | What it is | When it appears |
|---|---|---|
| **A year ago** | Photos from the same time last year ("On this day"). First because it changes often and gives a reason to come back. | Only when there are photos from that time a year earlier. |
| **Story** | A long stretch (several months) told chapter by chapter, one month at a time. A short clip of a selection of photos, not every photo or every moment. To see every photo, open the moment (e.g. Sarah's 100 photos). | When the family has photos spread across several months. |
| **Month** | A recap of one calendar month: everyone's photos from that month. One card per month, newest first (October, June, May, December…). | When a month ends, if it has 2+ photos. Quiet months are skipped; the current month gets its card once it's over. |

Month cards don't repeat the date: the title is the month, so the line underneath says "2 photos · from Ed and Sarah".

**Card shapes**: tall = a moment someone sent · wide = a memory TeaTime made · circle = a person.

**Three ways to show them — switch with "Memories design" in the review panel** (remembered per browser; `?concept=A`, `B` or `C` in the link). On 19 Nov the old option C (channels on Home) was removed and its channels became the Memory channels rail, so the old D (Featured + one rail) is now **C**. An old `?concept=D` link opens the new C.
| | Home | Where the rest lives | Idle |
|---|---|---|---|
| **A · Rails on Home** | Recent, New memories, People, Events, Places, Looking back, Memory channels, then member rails | Everything is on Home | Moments slideshow |
| **B · Memories space** | Recent + one "Memories" card, then member rails | Memories screen (`#memories`) with all the rails | Moments slideshow |
| **C · Featured + one rail** (recommended) | Hero = newest memory with **Play memory** / **See all memories**; Recent; one Memories rail ending in "See all memories" | Memories screen | Memory channel |

**Launch version** (review panel checkbox, `&launch=1`): no AI yet, so People and Events disappear everywhere. Only Places and Looking back remain, which is what can ship first (Ed).

**Memory player** (`#play/<id>`): a title card (~3 s: kind, title, when, how many, who sent them) → photos with a slow pan and zoom, ~3.6 s each → **Up next** card (5 s countdown; OK plays now, Back stops). Top-left chip says the kind plus "Photo 3 of 7", or for a Story "July 2026 · 1 of 1 this month", with one segment per month (May's T3). Left/Right = previous/next photo, OK = pause, Back = back to the card it came from. Controls fade after 4 s. Silent: no music (to discuss).

**Hero preview**: when a memory card is focused, the background starts stepping through its photos after ~1.5 s, so the memory "plays a little" before you open it.

**Still to decide**: which concept (A, B or C) · music · whether a new memory ever auto-plays · People naming flow on mobile · per-upload memories rail inside the moment (built) vs nothing.

## Leaving and coming back
- The connected state is remembered in this browser, so a reload (or TV restart) goes Splash → Home.
- Sign out asks first ("Sign out of Lisa's TV?", Cancel is focused). Signing out returns to Welcome; families stay on their phones and can reconnect with a new code.

## Not in this build
- Figma's multi-family Options A and C (one row per family / every member's row) and its person screen are not built. Don't confuse them with Memories designs A, B, C above. (The review panel used to say "Option 1": that was Figma's name for this Home layout, the immersive list. It now says "design review".)
- Real pairing, real video playback and real uploads. The review panel simulates "Phone scanned the QR" and "New moment from Tom".

## Deviations from Figma (to confirm)
- **Ambient caption chip:** Figma has placeholder test text that overflows the screen. Built with the real caption, max 2 lines.
- **Profile chip → This TV:** Figma has no visible route to This TV. I assumed Up to the chip, then OK.
- **Captions not in Figma** (cake, autumn walk, dinner, newborn) are placeholders.
