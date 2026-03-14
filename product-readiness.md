# Prakken - Production Readiness Checklist

**Created:** 2026-03-14  
**Target:** Production Release v1.0.0  
**Last Updated:** 2026-03-14

---

## Status Legend

- [ ] Not Started
- [x] Completed
- [~] In Progress
- [!] Blocked

---

## 🔴 CRITICAL (Must Fix Before Production)

### 1. Remove Debug Console Logs

- [x] Remove `console.log` from `src/stores/stats.ts:24`
- **Urgency:** HIGH ✅
- **Impact:** Exposes internal state in production
- **File:** `frontend/src/stores/stats.ts`

### 2. Update HTML Meta Tags

- [x] Change title from "Vite App" to "Prakken"
- [x] Add description meta tag
- [x] Add Open Graph meta tags
- [x] Add theme-color meta tag
- **Urgency:** HIGH ✅
- **Impact:** SEO, social sharing, branding
- **File:** `frontend/index.html`

### 3. Add Error Monitoring

- [ ] Integrate Sentry or similar error tracking
- [ ] Configure DSN via environment variable
- [ ] Add user context (anonymous)
- **Urgency:** HIGH
- **Impact:** Production debugging, user experience tracking

---

## 🟡 HIGH PRIORITY

### 4. Security Headers

- [x] Add Content-Security-Policy meta tag
- [x] Add X-Frame-Options
- [x] Add X-Content-Type-Options
- [x] Add Referrer-Policy
- **Urgency:** MEDIUM-HIGH ✅
- **Impact:** XSS protection, clickjacking prevention
- **File:** `frontend/index.html` or nginx config

### 5. Accessibility - ARIA Labels

- [x] Add aria-labels to icon-only buttons
- [x] Add aria-expanded and aria-controls to collapsible sections
- [x] Add aria-hidden to decorative icons
- [ ] Test with screen reader
- **Urgency:** MEDIUM-HIGH ✅ (partially)
- **Impact:** Accessibility compliance, inclusive design

### 6. Form Validation Feedback

- [x] Add visible error messages for name input
- [x] Add character limit indicator
- [ ] Add success states
- **Urgency:** MEDIUM ✅
- **Impact:** User experience, form completion rates
- **File:** `frontend/src/components/character-creation/Step7NameAndDetails.vue`

### 7. Environment Variables in Deploy Script

- [x] Move VPS_USER to environment variable
- [x] Move VPS_HOST to environment variable
- [x] Add .env.example file
- **Urgency:** MEDIUM ✅
- **Impact:** Security, deployment flexibility
- **File:** `deploy.sh`

---

## 🟢 MEDIUM PRIORITY

### 8. Loading States

- [ ] Add skeleton loaders for character list
- [ ] Add loading spinner for calculations
- [ ] Add transition animations
- **Urgency:** MEDIUM
- **Impact:** Perceived performance, UX

### 9. Navigation Confirmation

- [ ] Warn before leaving wizard mid-progress
- [ ] Add beforeunload handler for unsaved changes
- **Urgency:** MEDIUM
- **Impact:** Data loss prevention

### 10. Font Loading Optimization

- [x] Add `font-display: swap` to Google Fonts
- [x] Preconnect to font origins
- [x] Add font preloading
- **Urgency:** LOW-MEDIUM ✅
- **Impact:** Core Web Vitals, FCP

### 11. CSS Bundle Optimization

- [ ] Import only used Bulma components
- [ ] Remove unused CSS
- [ ] Consider Tailwind or utility-first approach
- **Urgency:** LOW-MEDIUM
- **Impact:** Bundle size, load time

---

## 🔵 LOW PRIORITY (Nice to Have)

### 12. PWA Support

- [ ] Create manifest.json
- [ ] Add service worker
- [ ] Add offline fallback page
- [ ] Cache character data
- **Urgency:** LOW
- **Impact:** Offline support, installability

### 13. Empty State Illustrations

- [ ] Add SVG illustrations for empty states
- [ ] Add helpful CTAs in empty states
- **Urgency:** LOW
- **Impact:** Visual appeal, user guidance

