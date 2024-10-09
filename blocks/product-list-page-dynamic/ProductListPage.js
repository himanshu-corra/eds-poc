import {
  h, Component, Fragment, createRef,
} from '../../scripts/preact.js';
import htm from '../../scripts/htm.js';
import ProductList from './ProductList.js';
import FacetList from './FacetList.js';
import { sampleRUM } from '../../scripts/aem.js';
import {
  isMobile,
  loadCategory,
  parseQueryParams,
} from './utils.js';
import { useLangDefenition } from '../../components/LangDefenitionContext.js';
import SelectedFilters from './SelectedFilters.js';
import { createMetaTag } from '../../scripts/scripts.js';

const html = htm.bind(h);

function updateMetaData(category) {
  createMetaTag('title', category.name, 'name');
  createMetaTag('og:title', category.name, 'property');
  createMetaTag('twitter:title', category.name, 'name');
  document.title = category.name;
}

// You can get this list via attributeMetadata query

function Pagination(props) {
  if (props.loading) {
    return html`<div class="pagination shimmer"></div>`;
  }

  return html`<div class="pagination">
    <div>
      <label for="select-pagesize">Show:</label>
      <select id="select-pagesize" name="pageSize" value=${props.currentPageSize} onChange=${(e) => props.onPageSizeChange?.(parseInt(e.target.value, 10))}>
        ${props.pageSizeOptions.map((size) => html`<option value=${size}>${size} Items</option>`)}
      </select>
    </div>
    <div>
      <label for="select-page">Page:</label>
      <select id="select-page" name="page" value=${props.currentPage} onChange=${(e) => props.onPageChange?.(parseInt(e.target.value, 10))}>
        ${Array(props.pages).fill(0).map((_, i) => html`<option value=${i + 1}>${i + 1}</option>`)}
      </select>
      <span>of ${props.pages}</span>
    </div>
    <div>
      ${props.currentPage > 1 ? html`<button class="previous" onClick=${() => props.onPageChange?.(props.currentPage - 1)}>Previous</button>` : ''}
      ${props.currentPage < props.pages ? html`<button class="next" onClick=${() => props.onPageChange?.(props.currentPage + 1)}>Next</button>` : ''}
    </div>
  </div>`;
}

function Sort(props) {
  const {
    type, disabled, sortMenuRef, onSort,
  } = props;
  const options = [
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Product Name', value: 'name-asc' },
    { label: 'Relevance', value: type === 'category' ? 'position-asc' : 'relevance-desc' },
  ];

  const { t } = useLangDefenition('PLP');

  const currentSort = options.find((option) => option.value === `${props.currentSort}-${props.sortDirection}`) || options[3];

  return html`<div class="sort" disabled=${disabled}>
    <button disabled=${disabled}>${t('Sort.label', 'Sort By')}: ${currentSort.label}</button>
    <div class="overlay" ref=${sortMenuRef}>
      <button class="close" 
      onClick=${() => {
    document.body.classList.toggle('modal-open');
    sortMenuRef.current.classList.toggle('active');
  }}
  >Close</button>
      <ul>
        ${options.map((option) => html`<li>
          <a href="#" class="${currentSort.value === option.value ? 'active' : ''}" onClick=${(e) => {
  sortMenuRef.current.classList.toggle('active');
  const [sort, direction = 'asc'] = option.value.split('-');
  onSort?.(sort, direction);
  e.preventDefault();
}}>${option.label}</a>
        </li>`)}
      </ul>
    </div>
  </div>`;
}

class ProductListPage extends Component {
  constructor(props) {
    const {
      type = 'category',
      category,
      urlpath,
    } = props;
    super();

    this.facetMenuRef = createRef();
    this.sortMenuRef = createRef();
    this.secondLastProduct = createRef();

    const queryParams = parseQueryParams();

    let headline = 'Search Results';
    let sort = 'relevance';
    let sortDirection = 'desc';
    const defaultPageSize = 12;
    if (type === 'category') {
      // Get from H1
      headline = document.querySelector('.default-content-wrapper > h1')?.innerText;
      sort = 'position';
      sortDirection = 'asc';
    }

    if (type === 'search') {
      sampleRUM('search', { source: '.search-input', target: queryParams.searchTerm });
    }

    this.state = {
      loading: true,
      pages: 1,
      currentPage: 1,
      basePageSize: defaultPageSize,
      currentPageSize: defaultPageSize,
      type,
      category: {
        name: headline,
        id: category || null,
        urlPath: urlpath || null,
      },
      sort,
      sortDirection,
      products: {
        items: [],
        total: 0,
      },
      filters: {},
      facets: [],
      ...queryParams,
    };

    this.filterChange = false;
    this.paginationClick = false;
  }

