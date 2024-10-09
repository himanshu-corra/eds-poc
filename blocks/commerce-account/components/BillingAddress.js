/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';
import Address from './Address.js';

const html = htm.bind(h);

function BillingAddress({
  addresses,
}) {
  return addresses.map((address) => {
    if (!address.default_billing) {
      return '';
    }
    return html`<div>
      <strong class="box-title"> <span>Default Billing Address</span></strong>
        <${Address} address=${address} />
        <a href="#">Edit Address</a>
      </div>`;
  });
}

export default BillingAddress;
