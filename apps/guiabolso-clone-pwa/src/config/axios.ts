import axios from 'axios';

const guiabolsoApi = axios.create({
    baseURL: '/api',
    timeout: 10000,
  //   headers: {'X-Custom-Header': 'CustomHeader1'}
});

const guiabolsoServer = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL ?? '',
    // timeout: 10000,
  //   headers: {'X-Custom-Header': 'CustomHeader1'}
});

export default {
    guiabolsoApi,
    guiabolsoServer,
}