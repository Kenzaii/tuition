/**
 * API Bridge - Frontend to Backend Communication Layer
 * 
 * This file provides a structured way to handle API calls when a backend is implemented.
 * Currently, it uses localStorage for demo purposes, but can be easily modified to use
 * real API endpoints in the future.
 */

// API Configuration - Change these values when implementing a real backend
const API_CONFIG = {
  // Set to true when a real backend is available
  useRealBackend: false,
  
  // Base URL for API endpoints - update this when deploying to production
  baseUrl: 'https://api.edusingapore.com/v1',
  
  // API endpoints
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    userProfile: '/user/profile',
    courses: '/courses',
    bookings: '/bookings',
    contact: '/contact'
  },
  
  // Default request headers
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * API Client for making requests to the backend
 */
class ApiClient {
  constructor(config = API_CONFIG) {
    this.config = config;
    this.authToken = localStorage.getItem('authToken');
  }
  
  /**
   * Set the authentication token for subsequent requests
   * @param {string} token - JWT or other auth token
   */
  setAuthToken(token) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }
  
  /**
   * Get headers for API requests
   * @returns {Object} Headers object
   */
  getHeaders() {
    const headers = { ...this.config.headers };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }
  
  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request payload
   * @returns {Promise} Promise resolving to response data
   */
  async request(endpoint, method = 'GET', data = null) {
    // If using mock backend, use localStorage instead of real API calls
    if (!this.config.useRealBackend) {
      return this.mockRequest(endpoint, method, data);
    }
    
    const url = `${this.config.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
      credentials: 'include'
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'API request failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
  
  /**
   * Mock API request using localStorage (for demo purposes)
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request payload
   * @returns {Promise} Promise resolving to mock response data
   */
  async mockRequest(endpoint, method, data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Handle different endpoints
    switch (endpoint) {
      case this.config.endpoints.login:
        return this.mockLogin(data);
      case this.config.endpoints.register:
        return this.mockRegister(data);
      case this.config.endpoints.userProfile:
        return this.mockUserProfile();
      default:
        return { success: true, message: 'Operation completed successfully' };
    }
  }
  
  /**
   * Mock login functionality
   * @param {Object} data - Login credentials
   * @returns {Object} Mock response
   */
  mockLogin(data) {
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('eduSingaporeUsers') || '[]');
    const user = users.find(u => u.email === data.email);
    
    if (!user || user.password !== data.password) {
      throw new Error('Invalid email or password');
    }
    
    // Generate mock token
    const token = `mock_token_${Date.now()}`;
    this.setAuthToken(token);
    
    const { password, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  }
  
  /**
   * Mock register functionality
   * @param {Object} data - Registration data
   * @returns {Object} Mock response
   */
  mockRegister(data) {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('eduSingaporeUsers') || '[]');
    if (users.some(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password, // In a real app, this would be hashed
      createdAt: new Date().toISOString()
    };
    
    // Save user to localStorage
    users.push(newUser);
    localStorage.setItem('eduSingaporeUsers', JSON.stringify(users));
    
    // Generate mock token
    const token = `mock_token_${Date.now()}`;
    this.setAuthToken(token);
    
    const { password, ...userWithoutPassword } = newUser;
    
    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  }
  
  /**
   * Mock user profile functionality
   * @returns {Object} Mock user profile
   */
  mockUserProfile() {
    if (!this.authToken) {
      throw new Error('Unauthorized');
    }
    
    // In a real app, we would decode the token to get the user ID
    // For demo, we'll just return a mock user profile
    return {
      success: true,
      user: {
        id: '12345',
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '+65 1234 5678',
        role: 'student',
        createdAt: '2023-01-01T00:00:00Z'
      }
    };
  }
}

// Create and export API client instance
const apiClient = new ApiClient();

// Export API service functions
const ApiService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise resolving to user data
   */
  login: async (email, password) => {
    return apiClient.request(
      API_CONFIG.endpoints.login,
      'POST',
      { email, password }
    );
  },
  
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise resolving to user data
   */
  register: async (userData) => {
    return apiClient.request(
      API_CONFIG.endpoints.register,
      'POST',
      userData
    );
  },
  
  /**
   * Get user profile
   * @returns {Promise} Promise resolving to user profile data
   */
  getUserProfile: async () => {
    return apiClient.request(
      API_CONFIG.endpoints.userProfile,
      'GET'
    );
  },
  
  /**
   * Logout user
   */
  logout: () => {
    apiClient.setAuthToken(null);
    localStorage.removeItem('eduSingaporeLoginData');
  }
};

// Make API service available globally
window.ApiService = ApiService;
