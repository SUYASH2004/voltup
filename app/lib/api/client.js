// lib/api/client.js - Centralized API client with interceptors

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Centralized API client using fetch API
 * Handles request/response interceptors, error handling, and auth tokens
 */
class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * Build full URL
   */
  getFullUrl(endpoint) {
    if (endpoint.startsWith('http')) return endpoint;
    return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }

  /**
   * Execute request interceptors
   */
  async executeRequestInterceptors(config) {
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  /**
   * Execute response interceptors
   */
  async executeResponseInterceptors(response) {
    let finalResponse = response;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = this.getFullUrl(endpoint);
    
    let config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Remove custom properties
    delete config.params;

    // Execute request interceptors
    config = await this.executeRequestInterceptors(config);

    // Build query string
    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      const separator = url.includes('?') ? '&' : '?';
      config.url = url + (queryString ? `${separator}${queryString}` : '');
    } else {
      config.url = url;
    }

    try {
      const response = await fetch(config.url, config);

      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data,
        ok: response.ok,
      };

      // Execute response interceptors
      await this.executeResponseInterceptors(result);

      if (!response.ok) {
        const error = new Error(data?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create singleton instance
const apiClient = new APIClient();

// Default request interceptor: Add auth token
apiClient.addRequestInterceptor((config) => {
  // In client components, we can use next-auth session instead
  // This is a fallback for when session is not available
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('authToken')
    : null;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Default response interceptor: Handle 401 errors
apiClient.addResponseInterceptor((response) => {
  if (response.status === 401) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  return response;
});

export default apiClient;
export { APIClient };
