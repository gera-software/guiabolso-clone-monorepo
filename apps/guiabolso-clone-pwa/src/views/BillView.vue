<template>
  <div class="page">
    <AppBar title="Detalhes da cobrança" />
    <div class="container" v-if="!loading">
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label class="form-label">Tipo</label>
                <select class="form-input" required v-model="form.type" disabled>
                    <option v-for="billType in types" :value="billType.value"> {{billType.label}} </option>
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
                <input class="form-input" type="date" required v-model="form.dueDate">
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
            <div class="form-group">
                <button type="button" class="button button-outline" :disabled="loading" @click="handleClickExcluirBill">Excluir</button>
            </div>
        </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '../config/axios.js'
import AppBar from '@/components/AppBar.vue'
import CurrencyInput from '../components/CurrencyInput.vue'
import { BillStatus, BillType, CalendarBill } from '../config/types';
import { onMounted, ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRoute, useRouter } from 'vue-router';
import { dateToUTCString, stringToUTCDate } from '../config/dateHelper';

const userStore =  useUserStore()
const router = useRouter()
const route = useRoute()



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

const bill = ref<CalendarBill>()

const form = ref({
    dueDate: '',
    description: '',
    amount: 0, // multiplied by 100 to remove decimals
    status: '',
    type: '',
    userId: '',
    _isDeleted: false,
})

async function getBill(id: string) {
  loading.value = true
  return api.guiabolsoApi({
    method: 'get',
    url: `/bill-get?id=${id}`,
  }).then(function (response) {
    console.log(response.data)
    bill.value = response.data
    loading.value = false
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}


onMounted(async () => {
  const billId = route.params.id.toString()
  console.log(billId)
  await getBill(billId)

  if(bill.value) {
    form.value.description = bill.value.description
    form.value.amount = Math.abs(bill.value.amount),
    form.value.dueDate = dateToUTCString(new Date(bill.value.dueDate))
    form.value.userId = bill.value.userId
    form.value.status = bill.value.status
    form.value.type = bill.value.type
    form.value._isDeleted = bill.value._isDeleted
  }
})

const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  const payload = {
        _id: bill.value?._id,
        description: form.value.description,
        amount: form.value.type === BillType.PAYABLE ? Math.abs(form.value.amount) * -1 : Math.abs(form.value.amount),
        dueDate: stringToUTCDate(form.value.dueDate),
        // type: form.value.type as BillType,
        status: form.value.status as BillStatus,
        // _isDeleted: false,
        // userId: store.user._id
    }

    console.log(payload)
    await updateBill(payload)
    loading.value = false
    router.back()

}

async function updateBill(payload: Object): Promise<CalendarBill> {
    console.log('update bill')
  return api.guiabolsoApi({
    method: 'post',
    url: `/bill-update`,
    data: payload,
  }).then(function (response) {
    console.log(response.data)
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

async function handleClickExcluirBill() {
  const result = window.confirm('Deseja realmente excluir a cobrança?');
  console.log('excluir', route.params.id.toString(), result)
  if(result) {
    await deleteBill(route.params.id.toString())
    router.back()
  }
}

async function deleteBill(id: string) {
  loading.value = true
  return api.guiabolsoApi({
    method: 'get',
    url: `/bill-delete?id=${id}`,
  }).then(function (response) {
    console.log(response.data)
    loading.value = false
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

.button.button-outline {
  background-color: transparent;
  color: #F9386A;
}

.button:disabled, .button.disabled {
    opacity: .35;
}

</style>