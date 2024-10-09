export const ALLOWED_FILTER_PARAMETERS = ['page', 'pageSize'];

export const parseQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const newState = {};
  params.forEach((value, key) => {
    if (!ALLOWED_FILTER_PARAMETERS.includes(key)) {
      return;
    }

    if (key === 'page') {
      newState.currentPage = parseInt(value, 10) || 1;
    } else if (key === 'pageSize') {
      newState.currentPageSize = parseInt(value, 10) || 12;
    } else {
      newState.filters[key] = value.split(',');
    }
  });
  return newState;
};

export const updateQueryParams = (params) => {
  const newParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (!ALLOWED_FILTER_PARAMETERS.includes(key)) {
      return;
    }

    if (Array.isArray(params[key]) && params[key].length > 0) {
      newParams.set(key, params[key].join(','));
    } else if (!Array.isArray(params[key]) && params[key]) {
      newParams.set(key, params[key]);
    }
  });

  const curentParams = new URLSearchParams(window.location.search);
  curentParams.forEach((value, key) => {
    if (!ALLOWED_FILTER_PARAMETERS.includes(key)) {
      newParams.set(key, value);
    }
  });

  window.history.pushState(
    {},
    '',
    `${window.location.pathname}?${newParams.toString()}`,
  );
};

export default parseQueryParams;
