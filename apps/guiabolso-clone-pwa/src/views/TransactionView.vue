<template>
  <div class="page">
    <AppBar title="Detalhes da Transação" />
    <div class="container" v-if="!loading">
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label class="form-label">Nome da Transação</label>
                <input class="form-input" type="text" placeholder="Crie um nome para a transação" required v-model="form.description">
            </div>
            <div class="form-group">
                <label class="form-label">Valor</label>
                <CurrencyInput class="form-input" required :disabled="transaction?.syncType === 'AUTOMATIC'" v-model="form.amount" :class="{ 'input-red': form.amount < 0 }"/>
                <div class="inline-buttons" v-if="transaction?.syncType === 'MANUAL'">
                  <button @click="turnNegative" type="button" class="button button-toggle" :class="{ 'button-toggle--active': form.amount < 0 }">- R$</button>
                  <button @click="turnPositive" type="button" class="button button-toggle" :class="{ 'button-toggle--active': form.amount >= 0 }">+ R$</button>
                </div>
            </div>
            <template v-if="transaction?.accountType !== 'CREDIT_CARD'">
              <div class="form-group">
                  <label class="form-label">Data</label>
                  <input class="form-input" type="date" required :disabled="transaction?.syncType === 'AUTOMATIC'" v-model="form.date">
              </div>
            </template>
            <template v-if="transaction?.accountType == 'CREDIT_CARD'">
              <div class="form-group">
                  <label class="form-label">Data da transação</label>
                  <input class="form-input" type="date" required :disabled="transaction?.syncType === 'AUTOMATIC'" v-model="form.creditCardDate">
              </div>
              <div class="form-group" v-if="transaction.category?.name !== 'Pagamento de cartão'">
                  <label class="form-label">Vencimento da fatura</label>
                  <input class="form-input" type="date" required disabled v-model="form.date">
              </div>
            </template>
            <div class="form-group">
                <label class="form-label">Conta</label>
                <select v-if="transaction?.syncType == 'AUTOMATIC'" class="form-input" required disabled="true" v-model="form.accountId">
                    <option v-for="account in accounts" :value="account._id">{{account.name}}</option>
                </select>
                <select v-else class="form-input" required disabled="true" v-model="form.accountId">
                    <option v-for="account in manualAccounts" :value="account._id">{{account.name}}</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Categoria</label>
                <CategoryInput v-model="form.categoryId"/>
            </div>
            <div class="form-group">
                <label class="form-label">Comentários e #tags</label>
                <input class="form-input" type="text" placeholder="Escreva seus comentários e #tags" v-model="form.comment">
            </div>
            <div class="form-group columns">
              <div>
                <label class="form-label">Ignorar transação</label>
                <p class="form-info">A transação não aparecerá nos gráficos ou planejamento</p>
              </div>
              <input type="checkbox" class="checkbox" v-model="form.ignored" />
            </div>
            <div class="form-group">
                <button type="submit" class="button" :disabled="loading">Salvar</button>
            </div>
            <div class="form-group" v-if="transaction?.syncType === 'MANUAL'">
                <button type="button" class="button button-outline" :disabled="loading" @click="handleClickExcluirTransacao">Excluir</button>
            </div>
        </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '../config/axios.js'
import { ref, watch, computed  } from 'vue'
import AppBar from '@/components/AppBar.vue'
import { onMounted } from 'vue';
import { AccountSummaryDTO, AccountType, Category, CurrencyCodes, Transaction, TransactionStatus, TransactionType } from '../config/types';
import { useUserStore } from '../stores/userStore';
import CurrencyInput from '../components/CurrencyInput.vue'
import { useRoute, useRouter } from 'vue-router';
import CategoryInput from '../components/CategoryInput.vue'
import { dateToUTCString, stringToUTCDate } from '../config/dateHelper';

const router = useRouter()
const route = useRoute()

const userStore =  useUserStore()

const transaction = ref<Transaction>()

async function handleClickExcluirTransacao() {
  const result = window.confirm('Deseja realmente excluir a transação?');
  console.log('excluir', route.params.id.toString(), result)
  if(result) {
    await deleteTransaction(route.params.id.toString())
    router.back()
  }
}


