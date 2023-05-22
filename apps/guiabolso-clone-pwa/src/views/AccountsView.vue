<template>
  <div class="page">
    <AppBar>
      <h1>Contas e Cartões</h1>
      <!-- <button class="button" @click="requestSync">
        <font-awesome-icon icon="fa-solid fa-arrows-rotate" />
      </button> -->
    </AppBar>
    <div class="container">

      <template v-if="!isLoading">
        <div class="card">
          <div class="card-header">
            Contas bancárias
          </div>
          <div v-if="!accountsGroupedByType.BANK">Você não tem nenhuma conta bancária!</div>
          <AccountSummary :account="account" v-for="account in accountsGroupedByType.BANK" :key="account._id?.toString()" />
        </div> 
    
        <div class="card">
          <div class="card-header">
            Cartões de Crédito
          </div>
          <div v-if="!accountsGroupedByType.CREDIT_CARD">Você não tem nenhum cartão de crédito!</div>
          <AccountSummary :account="account" v-for="account in accountsGroupedByType.CREDIT_CARD" :key="account._id?.toString()" />
        </div> 
    
        <div class="card">
          <div class="card-header">
            Carteiras
          </div>
          <div v-if="!accountsGroupedByType.WALLET">Você não tem nenhuma carteira manual!</div>
          <AccountSummary :account="account" v-for="account in accountsGroupedByType.WALLET" :key="account._id?.toString()" />
        </div>
    
        <!-- <button @click="openPluggyConnectWidget">add item</button> -->
      </template>


      <template v-if="isLoading">
        <div class="card card--skeleton">
          <div class="card-header">
            <div class="h2"></div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
        </div>
        <div class="card card--skeleton">
          <div class="card-header">
            <div class="h2"></div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
        </div>
        <div class="card card--skeleton">
          <div class="card-header">
            <div class="h2"></div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
          <div class="account">
            <div class="avatar"></div>
            <div style="flex-basis: 100%">
              <div class="title"></div>
              <div class="subtitle"></div>
              <div class="p"></div>
            </div>
          </div>
        </div>
      </template>
  
      
    </div>
  
    <FAB @click="() => { $router.push({ name: 'accounts-connect'}) }">
      <font-awesome-icon icon="fa-solid fa-plus" />
    </FAB>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed  } from 'vue'
import api from '../config/axios.js'
import { onMounted } from 'vue'
import { groupBy } from 'lodash'
import { AccountSummaryDTO } from '../config/types';
import { useUserStore } from '../stores/userStore';
import AccountSummary from '@/components/AccountSummary.vue';
import AppBar from '@/components/AppBar.vue'
import FAB from "@/components/FAB.vue";
import { useRouter } from 'vue-router';

const router = useRouter()


const userStore =  useUserStore()

const isLoading = ref(true)

const accounts = ref<AccountSummaryDTO[]>([])

const accountsGroupedByType = computed(() => {
  return groupBy(accounts.value, (accounts) => accounts.type )
});

async function getMyAccounts(): Promise<AccountSummaryDTO[]> {
  isLoading.value = true
    console.log('get my accounts')
  return api.guiabolsoApi({
    method: 'get',
    url: `/accounts-fetch?id=${userStore.user.data.id}`,
  }).then(function (response) {
    console.log(response.data)
    accounts.value = response.data
    isLoading.value = false
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
  getMyAccounts()
})


/**
 * @deprecated
 */
function requestSync() {
  console.log('requested sync')
  return api.guiabolsoApi({
    method: 'get',
    url: `/connectors-update?userId=${userStore.user.data.id}`,
  }).then(function (response) {
    console.log(response.data)
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}


async function getConnectToken(itemId?: string | undefined) {
    return api.guiabolsoApi({
        method: 'get',
        url: '/pluggy-connect-token',
        params: {
            itemId: itemId ?? ''
        }
    }).then((response) => {
        // console.log(response)
        return response.data.accessToken
    })
}

/**
 * @deprecated
 */
async function openPluggyConnectWidget() {
    const accessToken: string = await getConnectToken()

    // configure the Pluggy Connect widget instance
    // @ts-ignore
    const pluggyConnect = new PluggyConnect({
    connectToken: accessToken,
    connectorTypes: ['PERSONAL_BANK'],
    // updateItem: existingItemIdToUpdate, // by specifying the Item id to update here, Pluggy Connect will attempt to trigger an update on it, and/or prompt credentials request if needed.
    includeSandbox: true, // note: not needed in production
    onSuccess: (itemData: Object) => {
        // TODO: Implement logic for successful connection
        // The following line is an example, it should be removed when implemented.
        console.log('Yay! Pluggy connect success!', itemData);
        //@ts-ignore
        // item.value = itemData.item
    },
    onError: (error: Object) => {
        // TODO: Implement logic for error on connection
        // The following line is an example, it should be removed when implemented.
        console.error('Whoops! Pluggy Connect error... ', error);
    },
    onEvent: (object: Object) => {
      console.log(object)
    } 
    });

    // Open Pluggy Connect widget
    pluggyConnect.init();
}

</script>
  
<style scoped>
.app-bar h1 {
    margin: 0;
    font-weight: 600;
    font-size: 22px;
    color: #404040;
}

.button {
    color: #F9386A;
    border: none;
    margin: 0 10px;
    padding: 7px;
    background-color: transparent;
    cursor: pointer;
}

.container {
  padding-top: 60px;
  padding-bottom: 80px;
}

.card {
  background-color: white;
  margin: 30px 0;
  padding: 20px;
  padding-bottom: 0;
}

.card-header {
  font-weight: 600;
  color: #404040;
  font-size: 22px;
  margin-bottom: 15px;
}


.card--skeleton .h2 {
  background-color: rgb(0, 0, 0, 10%);
  height: 30px;
  width: 60%;
  margin-bottom: 15px;
  animation: pulse-bg 1s infinite;
}

.card--skeleton .account {
  display: flex;
  gap: 10px;
  padding: 15px 0;
}

.card--skeleton .avatar {
  background-color: rgb(0, 0, 0, 10%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse-bg 1s infinite;
}

.card--skeleton .title {
    background-color: rgb(0, 0, 0, 10%);
    height: 16px;
    width: 70%;
    margin-bottom: 5px;
    animation: pulse-bg 1s infinite;
}
.card--skeleton .subtitle {
    background-color: rgb(0, 0, 0, 10%);
    height: 30px;
    width: 50%;
    margin-bottom: 15px;
    animation: pulse-bg 1s infinite;
}
.card--skeleton .p {
    background-color: rgb(0, 0, 0, 10%);
    height: 16px;
    width: 90%;
    margin-bottom: 5px;
    animation: pulse-bg 1s infinite;
}

</style>
  