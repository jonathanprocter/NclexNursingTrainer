import { useState } from 'react';
import { api } from '@/services/api/client';

export function useApi<T>() {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async (endpoint: string) => {
        setLoading(true);
        try {
            const response = await api.get<T>(endpoint);
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const mutateData = async (method: 'post' | 'put' | 'delete', endpoint: string, data?: any) => {
        setLoading(true);
        try {
            const response = await api[method](endpoint, data);
            return response.data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        error,
        loading,
        fetchData,
        mutateData
    };
}
