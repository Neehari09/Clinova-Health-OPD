import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const queueApi = {
    // Queues
    getQueues: () => API.get('/queues/'),
    createQueue: (data) => API.post('/queues/', data),
    getWaitingTokens: (queueId) => API.get(`/queues/${queueId}/tokens/`),
    addToken: (queueId, data) => API.post(`/queues/${queueId}/add_token/`, data),
    serveNext: (queueId) => API.post(`/queues/${queueId}/serve_next/`),
    getAnalytics: (queueId) => API.get(`/queues/${queueId}/analytics/`),
    getAllCompleted: () => API.get('/queues/all_completed/'),

    // Tokens
    moveTokenUp: (tokenId) => API.post(`/tokens/${tokenId}/move_up/`),
    moveTokenDown: (tokenId) => API.post(`/tokens/${tokenId}/move_down/`),
    cancelToken: (tokenId) => API.post(`/tokens/${tokenId}/cancel/`),
};

export default API;
