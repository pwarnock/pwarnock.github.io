/**
 * Lit 3D Piano Component
 * A CSS-3D based piano component with Web Audio API sound.
 *
 * Usage:
 * <script type="module" src="/js/lit-3d-piano.js"></script>
 * <lit-3d-piano></lit-3d-piano>
 *
 * Target Page: peterwarnock.com/components/piano-demo/
 */

import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@3.1.2/+esm';

export class Lit3DPiano extends LitElement {
  static styles = css`
    :host {
      display: block;
      perspective: 800px;
      padding: 40px;
      background: #222;
      border-radius: 8px;
      overflow: hidden;
    }

    .piano {
      position: relative;
      width: 300px;
      height: 200px;
      margin: 0 auto;
      transform-style: preserve-3d;
      transform: rotateX(20deg);
    }

    .keys {
      display: flex;
      height: 100%;
      background: #333;
      border-radius: 0 0 4px 4px;
      padding: 0 10px 10px 10px;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
    }

    .key {
      position: relative;
      flex: 1;
      height: 100%;
      background: linear-gradient(to bottom, #fff 0%, #eee 100%);
      border: 1px solid #ccc;
      border-radius: 0 0 4px 4px;
      margin: 0 2px;
      cursor: pointer;
      transition:
        transform 0.1s,
        background 0.1s;
      transform-origin: top;
      box-shadow: 0 4px 0 #999;
      z-index: 1;
    }

    .key:active,
    .key.active {
      transform: rotateX(-5deg) translateY(4px);
      box-shadow: 0 0 0 #999;
      background: #ddd;
    }

    /* Black keys */
    .key.black {
      position: absolute;
      top: 0;
      height: 60%;
      width: 8%;
      background: linear-gradient(to bottom, #333 0%, #000 100%);
      border: 1px solid #000;
      border-radius: 0 0 4px 4px;
      z-index: 2;
      box-shadow: 0 3px 0 #222;
      margin-left: -4%; /* Center on the gap */
    }

    .key.black:active,
    .key.black.active {
      transform: rotateX(-5deg) translateY(3px);
      box-shadow: 0 0 0 #222;
      background: #222;
    }

    .note-label {
      position: absolute;
      bottom: 10px;
      width: 100%;
      text-align: center;
      font-size: 10px;
      color: #888;
      pointer-events: none;
    }
  `;

  constructor() {
    super();
    this.audioCtx = null;
    this.keys = [
      { note: 'C', freq: 261.63, type: 'white' },
      { note: 'C#', freq: 277.18, type: 'black', offset: 1 },
      { note: 'D', freq: 293.66, type: 'white' },
      { note: 'D#', freq: 311.13, type: 'black', offset: 2 },
      { note: 'E', freq: 329.63, type: 'white' },
      { note: 'F', freq: 349.23, type: 'white' },
      { note: 'F#', freq: 369.99, type: 'black', offset: 4 },
      { note: 'G', freq: 392.0, type: 'white' },
      { note: 'G#', freq: 415.3, type: 'black', offset: 5 },
      { note: 'A', freq: 440.0, type: 'white' },
      { note: 'A#', freq: 466.16, type: 'black', offset: 6 },
      { note: 'B', freq: 493.88, type: 'white' },
    ];
  }

  playNote(freq) {
    if (!this.audioCtx) {
      // @ts-ignore
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 1);
  }

  render() {
    // Separate white and black keys for rendering order/positioning
    const whiteKeys = this.keys.filter(k => k.type === 'white');
    const blackKeys = this.keys.filter(k => k.type === 'black');

    return html`
      <div class="piano">
        <div class="keys">
          ${whiteKeys.map(
            (k, i) => html`
              <div class="key" @mousedown="${() => this.playNote(k.freq)}">
                <span class="note-label">${k.note}</span>
              </div>
            `
          )}
          ${blackKeys.map(k => {
            // Calculate percentage position roughly based on index
            const leftPos = k.offset * (100 / 7) - 100 / 7 / 2;
            return html`
              <div
                class="key black"
                style="left: ${leftPos}%"
                @mousedown="${e => {
                  e.stopPropagation();
                  this.playNote(k.freq);
                }}"
              ></div>
            `;
          })}
        </div>
      </div>
    `;
  }
}

customElements.define('lit-3d-piano', Lit3DPiano);
