<template>
  <div class="page">
    <input v-model="monthFilter" type="month">

    <!-- <CategoryIcon icon="IncomeBonusIcon" color="red"/>
    <CategoryIcon icon="IncomeLoanIcon" color="blue"/>
    <CategoryIcon icon="NewCategoryIcon" color="green"/>
    <CategoryIcon icon="IncomeOtherIcon" color="green"/>
    <CategoryIcon icon="IncomeWageIcon" color="green"/>
    <CategoryIcon icon="IncomeReturnIcon" color="green"/>
    <CategoryIcon icon="EssentialResidentialBillsIcon" color="green"/>
    <br>
    <CategoryIcon icon="EssentialEducationIcon" color="green"/>
    <CategoryIcon icon="EssentialMarketIcon" color="green"/>
    <CategoryIcon icon="EssentialLivingIcon" color="green"/>
    <CategoryIcon icon="EssentialHealthIcon" color="green"/>
    <CategoryIcon icon="EssentialCommuteIcon" color="green"/>
    <br>
    <CategoryIcon icon="LifestyleRestaurantsIcon" color="red"/>
    <CategoryIcon icon="LifestyleShoppingIcon" color="red"/>
    <CategoryIcon icon="LifestylePersonalCareIcon" color="red"/>
    <CategoryIcon icon="LifestyleWorkExpensesIcon" color="red"/>
    <CategoryIcon icon="LifestyleEmployeesIcon" color="red"/>
    <CategoryIcon icon="LifestyleFamilyIcon" color="red"/>
    <CategoryIcon icon="LifestyleBankTaxesIcon" color="red"/>
    <CategoryIcon icon="LifestyleRecreationIcon" color="red"/>
    <CategoryIcon icon="LifestyleOtherIcon" color="red"/>
    <CategoryIcon icon="LifestyleGiftsIcon" color="red"/>
    <CategoryIcon icon="LifestyleWithdrawalIcon" color="red"/>
    <CategoryIcon icon="LifestyleServicesIcon" color="red"/>
    <CategoryIcon icon="LifestyleTvInternetIcon" color="red"/>
    <CategoryIcon icon="LifestyleTaxesIcon" color="red"/>
    <CategoryIcon icon="LifestyleTravelIcon" color="red"/>
    <br>
    <CategoryIcon icon="LoanPayrollIcon" color="purple"/>
    <CategoryIcon icon="LoanOverdraftIcon" color="purple"/>
    <CategoryIcon icon="LoanBillIcon" color="purple"/>
    <CategoryIcon icon="LoanCreditIcon" color="purple"/>
    <CategoryIcon icon="LoanInterestIcon" color="purple"/>
    <CategoryIcon icon="LoanCardInterestIcon" color="purple"/>
    <CategoryIcon icon="LoanOtherIcon" color="purple"/>
    <br>
    <CategoryIcon icon="BankPostingsApplicationIcon" color="purple"/>
    <CategoryIcon icon="BankPostingsCreditCardIcon" color="purple"/>
    <CategoryIcon icon="BankPostingsRescueIcon" color="purple"/>
    <CategoryIcon icon="BankPostingsTransferIcon" color="purple"/>
    <br>
    <CategoryIcon icon="UncategorizedIcon" color="red"/> -->


    <div class="date-group" v-for="(transactions, dateString) in transactionsGroupedByDate" :key="dateString">
      <h2>{{ new Date(dateString).toLocaleDateString() }}</h2>
      <div class="transaction" v-for="transaction in transactions" :key="transaction._id">
        <div class="col-1">
          <CategoryIcon icon="UncategorizedIcon" color="red"/>
          <div class="flex">
            <span class="category">{{ transaction.category[0].name }}</span>
            <span class="description">{{ transaction.description }}</span> 
          </div>
        </div>
        <div class="col-2">
          <span class="account">{{ transaction.account[0].name }}</span>
          <span class="value">R$ {{ transaction.value }}</span>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, watch, computed  } from 'vue'
import api from '../config/axios.js'
import { onMounted } from 'vue'
import { groupBy } from 'lodash'
import CategoryIcon from '@/components/CategoryIcon.vue'

interface Account {
  _id: String,
  name: String,
}

interface Category {
  _id: String,
  name: String,
}

interface Transaction {
  _id: string;
  account: Array<Account>;
  accountId: String;
  category: Array<Category>;
  categoryId: String;
  comment: String;
  date: String;
  description: String;
  value: Number;
}

const monthFilter = ref('')

watch(monthFilter, async () => {
    const [ year, month ] = monthFilter.value.split('-')
    console.log(year, month)

    await getTransactions(year, month)

})

const transactions = ref<Array<Transaction>>([])

async function getTransactions(year: String, month: String) {
    console.log(year, month)
  return api.guiabolsoApi({
    method: 'get',
    url: `/get-transactions?year=${year}&month=${month}`,
  }).then(function (response) {
    // console.log(response.data)
    transactions.value = response.data
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  monthFilter.value = `${year}-${month.toString().padStart(2, '0')}`

})

const transactionsGroupedByDate = computed(() => {
      // return transactions.value;
      return groupBy(transactions.value, (transaction) => transaction.date )
});

</script>
  
<style scoped>
  .date-group {
    border-bottom: 1px solid black;
    padding: 15px 0;
  }

  .date-group h2 {
    margin: 0;
    padding-left: 15px;
    font-size: 1.2em;
  }

  .date-group .transaction {
    display: flex;
    justify-content: space-between;
    padding: 15px;
  }

  .date-group .col-1 {
    display: flex;
    /* flex-direction: column; */
    flex-direction: row;
    flex-basis: min-content;
    overflow: hidden;
  }

  .date-group .col-2 {
    display: flex;
    flex-direction: column;
    text-align: right;
    flex-shrink: 0;
  }

.date-group .flex {
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    flex-basis: min-content;
    overflow: hidden;
  }

  .date-group  .category {
    font-size: .8em;
    opacity: .7;
    white-space: nowrap;
  }

  .date-group .description {
    font-size: 1em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .date-group  .account {
    font-size: .8em;
    opacity: .7;
  }

  .date-group  .value {
    font-size: 1em;
    font-weight: bold;
  }
</style>
  