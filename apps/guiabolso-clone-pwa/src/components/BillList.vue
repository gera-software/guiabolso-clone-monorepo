<template>
    <div class="bills-container" v-if="!isLoading">
      
      <div v-for="(bill, index) in bills">
        <div class="date-separator" v-if="index === 0 || bills[index - 1].dueDate.getUTCDate() !== bill.dueDate.getUTCDate()">
          <div class="date">
            <h2 class="day">{{ bill.dueDate.getUTCDate() }}</h2>
            <div class="month">{{ numberToMonth(bill.dueDate.getUTCMonth()) }}</div>
          </div>
        </div>
        <CalendarSummary :bill="bill"></CalendarSummary>
      </div>
      <div v-if="bills.length == 0">Ainda não há contas na agenda</div>

    </div>

    <div class="bills-container bills-container--skeleton" v-if="isLoading">
      <div class="calendar-summary" v-for="n in 7">
        <div class="row">
            <div class="title1"></div>
            <div class="title2"></div>
        </div>
        <div class="subtitle"></div>
    </div>
    </div>
</template>
<script setup lang="ts">
import { CalendarBill } from "../config/types";
import CalendarSummary from '@/components/CalendarSummary.vue'
import { numberToMonth } from "../config/dateHelper";


defineProps<{
  bills: CalendarBill[],
  isLoading: boolean,
}>()
</script>
<style scoped>

.bills-container .date-separator {
padding: 15px 0;
position: relative;
}

.bills-container .date-separator::before {
content: '';
position: absolute;
top: 50%;
right: 0;
left: 50px;
height: 1px;
background-color: #AAAAAA;
}


.bills-container .date-separator .date {
text-align: center;
padding-right: 15px;
max-width: 60px;
}

.bills-container .date-separator .day {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #AAAAAA;
}
.bills-container .date-separator .month {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #AAAAAA;
  text-transform: uppercase;
}

/* .bills-container--skeleton {
  background-color: red;
} */

.bills-container--skeleton .calendar-summary {
    background-color: white;
    margin: 15px 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
                       0px 1px 1px 0px rgba(0, 0, 0, 0.14),
                       0px 2px 1px -1px rgba(0, 0, 0, 0.12);
    padding: 15px 15px;
    gap: 8px;
    min-height: 88px;
}


.bills-container--skeleton .calendar-summary .row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.bills-container--skeleton .calendar-summary .description {
    font-size: 1em;
    color: #454545;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.bills-container--skeleton .calendar-summary .amount {
    font-size: 1.3em;
    font-weight: bold;
    color: #222222;
}

.bills-container--skeleton .calendar-summary .badge {
    font-size: .7em;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
    background-color: gray;
    border-radius: 10px;
    padding: 2px 15px;
    width: fit-content;
}

.bills-container--skeleton  .title1 {
    background-color: rgb(0, 0, 0, 10%);
    height: 16px;
    width: 60%;
    margin-bottom: 5px;
    animation: pulse-bg 1s infinite;
}
.bills-container--skeleton  .title2 {
    background-color: rgb(0, 0, 0, 10%);
    height: 16px;
    width: 20%;
    margin-bottom: 5px;
    animation: pulse-bg 1s infinite;
}

.bills-container--skeleton  .subtitle {
    background-color: rgb(0, 0, 0, 10%);
    height: 28px;
    width: 40%;
    animation: pulse-bg 1s infinite;
}

</style>