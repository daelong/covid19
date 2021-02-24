<template>
  <div class="main" id="app">
    <div class="change-day">
      <button @click="changeDate('yesterday')">&lt;</button>
      <div>{{state.today}}</div>
      <button @click="changeDate('tomorrow')">&gt;</button>
    </div>
    <div>
      <h1>chart of local new confirmed person</h1>
      <canvas id="corona-chart"></canvas>
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
import { reactive, onMounted, onBeforeUpdate } from 'vue';
// import VueApexCharts from "vue3-apexcharts";
import moment from 'moment';
import coronaData from './components/CoronaData.js';
import Chart from 'chart.js';
export default {
  name: 'App',
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
      coronaData: {},
      today: moment().format('YYYYMMDD'),
      // changeDay: 0,
      // sortType: 'day',
      // sortData: computed(() => {
      //   if(state.sortType === 'day'){
      //     console.log(state.sortType);
      //   }else{
      //     console.log(state.sortType);
      //   }
      //   return state.sortType;
      // })
    })
    onMounted(() => {
      fetchData();
    })
    onBeforeUpdate(() => {
      console.log(state.coronaData);
      createChart('corona-chart', state.coronaData);
    })
    let response = null;
    const fetchData = async () =>{
      response = await API.fetchAPI(state.today, state.today);
      state.items = response.data.response.body.items.item;
      coronaData.data.labels = state.items.map(data => data.gubun);
      coronaData.data.datasets[0].data = state.items.map(data => data.localOccCnt);
      state.coronaData = coronaData;
      console.log(state.coronaData);
      console.log(coronaData);
    }
    const createChart = (chartId, chartData) => {
      const ctx = document.getElementById(chartId);
      new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    }
    // const changeDate = (check) => {
    //   if(check === 'yesterday'){
    //     state.changeDay -= 1;
    //     state.today = moment().add(state.changeDay, 'days').format('YYYYMMDD');
    //     console.log(state.changeDay);
    //     fetchData();
    //   }else{
    //     state.changeDay += 1;
    //       state.today = moment().add(state.changeDay, 'days').format('YYYYMMDD');
    //     console.log(state.changeDay);
    //     fetchData();
    //   }
    // }
    return {
      state,
      fetchData,
      createChart,
      // changeDate,
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