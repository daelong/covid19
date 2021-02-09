import axios from 'axios';

const BASE_URL = '/openapi/service/rest/Covid19/getCovid19SidoInfStateJson';
const serviceKey = 'MoBGJRgx2xQcXOqyvajr62z%2F1Q8%2BZLLuPtbHbAe%2FecewK39pn%2BC%2BrrzLVdFy1Xb4KNsa4BERX7r7KDHcy9IvBA%3D%3D';

const API = {
    fetchAPI(startCreateDt = 20210204, endCreateDt = 20210204){
        const url = `${BASE_URL}?serviceKey=${serviceKey}&startCreateDt=${startCreateDt}&endCreateDt=${endCreateDt}`;
        return axios.get(url);
    }
}
export default API;