<template>
    <div class="page">
        <AppBar title="Novo item na agenda" />
        <div class="container">
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label class="form-label">Tipo</label>
                    <select class="form-input" required v-model="form.type">
                        <option v-for="billType in types" :value="billType.value">{{billType.label}}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Nome da cobrança</label>
                    <input class="form-input" type="text" placeholder="Salário" required v-model="form.description">
                </div>
                <div class="form-group">
                    <label class="form-label">Valor</label>
                    <CurrencyInput class="form-input" required v-model="form.amount" :class="{ 'input-red': form.amount < 0 }"/>
                    <!-- <div class="inline-buttons">
                      <button @click="turnNegative" type="button" class="button button-toggle" :class="{ 'button-toggle--active': form.amount < 0 }">- R$</button>
                      <button @click="turnPositive" type="button" class="button button-toggle" :class="{ 'button-toggle--active': form.amount >= 0 }">+ R$</button>
                    </div> -->
                </div>
                <div class="form-group">
                    <label class="form-label">Data</label>
                    <input class="form-input" type="date" required v-model="form.dueDate" :min="currentDateToUTCString()">
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-input" required v-model="form.status">
                        <option v-for="s in status" :value="s.value">{{s.label}}</option>
                    </select>
                </div>
                <div class="form-group">
                    <button type="submit" class="button" :disabled="loading">Salvar</button>
                </div>
            </form>
        </div>
    </div>
</template>
<script setup lang="ts">
import api from '../config/axios.js'
import AppBar from '@/components/AppBar.vue'
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CurrencyInput from '../components/CurrencyInput.vue'
import { BillStatus, BillType, CalendarBill } from '../config/types';
import { useUserStore } from '../stores/userStore';
import { dateToUTCString, stringToUTCDate, currentDateToUTCString } from '../config/dateHelper';

const router = useRouter()

const userStore =  useUserStore()

const types = [ 
    {
        value: 'PAYABLE',
        label: 'É pra pagar'
    }, 
    {
        value: 'RECEIVABLE',
        label: 'É pra receber'
    }, 
]

const status = [ 
    {
        value: 'PAID',
        label: 'Pago/Recebido'
    }, 
    {
        value: 'WAITING',
        label: 'Aguardando pagamento'
    }, 
]

const form = ref({
    dueDate: currentDateToUTCString(),
    description: '',
    amount: 0, // multiplied by 100 to remove decimals
    status: 'WAITING',
    type: 'PAYABLE',
    userId: '',
    _isDeleted: false,
})

const loading = ref(false)

async function handleSubmit() {
    loading.value = true
    const payload: CalendarBill = {
        description: form.value.description,
        amount: form.value.type === BillType.PAYABLE ? Math.abs(form.value.amount) * -1 : Math.abs(form.value.amount),
        dueDate: stringToUTCDate(form.value.dueDate),
        type: form.value.type as BillType,
        status: form.value.status as BillStatus,
        _isDeleted: false,
        userId: userStore.user.data.id
    }
    await save(payload)
    loading.value = false
    router.back()
}

async function save(payload: CalendarBill): Promise<CalendarBill> {
    console.log('save')
  return api.guiabolsoApi({
    method: 'post',
    url: `/bill-create`,
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

.form-info {
  color: #404040;
  font-family: 'Open Sans';
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  margin: 5px 0;
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

.button:disabled, .button.disabled {
    opacity: .35;
}

</style>