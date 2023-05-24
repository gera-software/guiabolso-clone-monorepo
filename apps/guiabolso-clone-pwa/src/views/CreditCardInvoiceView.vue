<template>
    <div class="page">
        <AppBar>
            <select class="app-bar-select" v-model="selectedInvoiceId">
                <option v-for="option in referenceOptions" :value="option.value">
                    {{ option.text }}
                </option>
            </select>
                
            <template #extra>
                <div class="account-info" v-if="account">
                <img v-if="account.imageUrl" class="account-logo" :src="account.imageUrl?.toString()" />
                <img v-else class="account-logo" src="@/assets/ManualAccountIcon.svg" />
                <div>
                    <h2 class="title">{{account.creditData?.institution?.name}} {{account.creditData?.brand}}</h2>
                    <h3 class="subtitle">{{account.name}}</h3>
                </div>
            </div>

            <div class="invoice-info" v-if="selectedInvoice">
                <div>
                    <h3 class="label">Total</h3>
                    <h4 class="display"> R$ {{ (+totalAmount / 100).toFixed(2) }}</h4>
                </div>
                <div>
                    <h3 class="label">Fechamento</h3>
                    <h4 class="display">{{ `${(''+selectedInvoice.closeDate.getUTCDate()).padStart(2, '0')}/${(selectedInvoice.closeDate.getUTCMonth()+1).toString().padStart(2, '0')}/${selectedInvoice.closeDate.getUTCFullYear()}` }}</h4>
                </div>
                <div>                  
                    <h3 class="label">Vencimento</h3>
                    <h4 class="display">{{ `${(''+selectedInvoice.dueDate.getUTCDate()).padStart(2, '0')}/${(selectedInvoice.dueDate.getUTCMonth()+1).toString().padStart(2, '0')}/${selectedInvoice.dueDate.getUTCFullYear()}` }}</h4>
                </div>
            </div>
            </template>
        </AppBar>
        <div class="container">
            <CreditCardTransactionList :transactions="transactions" :isLoading="false"></CreditCardTransactionList>
        </div>
        <FAB @click="handleClick">
          <font-awesome-icon icon="fa-solid fa-plus" />
        </FAB>
    </div>
</template>

<script setup lang="ts">
import AppBar from '@/components/AppBar.vue'
import api from "../config/axios.js";
import CreditCardTransactionList from '@/components/CreditCardTransactionList.vue'
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AccountDTO, AccountSyncType, AccountType, CreditCardInvoice, CurrencyCodes, InstitutionType, Transaction } from '../config/types';
import { currentDateToUTCString, numberToMonth } from '../config/dateHelper';
import FAB from "@/components/FAB.vue";

const router = useRouter()

const route = useRoute()


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

const totalAmount = computed(() => {
  return transactions.value.reduce((accumulator: number, transaction: Transaction) => {
    return accumulator += transaction.amount.valueOf()
  }, 0)
})

const invoices = ref<CreditCardInvoice[]>([])

async function getInvoicesByAccount(accountId: String) {
    invoices.value = await api.guiabolsoApi({
    method: 'get',
    url: `/credit-card-invoices-fetch-by-account?accountId=${accountId}`
  }).then((response) => {
    return response.data
  }).then((invoice) => {
    return invoice.map((invoice: CreditCardInvoice) : CreditCardInvoice => {
        invoice.closeDate = new Date(invoice.closeDate)
        invoice.dueDate = new Date(invoice.dueDate)
        return invoice
    } )
  })
  .catch(function (error) {
    console.log(error.response?.data);
  })
}

const selectedInvoiceId = ref('')

const selectedInvoice = computed<CreditCardInvoice>(() => {
    return invoices.value.find((invoice : CreditCardInvoice) => invoice._id == selectedInvoiceId.value) as CreditCardInvoice
})

onMounted(async () => {
    console.log(route.params.accountId.toString())
    await getAccount(route.params.accountId.toString())

    if(account.value?._id) {
        await getInvoicesByAccount(account.value._id)

        const currentDate = new Date()
        const currentInvoice = invoices.value.find((invoice: CreditCardInvoice) => invoice.dueDate.getUTCMonth() == currentDate.getMonth() && invoice.dueDate.getUTCFullYear() == currentDate.getFullYear() )
        console.log('currentInvoice', currentInvoice?.dueDate.toISOString())
        if(currentInvoice?._id) {
            selectedInvoiceId.value = currentInvoice._id
        }
    }
})

const referenceOptions = computed(() => {
    return invoices.value.map((invoice : CreditCardInvoice) => ({
        text: `${ numberToMonth(invoice.dueDate.getUTCMonth())}/${invoice.dueDate.getUTCFullYear()}`,
        value: invoice._id
    }))
})

const transactions = ref<Transaction[]>([])

async function getTransactionsByInvoice(invoiceId: String) {
  transactions.value = await api.guiabolsoApi({
    method: 'get',
    url: `/transactions-fetch-by-credit-card-invoice?id=${invoiceId}`
  }).then((response) => {
    return response.data
  }).then((transaction) => {
    return transaction.map((transaction: Transaction) : Transaction => {
        transaction.date = new Date(transaction.date)
        transaction.invoiceDate = new Date(transaction.invoiceDate ?? '')
        return transaction
    } )
  })
  .catch(function (error) {
    console.log(error.response?.data);
  })
}


watch(selectedInvoiceId, async (invoiceId) => {
  console.log('WATCH SELECTED ID', invoiceId)
  await getTransactionsByInvoice(invoiceId)
})

function handleClick() {
    router.push({ name: 'add-transaction' })
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
  padding-top: 196px;
  padding-bottom: 80px;
}


.account-info {
  padding: 0 15px;
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

.invoice-info {
    /* background-color: red; */
    display: flex;
    padding: 15px;
    gap: 20px;
    flex-wrap: wrap;
}

.label {
  font-size: .8em;
  color: #B2B2B2;
  font-weight: normal;
  margin: 0;
}

.display {
    font-size: .8em;
  /* font-size: 1.6em; */
  color: #454545;
  /* font-weight: 800; */
  margin: 0;
  /* margin-bottom: 20px; */
}

</style>