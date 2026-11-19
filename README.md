# TeaTime TV — design prototype

The **TV side of TeaTime**: the screens a family's TV shows. Moments (photos and videos the family sends from their phones) play on the TV, along with **Memories** that TeaTime makes from them. It's designed for a grandparent sitting across the room with a TV remote.

This is a clickable design prototype, not the production app. It's for the team and client to review the experience.

**Live:** https://maymyatnoekhin185.github.io/teatime-tv/

The mobile app lives in a sister repo, [teatime-onboarding](https://github.com/maymyatnoekhin185/teatime-onboarding) ([live](https://maymyatnoekhin185.github.io/teatime-onboarding/)). The phone and the TV are paired, so the rules they share (connecting a TV, the family PIN, captions, Memories and so on) are kept identical in both repos' `CLAUDE.md`.

## Try it

Open the live link. The **review panel** on the left is a design aid, not part of the TV. It has:

- **This TV:** Lisa's TV at home, or Margaret's TV at a care home.
- **Memories design:** three ways to show Memories on Home, to compare:
  - **A · Rails on Home:** every kind of memory gets its own row on Home.
  - **B · Memories space:** Home stays simple; one Memories card opens a Memories screen.
  - **C · Featured + one rail** (recommended): Home leads with one featured memory and a single Memories row.
- **Launch version:** hides the memories that need AI (People and Events).
- **Links** jump to any screen: set-up, Home, the viewer for every photo and video shape, Memories, ambient mode, This TV.
- **Simulate** what would come from a phone: the QR being scanned, a new moment arriving, a new memory being made.

Use the keyboard like a remote:

| Remote | Keyboard |
|---|---|
| D-pad | Arrow keys (mouse wheel, trackpad and swipe work too) |
| OK | Enter or Space |
| Back | Esc or Backspace |
| Numbers | 0–9 (on the code screen; the right code is **2580**) |

A link can open a particular set-up straight away:

| Add to the link | Opens |
|---|---|
| `?concept=A`, `?concept=B` or `?concept=C` | That Memories design |
| `&launch=1` | The launch version (no People or Events) |
| `&tv=care` | Margaret's care home TV |
| `#viewer/m-mix` (any screen's link from the panel) | That screen |

For example: https://maymyatnoekhin185.github.io/teatime-tv/?concept=C&tv=care#home

## What's in it

- **Connecting a TV:** QR first ("Scan to send photos to this TV"), or **Got a code from family?** with a 4-digit code sent from the phone.
- **Home:** an immersive list of rails. The focused card fills the background, a row map on the right shows where you are, and the profile chip opens This TV.
- **Viewer:** photos and **real videos** in every shape (16:9, 4:3, 3:2, square, 3:4, 9:16, panorama), each shown whole, never cropped. Captions up to 250 characters are shown in full, with time to read them.
- **Memories:** People, Events, Places and "Looking back" (A year ago, Story, Month), plus memory channels that play non-stop.
- **Ambient mode:** after 20 seconds idle on Home.
- **Care community TV:** the family's moments plus posts from the care home.

The full behaviour, every scenario and the decisions behind them are in **[UX.md](UX.md)**.

## Run it locally

No build step and no dependencies, just Node:

```
node dev-server.mjs 5174
```

Then open http://localhost:5174. (Port 5173 is used by the mobile prototype.)

## Files

| File | What it is |
|---|---|
| `index.html` | The page and the review panel |
| `app.js` | Every screen, the remote/focus handling and the sample data |
| `styles.css` | All styles |
| `assets/` | Images, icons and video clips |
| `dev-server.mjs` | A tiny local server (supports video streaming) |
| `UX.md` | The spec: scenarios, screen map, decisions |
| `CLAUDE.md` | Project notes and the shared contract with the mobile repo |

Everything is drawn on a 1920 × 1080 stage (the Figma TV frame) and scaled to fit the window.

Sample photos, people and families are placeholders. The video clips in `assets/clip-*.webm` are 10-second placeholders made from the sample photos; replace them with real videos under the same names.

## Design source

Figma file `Uk1zH52TS6WFucHkYVFKJY`, section "TV UI Final" (`13283:30526`), plus the onboarding flowchart (`13903:5026`).

## Updating the live site

The live site is published with GitHub Pages from the **`tv-design`** branch. Pushing to `tv-design` updates it within a minute or two.
