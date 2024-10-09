/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';
import ShippingAddress from '../components/ShippingAddress.js';
import BillingAddress from '../components/BillingAddress.js';
import ContactInfo from '../components/ContactInfo.js';
import NewsLetterInfo from '../components/NewsLetterInfo.js';
import OrderList from '../components/OrderList.js';
import { useCustomerData } from '../api/getCustomer.js';

const html = htm.bind(h);

function MyAccount() {
  const { customer, loading } = useCustomerData({
    includeAddresses: true,
    includeOrders: true,
    pageSize: 3,
    sort: { sort_direction: 'DESC', sort_field: 'CREATED_AT' },
  });
  const { orders, addresses } = customer;

  if (loading) return html`<span>Loading...</span>`;
  if (!Object.keys(customer)?.length) return null;

  const items = orders?.items.length ? orders.items : [];

  return html`<main class="content">
    <h1>My Account</h1>
    <section class="account-info">
        <div class="block-wrapper dashboard-info">
          <div class="block-title">
            <strong>Account Information</strong>
          </div>

          <div class="address-blc">
            <div class="add-blc-1"><${NewsLetterInfo} customer=${customer} /></div>
            <div class="add-blc-2"><${ContactInfo} customer=${customer} /></div>
          </div>
        </div>

        <div class="block-wrapper dashboard-addresses">
          <div class="block-title">
            <strong>Address Book</strong>
            <a href="/customer/account/addresses">Manage addresses</a>
          </div>
          <div class="address-blc">
            <div class="add-blc-1"><${ShippingAddress} addresses=${addresses} /></div>
            <div class="add-blc-2"><${BillingAddress} addresses=${addresses} /></div>\t\t
          </div>
        </div>

        <div class="block-wrapper dashboard-orders">
          <div class="block-title">
            <strong>Recent Orders</strong>
            <a href="/customer/account/orders">View All</a>
          </div>
          <div class="orders-list">
            <div style="overflow-x:auto;">
                <table aria-labelledby="recent-orders-list">
                  <caption class="sr-only" id="recent-orders-list">Recent Orders</caption>
                  <thead>
                    <tr>
                      <th scope="col">Order Number</th>
                      <th scope="col">Purchase Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </.thead>
                  <tbody>
                    <${OrderList} items=${items} />
                  </tbody>
                </table>
            </div>
          </div>
        </div>
    </section>
  </main>`;
}

export default MyAccount;
