# TeaTime — TV app (design)

This repo is the **TV** side of TeaTime: the screens shown on the family's TV. Designs will be added here.

## Sister repo: mobile
The mobile app lives in a separate repo at `C:\Users\Htet\TeaTime (May)` (HTML/JS prototype, full flow in its `UX.md`). The TV and the phone are paired, so anything below must stay identical in both.

## Shared contract (keep in sync with the mobile repo)
- **Pairing:** the TV shows a QR; scanning it starts mobile sign-in → "Name your family". The TV Home also shows a small QR used by a second family member to ask to join (mobile screen F1 → admin approves on F3).
- **Family PIN:** 6 digits, shown in two groups of three (e.g. `482 917`). Right PIN joins the family with no approval.
- **TV states:** a TV that is off shows "Off · last seen", not "Waiting".
- **Moments:** the first 3 uploads are free; locked moments start from the 4th, and the paywall on mobile unlocks them so they play on the TV.
- **Copy:** Australian English on every screen.
- **Source of truth for visuals:** Figma file `Uk1zH52TS6WFucHkYVFKJY` (mobile onboarding); TV designs to be shared.

When one of these changes here, change it in the mobile repo too (and the other way round).

## TV design notes
- Designed for a 10-foot view: large type, high contrast, remote/D-pad focus states, no tiny touch targets.
- Keep a `UX.md` here with the scenarios and screen map, as in the mobile repo.
