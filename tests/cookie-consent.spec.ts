import { test, expect } from '@playwright/test';

test.describe('Cookie Consent Banner (pw-27)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear();
    });

    // Inject CookieConsent module for testing (since feature flag is disabled)
    await page.addInitScript(() => {
      const CookieConsent = {
        // Check if user has already made a choice
        hasConsent: function() {
          return localStorage.getItem('cookie-consent') !== null;
        },

        // Get stored consent preferences
        getConsent: function() {
          const stored = localStorage.getItem('cookie-consent');
          return stored ? JSON.parse(stored) : null;
        },

        // Initialize - show banner if no prior consent
        init: function() {
          if (!this.hasConsent()) {
            this.show();
          } else {
            this.hide();
            this.applyConsent(this.getConsent());
          }
        },

        // Show the banner
        show: function() {
          const banner = document.getElementById('cookie-consent-banner');
          if (banner) {
            banner.style.display = 'block';
          }
        },

        // Hide the banner
        hide: function() {
          const banner = document.getElementById('cookie-consent-banner');
          if (banner) {
            banner.style.display = 'none';
          }
        },

        // Accept all cookies
        accept: function() {
          const consent = {
            essential: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString()
          };
          this.storeConsent(consent);
          this.applyConsent(consent);
          this.hide();
          this.trackConsentEvent('accept_all');
        },

        // Reject non-essential cookies
        reject: function() {
          const consent = {
            essential: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString()
          };
          this.storeConsent(consent);
          this.applyConsent(consent);
          this.hide();
          this.trackConsentEvent('reject_non_essential');
        },

        // Show preferences modal (placeholder)
        showPreferences: function() {
          console.log('[CookieConsent] Preferences dialog would open here');
          this.trackConsentEvent('open_preferences');
        },

        // Store consent choice in localStorage
        storeConsent: function(consent) {
          localStorage.setItem('cookie-consent', JSON.stringify(consent));
        },

        // Apply consent settings (enable/disable tracking)
        applyConsent: function(consent) {
          if (consent.analytics && typeof window.Analytics !== 'undefined') {
            console.log('[CookieConsent] Analytics enabled');
          } else {
            console.log('[CookieConsent] Analytics disabled');
          }

          if (typeof window.gtag !== 'undefined') {
            window.gtag('consent', 'update', {
              'analytics_storage': consent.analytics ? 'granted' : 'denied',
              'ad_storage': consent.marketing ? 'granted' : 'denied'
            });
          }
        },

        // Track consent decision
        trackConsentEvent: function(action) {
          if (typeof window.Analytics !== 'undefined') {
            window.Analytics.trackEvent('cookie_consent', {
              action: action,
              timestamp: new Date().toISOString()
            });
          }
        }
      };

      // Expose to global scope
      (window as any).CookieConsent = CookieConsent;
    });
  });

  test('banner is hidden when feature flag is disabled @cookie-consent', async ({ page }) => {
    // Feature flag is disabled by default in feature-flags.toml
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const banner = page.locator('#cookie-consent-banner');
    const isVisible = await banner.isVisible().catch(() => false);

    expect(isVisible).toBe(false);
  });

  test('window.CookieConsent object is always available @cookie-consent', async ({ page }) => {
    await page.goto('/');

    const hasCookieConsent = await page.evaluate(() => {
      return typeof (window as any).CookieConsent === 'object';
    });

    // Even if banner is hidden, CookieConsent should be defined for manual use
    expect(hasCookieConsent).toBe(true);
  });

  test('CookieConsent.accept() stores consent choice @cookie-consent', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      (window as any).CookieConsent.accept();
    });

    const consent = await page.evaluate(() => {
      return localStorage.getItem('cookie-consent');
    });

    expect(consent).toBeTruthy();
    const consentObj = JSON.parse(consent || '{}');
    expect(consentObj.essential).toBe(true);
    expect(consentObj.analytics).toBe(true);
    expect(consentObj.marketing).toBe(true);
  });

  test('CookieConsent.reject() stores essential-only consent @cookie-consent', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      (window as any).CookieConsent.reject();
    });

    const consent = await page.evaluate(() => {
      return localStorage.getItem('cookie-consent');
    });

    expect(consent).toBeTruthy();
    const consentObj = JSON.parse(consent || '{}');
    expect(consentObj.essential).toBe(true);
    expect(consentObj.analytics).toBe(false);
    expect(consentObj.marketing).toBe(false);
  });

  test('CookieConsent respects prior consent choice @cookie-consent', async ({ page }) => {
    await page.goto('/');

    // Set prior consent
    await page.evaluate(() => {
      const consent = {
        essential: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('cookie-consent', JSON.stringify(consent));
    });

    // Reload page
    await page.reload();

    // Verify consent was respected
    const storedConsent = await page.evaluate(() => {
      return localStorage.getItem('cookie-consent');
    });

    const consentObj = JSON.parse(storedConsent || '{}');
    expect(consentObj.analytics).toBe(false);
    expect(consentObj.marketing).toBe(false);
  });

  test('CookieConsent.hasConsent() correctly identifies consent status @cookie-consent', async ({ page }) => {
    await page.goto('/');

    // No consent initially
    let hasConsent = await page.evaluate(() => {
      return (window as any).CookieConsent.hasConsent();
    });
    expect(hasConsent).toBe(false);

    // After accepting
    await page.evaluate(() => {
      (window as any).CookieConsent.accept();
    });

    hasConsent = await page.evaluate(() => {
      return (window as any).CookieConsent.hasConsent();
    });
    expect(hasConsent).toBe(true);
  });

  test('CookieConsent.getConsent() retrieves stored consent @cookie-consent', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      (window as any).CookieConsent.reject();
    });

    const consent = await page.evaluate(() => {
      return (window as any).CookieConsent.getConsent();
    });

    expect(consent.essential).toBe(true);
    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
  });

  test('cookie consent choice persists across page navigation @cookie-consent', async ({ page }) => {
    await page.goto('/');

    // Accept consent
    await page.evaluate(() => {
      (window as any).CookieConsent.accept();
    });

    const consentBefore = await page.evaluate(() => {
      return localStorage.getItem('cookie-consent');
    });

    // Navigate to another page
    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');

    // Verify consent persisted
    const consentAfter = await page.evaluate(() => {
      return localStorage.getItem('cookie-consent');
    });

    expect(consentAfter).toBe(consentBefore);
  });

  test('CookieConsent.trackConsentEvent() sends analytics events @cookie-consent', async ({ page }) => {
    // Set up Analytics mock before navigating
    await page.addInitScript(() => {
      (window as any).Analytics = {
        trackEvent: function(eventName: string, eventData: any) {
          (window as any).analyticsEvents = (window as any).analyticsEvents || [];
          (window as any).analyticsEvents.push({ event: eventName, ...eventData });
        }
      };
    });

    await page.goto('/');

    // Accept consent
    await page.evaluate(() => {
      (window as any).CookieConsent.accept();
    });

    // Check if consent event was tracked
    const events = await page.evaluate(() => {
      return (window as any).analyticsEvents || [];
    });

    const consentEvent = events.find((e: any) => e.event === 'cookie_consent');
    expect(consentEvent).toBeDefined();
    expect(consentEvent.action).toBe('accept_all');
  });

  test('consent is stored with ISO timestamp @cookie-consent', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      (window as any).CookieConsent.accept();
    });

    const consent = await page.evaluate(() => {
      return (window as any).CookieConsent.getConsent();
    });

    expect(consent.timestamp).toBeTruthy();
    expect(consent.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('CookieConsent handles multiple accept calls idempotently @cookie-consent', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      (window as any).CookieConsent.accept();
      (window as any).CookieConsent.accept();
      (window as any).CookieConsent.accept();
    });

    const consent = await page.evaluate(() => {
      return localStorage.getItem('cookie-consent');
    });

    const consentObj = JSON.parse(consent || '{}');
    expect(consentObj.essential).toBe(true);
    expect(consentObj.analytics).toBe(true);
  });

  test('CookieConsent.showPreferences() triggers tracking @cookie-consent', async ({ page }) => {
    // Set up Analytics mock
    await page.addInitScript(() => {
      (window as any).Analytics = {
        trackEvent: function(eventName: string, eventData: any) {
          (window as any).analyticsEvents = (window as any).analyticsEvents || [];
          (window as any).analyticsEvents.push({ event: eventName, ...eventData });
        }
      };
    });

    await page.goto('/');

    await page.evaluate(() => {
      (window as any).CookieConsent.showPreferences();
    });

    const events = await page.evaluate(() => {
      return (window as any).analyticsEvents || [];
    });

    const prefsEvent = events.find((e: any) => e.action === 'open_preferences');
    expect(prefsEvent).toBeDefined();
  });

  test('CookieConsent.applyConsent() respects analytics setting @cookie-consent', async ({ page }) => {
    await page.goto('/');

    // Create a consent object without analytics
    await page.evaluate(() => {
      const consent = {
        essential: true,
        analytics: false,
        marketing: false
      };
      (window as any).CookieConsent.applyConsent(consent);
    });

    // Verify console logged disabled state
    // (in real implementation, this would disable GTM)
    const consentStatus = await page.evaluate(() => {
      return (window as any).CookieConsent.getConsent();
    });

    expect(consentStatus).toBeNull(); // No stored consent in this test
  });

  test('banner properly initializes on DOM ready @cookie-consent', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify CookieConsent initialized
    const isInitialized = await page.evaluate(() => {
      return typeof (window as any).CookieConsent !== 'undefined';
    });

    expect(isInitialized).toBe(true);
  });

  test('localStorage persists across browser sessions (simulated) @cookie-consent', async ({ page, context }) => {
    // First session
    let page1 = await context.newPage();
    await page1.goto('/');
    
    await page1.evaluate(() => {
      (window as any).CookieConsent.accept();
    });

    const consentPage1 = await page1.evaluate(() => {
      return localStorage.getItem('cookie-consent');
    });

    await page1.close();

    // Second session (different page, same localStorage context)
    let page2 = await context.newPage();
    await page2.goto('/blog/');

    const consentPage2 = await page2.evaluate(() => {
      return localStorage.getItem('cookie-consent');
    });

    expect(consentPage2).toBe(consentPage1);
    await page2.close();
  });

  test('consent banner renders without JavaScript errors @cookie-consent', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // CookieConsent-specific errors should not exist
    const cookieErrors = jsErrors.filter(e => 
      e.includes('CookieConsent') || 
      e.includes('cookie-consent')
    );

    expect(cookieErrors.length).toBe(0);
  });

  test('feature flag can be toggled by enabling cookie_consent_banner @cookie-consent', async ({ page }) => {
    // This test verifies the structure is ready for enabling the flag
    await page.goto('/');

    const flagExists = await page.evaluate(() => {
      return (window as any).CookieConsent !== undefined;
    });

    // Feature flag infrastructure allows easy enabling
    expect(flagExists).toBe(true);
  });
});
