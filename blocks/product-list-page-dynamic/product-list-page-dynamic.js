import {
  h, render,
} from '../../scripts/preact.js';
import htm from '../../scripts/htm.js';
import { getPLPconfig } from './helpers.js';
import ProductListPage from './ProductListPage.js';
import { fetchDefenitions } from './lang-utils.js';
import LangDefenitionProvider from '../../components/LangDefenitionContext.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { loadErrorPage } from '../../scripts/commerce.js';

const html = htm.bind(h);
export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const config = getPLPconfig(blockConfig);
  if ((!config.category || !config.urlpath) && config.type !== 'search') {
    await loadErrorPage();
    return Promise.reject();
  }
  block.textContent = '';
  block.dataset.category = config.category;
  block.dataset.urlpath = config.urlpath;

  const defenitions = await fetchDefenitions('PLP');

  return new Promise((resolve) => {
    const app = html`
      <${LangDefenitionProvider} defenitions=${defenitions}>
        <${ProductListPage} ...${config} block=${block} resolve=${resolve} />
      </${LangDefenitionProvider}>
    `;
    render(app, block);
  });
}
