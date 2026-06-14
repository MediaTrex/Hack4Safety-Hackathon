import axios from 'axios';
const baseUrl = process.env.REACT_APP_API_URL;

function getAuthToken() {
  const user = localStorage.getItem('sajag_user');
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed?.access_token || null;
  } catch (e) {
    return null;
  }
}

function getHeaders(auth = false) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function get(endpoint, auth = false) {
  try {
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      headers: getHeaders(auth),
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data || error.message || "GET request failed";
    throw new Error(errMsg);
  }
}

export async function post(endpoint, data, auth = false) {
  try {
    const response = await axios.post(`${baseUrl}${endpoint}`, data, {
      headers: getHeaders(auth),
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data || error.message || "POST request failed";
    throw new Error(errMsg);
  }
}
