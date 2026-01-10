# Glint - Implementation Plan

## 🏗 Step-by-Step Build Sequence (Microtasks)

### 🔹 Phase 1: Foundation (Auth + Input Flow)

- [ ] Set up project scaffolding (Vite + React + Tailwind)
- [ ] Implement email/password auth with Lovable Cloud
- [ ] Add optional Google OAuth
- [ ] Design & build homepage:
  - Centered input
  - “Make it Clear” CTA
  - Placeholder suggestions

### 🔹 Phase 2: Explanation Engine

- [ ] Integrate Claude/GPT API
- [ ] Create 3-tier explanation logic (Simple / Standard / Deep Dive)
- [ ] Build Results Page:
  - Tabs to toggle views
  - Scrollable explanation container
  - “Generate Flashcards” + “Save This” buttons

### 🔹 Phase 3: Flashcard Generator

- [ ] Build flashcard generation function (based on selected explanation)
- [ ] Create flashcard view (front/back, swipe/tap interactions)
- [ ] Add review buttons: “Got it” and “Review Again”
- [ ] Show completion screen: “Nice work!” + Save option

### 🔹 Phase 4: Saved Library

- [ ] Set up backend models for User, SavedConcept, Flashcard
- [ ] Build “Saved Concepts” page:
  - List layout with title, date, flashcard access
  - Search bar

### 🔹 Phase 5: Premium Logic

- [ ] Enforce daily limit (3 explanations/day for free)
- [ ] Build upgrade modal + banner triggers
- [ ] Add premium-only features:
  - PDF export
  - Priority queue handling
  - Spaced repetition reminders (basic logic)

### 🔹 Phase 6: Polish & Performance

- [ ] Optimize mobile layout (thumb zones, tap targets)
- [ ] Add loading animations + skeletons
- [ ] Implement motion-reduced accessibility option
- [ ] Run UX test: 3 students, 30 minutes
- [ ] Fix top 3 points of confusion

---

## ⏱ Timeline with Checkpoints

| Week | Milestone |
|------|-----------|
| 1    | Auth, Homepage, AI setup |
| 2    | Explanations fully working |
| 3    | Flashcard flow complete |
| 4    | Saved Library + daily limit |
| 5    | Premium flow + export |
| 6    | Mobile polish + accessibility |
| 7    | Usability test + refinements |
| 8    | Soft launch (invite-only) |

---

## 👥 Team Roles & Rituals

**Team Size Recommendation**: 2–4 people

### 🧑‍💻 Roles

- **Builder/Engineer** (1–2): React, AI API, backend logic
- **Designer** (1): Visuals + motion polish
- **Founder/PM** (you!): Feature priorities, voice/tone, QA

### 🔁 Rituals

- **Daily check-in** (15 min async or live)
- **Weekly build review** (demo to catch dead ends early)
- **Bi-weekly usability test** (3 users, 30 mins)
- **Feedback doc** updated continuously

---

## 🎯 Optional Integrations & Stretch Goals

- [ ] Export to Quizlet or Anki
- [ ] iOS/Android wrapper (via Capacitor or Flutter)
- [ ] AI “What should I study next?” prompt
- [ ] Spaced repetition dashboard
- [ ] Chrome extension for “explain this page”
