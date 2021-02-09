<template>
  <div class="main" id="app">
    <div class="change-day">
      <button @click="setDate('yesterday')">&lt;</button>
      <div>{{state.currentDay}}</div>
      <button @click="setDate('tomorrow')">&gt;</button>
    </div>
    <div>
      <h1>chart of local new confirmed person</h1>
      <apexchart
        width="1000"
        type="bar"
        :options="{ ...state.chartOptions}"
        :series="state.series"
      ></apexchart>
    </div>
    <table>
      <thead>
        <th v-for="col in state.columns" :key="col.key">{{col.text}}</th>
      </thead>
      <tbody>
        <tr v-for="item in state.items" :key="item.gubun">
          <td>{{item.gubun}}</td>
          <td>{{item.localOccCnt}}</td>
          <td>{{item.deathCnt}}</td>
          <td>{{item.incDec}}</td>
          <td>{{item.isolIngCnt}}</td>
        </tr>
      </tbody> 
    </table>
  </div>
</template>

<script>
import API from './assets/scripts/api';
// import BarChart from './components/BarChart';
import { reactive, onMounted, computed } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import moment from 'moment';
export default {
  name: 'App',
  components: {
    // BarChart,
    apexchart: VueApexCharts,
    // BarChart
  },
  setup(){
    const state = reactive({
      items: [],
      columns: [
        {
          key: 'gubun',
          text: '지역'
        },
        {
          key: 'localOccCnt',
          text: '신규확진자'
        },
        {
          key: 'deathCnt',
          text: '사망자'
        },
        {
          key: 'incDec',
          text: '전일대비증감'
        },
        {
          key: 'isolIngCnt',
          text: '격리중인환자수'
        }
      ],
      labels: [],
      dataset: [],
      chartOptions: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: computed(() => state.labels),
        },
      },
      series: [
        {
          name: "신규 확진자",
          data: computed(() => state.dataset),
        },
      ],
      currentDay: moment().format('YYYYMMDD'),
    })
    onMounted(() => {
      fetchData();
    })
    let response = null;
    const fetchData = async () =>{
      response = await API.fetchAPI(state.currentDay, state.currentDay);
      state.items = response.data.response.body.items.item;
      console.log(state.items);
      state.labels = state.items.map(data => data.gubun);
      state.dataset = state.items.map(data => data.localOccCnt);
    }
    let newDay = 0;
    const setDate = (check) => {
      if(check === 'yesterday'){
        newDay -= 1;
        state.currentDay = moment().subtract(Math.abs(newDay), 'days').format('YYYYMMDD');
        console.log(newDay);
        fetchData();
      }else{
        newDay += 1;
        if(newDay < 0){
          state.currentDay = moment().subtract(Math.abs(newDay), 'days').format('YYYYMMDD');  
        }else{
          state.currentDay = moment().add(Math.abs(newDay), 'days').format('YYYYMMDD');
        }
        console.log(newDay);
        fetchData();
      }
    }
    return {
      state,
      fetchData,
      setDate
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.main{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.change-day{
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.change-day div{
  padding: 0 10px 0 10px;
}
table{
  width: 30%;
}
</style>