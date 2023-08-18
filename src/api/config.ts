import axios from 'axios'

// export const BASEURL = 'https://localhost:59761';
export let BASEURL = 'http://localhost:7012';
if (import.meta.env.PROD) {
    BASEURL = 'https://midouz.online:8080';
}
const headers = {
    Authorization: `token`,
    'Content-Type': 'application/json'
}

const myAxios = (abortController?: AbortController) => axios.create({ headers: headers, baseURL: BASEURL, signal: abortController?.signal });
export default myAxios;