/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';

const html = htm.bind(h);
// media query match that indicates mobile/tablet width

const AccountSidebar = () => {
  const currentPath = window.location.pathname; // Get the current URL path

  // Function to return 'active' class if the link matches the current path
  const getActiveClass = (link) => {
    const ordersPath = '/neworders';
    if (currentPath === link || (currentPath.includes(ordersPath) && link.includes(ordersPath))) {
      return 'active';
    }
    return '';
  };

  return html`
    <aside class="sidebar">
      <div class="logo"></div>
      <div class="sidebar-nav-title" onclick=${() => document.getElementsByClassName('sidebar')[0].classList.toggle('menu-active')}>
        <strong>My Account</strong>
      </div>
      <nav class="menu">
        <ul>
          <li class="${getActiveClass('/customer/account')}"><a href="/customer/account">My Account</a></li>
          <li class="${getActiveClass('/customer/account/orders')}"><a href="/customer/account/orders">My Orders</a></li>
          <li class="${getActiveClass('/customer/account/downloadableproducts')}"><a href="/customer/account/downloadableproducts">My Downloadable Products</a></li>
          <li class="${getActiveClass('/customer/account/wishlist')}"><a href="/customer/account/wishlist">My Wish List</a></li>
        </ul>
        <ul>
          <li class="${getActiveClass('/customer/account/addresses')}"><a href="/customer/account/addresses">Address Book</a></li>
          <li class="${getActiveClass('/customer/account/accountinfo')}"><a href="/customer/account/accountinfo">Account Information</a></li>
          <li class="${getActiveClass('/customer/account/paymentmethods')}"><a href="/customer/account/paymentmethods">Stored Payment Methods</a></li>
        </ul>
        <ul>
          <li class="${getActiveClass('/customer/account/productreviews')}"><a href="/customer/account/productreviews">My Product Reviews</a></li>
          <li class="${getActiveClass('/customer/account/newsletter')}"><a href="/customer/account/newsletter">Newsletter Subscriptions</a></li>
        </ul>
        <ul>
          <li><a href="#" class="logoutDashboard">Logout</a></li>
        </ul>
      </nav>
    </aside>
  `;
};
export default AccountSidebar;