async function deleteTransaction(id: string) {
  loading.value = true
  return api.guiabolsoApi({
    method: 'get',
    url: `/transaction-delete?id=${id}`,
  }).then(function (response) {
    console.log(response.data)
    loading.value = false
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}


async function getTransaction(id: string) {
  loading.value = true
  return api.guiabolsoApi({
    method: 'get',
    url: `/transaction-get?id=${id}`,
  }).then(function (response) {
    console.log(response.data)
    transaction.value = response.data
    loading.value = false
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  const transactionId = route.params.id.toString()
  await getTransaction(transactionId)
  console.log(transaction.value)

  if(transaction.value) {
    form.value.description = transaction.value.description || transaction.value.descriptionOriginal || ''
    form.value.amount = transaction.value.amount
    form.value.date = dateToUTCString(new Date(transaction.value.date))
    if(transaction.value.accountType == AccountType.CREDIT_CARD && transaction.value.creditCardDate) {
      form.value.creditCardDate = dateToUTCString(new Date(transaction.value.creditCardDate))
    }
    form.value.accountId = transaction.value.accountId
    form.value.categoryId = transaction.value.category?._id ?? ''
    form.value.comment = transaction.value.comment ?? ''
    form.value.ignored = !!transaction.value.ignored
  }
})


const accounts = ref<AccountSummaryDTO[]>([])

async function getMyAccounts(): Promise<AccountSummaryDTO[]> {
    console.log('get my accounts')
  return api.guiabolsoApi({
    method: 'get',
    url: `/accounts-fetch?id=${userStore.user._id}`,
  }).then(function (response) {
    // console.log(response.data)
    accounts.value = response.data
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

const manualAccounts = computed<AccountSummaryDTO[]>(() => {
  return accounts.value.filter(account => account.syncType == 'MANUAL')
})

onMounted(async () => {
  getMyAccounts()
})

const categories = ref<Category[]>([])

// TODO refactor, not necessary fetch all categories, use getCategoryById()...
async function getCategories(): Promise<Category[]> {
    console.log('get categories')
  return api.guiabolsoApi({
    method: 'get',
    url: `/categories-fetch`,
  }).then(function (response) {
    //   console.log(response.data)
      categories.value = response.data
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
    getCategories()
})

function turnNegative() {
  form.value.amount = Math.abs(form.value.amount ?? 0) * -1
}
    
function turnPositive() {
  form.value.amount = Math.abs(form.value.amount ?? 0)
}

type TransactionForm = {
  description: string,
  amount: number,
  date: string,
  creditCardDate: string,
  accountId: string,
  categoryId: string,
  comment: string,
  ignored: boolean,
}

const form = ref<TransactionForm>({
    description: '',
    amount: 0, // multiplied by 100 to remove decimals
    date: '',
    creditCardDate: '',
    accountId: '',
    categoryId: '',
    comment: '',
    ignored: false,
})

const loading = ref(false)

async function handleSubmit() {
  loading.value = true
    const payload = {
        _id: transaction.value?._id,
        description: form.value.description,
        amount: form.value.amount,
        // currencyCode: CurrencyCodes.BRL,
        date: stringToUTCDate(form.value.date),
        // creditCardDate: null as Date,
        // TODO refactor, not necessary fetch all categories, use getCategoryById()...
        category: categories.value.find(category => category._id === form.value.categoryId),
        type: form.value.amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
        // status: TransactionStatus.POSTED,
        comment: form.value.comment,
        ignored: form.value.ignored,
        accountId: form.value.accountId,
        accountType: accounts.value.find(account => account._id == form.value.accountId)?.type,
        // userId: store.user._id,
        // _isDeleted: false,
    }

    if(payload.accountType == AccountType.CREDIT_CARD) {
      // @ts-ignore
      payload.creditCardDate = stringToUTCDate(form.value.creditCardDate)
    }

    console.log(payload)
    await updateTransaction(payload)
    loading.value = false
    router.back()

}

async function updateTransaction(payload: Object): Promise<Transaction> {
    console.log('update transaction')
  return api.guiabolsoApi({
    method: 'post',
    url: `/transaction-update`,
    data: payload,
  }).then(function (response) {
    console.log(response.data)
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}
</script>

<style scoped>

.container {
  padding-top: 60px;
}


.form-group {
    /* background-color: blue; */
    padding: 18px 15px;
    display: flex;
    flex-direction: column;
}

.form-group.columns {
  flex-direction: row;
}

.form-group .form-label {
    /* background-color: green; */
    font-family: 'Open Sans';
    font-size: 18px;
    font-weight: 600;
    text-align: left;
    color: #404040;
    margin-bottom: 16px;

}

.form-input {
    /* background-color: blueviolet; */
    font-family: 'Open Sans';
    font-size: 20px;
    font-weight: 400;
    text-align: left;
    color: #404040;
    border: none;
    border-bottom: 1px solid black;
    background-color: transparent;
    padding: 8px 0;
    width: 100%;
}

.form-input.input-red {
  color: red;
}
.form-input:disabled {
  opacity: .35;
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

.button.button-toggle {
  border: 1px solid black;
  background-color: transparent;
  color: black;
}

.button.button-toggle--active {
  border: 1px solid black;
  background-color: black;
  color: white;
}

.button:disabled, .button.disabled {
    opacity: .35;
}

.form-info {
  color: #404040;
  font-family: 'Open Sans';
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  margin: 5px 0;
}

.checkbox {
  margin: 0 20px;
}

.inline-buttons {
  padding-top: 20px;
  display: flex;
  gap: 10px;
}
</style>