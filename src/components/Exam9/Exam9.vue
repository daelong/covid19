<template>
  <div class="main" id="app">
    <div class="change-day">
      <button @click="changeDate('yesterday')">&lt;</button>
      <div>{{state.endDate}}</div>
      <button @click="changeDate('tomorrow')">&gt;</button>
      <div>
         <input type="radio" id="contactChoice1" value="day" v-model="state.sortType" checked="checked">
          <label for="contactChoice1">일일</label>
          <input type="radio" id="contactChoice2" value="week" v-model="state.sortType" >
          <label for="contactChoice2">주간</label>
          <input type="radio" id="contactChoice3" value="month" v-model="state.sortType" >
          <label for="contactChoice3">월간</label>
          {{state.startDate}}
          {{state.sortType}}
      </div>
    </div>
    <div>
      <h1>chart of local new confirmed person</h1>
      <apexchart
        width="1000"
        type="bar"
        :options="state.chartOptions"
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

import BarChart from './components/BarChart';
import { reactive, onMounted, computed, onBeforeUpdate } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import moment from 'moment';
export default {
  name: 'App',
  components: {
    BarChart,
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
      datacollection: null,
      endDate: moment().format('YYYYMMDD'),
      changeDay: 0,
      sortType: 'day',
      startDate: computed(() => {
         if(state.sortType === 'day'){
          return state.endDate;
        }else if(state.sortType === 'week'){
          console.log(state.sortType);
          let test = 0; 
          let a = moment();
          while(a.clone().subtract(test, 'days').format('dddd') !== 'Monday'){
              test += 1;
            }
          return a.subtract(test, 'days').format('YYYYMMDD');
        }else{
          return moment().clone().startOf('month').format('YYYYMMDD');
        }
      })
    })
    onMounted(() => {
      fetchData();
    })
    onBeforeUpdate(() => {
      fetchData();
      changeType();
      console.log(state.chartOptions.xaxis.categories);
      console.log(state.series);
    })

    // let response = null;
    const fetchData = () => {
      if(state.sortType === 'day'){
        state.items = todayData;
      }else if(state.sortType === 'week'){  
        console.log('week');
        state.items = weekData;
      }else{
        console.log('month');
        state.items = monthData;
      }
      // response = await API.fetchAPI(state.startDate, state.endDate);
      //  state.items = response.data.response.body.items.item;
      // // console.log(state.items);
    }
    const changeDate = (check) => {
      if(check === 'yesterday'){
        state.changeDay -= 1;
        state.endDate = moment().add(state.changeDay, 'days').format('YYYYMMDD');
        // console.log(state.changeDay);
        fetchData();
      }else{
        state.changeDay += 1;
        state.endDate = moment().add(state.changeDay, 'days').format('YYYYMMDD');
        console.log(state.changeDay);
        fetchData();
      }
    }
    const changeType = () => {
       let a = [];
      for(let i = 0; i < 19; i++){
        a.push(state.items.filter(res => res.gubun === state.items[i].gubun)) 
      }
      // console.log(a);
      for(let i = 0; i < a.length; i++){  
        a[i] = { gubun: a[i][0].gubun, incDec: 0, localOccCnt: a[i].reduce((prev, curr) => prev+curr.localOccCnt, 0), deathCnt: a[i].reduce((prev, curr) => prev+curr.deathCnt, 0), };
      }
      state.items = a;
      state.labels = state.items.map(data => data.gubun);
      state.dataset = state.items.map(data => data.localOccCnt);
    }
    return {
      state,
      fetchData,
      changeDate,
      changeType
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