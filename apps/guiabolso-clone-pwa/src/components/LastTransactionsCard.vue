<template>
    <div class="card" v-if="!isLoading">
        <div class="card-header">
            <h2>Últimas transações</h2> 
            <router-link :to="{ name: 'extract'}">
              <font-awesome-icon icon="fa-solid fa-arrow-right-long" />
            </router-link>
          </div>
        <div class="card-body">
          <span v-if="(transactions.length == 0)">Ainda não há transações</span>
          <TransactionSummary v-for="(transaction, index) in transactions" :transaction="transaction" :showDate="true"></TransactionSummary>
        </div>
    </div>
    <div class="card card--skeleton" v-if="isLoading">
        <div class="card-header">
          <div class="h2"></div>
          </div>
        <div class="card-body">
          <div class="transaction">
            <div class="avatar"></div>
            <div style="flex-basis: 100%; margin-left: 20px;">
              <div class="title"></div>
              <div class="subtitle"></div>
            </div>
          </div>
          <div class="transaction">
            <div class="avatar"></div>
            <div style="flex-basis: 100%; margin-left: 20px;">
              <div class="title"></div>
              <div class="subtitle"></div>
            </div>
          </div>
          <div class="transaction">
            <div class="avatar"></div>
            <div style="flex-basis: 100%; margin-left: 20px;">
              <div class="title"></div>
              <div class="subtitle"></div>
            </div>
          </div>
          <div class="transaction">
            <div class="avatar"></div>
            <div style="flex-basis: 100%; margin-left: 20px;">
              <div class="title"></div>
              <div class="subtitle"></div>
            </div>
          </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import api from "../config/axios.js";
import TransactionSummary from '@/components/TransactionSummary.vue'
import { Category, CurrencyCodes, TransactionStatus, TransactionSummaryDTO, TransactionType, AccountData, AccountType } from '../config/types';
import { useMonthFilterStore } from '../stores/monthFilterStore';

const userStore =  useUserStore()
const monthFilterStore = useMonthFilterStore()

const isLoading = ref(true)

monthFilterStore.$subscribe(async (mutation, state) => {
  console.log('changed state', state.monthFilter)
  const [ month, year ] = state.monthFilter.split('-')
  const id = userStore.user.data.id
  await getTransactions(id, year, month)
})

const transactions = ref<TransactionSummaryDTO[]>([])

async function getTransactions(userId: String, year: String, month: String) {
  isLoading.value = true
  transactions.value = await api.guiabolsoApi({
    method: 'get',
    url: `/transactions-fetch-by-user?id=${userId}&month=${month}&year=${year}&limit=4`,
  }).then(function (response) {
    console.log(response.data)
    isLoading.value = false
    return response.data
  }).then(transactions => {
    return transactions.map((transaction : TransactionSummaryDTO): TransactionSummaryDTO => { 
      transaction.date = new Date(transaction.date) 
      return transaction 
    })
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  console.log('changed state', monthFilterStore.monthFilter)
  const [ month, year ] = monthFilterStore.monthFilter.split('-')
  const id = userStore.user.data.id;
  await getTransactions(id, year, month)
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

.card--skeleton {
  min-height: 365px;
}

.card--skeleton .h2 {
    background-color: rgb(0, 0, 0, 10%);
    height: 30px;
    width: 60%;
    animation: pulse-bg 1s infinite;
}

.card--skeleton .transaction {
  display: flex;
  padding: 15px 0;
}

.card--skeleton .avatar {
  background-color: rgb(0, 0, 0, 10%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse-bg 1s infinite;
}

.card--skeleton .title {
    background-color: rgb(0, 0, 0, 10%);
    height: 16px;
    width: 70%;
    margin-bottom: 5px;
    animation: pulse-bg 1s infinite;
}
.card--skeleton .subtitle {
    background-color: rgb(0, 0, 0, 10%);
    height: 19px;
    width: 100%;
    animation: pulse-bg 1s infinite;
}
</style>