### 14. Color Contrast Verification

- [ ] Verify gold text on dark background (WCAG AA)
- [ ] Test with contrast checker tools
- [ ] Adjust colors if needed
- **Urgency:** LOW
- **Impact:** Accessibility compliance

### 15. Focus Indicators

- [ ] Ensure visible focus rings on all interactive elements
- [ ] Test keyboard navigation
- [ ] Add focus-visible styles
- **Urgency:** LOW
- **Impact:** Keyboard accessibility

### 16. Code Cleanup

- [ ] Remove or implement `counter.ts` store
- [ ] Document `any` types in storage.ts migration code
- [ ] Add JSDoc comments for public APIs
- **Urgency:** LOW
- **Impact:** Code maintainability

---

## ✅ COMPLETED ITEMS

- [x] Mobile responsiveness fixes (all breakpoints)
- [x] Touch-friendly button sizes (44px minimum)
- [x] Step indicator distribution fix
- [x] Step indicator glow overflow fix
- [x] "Laske aliominaisuudet" button sizing
- [x] TypeScript type checking (0 errors)
- [x] ESLint passing (0 errors)
- [x] Unit tests passing (84/84 tests)
- [x] Build successful (~900ms)
- [x] Backwards compatibility for storage migrations
- [x] Removed console.log from stats.ts
- [x] Updated index.html with proper title and meta tags
- [x] Added security headers (CSP, X-Frame-Options, etc.)
- [x] Added ARIA labels to icon buttons and section toggles
- [x] Added form validation feedback for name input
- [x] Updated deploy.sh with environment variables
- [x] Created .env.example for deployment configuration
- [x] Added font-display: swap and preload for fonts

---

## 📊 METRICS

| Metric                    | Current   | Target | Status |
| ------------------------- | --------- | ------ | ------ |
| TypeScript Errors         | 0         | 0      | ✅     |
| ESLint Errors             | 0         | 0      | ✅     |
| Unit Tests                | 84 passed | 80+    | ✅     |
| Build Time                | ~900ms    | <2s    | ✅     |
| Bundle Size (gzipped)     | ~180KB    | <250KB | ✅     |
| Mobile Responsive         | Fixed     | Fixed  | ✅     |
| Lighthouse Performance    | TBD       | 90+    | ⏳     |
| Lighthouse Accessibility  | TBD       | 90+    | ⏳     |
| Lighthouse Best Practices | TBD       | 90+    | ⏳     |
| Lighthouse SEO            | TBD       | 90+    | ⏳     |

---

## 🚀 PRE-LAUNCH CHECKLIST

### Final Verification

- [x] Run `npm run type-check` - Pass
- [x] Run `npm run lint` - Pass
- [x] Run `npm run test:unit -- --run` - Pass
- [x] Run `npm run build` - Success
- [x] Test on mobile devices (iOS Safari, Android Chrome)
- [x] Test on desktop browsers (Chrome, Firefox, Safari, Edge)
- [x] Verify localStorage persistence works
- [x] Test character creation flow end-to-end
- [x] Test character deletion with confirmation
- [x] Verify responsive design at all breakpoints

### Deployment

- [ ] Update version in package.json to 1.0.0
- [ ] Create git tag for release
- [ ] Run deploy.sh successfully
- [ ] Verify HTTPS working on production
- [ ] Test production deployment thoroughly
- [ ] Monitor error logs post-deployment

---

## 📝 NOTES

### Known Limitations

1. **No Backend API** - Currently uses localStorage only
2. **No User Authentication** - Single-user, local storage
3. **No Data Export/Import** - Characters stored locally only
4. **No Analytics** - No usage tracking implemented

### Future Enhancements (Post-v1.0)

- Backend API integration (Go + PostgreSQL)
- User authentication and multi-user support
- Character export/import (JSON, PDF)
- Share characters via link
- Character sheet printing optimization
- Dark/Light theme toggle
- Multiple language support

---

## 📞 CONTACT

For questions about this checklist, refer to:

- AGENTS.md - Development guidelines
- DOCUMENTATION.md - Project documentation
- DESIGN.md - Design decisions
