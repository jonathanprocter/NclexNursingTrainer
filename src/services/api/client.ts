import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://0.0.0.0:4004/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);
