# PWA Testing & Optimization Checklist

## PWA-5: Testing & Lighthouse Audit

### Manual Testing

#### 1. Service Worker Registration
- [ ] SW registers on page load (check console: `[PWA] Service Worker registered`)
- [ ] SW activates correctly
- [ ] SW updates and reloads on new version
- [ ] No SW errors in DevTools > Application > Service Workers

#### 2. Offline Functionality
- [ ] Homepage loads offline (shows cached version)
- [ ] `/kampanye` loads offline (stale cache)
- [ ] `/kampanye/[slug]` loads offline (if visited before)
- [ ] `/offline` page shows when navigation fails
- [ ] Images load from cache offline
- [ ] Static assets (icons, fonts) available offline

#### 3. Caching Strategies
- [ ] Kampanye pages use stale-while-revalidate (instant load + background update)
- [ ] Static assets cached for 30 days
- [ ] API routes not cached (NetworkOnly)
- [ ] Admin routes excluded from cache
- [ ] Old caches cleaned on SW update

#### 4. Install Prompt
- [ ] Banner appears after 10 seconds on homepage
- [ ] "Install Sekarang" triggers native prompt
- [ ] "Nanti" dismisses for 7 days
- [ ] Banner hidden if already installed
- [ ] Banner hidden if dismissed recently

#### 5. Manifest & Icons
- [ ] Manifest accessible at `/manifest.json`
- [ ] All icon sizes present (72px-512px)
- [ ] Maskable icons for Android
- [ ] Theme color matches brand (#2563eb)
- [ ] App name correct in manifest

#### 6. Cross-Browser Testing
- [ ] Chrome Desktop: SW + Install works
- [ ] Chrome Mobile: Install to homescreen works
- [ ] Edge: Basic PWA support
- [ ] Safari iOS: Add to homescreen (limited PWA)
- [ ] Firefox: SW works (no install prompt)

---

## Lighthouse Audit Results

### Run Audit:
```bash
# Option 1: Chrome DevTools
# 1. Open localhost:3000 in Chrome
# 2. DevTools > Lighthouse tab
# 3. Categories: Performance, PWA, Best Practices
# 4. Device: Mobile
# 5. Click "Analyze page load"

# Option 2: CLI (requires production build)
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

### Target Scores:
- **PWA**: ≥90 (mandatory)
- **Performance**: ≥80
- **Accessibility**: ≥90
- **Best Practices**: ≥90

### Common Issues & Fixes:

#### PWA Score Issues:
- ❌ "Does not register a service worker" → Check SW path
- ❌ "Does not respond with 200 when offline" → Check offline fallback
- ❌ "Is not configured for a custom splash screen" → Add icons/theme to manifest
- ❌ "Does not provide a valid apple-touch-icon" → Already added in layout.tsx
- ❌ "Does not set theme color" → Already set in metadata

#### Performance Issues:
- ⚠️ Large images → Use Next.js Image component (noted in lint warnings)
- ⚠️ Unused JS → Code splitting needed
- ⚠️ Large bundle size → Tree shaking

#### Accessibility Issues:
- ⚠️ Missing alt text → Check campaign images
- ⚠️ Color contrast → Already using proper Tailwind colors

---

## Automated Tests

### Service Worker Tests
```typescript
// tests/pwa/service-worker.test.ts
describe('PWA Service Worker', () => {
  test('SW registers successfully', async () => {
    // Mock navigator.serviceWorker
    // Check registration
  });

  test('SW caches offline page', async () => {
    // Check cache storage
  });

  test('SW serves cached pages offline', async () => {
    // Simulate offline, fetch cached
  });
});
```

### Install Prompt Tests
```typescript
// tests/pwa/install-prompt.test.ts
describe('PWA Install Prompt', () => {
  test('Shows banner after 10 seconds', async () => {
    // Mock beforeinstallprompt event
    // Wait 10s, check banner visible
  });

  test('Dismisses and sets localStorage', () => {
    // Click dismiss, check localStorage
  });

  test('Does not show if already dismissed', () => {
    // Set localStorage, check banner hidden
  });
});
```

---

## Production Testing (Vercel Deploy)

### Pre-Deploy Checklist:
- [ ] All PWA features work on localhost
- [ ] Lighthouse PWA score ≥90 on localhost
- [ ] No console errors
- [ ] Service Worker version bumped (currently v2)

### Post-Deploy Testing:
- [ ] Test on real mobile device (Chrome Android)
- [ ] Install to homescreen works
- [ ] Offline mode works on production
- [ ] Update check works (deploy new version, see auto-reload)
- [ ] Screenshots work in app switcher

### Known Limitations:
- **localhost**: No install prompt (needs HTTPS)
- **iOS Safari**: Limited PWA support (no install banner, basic offline only)
- **Firefox**: No install prompt API support

---

## Issues Found & Fixes

### Issue Log:
| Issue | Severity | Fix | Status |
|-------|----------|-----|--------|
| - | - | - | - |

---

## Sign-off

- [ ] All manual tests pass
- [ ] Lighthouse PWA score ≥90
- [ ] Cross-browser tested (Chrome, Edge, Safari)
- [ ] Production deployed and verified
- [ ] Documentation updated

**Tested by:** _____________  
**Date:** _____________  
**PWA Score:** _____/100
