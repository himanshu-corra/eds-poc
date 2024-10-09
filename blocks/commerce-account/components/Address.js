/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';

const html = htm.bind(h);

function Address({
  address,
  isOrderDetails = false,
}) {
  return html`<address>
        ${isOrderDetails ? `${address?.firstname} ${address?.lastname}` : ''}<br/>
        ${address?.street[0]}, <br/>
        ${address?.street[1]}, <br/>
        ${address?.city}, ${address?.region?.region || address?.region}, ${address?.postcode}<br/>
        ${address?.country_code}<br/>
        T: ${address?.telephone}
    </address>`;
}

export default Address;
