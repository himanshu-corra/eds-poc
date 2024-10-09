import '../../scripts/algolia/algoliasearch.js';
import '../../scripts/algolia/instantsearch.js';

import { getConfigValue } from '../../scripts/configs.js';

export default async function decorate(block) {
  const { algoliasearch, instantsearch } = window;
  const appId = await getConfigValue('algolio-app-id');
  const apiKey = await getConfigValue('algolio-api-key');
  const searchIndex = await getConfigValue('algolio-search-index');

  const searchClient = algoliasearch(appId, apiKey);

  const { connectAutocomplete } = instantsearch.connectors;

  const search = instantsearch({
    indexName: searchIndex,
    searchClient,
    insights: true,
  });

  const renderIndexListItem = ({ hits }) => `
      <div>
        <ul style="list-style: none; padding: 0;">
          ${hits.map((hit) => `
            <li style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding: 10px 0;">
              <div style="flex: 0 0 100px; margin-right: 10px;">
                <img src="${hit.image_url}" alt="${hit.name}" style="width: 100px;" />
              </div>
              <div style="flex-grow: 1;">
                <p style="margin: 0; font-weight: bold;">${instantsearch.highlight({ attribute: 'name', hit })}</p>
                <p style="margin: 0; color: #555;">${hit.price.USD.default_formated}</p>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  const autocompleteWrapper = document.createRange().createContextualFragment(`
      <div id="autocomplete">
      <input id="search" type="search" name="q" placeholder="Search" />
      <div id="autocomplete-panel"></div>
      </div>`);

  const renderAutocomplete = (renderOptions, isFirstRender) => {
    const { indices, currentRefinement, refine } = renderOptions;
    block.append(autocompleteWrapper);
    const container = document.querySelector('#autocomplete');
    const input = container.querySelector('input');
    const wrap = container.querySelector('#autocomplete-panel');
    if (isFirstRender) {
      input.addEventListener('input', (event) => {
        refine(event.currentTarget.value);
      });
    }

    input.value = currentRefinement;
    if (currentRefinement) {
      wrap.innerHTML = indices
        .map(renderIndexListItem)
        .join('');
    } else {
      wrap.innerHTML = '';
    }
  };

  const customAutocomplete = connectAutocomplete(renderAutocomplete);

  search.addWidgets([
    customAutocomplete({
      container: document.querySelector('#autocomplete'),
    }),
  ]);

  search.start();
}
