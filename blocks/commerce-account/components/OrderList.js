/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';
import convertDateFormat from '../helpers/convertDateFormat.js';

const html = htm.bind(h);

function OrderList({
  items,
}) {
  if (!items?.length) return html`<td colspan="4">There are no orders as such.</td>`;

  return items.map((order) => html`
    <tr>
      <td>Order ${order.order_number || order.number}</td>
      <td>${convertDateFormat(order.created_at || order.order_date)}</td>
      <td> ${order.status}</td>
      <td><a href="/customer/account/orders/view/${order?.order_number || order?.number}">View</a></td>
    </tr>`);
}

export default OrderList;
