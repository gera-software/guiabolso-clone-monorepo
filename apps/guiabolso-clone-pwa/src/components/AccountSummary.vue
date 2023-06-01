<template>
        <div class="account" @click="goToExtract(account)">
          <div class="col-1">
            <img v-if="account.imageUrl" class="account-logo" :src="account.imageUrl?.toString()" />
            <img v-else class="account-logo" src="@/assets/ManualAccountIcon.svg" />
            <div>
              <div class="name">{{account.name}}</div>
              <div class="balance">R$ {{ (+account.balance / 100).toFixed(2) }}</div>
              <div class="date" v-if="account.syncType === 'AUTOMATIC'">
                <font-awesome-icon icon="fa-solid fa-arrows-rotate" /> Atualizado em {{ (new Date(""+account.synchronization?.lastMergeAt)).toLocaleString() }} 
                <span class="badge" v-if="account.synchronization">{{account.synchronization.syncStatus}}</span> 
              </div>
              <div class="date" v-else><font-awesome-icon icon="fa-solid fa-user" /> Conta manual</div>
            </div>
          </div>
          <div class="col-2">
            <button v-if="account.syncType === 'AUTOMATIC'" class="icon-button" @click="requestUpdate(account, $event)">
              <font-awesome-icon icon="fa-solid fa-arrows-rotate" />
              <!-- <font-awesome-icon icon="fa-solid fa-arrows-rotate" :spin="account.sync?.syncStatus != SyncStatus.SYNCED"/> -->
            </button>
            <button class="icon-button" @click="openMoreDialog">
              <font-awesome-icon icon="fa-solid fa-ellipsis-vertical" />
            </button>
          </div>
        </div>
        <Teleport to="body">
            <BottomSheet v-model="isBottomSheetOpen">
              <div class="bottom-sheet__header">
                <h2 class="title">{{account.name}}</h2>
                <button class="icon-button" @click="() => isBottomSheetOpen = false">
                    <font-awesome-icon icon="fa-solid fa-xmark" />
                </button>
              </div>
              <div class="bottom-sheet__body">
                <ul class="menu-options">
                  <li @click="handleClickDeleteAccount">
                    Excluir conta
                  </li>
                </ul>
              </div>
            </BottomSheet>
        </Teleport>
        <div class="syncingModal" v-if="showSyncingModal">
            <font-awesome-icon icon="fa-solid fa-arrows-rotate" :spin="true" size="2xl"></font-awesome-icon>
            <p>{{ currentStep }}</p>
        </div>

</template>
<script setup lang="ts">
import { AccountSummaryDTO, AccountType, Synchronization } from '../config/types';
import { useRouter } from 'vue-router';
import api from '../config/axios.js'
import BottomSheet from '@/components/BottomSheet.vue'
import { ref } from 'vue';
import { dateToUTCString } from '../config/dateHelper';
import { Item } from 'pluggy-sdk';
import { useUserStore } from '../stores/userStore';

const props = defineProps<{
    account: AccountSummaryDTO
}>()

const userStore = useUserStore()

const showSyncingModal = ref(false)
const currentStep = ref('Conectando com a instituição financeira')

// function closeModal(e: any) {
//   console.log('fehcar o modal')
//   isBottomSheetOpen.value = false
// }

const router = useRouter()

function goToExtract(account: AccountSummaryDTO) {
  console.log(account.type)
  if(account.type == AccountType.CREDIT_CARD) {
    router.push({
      name: 'creditcard-invoice',
      params: {
        accountId: account._id?.toString()
      }
    })
  } else {
    router.push({
      name: 'extract-by-account',
      params: {
        id: account._id?.toString()
      }
    })
  }
}

async function getConnectToken(clientUserId: string, itemId?: string) {
  let params = new URLSearchParams();
  if(clientUserId) {
    params.set('clientUserId', clientUserId)
  }
  if(itemId) {
    params.set('itemId', itemId)
  }

  return api.guiabolsoServer({
        method: 'get',
        url: `/pluggy/create-token?${params.toString()}`,
  }).then((response) => {
      // console.log(response)
      return response.data.accessToken
  })
}

async function syncAutomaticAccount(accountId: string | undefined) {
    return api.guiabolsoServer({
        method: 'post',
        url: 'sync-accounts',
        data: {
          accountId
        }
    }).then((response) => {
        console.log(response)
        return response.data
    })
}

