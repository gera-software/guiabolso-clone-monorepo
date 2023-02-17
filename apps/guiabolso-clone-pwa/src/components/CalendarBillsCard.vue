<template>
    <div class="card" v-if="!isLoading">
        <div class="card-header">
            <h2>Agenda</h2> 
            <router-link :to="{ name: 'bills'}">
              <font-awesome-icon icon="fa-solid fa-arrow-right-long" />
            </router-link>
          </div>
        <div class="card-body">
          <BillList :bills="bills" :isLoading="isLoading"/>
        </div>
    </div>
    <div class="card card--skeleton" v-if="isLoading">
        <div class="card-header">
            <div class="h2"></div>
          </div>
        <div class="card-body">
          <div class="block"></div>
          <div class="block"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useMonthFilterStore } from '../stores/monthFilterStore';
import api from "../config/axios.js";
import { BillStatus, BillType, CalendarBill } from '../config/types';
import BillList from './BillList.vue';

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
    url: `/bills-fetch-by-user?id=${userId}&month=${month}&year=${year}&limit=2`,
  }).then(function (response) {
    console.log(response.data)
    isLoading.value = false
    return response.data
  }).then(bills => {
    return bills.map((transaction : CalendarBill): CalendarBill => { 
      transaction.dueDate = new Date(transaction.dueDate) 
      return transaction 
    })
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  console.log('changed state', monthFilterStore.monthFilter)
  const [ month, year ] = monthFilterStore.monthFilter.split('-')
  const id = userStore.user._id;
  await getBills(id, year, month)
})

function isAtrasado(bill: CalendarBill) {
    if(bill.status === BillStatus.PAID) {
        return false
    }
    
    const dueDateWithoutTime = bill.dueDate.setHours(0, 0, 0, 0)
    const nowDateWithoutTime = (new Date()).setHours(0, 0, 0, 0)

    return (dueDateWithoutTime <= nowDateWithoutTime)
}

function getStatus(bill: CalendarBill) {
    
    if(bill.status === BillStatus.PAID) {
        return  bill.type === BillType.PAYABLE ?  'pago' : 'recebido'
    } else {
        const dueDateWithoutTime = bill.dueDate.setHours(0, 0, 0, 0)
        const nowDateWithoutTime = (new Date()).setHours(0, 0, 0, 0)
        console.log(dueDateWithoutTime, nowDateWithoutTime, dueDateWithoutTime > nowDateWithoutTime )

        if(isAtrasado(bill)) {
            return 'atrasado'
        } else {
            return  bill.type === BillType.PAYABLE ?  'a pagar' : 'a receber'
        }

    }
}

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
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h2 {
  font-weight: 600;
  color: #404040;
  font-size: 22px;
  margin: 0;
}
.card-header a {
  color: #F9386A;
}


.calendar-summary {
    background-color: white;
    margin: 15px 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
                       0px 1px 1px 0px rgba(0, 0, 0, 0.14),
                       0px 2px 1px -1px rgba(0, 0, 0, 0.12);
    border-left: 5px solid gray;
    padding: 15px 15px;
    gap: 8px;
}

.calendar-summary.PAYABLE {
    border-color: #5B64DE;
}

.calendar-summary.RECEIVABLE {
    border-color: #00BD6E;
}

.calendar-summary .row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.calendar-summary .description {
    font-size: 1em;
    color: #454545;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.calendar-summary .amount {
    font-size: 1.3em;
    font-weight: bold;
    color: #222222;
}

.calendar-summary .badge {
    font-size: .7em;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
    background-color: gray;
    border-radius: 10px;
    padding: 2px 15px;
    width: fit-content;
}
.calendar-summary .badge.PAYABLE {
    background-color: #5B64DE;
}
.calendar-summary .badge.RECEIVABLE {
    background-color: #00BD6E;
}
.calendar-summary .badge.ATRASADO {
    background-color: #ED4A4A;
}

.card--skeleton .h2 {
    background-color: rgb(0, 0, 0, 10%);
    height: 30px;
    width: 60%;
    /* margin-bottom: 10px; */
    animation: pulse-bg 1s infinite;
}

.card--skeleton .block {
  background-color: rgb(0, 0, 0, 10%);
  height: 88px;
  width: 100%;
  margin-bottom: 15px;
  animation: pulse-bg 1s infinite;
}

</style>
