import axios from 'axios';  
const api = axios.create({
    baseURL: 'http://localhost:3005/api', // Replace with your backend API URL
    withCredentials: true, // Include cookies in requests
});

// Remove the interceptor since we're using httpOnly cookies for authentication
// The browser will automatically send cookies with requests

export default api;