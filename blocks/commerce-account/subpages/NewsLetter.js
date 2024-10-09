/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';

const html = htm.bind(h);

function NewsLetter() {
  return html`<main class="content">
    <h1>News Letter</h1>
  </main>`;
}

export default NewsLetter;
