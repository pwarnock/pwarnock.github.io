/**
 * Smart Iframe Component
 * A Lit-based wrapper for iframes that provides loading states, security defaults, and responsive styling.
 *
 * Usage:
 * <script type="module" src="/js/smart-iframe.js"></script>
 * <smart-iframe src="https://example.com" title="My App"></smart-iframe>
 */

import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@3.1.2/+esm';

export class SmartIframe extends LitElement {
  static properties = {
    src: { type: String },
    title: { type: String },
    height: { type: String },
    breakout: { type: Boolean, reflect: true },
    cropTop: { type: Number, attribute: 'crop-top' },
    devCrop: { type: Number, attribute: 'dev-crop' },
    isLoading: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      background: var(--base-200, #f4f4f4);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    :host([breakout]) {
      border-radius: 0;
      box-shadow: none;
      /* JS will handle width/position to avoid scrollbar issues */
    }

    .wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 300px;
      overflow: hidden; /* Required for cropping */
      transition: height 0.3s ease;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      display: block;
    }

    iframe.loaded {
      opacity: 1;
    }

    .loader {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--base-200, #eee);
      color: var(--base-content, #666);
      z-index: 10;
      transition: opacity 0.3s ease;
    }

    .loader.hidden {
      opacity: 0;
      pointer-events: none;
    }

    /* Simple CSS Spinner */
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: var(--primary, #007bff);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      font-family: sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
    }
  `;

  constructor() {
    super();
    this.src = '';
    this.title = 'Embedded Content';
    this.height = '600px';
    this.isLoading = true;
    this.cropTop = 0;
    this.devCrop = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.handleResize.bind(this));
    // Initial alignment
    setTimeout(() => this.handleResize(), 0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    if (this.breakout) {
      // Reset first to get true context
      this.style.width = '';
      this.style.marginLeft = '';

      // Calculate exact fit to document body (excludes scrollbar)
      const docWidth = document.body.clientWidth;
      const rect = this.getBoundingClientRect();

      // Force full width and pull to left edge
      this.style.width = `${docWidth}px`;
      this.style.marginLeft = `-${rect.left}px`;
    }
  }

  handleLoad() {
    // Artificial delay to prevent flickering on fast loads
    setTimeout(() => {
      this.isLoading = false;
      this.enhanceIframe();
    }, 500);
  }

  enhanceIframe() {
    try {
      const iframe = this.shadowRoot.querySelector('iframe');
      const doc = iframe.contentDocument;
      if (!doc) return;

      // 1. Inject Styles (Same-Origin Only)
      const style = doc.createElement('style');
      style.textContent = `
        .input-sheet__logo, 
        .hero-banner, 
        .pdf-cover-page,
        footer.home-page { 
          display: none !important; 
        }
        body { margin: 0; overflow-y: hidden; }
      `;
      doc.head.appendChild(style);

      // 2. Auto-resize
      const resizeObserver = new ResizeObserver(() => {
        const height = doc.documentElement.scrollHeight;
        if (height > 300) {
          // Adjust height taking cropping into account
          const visibleHeight = height - (this.cropTop || 0);
          this.style.height = visibleHeight + 'px';
          this.shadowRoot.querySelector('.wrapper').style.height = visibleHeight + 'px';
        }
      });
      resizeObserver.observe(doc.body);
    } catch (_e) {
      // Cross-origin: Alignment handled by JS, Cropping handled by CSS margin
      console.log('SmartIframe: Cross-origin content, generic enhancements only.');

      // Apply dev-crop if specified (fallback for when CSS injection fails)
      if (this.devCrop > 0) {
        console.log(`SmartIframe: Applying dev-crop of ${this.devCrop}px`);
        this.cropTop = this.devCrop;
      }
    }
  }

  render() {
    // Calculate iframe styles for cropping
    const iframeStyle = this.cropTop
      ? `margin-top: -${this.cropTop}px; height: calc(100% + ${this.cropTop}px);`
      : '';

    return html`
      <div class="wrapper" style="height: ${this.height}">
        <!-- Loading State -->
        <div class="loader ${this.isLoading ? '' : 'hidden'}">
          <div class="spinner"></div>
          <span class="loading-text">Loading App...</span>
        </div>

        <!-- Content -->
        <iframe
          src="${this.src}"
          title="${this.title}"
          loading="lazy"
          style="${iframeStyle}"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          class="${this.isLoading ? '' : 'loaded'}"
          @load="${this.handleLoad}"
        ></iframe>
      </div>
    `;
  }
}

customElements.define('smart-iframe', SmartIframe);
