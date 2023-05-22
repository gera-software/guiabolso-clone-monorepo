<template>
    <div class="card" v-if="!isLoading">
        <div class="card-header">
            <h2>Planejamento do mês</h2>
        </div>
        <div class="card-body">
          <h3 class="label">Renda</h3>
          <h4 class="display">R$ {{incomes}}</h4>

          <h3 class="label">Gastos</h3>
          <h4 class="display">R$ {{expenses}}</h4>
        </div>
    </div>
    <div class="card card--skeleton" v-if="isLoading">
        <div class="card-header">
          <div class="h2"></div>
        </div>
        <div class="card-body">
          <div class="text"></div>
          <div class="text"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import api from "../config/axios.js";
import { useMonthFilterStore } from '../stores/monthFilterStore';


const userStore =  useUserStore()
const monthFilterStore = useMonthFilterStore()


monthFilterStore.$subscribe(async (mutation, state) => {
  console.log('changed state', state.monthFilter)
  const [ month, year ] = state.monthFilter.split('-')
  const id = userStore.user.data.id
  await getData(id, year, month)
})

const isLoading = ref(true)

const data = ref<{
  _id: string,
  totalAmount: number,
}[]>([])



async function getData(userId: String, year: String, month: String) {
  isLoading.value = true
  data.value = await api.guiabolsoApi({
    method: 'get',
    url: `/month-planning-chart?id=${userId}&month=${month}&year=${year}`,
  }).then(function (response) {
    console.log(response.data)
    isLoading.value = false
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  console.log('changed state', monthFilterStore.monthFilter)
  const [ month, year ] = monthFilterStore.monthFilter.split('-')
  const id = userStore.user.data.id;
  await getData(id, year, month)
})

const incomes = computed(() => {
  const amount = data.value.find(item => item._id === 'INCOME')?.totalAmount ?? 0
  return Math.abs((amount / 100)).toFixed(2)
})

const expenses = computed(() => {
  const amount = data.value.find(item => item._id === 'EXPENSE')?.totalAmount ?? 0
  return Math.abs((amount / 100)).toFixed(2)
})


</script>

<style scoped>

.card {
  background-color: white;
  margin: 30px 20px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
                       0px 1px 1px 0px rgba(0, 0, 0, 0.14),
                       0px 2px 1px -1px rgba(0, 0, 0, 0.12);

}

.card-header {
  margin-bottom: 15px;
}
.card-header h2 {
  font-weight: 600;
  color: #404040;
  font-size: 22px;
  margin: 0;
}

.label {
  font-size: 1em;
  color: #B2B2B2;
  font-weight: normal;
  margin: 0;
}

.display {
  font-size: 1.6em;
  color: #454545;
  font-weight: 800;
  margin: 0;
  margin-bottom: 20px;
}

.card--skeleton {
  min-height: 240px;
}

.card--skeleton .h2 {
    background-color: rgb(0, 0, 0, 10%);
    height: 30px;
    width: 60%;
    /* margin-bottom: 20px; */
    animation: pulse-bg 1s infinite;
}

.card--skeleton .text {
    background-color: rgb(0, 0, 0, 10%);
    height: 57px;
    width: 100%;
    margin-top: 20px;
    animation: pulse-bg 1s infinite;
}

</style>