async function openPluggyUpdateWidget(account: AccountSummaryDTO) {
    currentStep.value = 'Conectando com a instituição financeira'

    const existingItemIdToUpdate = account.synchronization?.providerItemId
    // //@ts-ignore
    // account.sync.syncStatus = SyncStatus.PREPARING
    console.log('update account', account._id, existingItemIdToUpdate)
    //@ts-ignore
    const accessToken: string = await getConnectToken(account.userId, existingItemIdToUpdate)

    // configure the Pluggy Connect widget instance
    // @ts-ignore
    const pluggyConnect = new PluggyConnect({
      connectToken: accessToken,
      connectorTypes: ['PERSONAL_BANK'],
      updateItem: existingItemIdToUpdate, // by specifying the Item id to update here, Pluggy Connect will attempt to trigger an update on it, and/or prompt credentials request if needed.
      includeSandbox: true, // note: not needed in production
      onSuccess: async ({ item }: {item: Item}) => {
        currentStep.value = 'Importando suas transações recentes'

        const result = await syncAutomaticAccount(account?._id?.toString())
        console.log(result)
        account.balance = result.balance
        account.synchronization = result.synchronization
          // if(account.synchronization) {
          //   // @ts-ignore
          //   // account.synchronization.itemStatus = itemData.item.status
          //   // account.synchronization.lastSyncAt = itemData.item.lastUpdatedAt
          //   // account.synchronization.syncStatus = SyncStatus.READY

          //   console.log('PLUGGY CONNECT SUCCESS', itemData);
          //   account.synchronization = await synchronizationReady(account.synchronization)
          //   console.log('SYNCRONIZATION READY ', account.synchronization)
          //   const { sync, balance } = await startSynchronization(account)
          //   account.synchronization = sync
          //   account.balance = balance
          //   console.log('SYNCRONIZATION endend ', account)
          // }
          showSyncingModal.value = false
      },
      onError: (error: Object) => {
        console.error('Whoops! Pluggy Connect error... ', error);
          currentStep.value = 'Conectando com a instituição financeira'
          showSyncingModal.value = false
      },
      onEvent: (object: any) => {
          console.log(object)
          if(object.event == 'LOGIN_STEP_COMPLETED') {
              console.log('[PLUGGY] LOGIN_STEP_COMPLETED')
              showSyncingModal.value = true
          }

          if(object.event == 'ITEM_RESPONSE' && (object.item.status == "OUTDATED")) {
              if(object.item.executionStatus == "USER_AUTHORIZATION_PENDING") {
                  console.warn('Infelizmente o fluxo de conexão com a Caixa ainda não é suportado')
              }
          }
      },
      onClose: () => {
        console.log('pluggy modal closed')
        // router.push({
        //     name: 'accounts'
        // })
      }
    });

    // Open Pluggy Connect widget
    pluggyConnect.init();
}

async function requestUpdate(account: AccountSummaryDTO, event: Event) {
  event.stopImmediatePropagation()
  await openPluggyUpdateWidget(account)
}

const isBottomSheetOpen = ref(false)

function openMoreDialog(e: Event) {
  e.stopPropagation()
  isBottomSheetOpen.value = true
}

const loading = ref(false)

async function handleClickDeleteAccount() {
  const result = window.confirm(`Deseja realmente excluir a conta ${props.account.name}?`);
  if(result) {
    await deleteAccount(''+ props.account._id)
    router.go(0)
  }
}

async function deleteAccount(id: string) {
  loading.value = true
  return api.guiabolsoApi({
    method: 'get',
    url: `/account-delete?id=${id}`,
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

.account {
  /* background-color: #F9386A; */
  border-bottom: 1px solid #F2F2F2;
  padding: 15px 0px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between
}

.account .col-1 {
  display: flex;
}
.account .col-2 {
  display: flex;
  gap: 8px;
}

.account:last-child {
  border-bottom: none;
}

.account-logo {
  border: 1px solid #F2F2F2;
  width: 50px;
  height: 50px;
  border-radius: 100%;
  margin-right: 10px;
}

/* .account-logo.account-logo--wallet {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #F9386A;
  background-color: #FFF5F8;
} */

.account .name {
  font-size: 12px;
  font-weight: 400;
  color: #404040;
  text-transform: uppercase;
}
.account .date {
  font-size: 12px;
  font-weight: 400;
  color: #404040;
}

.account .balance {
  font-family: 'Axiforma';
  font-size: 30px;
  font-weight: 800;
  color: #404040;
}

.badge {
  background: gray;
  color: black;
  padding: 0px 10px;
  border-radius: 4px;
}

.icon-button {
    color: #F9386A;
    border: none;
    background-color: transparent;
    font-size: 18px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
}

.icon-button:disabled {
    opacity: .35;
}

/**
Bottom sheet
 */

.bottom-sheet__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px;
}

.title {
  margin: 0;
  font-weight: 600;
  font-size: 18px;
  color: #404040;
}

.bottom-sheet__body {
  margin: 30px;
  margin-top: 0;
}

.menu-options {
  /* background-color: red; */
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-options li {
  border-top: 1px solid #F2F2F2;
  padding: 15px;
}

/**
Syncing modal
 */
.syncingModal {
    background-color: #3f1b68e3;
    position: fixed;
    inset: 0;
    z-index: 3;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

</style>