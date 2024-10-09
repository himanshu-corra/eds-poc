import '../../scripts/algolia/algoliasearch.js';
import '../../scripts/algolia/autocomplete.js';
import '../../scripts/algolia/autocomplete-plugin-recent-searches.js';
import '../../scripts/algolia/autocomplete-plugin-query-suggestions.js';
import { getConfigValue } from '../../scripts/configs.js';

/**
 * Decorates a block element by creating a new div container
 * with the class "alert" and applying specific styles based on the content of the block's children.
 *
 * @param {HTMLElement} block - The HTML element to be decorated.
 * @returns {void}
 */

export default async function decorate(block) {
  const { algoliasearch } = window;
  const { autocomplete, getAlgoliaResults } = window['@algolia/autocomplete-js'];
  const { createLocalStorageRecentSearchesPlugin } = window['@algolia/autocomplete-plugin-recent-searches'];
  const { createQuerySuggestionsPlugin } = window['@algolia/autocomplete-plugin-query-suggestions'];

  const appId = await getConfigValue('algolio-app-id');
  const apiKey = await getConfigValue('algolio-api-key');
  const searchIndex = await getConfigValue('algolio-search-index');
  const querySuggestionIndex = await getConfigValue('algolio-query-suggestion-index');

  const autocompleteWrapper = document.createRange().createContextualFragment(`
    <div id="autocomplete-wrap">
      <div id="autocomplete" class="autocomplete-wrapper"></div>
      <div id="autocomplete-panel"></div>
    </div>`);
  block.append(autocompleteWrapper);

  const searchClient = algoliasearch(appId, apiKey);

  const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
    key: 'RECENT_SEARCH',
    limit: 5,
    transformSource({ source }) {
      return {
        ...source,
        onSelect({ setIsOpen }) {
          setIsOpen(true);
        },
      };
    },
  });

  const querySuggestionsPlugin = createQuerySuggestionsPlugin({
    searchClient,
    indexName: querySuggestionIndex,
    getSearchParams() {
      return {
        ...recentSearchesPlugin.data.getAlgoliaSearchParams(),
        hitsPerPage: 7,
      };
    },
    transformSource({ source }) {
      return {
        ...source,
        onSelect({ setIsOpen }) {
          setIsOpen(true);
        },
      };
    },
  });

  autocomplete({
    container: '#autocomplete',
    placeholder: 'Search...',
    autoFocus: true,
    openOnFocus: true,
    detachedMediaQuery: 'none',
    plugins: [recentSearchesPlugin, querySuggestionsPlugin],

    onSubmit({ state }) {
      window.location.href = `/search?q=${state.query}`;
    },

    getSources({ query }) {
      if (!query) {
        return [];
      }
      return [
        {
          sourceId: 'products',
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: searchIndex,
                  clickAnalytics: true,
                  query,
                  params: {
                    hitsPerPage: 5,
                    attributesToSnippet: [
                      'name:10',
                    ],
                    snippetEllipsisText: '…',
                  },
                },
              ],
            });
          },
          templates: {
            header({ html }) {
              return html`
                <div class="aa-SourceHeader">
                  <h2>
                    Products
                  </h2>
                </div>`;
            },
            item: ProductItem,
            noResults() {
              return 'No products for this query.';
            },
          },
          getItemUrl({ item }) {
            return item.url;
          },
        },
      ];
    },

    render({ elements, render, html }) {
      const {
        recentSearchesPlugin: rsPlugin,
        querySuggestionsPlugin: qsPlugin,
        products,
      } = elements;
      render(
        html`
          <div class="aa-PanelLayout aa-Panel--scrollable">
            <div class="aa-PanelLayout-wrap">
              ${products && html`
                <div class="aa-prodcut-list-wrapper">
                  ${products}
                </div>`}
              <div class="aa-recent-popular-wrapper">
                ${rsPlugin ? html`
                <div class="aa-rs-wrapper">
                  <div class="aa-SourceHeader">
                    <h2>
                      Recent Searches
                    </h2>
                  </div>
                  <div>
                    ${rsPlugin}
                  </div>
                </div>` : ''}
                ${qsPlugin ? html`
                <div class="aa-ps-wrapper">
                  <div class="aa-SourceHeader">
                    <h2>
                      Popular Searches
                    </h2>
                  </div>
                  <div>
                    ${qsPlugin}
                  </div>
                </div>
                ` : ''}
              </div>
            </div>  
          </div>
        `,
        document.getElementById('autocomplete-panel'),
      );
    },
  });
}

function ProductItem({ item, components, html }) {
  return (html`
  <a
    href="${item.url}"
    target="_self"
    rel="noreferrer noopener"
    className="aa-ItemLink aa-ProductItem"
    style="text-decoration: none;"
  >
    <div class="aa-product-item-detail">
      <div class="aa-item-detail-wrapper">
        <div class="aa-item-image">
          <img src="${item.image_url}" alt="${item.name}" />
        </div>

        <div class="aa-item-content">
          <p class="aa-item-name">
            ${components.Highlight({ hit: item, attribute: 'name' })}
          </p>
          <p class="aa-item-sku">SKU: ${Array.isArray(item.sku) ? item.sku[0] : item.sku}</p>
          <p class="aa-item-price">
            <span>${item.price.USD.default_formated}</span>
          </p>
        </div>

      </div>
    </div>
  </a>`
  );
}
