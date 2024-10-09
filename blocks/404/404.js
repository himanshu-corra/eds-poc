import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the 404
 * @param {Element} block The 404 block element
 */
export default async function decorate(block) {
  // load 404 as fragment
  const fragment = await loadFragment('/404');

  // decorate 404 DOM
  block.textContent = '';
  const wrapper = document.createElement('div');
  while (fragment.firstElementChild) wrapper.append(fragment.firstElementChild);

  block.append(wrapper);
}