  setStatePromise(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  static updateQueryParams = (params) => {
    const newParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (Array.isArray(params[key]) && params[key].length > 0) {
        newParams.set(key, params[key].join(','));
      } else if (!Array.isArray(params[key]) && params[key]) {
        newParams.set(key, params[key]);
      }
    });

    const url = newParams.toString() ? `${window.location.pathname}?${newParams.toString()}` : window.location.pathname;
    window.history.pushState({}, '', url);
  };

  loadState = async (state) => {
    await this.setStatePromise({ ...state, loading: false });
    if (this.state && this.state.products) {
      this.filterChange = false;
      this.paginationClick = false;
    }
    this.props.resolve();

    if (this.state.loading === false) {
      window.adobeDataLayer.push((dl) => {
        const searchResultsContext = dl.getState('searchResultsContext') ?? { units: [] };
        const searchRequestId = window.sessionStorage.getItem('searchRequestId');
        const searchUnitId = 'livesearch-plp';
        const searchResultUnit = {
          searchUnitId,
          searchRequestId,
          products: this.state.products.items.map((p, index) => ({
            name: p.name,
            sku: p.sku,
            url: new URL(`/products/${p.url_key}/${p.sku.toLowerCase()}`, window.location).toString(),
            imageUrl: p.images?.length ? p.images[0].url : '',
            price: p.price?.final?.amount?.value ?? p.priceRange?.minimum?.final?.amount?.value,
            rank: index,
          })),
          categories: [],
          suggestions: [],
          page: this.state.currentPage,
          perPage: this.state.currentPageSize,
          facets: this.state.facets,
        };
        const index = searchResultsContext.units.findIndex((u) => u.searchUnitId === searchUnitId);
        if (index < 0) {
          searchResultsContext.units.push(searchResultUnit);
        } else {
          searchResultsContext.units[index] = searchResultUnit;
        }
        dl.push({ searchResultsContext });
        // TODO: Remove eventInfo once collector is updated
        dl.push({ event: 'search-response-received', eventInfo: { ...dl.getState(), searchUnitId } });
        if (this.props.type === 'search') {
          // TODO: Remove eventInfo once collector is updated
          dl.push({ event: 'search-results-view', eventInfo: { ...dl.getState(), searchUnitId } });
        } else {
          dl.push({
            categoryContext: {
              name: this.state.category.name,
              urlKey: this.state.category.urlKey,
              urlPath: this.state.category.urlPath,
            },
          });
          // TODO: Remove eventInfo once collector is updated
          dl.push({ event: 'category-results-view', eventInfo: { ...dl.getState(), searchUnitId } });
        }
      });
    }
  };

  loadProducts = async () => {
    this.setState({ loading: true });

    const state = await loadCategory(this.state);
    await this.loadState(state);
  };

  async componentDidMount() {
    if (window.loadCategoryPromise) {
      const state = await window.loadCategoryPromise;

      if (state.category) {
        updateMetaData(state.category);
      }

      await this.loadState(state);
    } else {
      await this.loadProducts();
    }

    // Special optimization for mobile
    if ('IntersectionObserver' in window && isMobile && this.state.products.items.length === 6 && this.state.products.total > 6) {
      const scrollToBottomObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load products with real page size
            this.loadProducts();
            scrollToBottomObserver.unobserve(entry.target);
          }
        });
      });
      if (this.secondLastProduct.current) {
        scrollToBottomObserver.observe(this.secondLastProduct.current);
      }
    }
  }

  updateURLParams = (diff, keysToCheck) => {
    const currentParams = new URLSearchParams(window.location.search);
    const currentParamsObject = {};
    currentParams.forEach((value, key) => {
      currentParamsObject[key] = value;
    });

    const mapper = {
      searchTerm: 'q',
      currentPageSize: 'pageSize',
      currentPage: 'page',
    };

    keysToCheck.forEach((key) => {
      if (diff.includes(key)) {
        if (['sort', 'sortDirection'].includes(key)) {
          currentParamsObject.sort = `${this.state.sort}_${this.state.sortDirection}`;
        } else if (mapper[key]) {
          currentParamsObject[mapper[key]] = this.state[key];
        }
      }
    });

    if (currentParamsObject.page === '1') {
      delete currentParamsObject.page;
    }
    ProductListPage.updateQueryParams({
      ...currentParamsObject,
      ...this.state.filters,
    });
  };

  componentDidUpdate(_, prevState) {
    // Load new products if filters, pagination or sort have changed
    const diff = Object.keys(Object.keys(prevState).reduce((acc, key) => {
      if (prevState[key] !== this.state[key]) {
        acc[key] = this.state[key];
      }
      return acc;
    }, {}));

    const keysToCheck = ['filters', 'sort', 'sortDirection', 'searchTerm', 'currentPageSize', 'currentPage'];

    if (keysToCheck.some((key) => diff.includes(key))) {
      this.loadProducts();
      this.updateURLParams(diff, keysToCheck);
    }
  }

  onPageChange(page) {
    this.setState({ currentPage: page });
    this.paginationClick = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleFilterChange(filters) {
    const newFilters = { ...this.state.filters, ...filters };
    if (JSON.stringify(newFilters) !== JSON.stringify(this.state.filters)) {
      this.setState({ filters: newFilters, currentPage: 1 }, () => {
        this.filterChange = true;
      });
    }
  }

  handleClearFilters() {
    this.setState({ ...this.state, filters: {} });
    const keepParams = ['page', 'pageSize', 'sort', 'q'];
    const params = new URLSearchParams(window.location.search);
    const keys = [...params.keys()];
    keys.forEach((key) => {
      if (!keepParams.includes(key)) {
        params.delete(key);
      }
    });

    const url = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', url);
  }

  render(props, state) {
    const { type = 'category' } = props;

    return html`<${Fragment}>
      <${FacetList} 
        facets=${state.facets}
        filters=${state.filters}
        facetMenuRef=${this.facetMenuRef}
        onFilterChange=${this.handleFilterChange.bind(this)}
        loading=${state.loading} />
      <div class="products">
        <div class="title">
          <h1>${state.category.name}</h1>
          ${!state.loading && html`<span>(${state.products.total} ${state.products.total === 1 ? 'Product' : 'Products'})</span>`}
          <${Sort}
            disabled=${state.loading}
            currentSort=${state.sort}
            sortDirection=${state.sortDirection}
            type=${type}
            onSort=${(sort, direction) => this.setState({ sort, sortDirection: direction })}
            sortMenuRef=${this.sortMenuRef} />
        </div>
        <div class="mobile-menu">
          <button disabled=${state.loading} id="toggle-filters" onClick=${() => {
  document.body.classList.toggle('modal-open');
  this.facetMenuRef.current.classList.toggle('active');
}}>Filters</button>
          <button disabled=${state.loading} id="toggle-sortby" onClick=${() => {
  document.body.classList.toggle('modal-open');
  this.sortMenuRef.current.classList.toggle('active');
}}>Sort By</button>
        </div>
        <${SelectedFilters}
          filters=${state.filters}
          facets=${state.facets}
          clearFilters=${this.handleClearFilters.bind(this)}
          onFilterChange=${this.handleFilterChange.bind(this)}
        />
        <${ProductList}
          products=${state.products}
          secondLastProduct=${this.secondLastProduct}
          loading=${state.loading}
          currentPageSize=${state.currentPageSize} />
        <${Pagination}
          pages=${state.pages}
          currentPage=${state.currentPage}
          pageSizeOptions=${[state.basePageSize, 24, 36]}
          currentPageSize=${state.currentPageSize}
          loading=${state.loading}
          onPageChange=${this.onPageChange.bind(this)}
          onPageSizeChange=${(pageSize) => this.setState({ currentPageSize: pageSize, currentPage: 1 })} />
      </div>
    </>`;
  }
}

export default ProductListPage;
