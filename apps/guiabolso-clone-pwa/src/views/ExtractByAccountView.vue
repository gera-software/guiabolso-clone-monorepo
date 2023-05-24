<template>
  <div class="page">
    <AppBar>
      <select class="app-bar-select" v-model="monthFilterStore.monthFilter">
        <option v-for="option in monthFilterStore.monthOptions" :value="option.value">
            {{ option.text }}
        </option>
      </select>
  
      <template #extra>
        <div class="filter-bar">
          <button class="button-toggle" :class="{'button-toggle--active': transactionTypeFilter == TransactionType.INCOME}" @click="toggleIncomeFilter(TransactionType.INCOME)">Rendas</button>
          <button class="button-toggle" :class="{'button-toggle--active': transactionTypeFilter == TransactionType.EXPENSE}" @click="toggleIncomeFilter(TransactionType.EXPENSE)">Gastos</button>
        </div>
      </template>
    </AppBar>
  
      <div class="container">
        <div class="account-info" v-if="account">
          <img v-if="account.imageUrl" class="account-logo" :src="account.imageUrl?.toString()" />
          <img v-else class="account-logo" src="@/assets/ManualAccountIcon.svg" />
          <div>
            <h2 class="title">{{account.institution?.name}}</h2>
            <h3 class="subtitle">{{account.name}}</h3>
          </div>
        </div>
        <TransactionList :transactions="transactions" :isLoading="isLoading"/>
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
import TransactionList from "../components/TransactionList.vue";
import { AccountDTO, TransactionSummaryDTO, TransactionType } from "../config/types";
import { useUserStore } from "../stores/userStore";
import { useRoute } from "vue-router";
import AppBar from '@/components/AppBar.vue'
import FAB from "@/components/FAB.vue";
import { useRouter } from 'vue-router';
import { useMonthFilterStore } from '../stores/monthFilterStore';


const router = useRouter()


const route = useRoute()

const userStore =  useUserStore()
const monthFilterStore = useMonthFilterStore()


monthFilterStore.$subscribe(async (mutation, state) => {
  console.log('changed state', state.monthFilter)
  const [ month, year ] = state.monthFilter.split('-')
  const id = route.params.id.toString()
  await getTransactionsByAccount(id, year, month)
})

const isLoading = ref(true)
const transactions = ref<TransactionSummaryDTO[]>([])

async function getTransactionsByAccount(accountId: String, year: String, month: String) {
  isLoading.value = true
  transactions.value = await api.guiabolsoApi({
    method: 'get',
    url: `/transactions-fetch-by-account?id=${accountId}&month=${month}&year=${year}&transactionType=${transactionTypeFilter.value}`,
  }).then(function (response) {
    console.log(response.data)
    return response.data
  }).then(transactions => {
    isLoading.value = false
    return transactions.map((transaction : TransactionSummaryDTO): TransactionSummaryDTO => { 
      transaction.date = new Date(transaction.date) 
      return transaction 
    })
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  console.log('month filter', monthFilterStore.monthFilter)
  const [ month, year ] = monthFilterStore.monthFilter.split('-')
  const id = route.params.id.toString()
  await getTransactionsByAccount(id, year, month)
})


const account = ref<AccountDTO>()

async function getAccount(accountId: String) {
  account.value = await api.guiabolsoApi({
    method: 'get',
    url: `/account-get?id=${accountId}`
  }).then((response) => {
    console.log(response.data)
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}


onMounted(async () => {
  console.log("accountid", route.params.id)
  const id = route.params.id;
  await getAccount(id.toString())
})

function handleClick() {
    router.push({ name: 'add-transaction' })
}

type TransactionFilter = TransactionType | 'ALL'

const transactionTypeFilter = ref<TransactionFilter>('ALL')

watch(transactionTypeFilter, async (newValue) => {
      console.log('changed state', newValue)
      const [ month, year ] = monthFilterStore.monthFilter.split('-')
      const id = route.params.id.toString()
      await getTransactionsByAccount(id, year, month)
});

function toggleIncomeFilter(type: TransactionFilter) {
  if(transactionTypeFilter.value == type)
  {
    transactionTypeFilter.value = 'ALL'
  } else {
    transactionTypeFilter.value = type
  }
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
  padding-top: 124px;
  padding-bottom: 80px;
}


.filter-bar {
  padding: 15px 15px;
  display: flex;
  gap: 10px;
}

.filter-bar .button-toggle {
  border-radius: 8px;
  border: 1px solid #A9A9A9;
  color: #A9A9A9;
  background-color: transparent;
  padding: 10px 15px;
}

.filter-bar .button-toggle.button-toggle--active {
  border: 1px solid #F92A64;
  background-color: #FFF5F8;
  color: #F92A64;
}


.account-info {
  padding: 20px 15px 0 15px;
  display: flex;
  align-items: center;
  min-height: 70px;
}

.account-info .account-logo {
  border: 1px solid #F2F2F2;
  width: 50px;
  height: 50px;
  border-radius: 100%;
  margin-right: 10px;
}

.account-info .title {
  margin: 0;
  font-family: 'Open Sans';
  font-size: 14px;
  font-weight: 600;
  color: #222222;
}

.account-info .subtitle {
  margin: 0;
  font-family: 'Open Sans';
  font-size: 12px;
  text-transform: uppercase;
  font-weight: normal;
  color: #454545;
}

</style>
