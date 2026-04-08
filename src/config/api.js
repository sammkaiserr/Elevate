const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const apiFetch = async (endpoint, options = {}) => {
  const headers = { ...options.headers };
  

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (window.Clerk && window.Clerk.session) {
    try {
      const token = await window.Clerk.session.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Could not retrieve Clerk token', err);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = 'Unknown API Error';
    try {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        errorData = json.error || json.message || JSON.stringify(json);
      } catch {
        errorData = text;
      }
    } catch (e) {
      console.warn('Failed to parse error response body', e);
    }
    throw new Error(`API Error ${response.status}: ${errorData}`);
  }

  if (response.status === 204) return null;
  
  return response.json();
};
