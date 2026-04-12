# UI-REVIEW.md — WellSync AI Frontend

**Audit Date:** 2026-04-12  
**Scope:** Frontend codebase (Next.js 16, Tailwind CSS, Framer Motion)  
**Context:** Voice-first health memory system for families

---

## Overall Score: **2.8/24**

| Pillar | Score | Assessment |
|--------|-------|------------|
| Copywriting | 3/4 | Good — health-focused, multi-language |
| Visuals | 3/4 | Rich icons, good motion |
| Color | 3/4 | Strong semantic palette, dark mode |
| Typography | 2/4 | Inconsistent sizing, accessibility gaps |
| Spacing | 2/4 | Good margins, but over-engineered shadows |
| Experience Design | 3/4 | Mobile-first, loading states, voice UX |

---

## 1. Copywriting — 3/4

### Strengths
- Warm, family-friendly greeting: "Good morning, Family!"
- Clear status labels: "Action Required", "Upcoming Soon", "Completed"
- Multi-language support with localized date formatting
- Health terms explained simply (Health Adherence, Protection Score)

### Issues
| Issue | Severity | Location |
|-------|----------|----------|
| "Health Pass" button says "View All" - ambiguous action | Medium | TimelineFeed.tsx:161 |
| Missing empty states for households/dependents | Medium | FamilyOverview.tsx |
| "Deficient" label may cause anxiety (should be "Needs Focus") | Low | HealthPassCard.tsx:100 |

### Verdict
Good health-focused language with multi-language support. Minor UX improvements needed.

---

## 2. Visuals — 3/4

### Strengths
- Lucide icons consistent and well-sized (size={32}, strokeWidth={3})
- Good icon categorization: Syringe (vaccination), Stethoscope (checkup)
- Voice FAB has premium tier styling with animations
- Health Pass card has mesh gradient backgrounds

### Issues
| Issue | Severity | Location |
|-------|----------|----------|
| ScannerView component not reviewed (potential placeholder) | Medium | ScannerView.tsx |
| ThreeScene component adds load (check if decorative) | Low | ThreeScene.tsx |
| No custom illustrations or photos - relies purely on icons | Low | All components |

### Verdict
Strong icon system and visual hierarchy. Some decorative components need scrutiny.

---

## 3. Color — 3/4

### Strengths
- Semantic color coding: emerald (completed), amber (due), red (overdue), blue (upcoming)
- Proper dark mode palette (slate-800, slate-700)
- Status-based gradients in HealthPassCard
- Blue as primary action color works well for healthcare

### Issues
| Issue | Severity | Location |
|-------|----------|----------|
| Hardcoded `#f3f6fd` background - not in Tailwind default palette | Medium | FamilyOverview.tsx, TimelineFeed.tsx |
| Shadow colors use brand-specific tints (not in theme) | Low | Multiple components |
| Contrast ratio not verified for accessibility (slate-500 on white) | Medium | Multiple components |

### Verdict
Good semantic color usage. Consider adding custom colors to Tailwind config.

---

## 4. Typography — 2/4

### Strengths
- Clear hierarchy: font-black (headings), font-bold (body), font-black text-lg (cards)
- Tracking-tight on headings improves readability
- Uppercase for labels (ACTION REQUIRED, UPCOMING SOON)

### Issues
| Issue | Severity | Location |
|-------|----------|----------|
| Inconsistent heading sizes: text-2xl, text-3xl, text-4xl, text-5xl | Medium | Multiple components |
| Font-weight mix: font-black (too heavy in some places), font-bold | Medium | OnboardingWizard.tsx |
| "Listening Now" - text-[10px] too small for action feedback | Low | VoiceFAB.tsx:433 |
| Body text uses font-bold (should be font-medium for readability) | Medium | Multiple components |

### Verdict
Hierarchy exists but needs consistency. Bold weights for body text hurt readability.

---

## 5. Spacing — 2/4

### Strengths
- Generous padding in cards (p-6, p-8, p-12)
- Consistent gap spacing (gap-5, gap-6, gap-8)
- Good vertical rhythm in sections

### Issues
| Issue | Severity | Location |
|-------|----------|----------|
| Over-engineered shadows with multiple layers | Medium | FamilyOverview.tsx:30, ActivitySummary.tsx:47 |
| Complex shadow syntax hard to maintain | Medium | Multiple components |
| No spacing scale consistency (using arbitrary values) | Medium | globals.css |
| Some cards use min-h-[180px] forcing inconsistent heights | Low | FamilyOverview.tsx:30 |

### Verdict
Good spacing but shadows are over-complicated and not in design tokens.

---

## 6. Experience Design — 3/4

### Strengths
- Mobile-first responsive classes (sm:, md:, lg:)
- Loading states with skeleton UI (animate-pulse)
- Error states handled (isLoading, isError)
- Voice FAB with connection states (isConnecting, isActive, callError)
- Dark mode toggle works

### Issues
| Issue | Severity | Location |
|-------|----------|----------|
| No empty state UI for "No household found" | Medium | dashboard/page.tsx:46 |
| localStorage access in components (should be abstracted) | High | Multiple components |
| No error boundary or fallback UI | Medium | Multiple components |
| Voice FAB error message positioning on mobile | Low | VoiceFAB.tsx:404 |
| No keyboard navigation for wizard options | Medium | OnboardingWizard.tsx |

### Verdict
Strong mobile support and state handling. Error handling and accessibility need work.

---

## Top Fixes

1. **Add empty states** — Dashboard shows error message but no clear CTA
2. **Consolidate typography** — Use consistent heading scale and body font weights
3. **Simplify shadows** — Move complex shadows to Tailwind config
4. **Abstract localStorage** — Create useHousehold() hook
5. **Add focus states** — Keyboard navigation for onboarding wizard

---

## Next Steps

Before proceeding to implementation:
- Add empty state components
- Refactor localStorage to hooks
- Add custom colors to tailwind.config.ts
- Verify contrast ratios (WCAG AA)
- Add keyboard navigation

---

*Audit complete. Score: 2.8/4 average = 16.8/24 overall*