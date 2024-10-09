/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';

const html = htm.bind(h);

function AddressList({
  allAddressess,
}) {
  if (!allAddressess?.length) { return html`<td colspan="4">No additional addresses found.</td>`; }

  return allAddressess.map((address) => html`
    <tr>
      <td>${address.firstname}</td>
      <td>${address.lastname}</td>
      <td>${address.region.region}</td>
      <td>${address.city}</td>
      <td>${`${address.street[0]} ${address.street[1]}`}</td>
      <td>${address.telephone}</td>
      <td><a href="#">Edit</a></td>
    </tr>`);
}

export default AddressList;
