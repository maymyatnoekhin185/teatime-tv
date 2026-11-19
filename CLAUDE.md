# TeaTime — TV app (design)

This repo is the **TV** side of TeaTime: the screens shown on the family's TV. Designs will be added here.

## Sister repo: mobile
The mobile app lives in a separate repo at `C:\Users\Htet\TeaTime (May)` (HTML/JS prototype, full flow in its `UX.md`). The TV and the phone are paired, so anything below must stay identical in both.

## Shared contract (keep in sync with the mobile repo)
- **Connecting a TV (19 Nov, two ways only):** (1) **QR first.** The TV's first screen is "Scan to send photos to this TV". Its QR has the TV's id in the link; scanning starts mobile sign-in → "Name your family", and the TV pairs itself. (2) **"Got a code from family?"** If nobody is in front of the TV, the phone sends a set-up message with a **4-digit code** for the TV (Figma flow B5 → B6), typed on the TV. There is no TV-made pairing code and no family PIN on the TV any more. The TV Home also shows a small QR used by a second family member to ask to join (mobile screen F1 → admin approves on F3).
- **Family PIN:** 6 digits, shown in two groups of three (e.g. `482 917`), **phone only**: a person joining a family enters it (E2), with no approval. The TV never asks for it.
- **Care community TV:** not a separate kind of TV. A TV connected to a care family (made for a resident on the phone, E6/E7) shows the family's moments plus the care home's posts ("From {community}" rail), titled "{resident}'s TV". It connects the same two ways (QR, or the 4-digit code, which staff can help type). No staff-only TV code.
- **TV states:** a TV that is off shows "Off · last seen", not "Waiting".
- **Moments:** the first 3 uploads are free; locked moments start from the 4th, and the paywall on mobile unlocks them so they play on the TV.
- **Memories:** auto-made clips are called "Memories" in both apps. They're made from all the family's photos, not per upload. Kinds: Person (named faces only), Event, Place, and date-based ones shown under "Looking back" (A year ago, Story, Month). A bulk upload stays one moment. New memories arrive quietly (no pop-up).
- **Captions:** up to 250 characters (set on mobile). The TV always shows the whole caption while a moment plays and in ambient mode (no "See more"); only the Home preview cuts it at 2 lines.
- **Copy:** Australian English on every screen.
- **Source of truth for visuals:** Figma file `Uk1zH52TS6WFucHkYVFKJY` (mobile onboarding); TV designs to be shared.

When one of these changes here, change it in the mobile repo too (and the other way round).

## Prototype
- Plain HTML/CSS/JS, no build: `index.html`, `styles.css`, `app.js`, images in `assets/`. Spec and screen map in `UX.md`.
- Run: `node dev-server.mjs 5174`, then open http://localhost:5174 (port 5173 is the mobile prototype).
- Everything is drawn on a 1920 × 1080 stage (the Figma frame size) and scaled to fit the window. Use design px inside the stage.
- Figma source: section `13283:30526` "TV UI Final".

## Branches and publishing (set up 19 Nov)
- **`tv-design`** is the workspace: make and commit all changes here.
- **`main`** is the approved version the team and client see. GitHub Pages publishes the live site from `main`: https://maymyatnoekhin185.github.io/teatime-tv/
- **Publish** only when May says so: fast-forward `main` to `tv-design` (`git switch main && git merge --ff-only tv-design && git push origin main`, then switch back to `tv-design`). Never commit work directly on `main`.
- The repo is public: don't push anything May wants to keep private.

## TV design notes
- Designed for a 10-foot view: large type, high contrast, remote/D-pad focus states, no tiny touch targets.
- Keep a `UX.md` here with the scenarios and screen map, as in the mobile repo.
