<template>
    <div class="barchart" v-if="!isLoading">
        <div class="chartarea">
            <div class="bar" v-for="item in data" :style="{ height: convertToLocalPercent(item.percent) + '%', backgroundColor: item.primaryColor.toString() }"></div>
        </div>
        <div class="y-labels">
            <div class="label" v-for="item in data" :style="{ color: item.primaryColor.toString(), fill: item.primaryColor.toString() }" :title="item.name.toString()">
                <span>R$ {{ (+item.amount / 100).toFixed(0) }}</span>
                <component :is="item.iconName+'Icon'" class="icon"></component>
            </div>
        </div>
    </div>

    <div class="barchart barchart--skeleton" v-if="isLoading">
        <div class="chartarea">
            <div class="bar" style="height:100%"></div>
            <div class="bar" style="height:50%"></div>
            <div class="bar" style="height:70%"></div>
            <div class="bar" style="height:20%"></div>
            <div class="bar" style="height:40%"></div>
        </div>
        <div class="y-labels">
            <div class="label" v-for="n in 5" :style="{   }">
                <span><div class="text"></div></span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import api from "../config/axios.js";
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useMonthFilterStore } from '../stores/monthFilterStore';

const props = defineProps({
    transactionType: String
})

watch(() => props.transactionType, async (newValue) => {
      console.log(
        "Watch props.selected function called with args:",
        newValue
      );

    const [ month, year ] = monthFilterStore.monthFilter.split('-')
    const id = userStore.user._id;
    await getBarChartData(id, year, month, props.transactionType)
});

const userStore =  useUserStore()
const monthFilterStore = useMonthFilterStore()

monthFilterStore.$subscribe(async (mutation, state) => {
  console.log('changed state', state.monthFilter)
  const [ month, year ] = state.monthFilter.split('-')
  const id = userStore.user._id
  await getBarChartData(id, year, month, props.transactionType)
})

const isLoading = ref(false)

type Item = {
    _id: String,
    name: String,
    iconName: String, 
    primaryColor: String,
    amount: number,
    percent: number,
} 

function convertToLocalPercent(percent: number) {
    return 100 * percent / (data.value[0].percent)
}

const data = ref<Item[]>([])

async function getBarChartData(userId: String, year: String, month: String, transactionType: string | undefined) {
    console.log('get', props.transactionType)
    isLoading.value = true
  data.value = await api.guiabolsoApi({
    method: 'get',
    url: `/monthly-spending-by-categories?id=${userId}&month=${month}&year=${year}&transactionType=${props.transactionType}`,
  }).then(function (response) {
    console.log(response.data)
    isLoading.value = false
    return response.data
  })
  .catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  console.log('changed state', monthFilterStore.monthFilter)
  const [ month, year ] = monthFilterStore.monthFilter.split('-')
  const id = userStore.user._id;
  await getBarChartData(id, year, month, props.transactionType)
})

</script>

<style scoped>
.barchart {
    /* background-color: rgb(219, 121, 121); */
    height: 240px;
    padding: 15px;
    overflow-y: auto;
}

.chartarea {
    display: flex;
    height: 140px;
    flex-wrap: nowrap;
    align-items: flex-end;
    border-bottom: 1px solid #E8E8E8;
    width: fit-content;
}

.barchart .bar {
    content: '';
    height: 100%;
    width: 44px;
    background-color: #E8E8E8;
    margin: 0 20px;
    flex-shrink: 0;
    /* border: 1px solid white; */
}

.barchart .y-labels {
    display: flex;
    /* background-color: blue; */
    flex-wrap: nowrap;
    width: fit-content;
    padding-top: 10px;
}

.y-labels .label {
    font-family: 'Open Sans';
    font-weight: 700;
    font-size: 12px;
    /* margin: 0 20px; */
    flex-shrink: 0;
    width: 84px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.y-labels .label .icon {
    margin: 10px;
    /* background-color: rebeccapurple; */
}

.barchart--skeleton .text {
  background-color: rgb(0, 0, 0, 10%);
  height: 22px;
  width: 50px;
  margin: 15px 0;
  animation: pulse-bg 1s infinite;
}

</style>