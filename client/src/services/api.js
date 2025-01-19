import axios from 'axios';

const apiUrl = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:4000';

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout to 15 seconds
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 3000; // Increased delay between retries
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here if needed
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, message } = error;
    if (!config || !config.retry) {
      console.error('API Error:', error);
      return Promise.reject(error);
    }

    config.retryCount = config.retryCount || 0;
    if (config.retryCount >= config.retry) {
      console.warn('Network error or timeout detected. Attempting to use cached data if available.');
      return Promise.reject({ useCache: true, originalError: error });
    }

    config.retryCount += 1;
    console.log(`Retrying request (${config.retryCount}/${config.retry}): ${config.url}`);

    const delayRetry = new Promise(resolve => {
      setTimeout(resolve, config.retryDelay(config.retryCount));
    });
    await delayRetry;

    return axiosInstance(config);
  }
);

export default axiosInstance;

