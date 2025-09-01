import axios from 'axios';

// The URL provided by your backend colleague
const API_URL = 'https://172.32.3.12:2220/api/account/AuthPPortaloffDptCiv';

/**
 * Logs in a user by making a POST request to the authentication API.
 * @param {string} username - The user's identifier (Pakno).
 * @param {string} password - The user's password.
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const login = async (username, password) => {
  try {
    const response = await axios.post(API_URL, {
      Pakno: username,
      PType: "3", // As per the example parameter
      PasswordHash: password,
    });

    // Assuming a successful response has a truthy value or a specific status.
    // You may need to adjust this based on the actual API response.
    if (response.data && response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.data.message || 'Invalid credentials' };
  } catch (error) {
    console.error("Login API Error:", error);
    const message = error.response?.data?.message || 'An error occurred during login. Please try again.';
    return { success: false, message };
  }
};

