/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../scripts/preact.js';
import htm from '../../scripts/htm.js';
import { useLangDefenition } from '../../components/LangDefenitionContext.js';

const html = htm.bind(h);

function SelectedFilters({
  facets,
  filters,
  clearFilters,
  onFilterChange,
}) {
  const { t } = useLangDefenition('PLP');
  this.formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const filtersArray = [];

  Object.entries(filters).forEach((filter) => {
    if (filter[0] === 'price' && filter[1]?.length) {
      const item = `${this.formatter.format(filter[1][0])}-${this.formatter.format(filter[1][1])}`;
      filtersArray.push(item);
    } else {
      filtersArray.push(...filter[1]);
    }
    return null;
  });

  const clearFilter = (filterName) => {
    const newFilters = { ...filters };
    const priceRegex = /^\$\d{1,3}(?:\.\d{2})?-\$\d{1,3}(?:\.\d{2})?$/;

    Object.keys(newFilters).forEach((filter) => {
      if (filter === 'price' && priceRegex.test(filterName)) {
        newFilters[filter] = [];
      } else if (Array.isArray(newFilters[filter])) {
        newFilters[filter] = newFilters[filter].filter((item) => item !== filterName);
      }
    });
    onFilterChange(newFilters);
  };

  const renderSelectedFilters = () => html` <div class="swatch-badge-wrapper">
    ${filtersArray?.map(
    (filter) => {
      let name = '';
      facets.forEach((facet) => {
        facet.buckets.forEach((bucket) => {
          if (bucket.title === filter) {
            name = bucket?.name;
          }
        });
      });

      return html`<div class="swatch-badge">
      <span>${name || filter}</span>
      <button class="clear-filter" onClick=${() => clearFilter(filter)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          class="h-[12px] w-[12px] rotate-45 inline-block ml-sm cursor-pointer  fill-neutral-800"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </button>
    </div>`;
    },
  )}
    <button class="clear-filters" onClick=${() => clearFilters()}>
      ${t('Clear filters')}
    </button>
  </div>`;

  if (!filtersArray?.length) return null;

  return html`<div class="selected-filters">
    ${renderSelectedFilters()}
  </div>`;
}

export default SelectedFilters;
