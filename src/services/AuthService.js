import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

const AuthService = {
  signup: async (userData) => {
    try {
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.staffLevel,
        department: userData.department.toUpperCase(),
      };
      const response = await axios.post(`${API_BASE_URL}/signup`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: credentials.username,
        password: credentials.password,
      });

      let token = null;

      // 1. Check response headers for Authorization or x-auth-token
      if (response.headers && response.headers.authorization) {
        token = response.headers.authorization.replace('Bearer ', '');
      } else if (response.headers && response.headers['x-auth-token']) {
        token = response.headers['x-auth-token'];
      } else if (response.headers && response.headers['x-access-token']) {
        token = response.headers['x-access-token'];
      }
      // 2. Check response body if data is a JWT string
      else if (response.data && typeof response.data === 'string' && response.data.startsWith('eyJ')) {
        token = response.data;
      }
      // 3. Check response body for token property
      else if (response.data && response.data.token) {
        token = response.data.token;
      }
      // 4. Check for jwt property
      else if (response.data && response.data.jwt) {
        token = response.data.jwt;
      }

      if (token) {
        console.log('JWT Token fetched from backend after login:', token);
        localStorage.setItem('token', token);
        return { success: true, token, data: response.data };
      } else {
        console.log('No JWT token found in response. Response data:', response.data);
        // Still return success if login message indicates success
        if (typeof response.data === 'string' && response.data.toLowerCase().includes('success')) {
          localStorage.setItem('loginMessage', response.data);
          return { success: true, data: response.data };
        }
        throw new Error('Login successful but no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Login failed';
      const err = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('loginMessage');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default AuthService;
