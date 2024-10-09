/* eslint-disable object-curly-spacing, class-methods-use-this */
import {
  h, Component, Fragment,
} from '../../../../scripts/preact.js';
import htm from '../../../../scripts/htm.js';
import convertDateFormat from '../../helpers/convertDateFormat.js';

const html = htm.bind(h);

class OrderRow extends Component {
  constructor(props) {
    super();
    this.baseOrder = props.order;
  }

  render({
    order, loading, index, secondLastOrder,
  }) {
    if (loading) {
      return html`<tr index=${index} ref=${secondLastOrder}><td colspan="4">Loading</td></tr>`;
    }

    const orderHTML = html`
        <tr index=${index} ref=${secondLastOrder}>
          <td>Order ${order.order_number || order.number}</td>
          <td>${convertDateFormat(order.created_at || order.order_date)}</td>
          <td> ${order.status}</td>
          <td><a href="/customer/account/orders/view/${order?.order_number || order?.number}">View</a></td>
        </tr>`;

    return orderHTML;
  }
}

const OrdersList = ({
  orders, loading, secondLastOrder,
}) => {
  if (loading) {
    return html`<${OrderRow} loading=${true}/>`;
  }

  if (orders.items.length === 0) {
    return html`<tr><td colspan="4">We're sorry, we couldn't find any orders.</td></tr>`;
  }

  const gridItems = orders.items.map((order, index) => html`<${OrderRow} key=${order.number} order=${order} index=${index} secondLastOrder=${index === orders.items.length - 2 ? secondLastOrder : null} />`);

  return html`<${Fragment}>
                      ${gridItems}
                    </>`;
};

export default OrdersList;
