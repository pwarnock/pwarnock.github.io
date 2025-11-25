/**
 * Analytics Tracking Module
 * Sends custom events to Google Tag Manager (GTM)
 * 
 * Usage:
 *   window.Analytics.trackEvent('tool_click', { tool_name: 'My Tool' })
 */

(function() {
  'use strict';

  // Only initialize if GTM container ID is configured
  if (!window.dataLayer) {
    console.warn('[Analytics] GTM dataLayer not found - analytics disabled');
    return;
  }

  const Analytics = {
    /**
     * Send a custom event to GTM
     * @param {string} eventName - Name of the event
     * @param {Object} eventData - Event properties (optional)
     */
    trackEvent: function(eventName, eventData = {}) {
      if (typeof eventName !== 'string' || !eventName) {
        console.error('[Analytics] Event name must be a non-empty string');
        return;
      }

      const eventPayload = {
        event: eventName,
        ...eventData,
        timestamp: new Date().toISOString(),
        page_path: window.location.pathname,
        page_title: document.title
      };

      console.debug('[Analytics] Tracking event:', eventPayload);
      window.dataLayer?.push(eventPayload);
    },

    /**
     * Track section view (tool, portfolio, blog)
     */
    trackSectionView: function(section) {
      this.trackEvent(`${section}_view`, {
        section: section
      });
    },

    /**
     * Track external link click with context
     */
    trackExternalClick: function(url, context = {}) {
      this.trackEvent('external_link_click', {
        url: url,
        ...context
      });
    },

    /**
     * Track CTA click
     */
    trackCTAClick: function(ctaText, ctaLocation) {
      this.trackEvent('cta_click', {
        cta_text: ctaText,
        cta_location: ctaLocation
      });
    },

    /**
     * Track newsletter signup
     */
    trackNewsletterSignup: function() {
      this.trackEvent('newsletter_signup');
    },

    /**
     * Track social share
     */
    trackSocialShare: function(network) {
      this.trackEvent('social_share', {
        network: network
      });
    }
  };

  // Expose to global scope
  window.Analytics = Analytics;

  // Auto-track page views
  window.addEventListener('load', function() {
    const section = document.body.getAttribute('data-section');
    if (section) {
      Analytics.trackSectionView(section);
    }
  });

  // Auto-track external link clicks
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    const isExternal = href && (href.startsWith('http') || href.startsWith('//')) && !href.includes(window.location.hostname);

    if (isExternal) {
      const context = {
        section: document.body.getAttribute('data-section'),
        link_text: link.textContent.trim().substring(0, 100),
        target: link.getAttribute('target')
      };
      Analytics.trackExternalClick(href, context);
    }
  }, true);

  console.debug('[Analytics] Module initialized');
})();
