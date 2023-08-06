import axios from 'axios'

// export const BASEURL = 'https://localhost:59761';
export const BASEURL = 'http://192.168.1.5:7012';
// export const BASEURL = 'https://midouz.online:8080';
const headers = {
    Authorization: `token`,
    'Content-Type': 'application/json'
}

const myAxios = (abortController?: AbortController) => axios.create({ headers: headers, baseURL: BASEURL, signal: abortController?.signal });
export default myAxios;