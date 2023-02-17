<template>
      <div class="transactions-container" v-if="!isLoading">
        
        <div v-for="(transaction, index) in transactions">
          <div class="date-separator" v-if="index === 0 || transactions[index - 1].date.getUTCDate() !== transaction.date.getUTCDate()">
            <div class="date">
              <h2 class="day">{{ transaction.date.getUTCDate() }}</h2>
              <!-- <h2 class="day">{{ transaction.date.toLocaleString('pt-BR', { day: '2-digit'}) }}</h2> -->
              <!-- <div class="month">{{ transaction.date.toLocaleString('pt-BR', { month: 'short'}) }}</div> -->
              <div class="month">{{ numberToMonth(transaction.date.getUTCMonth()) }}</div>
            </div>
          </div>

          <TransactionSummary :transaction="transaction"></TransactionSummary>
        </div>
        <div v-if="transactions.length == 0">Ainda não há transações</div>

      </div>

      <div class="transactions-container transactions-container--skeleton" v-if="isLoading">
        <div class="transaction" v-for="n in 15">
            <div class="avatar"></div>
            <div style="flex-basis: 100%; margin-left: 20px;">
              <div class="title"></div>
              <div class="subtitle"></div>
            </div>
            <div style="flex-basis: 50%; margin-left: 20px;display: flex;flex-direction: column;align-items: flex-end;">
              <div class="title"></div>
              <div class="subtitle"></div>
            </div>
          </div>
      </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import TransactionSummary from "../components/TransactionSummary.vue";
import { TransactionSummaryDTO } from "../config/types";
import { numberToMonth } from '../config/dateHelper'

defineProps<{
    transactions: TransactionSummaryDTO[],
    isLoading: boolean
}>()



</script>
<style scoped>

.transactions-container {
  padding: 15px;
}

.transactions-container .date-separator {
  padding: 15px 0;
  position: relative;
}

.transactions-container .date-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  left: 50px;
  height: 1px;
  background-color: #AAAAAA;
}


.transactions-container .date-separator .date {
  text-align: center;
  padding-right: 15px;
  max-width: 60px;
}

.transactions-container .date-separator .day {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #AAAAAA;
}
.transactions-container .date-separator .month {
    margin: 0;
    font-size: 12px;
    font-weight: 400;
    color: #AAAAAA;
    text-transform: uppercase;
}


.transactions-container--skeleton {
  /* background-color: red; */
}
.transactions-container--skeleton .transaction {
  display: flex;
  padding: 15px 0;
}

.transactions-container--skeleton .avatar {
  background-color: rgb(0, 0, 0, 10%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse-bg 1s infinite;
}

.transactions-container--skeleton .title {
    background-color: rgb(0, 0, 0, 10%);
    height: 16px;
    width: 70%;
    margin-bottom: 5px;
    animation: pulse-bg 1s infinite;
}
.transactions-container--skeleton .subtitle {
    background-color: rgb(0, 0, 0, 10%);
    height: 19px;
    width: 100%;
    animation: pulse-bg 1s infinite;
}

</style>