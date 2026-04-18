// src/services/api.ts

import axios from 'axios';
import {getItem} from '@/src/services/storage';

const API_URL = 'http://127.0.0.1:8000/';

export const api = axios.create(
    {
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    }
)

// Interceptor for adding the token to the request headers
api.interceptors.request.use(
    async (config) => {

        try {
            const token = await getItem('@stafy_token')

            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }

            return config;
        } catch (error) {
            console.error("Error getting token from storage:", error);
            return config;
        }


    }, (error) => {
        return Promise.reject(error);
    })