# Glint - Masterplan

## 🚀 30-Second Elevator Pitch

Glint is an AI-powered study buddy for college students who need to understand tough concepts—fast. Just paste in a topic or paragraph, and Glint gives you three crystal-clear explanations: simple, standard, and deep dive. It’s like having a brilliant friend explain things calmly, right when you’re stressed.

---

## 🧩 Problem & Mission

**Problem:**  
Students—especially those who are neurodivergent, international, or cramming—struggle with dense, jargon-heavy academic content. Traditional tools are slow, cluttered, or patronizing.

**Mission:**  
Make complex topics emotionally and cognitively clear—in under 10 seconds. Reduce anxiety. Increase retention. Spark “aha” moments with empathy.

---

## 🎯 Target Audience

- STEM majors in college
- Neurodivergent learners (ADHD, dyslexia)
- International students (English as second language)
- Crammers the night before an exam

---

## ✨ Core Features

- 📥 **Home**: Paste a topic → “Make it Clear” CTA
- 🧠 **3-Level Explanations**: Simple / Standard / Deep Dive
- 🃏 **Flashcard Generator**: Auto-generates 3–5 concept-check questions
- 💾 **Saved Concepts**: Searchable archive with review options
- 💎 **Premium Tier**:
  - Unlimited explanations
  - Flashcard export (PDF)
  - Spaced repetition reminders
  - Faster results

---

## 🛠 High-Level Tech Stack

- **Frontend**: React (with Vite + TS) + Tailwind + shadcn/ui  
  → fast, scalable, great DX, easy theming for mobile-first UI

- **Backend**: Lovable Cloud  
  → simple, secure storage + fast API routing

- **AI**: Claude or GPT  
  → explanation and flashcard generation

- **Auth**: Email + Google OAuth  
  → quick onboarding, familiar patterns

---

## 🧮 Conceptual Data Model (ERD in words)

- **User**
  - id, email, auth_provider, plan_type
  - has_many → SavedConcept

- **SavedConcept**
  - id, user_id, title, explanation_levels, created_at
  - has_many → Flashcard

- **Flashcard**
  - id, concept_id, front_text, back_text, review_status

- **Plan**
  - Free or Premium → limits daily usage + features

---

## 🖼 UI Design Principles (via Krug’s Laws)

- Don’t make me think → Large, centered input; zero clutter
- Speak like a friend → “Paste anything confusing. I’ll make it clear.”
- One primary action per screen → Single CTA per page (e.g., “Generate Flashcards”)
- White space = calm → Ample padding, 8pt grid
- System coherence → Tabs for clarity levels, swipe cards for review

---

## 🔐 Security & Compliance Notes

- OAuth + salted password auth
- Rate-limiting API endpoints for abuse prevention
- Minimal PII; no academic data stored beyond user prompts
- GDPR-safe user deletion logic
- Option for motion-reduced mode (accessibility)

---

## 🗺 Phased Roadmap

**MVP (Complete):**
- Explanation + flashcards
- Save system
- Free tier enforcement
- Mobile-first layout

**V1**
- Premium tier with export + spaced repetition
- PDF flashcard download
- Priority queue for AI generation
- Empty-state polish + celebrations

**V2**
- Native iOS/Android apps
- Chrome extension
- Weekly pricing option
- Concept progress dashboard

---

## ⚠️ Risks & Mitigations

- **AI Output Confusion** → Limit to 3 tight formats + plain English
- **Mobile Frustration** → Mobile-first design + thumb zone checks
- **Overload in UI** → One action per screen, no menus, minimal nav
- **Free-tier abuse** → Hardcoded limits + upgrade prompts after 3 uses
- **Performance lag** → Optimize API latency, pre-warm AI models

---

## 🌱 Future Expansion Ideas

- Export to Quizlet or Anki
- Quiz mode for self-testing
- Friends leaderboard (optional V3)
- Class-based concept tagging
- AI follow-up: “What should I study next?”
