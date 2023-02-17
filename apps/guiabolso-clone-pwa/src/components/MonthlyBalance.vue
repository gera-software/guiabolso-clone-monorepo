<template>
    <template v-if="monthFilterStore.isCurrentMonthSelected()">
        <div class="monthlyBalance" v-if="!isLoading">
            <div class="container">
                <h2>Contas e cartões</h2>
                <div class="flex">
                    <div class="row">
                        <div class="col1">Saldo das contas</div>
                        <div class="col2">R$ {{ (bankBalance / 100).toFixed(2) }}</div>
                    </div>
                    <div class="row">
                        <div class="col1">Fatura dos cartões</div>
                        <div class="col2">R$ {{ (creditCardBalance / 100).toFixed(2) }}</div>
                    </div>
                    <div class="row">
                        <div class="col1">Dinheiro</div>
                        <div class="col2">R$ {{ (walletBalance / 100).toFixed(2) }}</div>
                    </div>
                    <div class="row">
                        <div class="col1">Total</div>
                        <div class="col2">R$ {{ (totalBalance / 100).toFixed(2) }}</div>
                    </div>
                </div>
                <router-link class="accounts-link" :to="{ name: 'accounts'}">Ir para contas e cartões</router-link>
            </div>
        </div>

        <div class="monthlyBalance monthlyBalance--skeleton" v-if="isLoading">
            <div class="container">
                <div class="h2"></div>
                <div class="p"></div>
                <div class="text"></div>
            </div>
        </div>
    </template>


</template>
<script setup lang="ts">
import api from "../config/axios.js";
import { useUserStore } from '../stores/userStore';
import { useMonthFilterStore } from '../stores/monthFilterStore';
import { ref, computed, onMounted } from "vue";

const userStore =  useUserStore()

const monthFilterStore = useMonthFilterStore()

// TODO só deve exibir o balanco do mes atual!
monthFilterStore.$subscribe(async (mutation, state) => {
  console.log('changed state', state.monthFilter)
  const [ month, year ] = state.monthFilter.split('-')
  const id = userStore.user._id
  await getUserBalance(id)
})

const data = ref<{
  _id: string,
  total: number,
}[]>([])

const isLoading = ref(true)


async function getUserBalance(userId: String) {
    isLoading.value = true
  data.value = await api.guiabolsoApi({
    method: 'get',
    url: `/user-balance?id=${userId}`,
  }).then(function (response) {
    console.log(response.data)
    isLoading.value = false
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  console.log('changed state', monthFilterStore.monthFilter)
  const [ month, year ] = monthFilterStore.monthFilter.split('-')
  const id = userStore.user._id;
  await getUserBalance(id)
})


const walletBalance = computed(() => {
    return data.value.find(el => el._id === 'WALLET')?.total ?? 0
})

const bankBalance = computed(() => {
    return data.value.find(el => el._id === 'BANK')?.total ?? 0
})

const creditCardBalance = computed(() => {
    return data.value.find(el => el._id === 'CREDIT_CARD')?.total ?? 0
})

const totalBalance = computed(() => {
    return walletBalance.value + bankBalance.value + creditCardBalance.value;
})

</script>

<style scoped>

.monthlyBalance {
    background-color: #250048;
}

.container {
    padding: 15px 25px;
    color: white;
}

h2 {
    margin: 0;
    font-weight: 600;
    font-size: 20px;
    /* color: #404040; */
}

.flex {
    display: flex;
    flex-direction: column;
    margin: 10px 0;
}

.row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    overflow: hidden;
    border-bottom: 2px dotted rgba(255, 255, 255, 0.3);
}

.col1 {
    width: 100%;
    overflow: hidden;
}

.col2 {
    font-weight: 600;
    flex-shrink: 0;
    text-align: right;
}

.accounts-link {
    font-size: .9em;
    color: #FB396A;
}

.monthlyBalance--skeleton {
    min-height: 235px;
}

.monthlyBalance--skeleton .h2 {
    background-color: rgb(255, 255, 255, 15%);
    height: 36px;
    width: 80%;
    margin-top: 25px;
    margin-bottom: 10px;
    animation: pulse-bg 1s infinite;
}

.monthlyBalance--skeleton .p {
    background-color: rgb(255, 255, 255, 15%);
    height: 28px;
    width: 60%;
    margin-bottom: 25px;
    animation: pulse-bg 1s infinite;
}
.monthlyBalance--skeleton .text {
    background-color: rgb(255, 255, 255, 15%);
    height: 42px;
    width: 100%;
    margin-bottom: 15px;
    animation: pulse-bg 1s infinite;
}

</style>