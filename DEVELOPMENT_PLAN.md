# Qalam Development Plan

**Version:** 2.0
**Updated:** December 2025
**Purpose:** Simplified development roadmap focused on core learning experience

---

## Architecture Overview

### Design Philosophy

Qalam is a **stateless knowledge application** for learning Quran translation. Unlike traditional apps:

- **No user accounts** - No login, no registration, no passwords
- **No database** - All data served from static JSON files
- **No server-side state** - Each session is independent
- **Local preferences only** - Optional localStorage for UX convenience

### Why This Approach?

1. **Spiritual focus** - Muslims don't need gamified tracking; the Quran is its own reward
2. **Zero security burden** - No user data to protect, no compliance concerns
3. **Maximum simplicity** - Fewer moving parts = fewer bugs, easier maintenance
4. **Instant access** - No friction to start learning

### Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 16 (App Router) | React with server components |
| Styling | Tailwind CSS | Utility-first CSS |
| Data | Static JSON files | Quran verses + pre-computed analysis |
| LLM | Ollama (local) | Real-time translation evaluation |
| Persistence | localStorage (optional) | User preferences, session state |

### Data Flow

```
User visits → Browse Surahs → Select Verse → Practice Translation
                                                    ↓
                                            Submit Answer
                                                    ↓
                                    LLM Evaluates (stateless)
                                                    ↓
                                    Display Feedback + Analysis
                                                    ↓
                                        Next Verse / Try Again
```

---

## Enhanced Practice UX

### Core Principles

1. **Immediate value** - User can start practicing within seconds of landing
2. **Encouraging feedback** - Always positive, focus on progress not perfection
3. **Deep learning** - Word-by-word analysis reveals linguistic beauty
4. **Flow state** - Smooth transitions keep user engaged

### Practice Flow Features

#### Before Submission
- Large, beautiful Arabic text display with proper typography
- Optional hint system (reveal word-by-word meanings)
- Comfortable textarea with placeholder guidance
- Keyboard shortcut (Cmd/Ctrl+Enter) to submit

