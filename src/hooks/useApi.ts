import { useCallback, useEffect, useState } from 'react';

type ApiResponse<T> = {
    data: T | null,
    error: unknown,
    refetchData: () => void;
    hasError?: boolean,
    loading: boolean,

}

type UseFetchApiProps<T> = {
    request?: () => Promise<T>,
    dependencies: any[],
    onFinish?: (data: T | null) => void,
    onStart?: () => void,
    onError?: (error: unknown) => void,
    onFinally?: () => void,
    abortController?: AbortController,
}

const useFetchApi = <T>(
    { request, dependencies, onFinish, onStart, onError, abortController, onFinally }: UseFetchApiProps<T>
) => {

    const handleFetchData = useCallback(async () => {
        if (!request) return;
        try {
            onStart && onStart();
            const data = await request();
            setFetchData((prev) => ({ ...prev, data }));
            onFinish && onFinish(data);
        } catch (error) {
            setFetchData((prev) => ({
                ...prev,
                error: error,
                hasError: true,
            }) as ApiResponse<T>);
            onError && onError(error);
        } finally {
            setFetchData(prev => ({ ...prev, loading: false }) as ApiResponse<T>);
            onFinally && onFinally();
        }
    }, dependencies)

    const [fetchData, setFetchData] = useState<ApiResponse<T>>({
        refetchData: () => { handleFetchData() },
        hasError: false,
        loading: false,
    } as ApiResponse<T>);

    useEffect(() => {
        handleFetchData();
        return () => {
            abortController?.abort();
        }
    }, dependencies);

    return fetchData;
}


type apiRequestProps<T> = {
    request: () => Promise<T>,
    onError?: (error: unknown) => void,
    onStart?: () => void,
    onFinish?: (data?: T) => void,
    onFinally?: () => void
}

export const apiRequest = async <T>({ request, onError, onStart, onFinish, onFinally }: apiRequestProps<T>) => {
    let data: T | null = null;
    let error: unknown = null;
    try {
        onStart && onStart();
        var responseData = await request();
        data = responseData;
        onFinish && onFinish(responseData);
    } catch (err) {
        console.error(err);
        onError && onError(err);
        error = err;
    } finally {
        onFinally && onFinally();
    }
    return {
        data, error
    }
}

export default useFetchApi;