/**
 * Simple Greeting Lit Component
 * A minimal demonstration of a Lit web component for peterwarnock.com.
 *
 * Usage:
 * <script type="module" src="/js/simple-greeting.js"></script>
 * <simple-greeting></simple-greeting>
 *
 * Target Page: peterwarnock.com/components/demo/
 */

// Import Lit from CDN (no build tools required)
import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@3.1.2/+esm';

// Define the component
export class SimpleGreeting extends LitElement {
  // Encapsulated styles (Shadow DOM)
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    p {
      color: blue;
      font-weight: bold;
      font-size: 1.2rem;
    }
  `;

  // Render template
  render() {
    return html` <p>Hello from Lit Web Component!</p> `;
  }
}

// Register custom element
customElements.define('simple-greeting', SimpleGreeting);
