import axios from 'axios';

const api = axios.create({
//    baseURL: 'http://10.1.16.58/api',
baseURL: '/api',
    //baseURL: 'http://181.224.197.175/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 1. INTERCEPTOR DE SOLICITUD (Envia el token)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. INTERCEPTOR DE RESPUESTA (Maneja el error 401 Automáticamente)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor dice "401 Unauthorized" (Token vencido o inválido)
        if (error.response && error.response.status === 401) {
            console.warn("⚠️ Sesión expirada o inválida. Cerrando sesión...");
            
            // BORRAMOS TODO AUTOMÁTICAMENTE
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // REDIRIGIMOS AL LOGIN SI NO ESTAMOS YA AHÍ
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
