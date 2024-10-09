/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../../scripts/preact.js';
import htm from '../../../../scripts/htm.js';
import { useCustomerData } from '../../api/getCustomer.js';
import { formatDate, formatPrice } from '../../../../scripts/scripts.js';
import Address from '../../components/Address.js';
import TabComponent from '../../../tabs/TabComponent.js';

const html = htm.bind(h);

function getQtyLabel(isInvoice, isShipment) {
  if (isInvoice) {
    return 'Qty Invoiced';
  }
  if (isShipment) {
    return 'Qty Shipped';
  }

  return 'Qty';
}

function renderTable(
  items,
  total = {},
  currency = 'USD',
  isInvoice = false,
  isShipment = false,
) {
  return html` <table>
    <thead>
      <tr>
        <th>Product Name</th>
        <th>SKU</th>
        ${!isShipment && html`<th class="align-right">Price</th>`}
        <th class="align-right">${getQtyLabel(isInvoice, isShipment)}</th>
        ${!isShipment && html`<th class="align-right">Subtotal</th>`}
      </tr>
    </thead>
    <tbody>
      ${items?.map(
    (item) => html`
          <tr>
            <td>
              <strong>${item?.product_name}</strong>
              <dl class="item-options">
                ${item?.selected_options?.map(
    (option) => html`<dt>${option?.label}</dt>
                    <dd>${option?.value}</dd>`,
  )}
              </dl>
            </td>
            <td>${item?.product_sku}</td>
            ${!isShipment
            && html` <td class="align-right">
              ${formatPrice(item?.product_sale_price?.value, currency)}
            </td>`}

            <td class="align-right">
              ${isInvoice || isShipment
    ? item?.quantity_invoiced || item?.quantity_shipped
    : html`<span>Ordered: ${item?.quantity_ordered}</span
                    ><br /><span>Shipped: ${item?.quantity_shipped}</span>`}
            </td>
            ${!isShipment
            && html` <td class="align-right">
              ${formatPrice(
    item.product_sale_price.value
                  * (isInvoice ? item.quantity_invoiced : item.quantity_ordered),
    currency,
  )}
            </td>`}
          </tr>
        `,
  )}
    </tbody>
    ${!isShipment
      && html` <tfoot>
      <tr class="subtotal">
        <th colspan="4" class="align-right" scope="row">Subtotal</th>
        <td class="amount align-right" data-th="Subtotal">
          <span class="price"
            >${formatPrice(total?.subtotal?.value, currency)}</span
          >
        </td>
      </tr>
      ${total?.shipping_handling?.amount_including_tax?.value
    ? html` <tr class="shipping">
            <th colspan="4" class="align-right" scope="row">
              Shipping & Handling
            </th>
            <td class="amount align-right" data-th="Shipping & Handling">
              <span class="price"
                >${formatPrice(
    total?.shipping_handling?.amount_including_tax?.value,
    currency,
  )}</span
              >
            </td>
          </tr>`
    : ''}
      <tr class="grand_total">
        <th colspan="4" class="align-right" scope="row">
          <strong>Grand Total</strong>
        </th>
        <td class="amount align-right" data-th="Grand Total">
          <strong
            ><span class="price"
              >${formatPrice(total?.grand_total?.value, currency)}</span
            ></strong
          >
        </td>
      </tr>
    </tfoot>`}
  </table>`;
}

function ItemsOrdered({ items, total }) {
  const currency = total?.subtotal?.currency;
  return html` <div class="order-details-items-ordered">
    ${renderTable(items, total, currency)}
  </div>`;
}

function Invoices({ invoices }) {
  const currency = invoices[0]?.total?.subtotal?.currency;

  return html` <div class="order-details-invoices">
    ${invoices?.map((invoice) => {
    invoice.items.map((item) => {
      item.selected_options = item?.order_item?.selected_options;
      return null;
    });

    return html` <div class="order-details-invoices">
        <h5>Invoice # ${invoice?.number}</h5>
        ${renderTable(invoice?.items, invoice?.total, currency, true)}
      </div>`;
  })}
  </div>`;
}

function Shipments({ shipments }) {
  return html` <div class="order-details-shipments">
    ${shipments?.map((shipment) => {
    shipment.items.map((item) => {
      item.selected_options = item?.order_item?.selected_options;
      return null;
    });
    return html` <div class="order-details-shipment">
        <h5>Shipment # ${shipment?.number}</h5>
        ${renderTable(shipment?.items, shipment?.total, '', false, true)}
      </div>`;
  })}
  </div>`;
}

function OrderDetails() {
  const path = window.location.pathname?.split('/');
  const orderNumber = path[path.length - 1];
  const {
    customer: { firstname, lastname, orders },
    loading,
  } = useCustomerData({
    includeOrders: true,
    includeInvoice: true,
    includeShipment: true,
    filter: {
      number: {
        eq: orderNumber,
      },
    },
  });
  const order = orders?.items[0];

  if (loading) return html`<span>Loading...</span>`;
  if (!order) return html`<span>Order Not Found!</span>`;

  const tabs = [
    {
      title: 'Items Ordered',
      content: html`<${ItemsOrdered}
        items=${order?.items}
        total=${order?.total}
      />`,
    },
    order?.invoices?.length
      ? {
        title: 'Invoices',
        content: html`<${Invoices} invoices=${order?.invoices} />`,
      }
      : '',
    order?.shipments?.length
      ? {
        title: 'Shipments',
        content: html`<${Shipments} shipments=${order?.shipments} />`,
      }
      : '',
  ];

  return html`
    <main class="content">
      <div class="order-details-heading">
        <h1 class="order-details-title">Order # ${orderNumber}</h1>
        <span class="order-details-status">${order?.status}</span>
      </div>
      <section class="order-details">
        <span class="order-details-date">Order Date: ${formatDate(
    order?.order_date,
  )} (${firstname} ${lastname})</span>
        <${TabComponent}>
          ${tabs?.map(
    (tab) => html`<div label="${tab?.title}">${tab?.content}</div>`,
  )}
        </${TabComponent}>
        <div class="order-details-information">
          <h4>Order Information</h4>
          <div class="information-blocks">
            <div class="information-block">
              <h5>Shipping Address</h5>
              <${Address}
                address=${order?.shipping_address}
                isOrderDetails=${true}
              />
            </div>
            <div class="information-block">
              <h5>Shipping Method</h5>
              <span>${order?.shipping_method}</span>
            </div>
            <div class="information-block">
              <h5>Billing Address</h5>
              <${Address}
                address=${order?.billing_address}
                isOrderDetails=${true}
              />
            </div>
            <div class="information-block">
              <h5>Payment Method</h5>
              <span>${order?.payment_methods[0]?.name}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

export default OrderDetails;