#### After Submission
- Animated score reveal with encouraging message
- Side-by-side comparison (user's answer vs reference)
- Color-coded feedback (green=correct, amber=partial, tips=blue)
- Word-by-word analysis always available
- Clear next actions: Try Again, Next Verse, View Analysis

#### Session Engagement (No Account Needed)
- Session streak counter (verses practiced this session)
- "Quick Practice" - random verse from favorite surahs
- Difficulty indicator per verse (based on length/complexity)
- Progress within current surah (e.g., "Verse 3 of 7")

#### Visual Polish
- Celebratory animation for scores 90%+
- Subtle transitions between states
- Islamic geometric patterns as subtle backgrounds
- Proper spacing and typography for readability

---

## Project Structure

```
qalam/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing/Home page
│   │   ├── browse/
│   │   │   ├── page.tsx            # Surah list
│   │   │   └── surah/[id]/page.tsx # Surah detail with verses
│   │   ├── practice/
│   │   │   └── page.tsx            # Core practice interface
│   │   └── api/
│   │       └── evaluate/route.ts   # LLM evaluation endpoint
│   │
│   ├── components/
│   │   ├── ui/                     # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── Navbar.tsx              # Simple navigation
│   │   ├── VerseDisplay.tsx        # Arabic text display
│   │   ├── PracticeForm.tsx        # Translation input
│   │   ├── FeedbackCard.tsx        # Evaluation results
│   │   ├── AnalysisView.tsx        # Word-by-word breakdown
│   │   └── ScoreCelebration.tsx    # Success animation
│   │
│   ├── lib/
│   │   ├── utils.ts                # Utility functions
│   │   ├── data.ts                 # JSON data loading
│   │   ├── llm.ts                  # LLM API calls
│   │   └── localStorage.ts         # Optional persistence
│   │
│   └── types/
│       └── index.ts                # TypeScript definitions
│
├── data/
│   ├── surahs/
│   │   ├── index.json              # Surah metadata (all 114)
│   │   └── 001.json - 114.json     # Individual surah data
│   └── analysis/
│       └── 001.json - 114.json     # Pre-computed verse analysis
│
├── scripts/
│   ├── fetch-quran-data.ts         # Download Quran data
│   └── seed-analysis.ts            # Generate analysis via LLM
│
└── public/
    └── fonts/                      # Amiri Arabic font (if self-hosted)
```

---

## Development Phases

### Phase 1: Project Foundation

**Deliverable:** Running Next.js app with styling and component library

**Branch:** `feature/phase-1-foundation`

#### Step 1.1: Project Setup
- [x] Create Next.js 16 project with TypeScript and App Router
- [x] Configure Tailwind CSS with Islamic theme (teal/green palette)
- [x] Set up path aliases (@/ prefix)
- [x] Add Arabic font (Amiri) via Google Fonts
- [x] Create base layout with proper HTML structure

#### Step 1.2: Base UI Components
- [x] Button (primary, secondary, outline, ghost variants)
- [x] Card (with header, content, footer)
- [x] Input and Textarea (with labels, errors)
- [x] Alert (info, success, warning, error)
- [x] Spinner (loading states)

#### Step 1.3: TypeScript Types
- [x] Surah and Verse types
- [x] WordAnalysis and VerseAnalysis types
- [x] API response types
- [x] Form state types

---

### Phase 2: Data Acquisition

**Deliverable:** Complete Quran data and verse analysis in /data/

**Branch:** `feature/phase-2-data`

#### Step 2.1: Quran Data Fetch
- [ ] Create `scripts/fetch-quran-data.ts`
- [ ] Fetch from quran-json repository
- [ ] Transform to required format
- [ ] Save surah index and individual files
- [ ] Validate verse counts (6,236 total)

#### Step 2.2: Data Loading Utilities
- [ ] Create `lib/data.ts` with:
  - `getSurahIndex()` - Load surah list
  - `getSurah(id)` - Load single surah
  - `getVerseAnalysis(surahId, verseNum)` - Load analysis
- [ ] Add caching for performance
- [ ] Handle missing file errors gracefully

#### Step 2.3: LLM Integration
- [ ] Create `lib/llm.ts` with Ollama support
- [ ] Build analysis prompt template
- [ ] Build evaluation prompt template
- [ ] Add retry logic with backoff
- [ ] Validate LLM responses

#### Step 2.4: Seed Analysis Script
- [ ] Create `scripts/seed-analysis.ts`
- [ ] Iterate through all verses
- [ ] Generate word-by-word analysis via LLM
- [ ] Save to `/data/analysis/` files
- [ ] Add resume support for long runs

---

### Phase 3: Browse Feature

**Deliverable:** Surah browser with verse selection

**Branch:** `feature/phase-3-browse`

#### Step 3.1: Navigation
- [x] Create simple Navbar component
- [ ] Update for new structure (no auth links)
- [ ] Add: Home, Browse, Practice links
- [ ] Mobile-responsive hamburger menu

#### Step 3.2: Home Page
- [ ] Simplify landing page (no auth CTAs)
- [ ] "Start Practicing" primary action
- [ ] Brief explanation of what Qalam does
- [ ] Featured verse with "Try it now" option

#### Step 3.3: Surah Browser
- [x] Display all 114 surahs in grid
- [x] Search by name, number, or meaning
- [x] Filter by revelation type (Meccan/Medinan)
- [ ] Load data from JSON files (not mock)

#### Step 3.4: Surah Detail
- [x] Display surah header (name, Arabic, verse count)
- [x] List all verses with Arabic text
- [x] "Practice" button for each verse
- [ ] Load data from JSON files (not mock)
- [ ] Show verse difficulty indicator

---

### Phase 4: Core Practice Feature

**Deliverable:** Complete practice workflow with AI feedback

**Branch:** `feature/phase-4-practice`

#### Step 4.1: Practice Page Structure
- [x] Parse verseId from URL (?verseId=1:2)
- [x] Fetch verse data (Arabic + reference translation)
- [x] Display Arabic with VerseDisplay component
- [ ] Load from JSON files (not mock)

#### Step 4.2: Practice Input
- [x] Textarea for user translation
- [ ] Add placeholder with guidance text
- [ ] Keyboard shortcut (Cmd/Ctrl+Enter to submit)
- [ ] Auto-focus on page load
- [ ] Character count (optional)

#### Step 4.3: Hint System
- [ ] "Show Hint" button (optional helper)
- [ ] Progressive reveal: first word → more words
- [ ] Hint usage indicator (how many hints used)
- [ ] Hints affect score (optional penalty)

#### Step 4.4: Evaluation API
- [ ] Create `app/api/evaluate/route.ts`
- [ ] Load verse data and pre-computed analysis
- [ ] Call LLM with evaluation prompt
- [ ] Parse and validate response
- [ ] Return structured feedback
- [ ] Handle LLM errors gracefully

#### Step 4.5: Feedback Display
- [x] Show score with encouraging message
- [x] Display what user got correct (green)
- [x] Display what was missed (amber)
- [x] Show suggestions for improvement
- [ ] Add celebratory animation for 90%+ scores
- [ ] Side-by-side comparison view

#### Step 4.6: Word-by-Word Analysis
- [x] Create AnalysisView component
- [x] Table: Arabic | Transliteration | Meaning | Root | Grammar
- [x] Proper RTL alignment for Arabic column
- [ ] Highlight words user got correct vs missed

#### Step 4.7: Practice Navigation
- [x] "Try Again" - reset to input state
- [x] "Next Verse" - go to next verse in surah
- [x] "View Analysis" - show word breakdown
- [ ] "Random Verse" - practice random verse
- [ ] Breadcrumb: Surah > Verse
- [ ] Progress indicator: "Verse 3 of 7"

---

### Phase 5: Polish & UX

**Deliverable:** Production-quality user experience

**Branch:** `feature/phase-5-polish`

#### Step 5.1: Loading States
- [x] Skeleton components for cards and lists
- [ ] "Evaluating your answer..." with spinner
- [ ] Smooth transitions between states

#### Step 5.2: Session Features (localStorage)
- [ ] Create `lib/localStorage.ts`
- [ ] Remember last visited verse
- [ ] Session practice counter
- [ ] User preferences (font size, hints on/off)
- [ ] Recently practiced verses (last 10)

#### Step 5.3: Mobile Responsiveness
- [ ] Audit all pages on mobile (375px)
- [ ] Ensure Arabic text readable
- [ ] 48px minimum tap targets
- [ ] Test textarea with mobile keyboard

#### Step 5.4: Accessibility
- [ ] Proper heading hierarchy
- [ ] ARIA labels on interactive elements
- [ ] lang="ar" on Arabic text
- [ ] Keyboard navigation
- [ ] Color contrast compliance

#### Step 5.5: Visual Polish
- [x] Islamic color palette (teal/green)
- [x] Card shadows and depth
- [x] Consistent 8px spacing grid
- [ ] Smooth animations/transitions
- [ ] Success celebration animation

---

### Phase 6: Testing & Deployment

**Deliverable:** Deployed, tested application

**Branch:** `feature/phase-6-deploy`

#### Step 6.1: Testing
- [ ] Test data loading utilities
- [ ] Test LLM response validation
- [ ] Test practice flow end-to-end
- [ ] Mobile device testing

#### Step 6.2: Production Prep
- [ ] Run production build
- [ ] Verify all JSON data committed
- [ ] Configure environment variables
- [ ] Set up error monitoring (optional)

#### Step 6.3: Deployment
- [ ] Deploy to Vercel
- [ ] Configure production LLM endpoint
- [ ] Test production functionality
- [ ] Set up custom domain (optional)

---

## Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 1 | Foundation | Next.js app with UI components |
| 2 | Data | Quran data + verse analysis |
| 3 | Browse | Surah browser and verse selection |
| 4 | Practice | Core learning interface with AI |
| 5 | Polish | UX, animations, localStorage |
| 6 | Deploy | Live production app |

**Total Phases:** 6 (reduced from 11)
**Removed:** Authentication, Database, User Management, Security hardening (for user data)

---

## What's NOT Included (By Design)

| Feature | Reason Not Included |
|---------|---------------------|
| User accounts | No benefit for spiritual learning |
| Progress tracking (server) | Adds complexity without value |
| Database | Not needed for stateless app |
| Password management | No users = no passwords |
| Rate limiting (for auth) | No auth endpoints to protect |
| User settings (server) | localStorage is sufficient |

---

*This simplified plan focuses on delivering the core value: helping Muslims understand Quran verses through active translation practice with AI feedback.*
