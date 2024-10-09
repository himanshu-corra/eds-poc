import { priceFieldsFragment, performCatalogServiceQuery } from '../../scripts/commerce.js';

export const ALLOWED_FILTER_PARAMETERS = ['page', 'pageSize', 'sort', 'sortDirection', 'q', 'price', 'size', 'color_family'];
export const isMobile = window.matchMedia('only screen and (max-width: 900px)').matches;

export const productSearchQuery = (addCategory = false) => `query ProductSearch(
    $currentPage: Int = 1
    $pageSize: Int = 20
    $phrase: String = ""
    $sort: [ProductSearchSortInput!] = []
    $filter: [SearchClauseInput!] = []
    ${addCategory ? '$categoryId: String!' : ''}
  ) {
    ${addCategory ? `categories(ids: [$categoryId]) {
        name
        urlKey
        urlPath
    }` : ''}
    productSearch(
        current_page: $currentPage
        page_size: $pageSize
        phrase: $phrase
        sort: $sort
        filter: $filter
    ) {
        facets {
            title
            type
            attribute
            buckets {
                title
                __typename
                ... on CategoryView {
                    name
                    count
                    path
                }
                ... on RangeBucket {
                    count
                    from
                    to
                }
                ... on ScalarBucket {
                    count
                    id
                }
                ... on StatsBucket {
                    max
                    min
                }
            }
        }
        items {
            product {
              id
            }
            productView {
                name
                sku
                urlKey
                inStock
                images(roles: "thumbnail") {
                  url
                }
                __typename
                ... on SimpleProductView {
                    price {
                        ...priceFields
                    }
                }
                ... on ComplexProductView {
                    options {
                      id
                      title
                      required
                      values {
                        id
                        title
                        inStock
                        ...on ProductViewOptionValueSwatch {
                          type
                          value
                        }
                      }
                    }
                    priceRange {
                        minimum {
                            ...priceFields
                        }
                        maximum {
                            ...priceFields
                        }
                    }
                }
            }
        }
        page_info {
            current_page
            total_pages
            page_size
        }
        total_count
    }
  }
  ${priceFieldsFragment}`;

export async function loadCategory(state) {
  try {
    // Be careful if query exceeds GET size limits, then switch to POST
    const variables = {
      pageSize: state.currentPageSize,
      currentPage: state.currentPage,
      sort: [{
        attribute: state.sort,
        direction: state.sortDirection === 'desc' ? 'DESC' : 'ASC',
      }],
    };

    variables.phrase = state.type === 'search' ? state.searchTerm : '';

    if (Object.keys(state.filters).length > 0) {
      variables.filter = [];
      Object.keys(state.filters).forEach((key) => {
        if (key === 'price') {
          const [from, to] = state.filters[key];
          if (from && to) {
            variables.filter.push({ attribute: key, range: { from, to } });
          }
        } else if (state.filters[key].length > 1) {
          variables.filter.push({ attribute: key, in: state.filters[key] });
        } else if (state.filters[key].length === 1) {
          variables.filter.push({ attribute: key, eq: state.filters[key][0] });
        }
      });
    }

    if (state.type === 'category' && state.category.id) {
      variables.categoryId = state.category.id;
      variables.filter = variables.filter || [];
      if (state.category.urlPath) {
        variables.filter.push({ attribute: 'categoryPath', eq: state.category.urlPath });
      } else if (state.category.id) {
        variables.filter.push({ attribute: 'categoryIds', eq: state.category.id });
      }
    }

    window.adobeDataLayer.push((dl) => {
      const requestId = crypto.randomUUID();
      window.sessionStorage.setItem('searchRequestId', requestId);
      const searchInputContext = dl.getState('searchInputContext') ?? { units: [] };
      const searchUnitId = 'livesearch-plp';
      const unit = {
        searchUnitId,
        searchRequestId: requestId,
        queryTypes: ['products', 'suggestions'],
        ...variables,
      };
      const index = searchInputContext.units.findIndex((u) => u.searchUnitId === searchUnitId);
      if (index < 0) {
        searchInputContext.units.push(unit);
      } else {
        searchInputContext.units[index] = unit;
      }
      dl.push({ searchInputContext });
      // TODO: Remove eventInfo once collector is updated
      dl.push({ event: 'search-request-sent', eventInfo: { ...dl.getState(), searchUnitId } });
    });

    const response = await performCatalogServiceQuery(productSearchQuery(state.type === 'category'), variables);

    // Parse response into state
    return {
      pages: Math.max(response.productSearch.page_info.total_pages, 1),
      products: {
        items: response.productSearch.items
          .map((product) => ({ ...product.productView, ...product.product }))
          .filter((product) => product !== null),
        total: response.productSearch.total_count,
      },
      category: { ...state.category, ...response.categories?.[0] ?? {} },
      facets: response.productSearch.facets,
    };
  } catch (e) {
    console.error('Error loading products', e);
    return {
      pages: 1,
      products: {
        items: [],
        total: 0,
      },
      facets: [],
    };
  }
}

export function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const newState = {
    filters: {},
  };
  params.forEach((value, key) => {
    if (key === 'page') {
      newState.currentPage = parseInt(value, 10) || 1;
    } else if (key === 'pageSize') {
      newState.currentPageSize = parseInt(value, 10) || 12;
    } else if (key === 'sort') {
      const data = value.split('_');
      const [sort, direction] = data;
      newState.sort = sort;
      newState.sortDirection = direction;
    } else if (key === 'sortDirection') {
      newState.sortDirection = value;
    } else if (key === 'q') {
      newState.searchTerm = value;
    } else if (key === 'price') {
      newState.filters[key] = value.split(',').map((v) => parseInt(v, 10) || 0);
    } else {
      newState.filters[key] = value.split(',');
    }
  });
  return newState;
}

export async function preloadCategory(category) {
  const queryParams = parseQueryParams();

  window.loadCategoryPromise = loadCategory({
    pages: 1,
    currentPage: 1,
    category,
    basePageSize: isMobile ? 6 : 12,
    currentPageSize: isMobile ? 6 : 12,
    locale: 'en-US',
    currency: 'USD',
    type: 'category',
    sort: 'position',
    sortDirection: 'asc',
    ...queryParams,
  });
}
