<template>
    <div class="page">
        <AppBar hideBackButton="true">
            <select class="app-bar-select" v-model="monthFilterStore.monthFilter">
            <option v-for="option in monthFilterStore.monthOptions" :value="option.value">
                {{ option.text }}
            </option>
            </select>
        </AppBar>
        <div class="container">
            <MonthlyBalance></MonthlyBalance>
            <HighestMonthlySpendingCard></HighestMonthlySpendingCard>
            <MonthPlanningCard></MonthPlanningCard>
            <LastTransactionsCard></LastTransactionsCard>
            <CalendarBillsCard></CalendarBillsCard>
    
            <button class="button button-outline" @click="handleLogout">Logout</button>
            v{{ version }} - {{ node_env }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { useUserStore } from '../stores/userStore';
import AppBar from '@/components/AppBar.vue'
import HighestMonthlySpendingCard from '@/components/HighestMonthlySpendingCard.vue'
import MonthPlanningCard from '@/components/MonthPlanningCard.vue'
import LastTransactionsCard from '@/components/LastTransactionsCard.vue'
import CalendarBillsCard from '@/components/CalendarBillsCard.vue'
import MonthlyBalance from '@/components/MonthlyBalance.vue'
import { useRouter } from 'vue-router';
import { useMonthFilterStore } from '../stores/monthFilterStore';

const router = useRouter()

const userStore =  useUserStore()

// logout button
userStore.$subscribe((mutation, state) => {
  console.log('MUTATED STATE', state)
  if(!state.user._id) {
    router.push({ name: 'login'})
  }
})

const monthFilterStore = useMonthFilterStore()


function handleLogout() {
    userStore.logout()
}

// @ts-ignore
const version: string = __APP_VERSION__;
const node_env: string = import.meta.env.MODE

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

.app-bar-select * {
    color: #404040;
}

.container {
    padding-top: 57px;
    padding-bottom: 80px;
}

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

.donut {
    display: flex;
    gap: 10px;
}

.donut-chart path {
    transform-origin: center;
}

.donut-legend {
    list-style-type: none;
    margin: 0;
    padding: 0;
    max-width: 40%;
}

.donut-legend li {
    padding: 10px 0;
    display: flex;
    gap: 10px;
    align-items: center;
}

.donut-legend .label {
    font-size: .8em;
    color: #454545;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.donut-legend .color {
    width: 1em;
    height: 1em;
    background-color: #D9D9D9;
    border-radius: 100%;
    flex-shrink: 0;
}

.button {
    background-color: #F9386A;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Open Sans';
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    padding: 12px 16px;
}

.button.button-outline {
  background-color: transparent;
  color: #F9386A;
}
</style>
