/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';

const html = htm.bind(h);

function NewsLetterInfo({
  customer,
}) {
  return html`<div>
    <strong class="box-title"> 
      <span>Newsletters</span>
    </strong><br/>
    <div class="box-content">
      <span>${customer?.is_subscribed ? 'You are subscribed to our newsletter'
    : 'You are not subscribed to our newsletter'}</span><br/>
    </div>
    <div class="box-actions">
      <a href="#">Edit</a>
    </div>
  </div>`;
}

export default NewsLetterInfo;
