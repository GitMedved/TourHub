const trimTrailingSlash = (value) => value.replace(/\/$/, '');

const getApiOrigin = () => {
  if (process.env.REACT_APP_API_ORIGIN) {
    return trimTrailingSlash(process.env.REACT_APP_API_ORIGIN);
  }

  if (process.env.REACT_APP_API_URL) {
    return trimTrailingSlash(
      process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
    );
  }

  return 'http://localhost:5001';
};

export const API_ORIGIN = getApiOrigin();

export const API_BASE_URL = process.env.REACT_APP_API_URL || `${API_ORIGIN}/api`;

export const getAssetUrl = (path) => {
  if (!path) return '';

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
