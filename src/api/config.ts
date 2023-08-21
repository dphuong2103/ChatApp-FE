import axios from 'axios'
export let BASEURL = 'http://localhost:7012';
// export let BASEURL = 'https://localhost:59284';
if (import.meta.env.PROD) {
    BASEURL = 'https://midouz.online:8080';
}
const headers = {
    Authorization: `token`,
    'Content-Type': 'application/json'
}

const myAxios = (abortController?: AbortController) => {
    const mAxios = axios.create({ headers: headers, baseURL: BASEURL, signal: abortController?.signal })
    mAxios.interceptors.response.use(response => response,
        error => {
            if (error.code === 'ERR_CANCELED') {
                return Promise.resolve({ status: 499 })
            }
            return Promise.reject((error.response && error.response.data) || 'Error')
        }
    );
    return mAxios
};
export default myAxios;