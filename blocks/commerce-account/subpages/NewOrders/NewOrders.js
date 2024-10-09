import { useState, useEffect, useRef } from '../../../../scripts/preact-hooks.js';
import { Fragment, h } from '../../../../scripts/preact.js';
import OrdersList from './OrdersList.js';
import htm from '../../../../scripts/htm.js';
import getCustomer from '../../api/getCustomer.js';
import Pagination from '../../components/Pagination.js';
import { parseQueryParams, updateQueryParams } from '../../helpers/queryParams.js';

const html = htm.bind(h);

const isMobile = window.matchMedia('only screen and (max-width: 900px)').matches;

async function loadCustomer(state) {
  try {
    const response = await getCustomer({
      includeOrders: true,
      pageSize: state.currentPageSize,
      currentPage: state.currentPage,
      sort: { sort_direction: 'DESC', sort_field: 'CREATED_AT' },
    });

    return {
      pages: Math.max(response?.customer?.orders?.page_info.total_pages, 1),
      orders: {
        items: response?.customer?.orders?.items ?? [],
        total: response?.customer?.orders?.items?.length,
      },
      loading: false,
    };
  } catch (e) {
    console.error('Error loading customer orders', e);
    return {
      pages: 1,
      orders: {
        items: [],
        total: 0,
      },
    };
  }
}

function NewOrders() {
  const secondLastOrder = useRef(null);
  const queryParams = parseQueryParams();
  const defaultPageSize = 12;

  const [state, setState] = useState({
    loading: true,
    pages: 1,
    currentPage: 1,
    basePageSize: defaultPageSize,
    currentPageSize: defaultPageSize,
    orders: {
      items: [],
      total: 0,
    },
    ...queryParams,
  });

  const loadState = async (newState) => {
    setState({ ...state, ...newState, loading: false });
  };

  const loadOrders = async () => {
    setState({ ...state, loading: true });
    const newState = await loadCustomer(state);
    await loadState(newState);
  };

  useEffect(() => {
    const initialLoad = async () => {
      if (window.loadCategoryPromise) {
        const newState = await window.loadCategoryPromise;
        await loadState(newState);
      } else {
        await loadOrders();
      }
    };
    initialLoad();

    if ('IntersectionObserver' in window && isMobile && state.orders.items.length === 6 && state.orders.total > 6) {
      const scrollToBottomObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadOrders();
            scrollToBottomObserver.unobserve(entry.target);
          }
        });
      });
      if (secondLastOrder.current) {
        scrollToBottomObserver.observe(secondLastOrder.current);
      }
    }
  }, []);

  useEffect(() => {
    updateQueryParams({
      page: state.currentPage,
      basePageSize: state.basePageSize,
      pageSize: state.currentPageSize,
    });

    loadOrders();
  }, [state.currentPage, state.currentPageSize]);

  const onPageChange = (page) => {
    setState({ ...state, currentPage: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onPageSizeChange = (pageSize) => {
    setState({ ...state, currentPageSize: pageSize, currentPage: 1 });
  };

  return html`<${Fragment}>
    <main class="content">
      <h1>My Orders</h1>
      <section class="account-info">
          <div class="orders-list">
              <div style="overflow-x:auto;">
                  <table aria-labelledby="orders-list">
                      <caption class="sr-only" id="orders-list">Orders</caption>
                      <thead>
                        <tr>
                            <th scope="col">Order Number</th>
                            <th scope="col">Purchase Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <${OrdersList}
                            orders=${state.orders}
                            secondLastOrder=${secondLastOrder}
                            loading=${state.loading}
                            currentPageSize=${state.currentPageSize}
                        />
                      </tbody>
                      
                  </table>
              </div>
          </div>
      </section>
      <${Pagination}
        pages=${state.pages}
        currentPage=${state.currentPage}
        pageSizeOptions=${[state.basePageSize, 24, 36]}
        currentPageSize=${state.currentPageSize}
        loading=${state.loading}
        onPageChange=${onPageChange}
        onPageSizeChange=${onPageSizeChange}
      />
    </main>
  </>`;
}

export default NewOrders;
