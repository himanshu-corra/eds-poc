// eslint-disable-next-line import/no-unresolved
import { h, render } from '../../scripts/preact.js';
import htm from '../../scripts/htm.js';
import TabComponent from './TabComponent.js';

const html = htm.bind(h);

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const tabHeaders = [...block.children].map((child) => child.firstElementChild);
  const tabContents = [...block.children].map((child, i) => {
    const content = child.children[1];
    return {
      label: tabHeaders[i].textContent,
      content: content.innerHTML,
    };
  });

  block.innerHTML = '';

  const tabsComponent = (
    html`<${TabComponent}>
    ${tabContents.map((tab, i) => (
      html`<div key=${i} label=${tab.label} dangerouslySetInnerHTML=${{ __html: tab.content }} />`
    ))}
  </${TabComponent}>`
  );

  return new Promise((resolve) => {
    const app = html`
      ${tabsComponent}
    `;
    render(app, block);
    resolve();
  });
}
