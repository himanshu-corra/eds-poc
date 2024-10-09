/* eslint-disable import/prefer-default-export */
import { fetchPlaceholdersWithLocale } from '../../scripts/aem.extend.js';

export const fetchDefenitions = async (namespace) => {
  const placeholders = await fetchPlaceholdersWithLocale();
  switch (namespace) {
    case 'PLP':
      return {
        [namespace]: {
          Search: {
            label: placeholders.plpSearch,
          },
          Product: {
            OutOfStock: { label: placeholders.plpProductOutofstock },
            AddToCart: { label: placeholders.plpProductAddtocart },
          },
          Filter: {
            label: placeholders.plpFilter,
          },
          Sort: {
            label: placeholders.plpSort,
          },
          Empty: {
            label: placeholders.plpEmpty,
          },
        },
      };
    default:
      return { [namespace]: {} };
  }
};
