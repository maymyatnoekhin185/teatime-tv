# TeaTime TV — UX spec

Source: Figma `Uk1zH52TS6WFucHkYVFKJY`, section `13283:30526` "TV UI Final" (Option 1 · Immersive list, v2 Moments cards, 16 Oct).
Built at the design's full frame size, **1920 × 1080** (Android TV 960 × 540 dp at 2×), scaled to fit the browser window.

## Who and where
- **The viewer** is often a grandparent (e.g. Lisa) sitting across the room with a remote: D-pad, OK, Back. No keyboard, no touch, sometimes poor eyesight. The TV may be left on for hours.
- **The family** set the TV up from their phones (mobile repo). Nothing is typed on the TV except, at most, a 6-digit family PIN.
- **Care home staff** set up room TVs from the TeaTime admin website.

## Layout rules (from Figma)
- 96 px side / 56 px top-bottom safe margins; 12-column grid.
- Focus = scale ~1.05 + white outline + pink glow. Exactly one thing is focused at a time, always visible.
- No navigation bar. **Back on the remote always goes back** one step.
- Surfaces are deep plum (`#1a1226`) with a soft purple/coral glow, never black.

## Remote mapping (prototype)
| Remote | Keyboard | Mouse |
|---|---|---|
| D-pad | Arrow keys | Hover moves focus |
| OK | Enter or Space | Click |
| Back | Esc or Backspace (on the PIN screen Backspace deletes a digit first) | — |
| Number keys | 0–9 (PIN screen only) | — |

## Screen map
| Route | Screen (Figma) | Behaviour |
|---|---|---|
| `#splash` | 1 Splash | Logo draws in, name fades up, ~2 s → Home if this TV is connected, otherwise Welcome. |
| `#welcome` | 2 Not connected | Get started → Pairing code. Back does nothing (first screen). |
| `#pair` | 3 Pairing code | 4-digit code for this TV only, refreshes every 10 min (new code appears in place, no flash). Other ways to connect → Family PIN. When the phone enters the code → "Connected" toast → Home. |
| `#pin` | 4 Family PIN | 6 boxes in two groups of three (shared contract with mobile). On-screen keypad, focus starts on 5. Submit or ✓ at 6 digits. Right PIN (`482 917`) → Home. Wrong PIN → boxes turn red with a message, cleared on the next digit. Fewer than 6 → "Enter all 6 digits". Back → Pairing code. Scan a QR code instead → QR. |
| `#qr` | 4q Scan a QR code | Every family on that phone joins at once. Back → Pairing code · Use a family PIN instead → PIN. |
| `#community` | 10 Community | Care community room TV: 4-digit code for the admin website. Other ways to connect → Pairing code. |
| `#home` | 5 / 5b / 5c-Cp / 7 Home | Immersive list (below). |
| `#viewer` | 6 / 6p / 6v / 6f Moment viewer | Plays a moment and then the rest of its row (below). |
| `#ambient` | 8 Ambient | After 20 s idle on Home. Slideshow with clock and caption. Any key or click wakes it back to Home, on the same card, without acting on that key. |
| `#thistv` | 9 This TV | Families on this TV + Sign out. Reached by Up from the top row of Home onto the profile chip, then OK. |
| `#family` | 9a A family opened | Members (admin has the crown). Back → This TV. |

## Home — immersive list
- Rows: **Recent from everyone**, then one row per member (Sarah's, Ed's, May's, Tom's moments). Rows bleed off the right edge to show they scroll.
- The focused card's photo becomes the background, with the uploader, family · count · date, and the caption as a quote. Portrait photos use the "hero treatment" (photo framed on the face).
- Left/Right moves along a row; the row scrolls only when the focused card would leave the safe area. Up/Down changes row; each row remembers its own position. Rows above the focused row fade out under the hero.
- OK opens the viewer at that card. Up from the top row → profile chip (time · TV name) → OK opens This TV.
- New moments wear a pink **New** pill until watched.

## Viewer
- Landscape photo: full bleed with scrims. Portrait photo: blurred backdrop, photo on the right, text on the left. Video: poster, time and playhead.
- Photos advance every 6 s through the moment's photos, then on to the next card in the row; after the last card it returns to Home on that card.
- Left/Right = previous/next photo at any time. OK = pause/play (video shows the big play ring for 1 s). Up/Down just shows the controls.
- Controls hide after 4 s while playing (6f: only the thin progress line stays). Paused keeps them visible.
- Back → Home, focused on the card that was playing.

## New moment arriving (7 + notification K1–K4)
- **On Home, idle:** toast grows in top-right ("New from Tom · Plays in 5 s · press Back to stay here"), countdown drains over 5 s, then the moment plays. OK plays it now. Back dismisses it and stays.
- **On Home, browsing:** any arrow key cancels the countdown (the toast fades). We never pull someone away mid-browse. The moment is first in Recent with a New pill.
- **In the viewer, ambient or setup screens:** no toast (no focus-stealing). The moment joins Recent with a New pill.

## Leaving and coming back
- The connected state is remembered in this browser, so a reload (or TV restart) goes Splash → Home.
- Sign out asks first ("Sign out of Lisa's TV?", Cancel is focused). Signing out returns to Welcome; families stay on their phones and can reconnect with a new code.

## Not in this build
- Options A and C (multi-family Home layouts) and the person screen are alternatives in Figma; not built yet.
- Real pairing, real video playback and real uploads. The review panel simulates "Phone entered the code" and "New moment from Tom".

## Deviations from Figma (to confirm)
- **PIN boxes are grouped 3 + 3** to match the mobile app's family PIN (Figma TV frame shows 6 even boxes).
- **Ambient caption chip:** Figma has placeholder test text that overflows the screen. Built with the real caption, max 2 lines.
- **Profile chip → This TV:** Figma has no visible route to This TV. I assumed Up to the chip, then OK.
- **Captions not in Figma** (cake, autumn walk, dinner, newborn) are placeholders.
