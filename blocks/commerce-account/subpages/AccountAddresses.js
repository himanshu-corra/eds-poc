/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';
import AddressList from '../components/AddressList.js';
import ShippingAddress from '../components/ShippingAddress.js';
import BillingAddress from '../components/BillingAddress.js';
import { useCustomerData } from '../api/getCustomer.js';

const html = htm.bind(h);

function AccountAddresses() {
  const { customer, loading } = useCustomerData({
    includeAddresses: true,
  });
  const { addresses } = customer;

  if (loading) return html`<span>Loading...</span>`;
  if (!Object.keys(customer)?.length) return null;

  const allAddressess = addresses
    .filter((address) => !address?.default_billing && !address?.default_shipping)
    .reverse();

  return html`<main class="content">
    <h1>My Addresses</h1>
    <section class="account-info">
      <div class="block-wrapper dashboard-addresses">
        <div class="block-title">
          <strong>Default addresses</strong>
        </div>
        <div class="address-blc">
          <div class="add-blc-1"><${ShippingAddress} addresses=${addresses} /></div>
          <div class="add-blc-2"><${BillingAddress} addresses=${addresses} /></div>\t\t
        </div>
      </div>
      <div class="block-wrapper dashboard-addresses">
        <div class="block-title">
          <strong>Additional Addresses</strong>
        </div>
        <div class="orders-list">
          <div style="overflow-x:auto;">
            <table>
              <tr>
                <th>Name</th>
                <th>Last Name</th>
                <th>State</th>
                <th>City</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
              <${AddressList} allAddressess=${allAddressess} />
            </table>
          </div>
        </div>
      </div>
    </section>
  </main>`;
}

export default AccountAddresses;
