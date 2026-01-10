# Glint - Design Guidelines 

## 🌤 Emotional Tone

**Feels like:**  
*A 12:30 AM lifeline—smart, calm, and always there when you need it.*  
Warm, clear, emotionally stabilizing—Glint should reduce panic, not just deliver answers.

---

## 🔠 Typography System

| Element | Font       | Size       | Weight | Notes                        |
|---------|------------|------------|--------|------------------------------|
| H1      | Inter/SF Pro | 28–32pt   | Semi-bold | Calm headline, not shouty    |
| H2      | Inter/SF Pro | 22–24pt   | Medium   | Section headers              |
| Body    | Inter/SF Pro | 16–18pt   | Regular  | Must be readable on mobile   |
| Caption | Inter/SF Pro | 13–14pt   | Light    | Use for tips or labels       |

- Line height: 1.6–1.8
- Use sentence case, no all-caps
- WCAG AA+ contrast minimum

---

## 🎨 Color System

| Use Case      | Color         | Hex       | Notes                           |
|---------------|---------------|-----------|---------------------------------|
| Primary       | Calm Blue     | `#4A90E2` | Buttons, highlights             |
| Accent        | Light Purple  | `#B39DDB` | Tabs, icons                     |
| Background    | Soft Off-White| `#F8F9FA` | Full-screen background          |
| Text          | Deep Gray     | `#2C3E50` | Primary readable text           |
| Success       | Soft Green    | `#A3D9A5` | Flashcard success messages      |
| Avoid         | Red/Orange    | —         | Too alerting or stressful       |

Ensure 4.5:1 contrast ratio on all text/bg combinations.

---

## 📐 Spacing & Layout

- **8pt grid system**
- **Large input box**: min 60% screen height (mobile)
- **Breakpoints**: Mobile-first; base = 375px width
- **Touchable area**: ≥ 44px tall for all interactive elements
- **White space = emotional calm**

---

## 🎞 Motion & Interaction

- **Progress animation**: 2–3 seconds, skeleton fill → text fade-in
- **Card flip**: Smooth, tactile easing
- **Tap/hover**: Subtle pulse (no bounce)
- **Flashcard win**: Soft confetti, fade to “Nice work!” screen
- **Easing**: `ease-in-out`
- **Duration**: 200–300ms max

---

## 💬 Voice & Tone

**Competent Friend**  
→ Calm, kind, always clear. Not peppy. Not robotic.

**Examples:**
- “Paste anything confusing. I’ll make it clear.”
- “Still fuzzy? Try the simpler version.”
- “Nice work! You’ve mastered this concept.”
- “You’re on a roll 💪”

Avoid filler, cheerleading, or corporate lingo.

---

## ♿ Accessibility

- Tap targets: ≥ 44x44px
- ARIA labels for all toggles and tabs
- Skip-to-content + keyboard nav
- Motion-reduced mode for all animations
- Use semantic HTML (headings, lists, landmarks)

---

## ♻️ System Consistency

- Always start from input
- Tabs = mode switch (never dropdowns)
- Flashcards = swipe/tap (never scroll)
- Same padding, font scale, and color rhythm across all screens

---

## 🧠 Emotional Audit Checklist

- Does this screen reduce anxiety or add to it?
- Does the tone feel like a real friend or a bot?
- Are transitions calm and supportive?
- Is white space used generously to create breathing room?
- Would this feel good to use at 12:30 AM?

---

## 🛠 Technical QA Checklist

- ✅ Typography scale fits 8pt rhythm
- ✅ Text/background contrast meets WCAG AA+
- ✅ Every tap has visual feedback
- ✅ Motion = 200–300ms with calm easing
- ✅ Responsive at 375px and up

---

## 🖼 Design Snapshot Output

### 🎨 Color Palette Preview

Primary Blue: #4A90E2
Accent Purple: #B39DDB
Background: #F8F9FA
Text Gray: #2C3E50
Success Green: #A3D9A5


### 🔠 Typographic Scale

| Element  | Size  | Weight | Line Height |
|----------|-------|--------|-------------|
| H1       | 28pt  | 600    | 1.6         |
| H2       | 24pt  | 500    | 1.6         |
| Body     | 16pt  | 400    | 1.6–1.8     |
| Caption  | 13pt  | 300    | 1.5         |

### 📐 Layout System Summary

- 8pt spacing grid
- Mobile-first
- Touch-safe zones (≥ 44px)
- Skeletons + fade-ins for async clarity
- Tabs for level-switching
- Card-based flash review

---

## ✅ Design Integrity Review

Glint’s visual identity mirrors its emotional intent. The typography is friendly but focused, color palette calm but confident, and microinteractions reassuring without distraction. If there’s one area to tighten: ensure motion is optional and never flashy. For users studying under stress, emotional safety is UX.
