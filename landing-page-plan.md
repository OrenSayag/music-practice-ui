# Landing Page Plan - Music Practice App

## Header Bar (sticky top)

**Layout:** Horizontal bar, sticky top, dark background, full width

| Left | Right |
|------|-------|
| App logo/name ("Music Practice") | Language selector (EN / HE toggle) + "Login" button |

### Language Selector
- Compact toggle or dropdown — two options: English, Hebrew
- Extract from existing settings page implementation (`i18n.changeLanguage`)
- Switching language updates all landing page text + flips to RTL for Hebrew
- Persists choice to `localStorage` key `music-practice-language`
- Create a reusable `LanguageSelector` component (can later be used in app sidebar/settings too)

### Login Button
- Styled as primary/outline button
- Links to `/login` route
- Text is translatable: `t('landing.login')` / `t('landing.signIn')`

### Implementation
- New component: `src/components/landing-header.tsx`
- Uses existing shadcn `Button` component
- Responsive: on mobile, logo + language + login still fit in one row (compact layout)
- No hamburger menu needed — only two actions

---

## Hero Section

**Headline:** "Structure Your Practice. Track Your Progress."
**Subheadline:** A focused practice companion for disciplined musicians — plan sessions, record yourself, and see real progress over time.

**CTA:** "Start Practicing Free" (links to guest mode) | "Sign In" (email auth)

**Visual:** Dark-themed screenshot/mockup of the practice session view with timer, plan, and metronome visible.

---

## Problem Section

**Headline:** "Practice Without Direction Wastes Time"

Three pain points (icon + short text):
1. **No structure** — Jumping between pieces without a plan leads to scattered sessions
2. **No tracking** — Without logging, it's impossible to see what's working
3. **No accountability** — Easy to skip tough exercises when no one's watching the clock

---

## Features Section

**Headline:** "Everything You Need for Focused Practice"

### Feature Cards

1. **Structured Plans**
   - Create practice plans with sections (technique, repertoire, sight-reading)
   - Timed items with target durations
   - Drag-and-drop reordering
   - Save as reusable preset templates

2. **Built-in Timer & Metronome**
   - Session timer with per-item countdowns
   - Adjustable BPM (40-208) with beat accents
   - Stay on tempo and on schedule

3. **AI Practice Assistant**
   - Chat with AI to build or refine your practice plan
   - Get suggestions based on your goals
   - Powered by Claude & GPT

4. **Audio Recording**
   - Record yourself during practice
   - Recordings auto-tagged to session & item
   - Star your best takes for easy review

5. **Progress Dashboard**
   - Weekly activity heatmap
   - Week-over-week stats comparison
   - Session history with tags and notes

6. **Session Tags & Notes**
   - Tag sessions (technique focus, over-time, early-stop, etc.)
   - Add free-text notes and observations
   - Review patterns in your practice habits

---

## How It Works Section

**Headline:** "Three Steps to Better Practice"

1. **Plan** — Build a structured practice session (or let AI help)
2. **Practice** — Follow your plan with timers, metronome, and recording
3. **Review** — Check your dashboard, listen to recordings, track growth

---

## Screenshot Showcase

3-4 dark-themed screenshots:
1. **Dashboard** — Heatmap + weekly stats
2. **Practice Session** — Active plan with timer running
3. **AI Chat** — Plan editing conversation
4. **Recordings** — Recording browser with starred items

---

## Social Proof / Quote Section

*Placeholder for future testimonials or a motivational music quote.*

Example: _"The only way to do great work is to love what you do — and practice it deliberately."_

---

## Pricing / Access Section

**Headline:** "Free to Use. No Credit Card."

- Guest mode: Try instantly, data stored locally
- Email sign-in: Cloud sync, recordings stored in S3
- All features included — no paywalls

---

## Footer

- App name + tagline
- Links: Login | GitHub (if open source) | Contact
- "Built for musicians who take practice seriously."

---

## Technical Implementation Notes

### Approach Options

**Option A — Static route in existing app**
- Add `/landing` route in React Router
- Redirect unauthenticated users to it
- Shares the same build/deploy pipeline
- Uses existing Tailwind + shadcn components

**Option B — Separate static page**
- Standalone HTML/CSS or simple Vite page
- Deployed separately (e.g., Vercel, Netlify)
- Lighter, faster load — no React bundle
- Better SEO (server-rendered or static)

### Recommended: Option A (static route)
Keeps everything in one codebase. Can always extract later if SEO becomes a priority.

### Design Direction
- **Dark theme** — matches the app aesthetic (monospace, dev-inspired)
- **Minimal animations** — subtle scroll reveals, nothing flashy
- **Mobile-first** — responsive layout, works on all screen sizes
- **Typography** — monospace headings, clean sans-serif body (matches existing app)

### Key Assets Needed
- [ ] App screenshots (dashboard, practice, chat, recordings)
- [ ] Icon set for feature cards (can use Lucide, already in the project)
- [ ] Hero image or illustration (optional — screenshots may suffice)
