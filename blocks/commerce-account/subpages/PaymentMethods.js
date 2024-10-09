/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';

const html = htm.bind(h);

function PaymentMethods() {
  return html`<main class="content">
    <h1>Payment Methods</h1>
  </main>`;
}

export default PaymentMethods;
