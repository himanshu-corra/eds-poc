/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';

const html = htm.bind(h);

function ContactInfo({
  customer,
}) {
  return html`<div>
    <strong class="box-title"> 
      <span>Contact Informations</span>
    </strong>
    <div class="box-content">
      <span>${customer.firstname} ${customer.lastname}</span><br/>
      <span>${customer.email}</span><br/>
    </div>
    <div class="box-actions">
      <a href="#">Edit</a> | <a href="#">Change Password</a>
    </div>
  </div>`;
}

export default ContactInfo;
