<template>
  <div class="page">
    <AppBar>
        <select class="app-bar-select" v-model="monthFilterStore.monthFilter">
        <option v-for="option in monthFilterStore.monthOptions" :value="option.value">
            Agenda de {{ option.text }}
        </option>
        </select>
    </AppBar>
    <div class="container">
      <BillList :bills="bills" :isLoading="isLoading"/>
    </div>
    <FAB @click="handleClick">
      <font-awesome-icon icon="fa-solid fa-plus" />
    </FAB>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import api from "../config/axios.js";
import { onMounted } from "vue";

import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import AppBar from '@/components/AppBar.vue'
import BillList from '@/components/BillList.vue'
import { CalendarBill } from "../config/types";
import FAB from "@/components/FAB.vue";
import { useMonthFilterStore } from '../stores/monthFilterStore';



const router = useRouter()

const userStore =  useUserStore()
const monthFilterStore = useMonthFilterStore()

monthFilterStore.$subscribe(async (mutation, state) => {
  console.log('changed state', state.monthFilter)
  const [ month, year ] = state.monthFilter.split('-')
  const id = userStore.user._id
  await getBills(id, year, month)
})

const isLoading = ref(true)

const bills = ref<CalendarBill[]>([])

async function getBills(userId: String, year: String, month: String) {
  isLoading.value = true
  bills.value = await api.guiabolsoApi({
    method: 'get',
    url: `/bills-fetch-by-user?id=${userId}&month=${month}&year=${year}`,
  }).then(function (response) {
    console.log(response.data)
    return response.data
  })
  .then(bills => {
    isLoading.value = false
    return bills.map((bill : CalendarBill): CalendarBill => { 
      bill.dueDate = new Date(bill.dueDate) 
      return bill 
    })
  })
  .catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  console.log('changed state', monthFilterStore.monthFilter)
  const [ month, year ] = monthFilterStore.monthFilter.split('-')
  const id = userStore.user._id;
  await getBills(id, year, month)
})

function handleClick() {
    router.push({ name: 'add-bill' })
}


</script>

<style scoped>

.app-bar-select {
    margin: 0;
    font-weight: 600;
    font-size: 22px;
    color: #404040;
    border: none;
    background-color: white;
}

.container {
    padding-top: 60px;
    padding-bottom: 80px;
    margin: 0 15px;
}

</style>
