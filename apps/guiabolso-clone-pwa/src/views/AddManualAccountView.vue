<template>
  <div class="page">
    <AppBar title="Nova conta manual" />

    <div class="container">
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label class="form-label">Qual o nome da conta?</label>
                <input class="form-input" type="text" placeholder="Economias" required v-model="form.name">
            </div>
            <div class="form-group">
                <label class="form-label">Tipo de conta</label>
                <select class="form-input" required v-model="form.type">
                    <option v-for="accountType in accountTypes" :value="accountType.value">{{accountType.label}}</option>
                </select>
            </div>
            <template v-if="form.type == 'WALLET' || form.type == 'BANK'">
              <div class="form-group">
                  <label class="form-label">Qual é o saldo atual dessa conta?</label>
                  <CurrencyInput class="form-input" required v-model="form.amount" :class="{ 'input-red': form.amount < 0 }"/>
                  <div class="inline-buttons">
                    <button @click="turnNegative" type="button" class="button button-toggle" :class="{ 'button-toggle--active': form.amount < 0 }">- R$</button>
                    <button @click="turnPositive" type="button" class="button button-toggle" :class="{ 'button-toggle--active': form.amount >= 0 }">+ R$</button>
                  </div>
              </div>
            </template>
            <template v-if="form.type == 'CREDIT_CARD'">
              <div class="form-group">
                <label class="form-label">Qua a bandeira do cartão?</label>
                <select class="form-input" required v-model="form.creditCardInfo.brand">
                    <option v-for="brandType in creditCardBrandTypes" :value="brandType.value">{{brandType.label}}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Qual o limite do cartão?</label>
                <CurrencyInput class="form-input" required v-model="form.creditCardInfo.creditLimit"/>
              </div>
              <div class="form-group">
                <label class="form-label">E o limite disponível atualmente?</label>
                <CurrencyInput class="form-input" required v-model="form.creditCardInfo.availableCreditLimit"/>
              </div>
              <div class="form-group">
                <label class="form-label">Qual o valor da fatura atual?</label>
                <CurrencyInput class="form-input" required v-model="form.amount"/>
              </div>
              <!-- <div class="form-group">
                <label class="form-label">E o valor total das próximas faturas?</label>
                <CurrencyInput class="form-input" required v-model="form.creditCardInfo.nextInvoices"/>
              </div> -->
              <div class="form-group">
                <label class="form-label">Qual o dia do vencimento?</label>
                <input class="form-input" type="number" required v-model="form.creditCardInfo.dueDay" min="1" max="31">
              </div>
              <div class="form-group">
                <label class="form-label">E o dia do fechamento? (melhor dia de compra)</label>
                <input class="form-input" type="number" required v-model="form.creditCardInfo.closeDay" min="1" max="31">
              </div>
            </template>

            <div class="form-group">
                <button type="submit" class="button" :disabled="loading">Criar conta manual</button>
            </div>
        </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppBar from '@/components/AppBar.vue'
import CurrencyInput from '../components/CurrencyInput.vue'
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { AccountDTO, AccountSyncType, CurrencyCodes } from '../config/types';
import api from '../config/axios.js'
import { useRouter } from 'vue-router';

const userStore =  useUserStore()

const router = useRouter()


const accountTypes = [
    { label: 'Carteira', value: 'WALLET' },
    { label: 'Conta bancária', value: 'BANK' },
    { label: 'Cartão de crédito', value: 'CREDIT_CARD' },
]

const creditCardBrandTypes = [
    { label: 'Mastercard', value: 'Mastercard' },
    { label: 'Visa', value: 'Visa' },
    { label: 'Elo', value: 'Elo' },
]

const form = ref({
    name: '',
    type: 'WALLET',
    amount: 0, // multiplied by 100 to remove decimals
    creditCardInfo: {
      brand: 'Mastercard',
      creditLimit: 0,
      availableCreditLimit: 0,
      // currentInvoice: 0,
      // nextInvoices: 0,
      closeDay: 3,
      dueDay: 10,
    }
})

function turnNegative() {
  form.value.amount = Math.abs(form.value.amount ?? 0) * -1
}
    
function turnPositive() {
  form.value.amount = Math.abs(form.value.amount ?? 0)
}

const loading = ref(false)

async function handleSubmit() {
    loading.value = true
    const payload = {
        name: form.value.name,
        type: form.value.type,
        initialBalance: form.value.type == 'WALLET' || form.value.type == 'BANK' ? form.value.amount : 0,
        // balance: form.value.type == 'WALLET' || form.value.type == 'BANK' ? form.value.amount : 0,
        balance: form.value.amount,
        userId: userStore.user.data.id,
        imageUrl: '',
        syncType: AccountSyncType.MANUAL,
        currencyCode: CurrencyCodes.BRL,
        _isDeleted: false,
    }

    if(form.value.type == 'CREDIT_CARD') {
      payload.balance = -form.value.amount, // o balanço do cartão de credito deve ser negativo

      //@ts-ignore
      payload.creditCardInfo = {
        brand: form.value.creditCardInfo.brand,
        closeDay: form.value.creditCardInfo.closeDay,
        dueDay: form.value.creditCardInfo.dueDay,
        creditLimit: form.value.creditCardInfo.creditLimit,
        availableCreditLimit: form.value.creditCardInfo.availableCreditLimit + form.value.amount, // descontando do limite disponível o valor das transações do mes atual (que ainda deverão ser cadastradas manualmente)
      }
    }

    console.log(payload)
    await saveAccount(payload)
    loading.value = false
    router.push({ name: 'accounts'})


}

async function saveAccount(payload: Object): Promise<AccountDTO> {
    console.log('save ')
  return api.guiabolsoApi({
    method: 'post',
    url: `/account-create`,
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