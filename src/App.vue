<template>
  <div class="main" id="app">
    <div class="change-day">
      <button @click="changeDate('back')">&lt;</button>
      <div>날짜: {{ startDate }}</div>
      <button @click="changeDate('front')">&gt;</button>
      <div>
        <input
          type="radio"
          id="contactChoice1"
          value="day"
          v-model="sortType"
          checked="checked"
        />
        <label for="contactChoice1">일일</label>
        <input
          type="radio"
          id="contactChoice2"
          value="week"
          v-model="sortType"
        />
        <label for="contactChoice2">주간</label>
        <input
          type="radio"
          id="contactChoice3"
          value="month"
          v-model="sortType"
        />
        <label for="contactChoice3">월간</label>
        {{ startDate }} ~ {{ endDate }}
      </div>
    </div>
    <div>
      <h1>chart of local new confirmed person</h1>
      <canvas id="corona-chart"></canvas>
    </div>
    <table>
      <thead>
        <th v-for="col in state.columns" :key="col.key">{{ col.text }}</th>
      </thead>
      <tbody>
        <tr v-for="item in state.items" :key="item.gubun">
          <td>{{ item.gubun }}</td>
          <td>{{ item.localOccCnt }}</td>
          <td>{{ item.deathCnt }}</td>
          <td>{{ item.incDec }}</td>
          <td>{{ item.isolIngCnt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import API from "./assets/scripts/api";
import { reactive, onMounted, onBeforeUpdate, ref, watch } from "vue";
import moment from "moment";
import coronaData from "./components/CoronaData.js";
import Chart from "chart.js";

export default {
  name: "App",
  setup() {
    const sortType = ref("day");
    const endDate = ref(moment().format("YYYYMMDD"));
    const startDate = ref(moment().format("YYYYMMDD"));
    const changeToday = ref(0);
    watch(sortType, () => {
      console.log(endDate.value);
      endDate.value = moment().format("YYYYMMDD");
      changeToday.value = 0;
      if (sortType.value === "day") {
        startDate.value = moment()
          .clone()
          .startOf("day")
          .format("YYYYMMDD");
        fetchData();
      } else if (sortType.value === "week") {
        startDate.value = moment()
          .clone()
          .startOf("week")
          .format("YYYYMMDD");
        avgFetchData();
      } else {
        startDate.value = moment()
          .clone()
          .startOf("month")
          .format("YYYYMMDD");
        avgFetchData();
      }
    });
    const changeDate = (check) => {
      if (check === "back") {
        changeToday.value -= 1;
      } else {
        changeToday.value += 1;
      }
      if (sortType.value === "day") {
        startDate.value = moment()
          .add(changeToday.value, "days")
          .format("YYYYMMDD");
        endDate.value = moment()
          .add(changeToday.value, "days")
          .format("YYYYMMDD");
        fetchData();
      } else if (sortType.value === "week") {
        startDate.value = moment()
          .add(changeToday.value, "weeks")
          .startOf("week")
          .format("YYYYMMDD");
        if (
          moment()
            .add(changeToday.value, "weeks")
            .endOf("week")
            .format("YYYYMMDD") < moment().format("YYYYMMDD")
        ) {
          endDate.value = moment()
            .add(changeToday.value, "weeks")
            .endOf("week")
            .format("YYYYMMDD");
        } else {
          endDate.value = moment().format("YYYYMMDD");
        }
        avgFetchData();
      } else {
        startDate.value = moment()
          .add(changeToday.value, "months")
          .startOf("month")
          .format("YYYYMMDD");
        if (
          moment()
            .add(changeToday.value, "months")
            .endOf("month")
            .format("YYYYMMDD") < moment().format("YYYYMMDD")
        ) {
          endDate.value = moment()
            .add(changeToday.value, "months")
            .endOf("month")
            .format("YYYYMMDD");
        } else {
          endDate.value = moment().format("YYYYMMDD");
        }
        avgFetchData();
      }
    };

    const state = reactive({
      items: [],
      columns: [
        {
          key: "gubun",
          text: "지역",
        },
        {
          key: "localOccCnt",
          text: "신규확진자",
        },
        {
          key: "deathCnt",
          text: "사망자",
        },
        {
          key: "incDec",
          text: "전일대비증감",
        },
        {
          key: "isolIngCnt",
          text: "격리중인환자수",
        },
      ],
      coronaData: {},
    });
    onMounted(() => {
      fetchData();
    });
    onBeforeUpdate(() => {
      createChart("corona-chart", state.coronaData);
    });
    let response = null;
    const fetchData = async () => {
      response = await API.fetchAPI(startDate.value, endDate.value);
      state.items = response.data.response.body.items.item;
      coronaData.data.labels = state.items.map((data) => data.gubun);
      coronaData.data.datasets[0].data = state.items.map(
        (data) => data.localOccCnt
      );
      // console.log(coronaData);
      state.coronaData = coronaData;
    };

    const avgFetchData = async () => {
      response = await API.fetchAPI(startDate.value, endDate.value);
      state.items = response.data.response.body.items.item;
      let a = [];
      let computedDate = state.items.length / 19;
      for (let i = 0; i < 19; i++) {
        a.push(state.items.filter((res) => res.gubun === state.items[i].gubun));
      }
      for (let i = 0; i < a.length; i++) {
        a[i] = {
          gubun: a[i][0].gubun,
          incDec: 0,
          localOccCnt: Math.floor(
            a[i].reduce((prev, curr) => prev + curr.localOccCnt, 0) /
              computedDate
          ),
          deathCnt: Math.floor(
            a[i].reduce((prev, curr) => prev + curr.deathCnt, 0) / computedDate
          ),
          isolIngCnt: Math.floor(
            a[i].reduce((prev, curr) => prev + curr.isolIngCnt, 0) /
              computedDate
          ),
        };
      }
      state.items = a;
      coronaData.data.labels = state.items.map((data) => data.gubun);
      coronaData.data.datasets[0].data = state.items.map(
        (data) => data.localOccCnt
      );
      // console.log(coronaData);
      state.coronaData = coronaData;
    };
    const createChart = (chartId, chartData) => {
      const ctx = document.getElementById(chartId);
      new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    };

    return {
      sortType,
      startDate,
      endDate,
      state,
      fetchData,
      avgFetchData,
      createChart,
      changeToday,
      changeDate,
      // changeType
    };
  },
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
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.change-day {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.change-day div {
  padding: 0 10px 0 10px;
}
table {
  width: 30%;
}
</style>
