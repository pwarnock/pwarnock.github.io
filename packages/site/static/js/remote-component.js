class RemoteComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Demonstrate JS isolation: This variable 'localData' is not accessible to the host
    const localData = 'Secret remote data';

    this.shadowRoot.innerHTML = `
      <style>
        /* Demonstrate CSS isolation: This h2 style won't affect the host */
        :host {
          display: block;
          border: 2px dashed #ff4400;
          padding: 20px;
          margin: 20px 0;
          font-family: sans-serif;
          background-color: #fff5f0;
        }
        h2 {
          color: #ff4400;
          margin-top: 0;
        }
        p {
          color: #333;
        }
        button {
          background: #ff4400;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        button:hover {
          background: #e03c00;
        }
      </style>
      <div class="wrapper">
        <h2>Remote Component (Shadow DOM)</h2>
        <p>My styles are isolated. Your page's blue H2 styles cannot reach me, and my orange H2 styles cannot leak out to you.</p>
        <button id="btn">Click Me (Remote)</button>
      </div>
    `;

    this.shadowRoot.getElementById('btn').addEventListener('click', () => {
      alert(`Hello from the remote component!\nInternal variable: ${localData}`);
    });
  }
}

// Define the custom element
// In a cross-domain scenario, this script runs on the host page
// but encapsulates all its logic within this class.
customElements.define('remote-component', RemoteComponent);
