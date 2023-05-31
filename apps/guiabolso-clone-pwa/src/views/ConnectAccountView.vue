<template>
    <div class="page">
        <AppBar title="Conexão de conta" />
        <div class="container">
            <p>
                Escolha uma instituição para conectar
            </p>
            <ul class="institutions-list" v-if="!isLoading">
                <li v-for="institution in personalInstitutions" :key="institution.providerConnectorId.toString()">
                    <button class="institution" @click="handleConnect(institution.providerConnectorId.toString(), $event)" :class="{ 'breve': institution.providerConnectorId == '219'}" :disabled="institution.providerConnectorId == '219'">
                        <img class="institution-logo" :src="institution.imageUrl?.toString()" />
                        <div>
                            {{institution.name}}
                        </div>
                    </button>
                </li>
            </ul>
            <ul class="institutions-list institutions-list--skeleton" v-if="isLoading">
                <li v-for="n in 6" >
                    <div class="institution">
                        <div class="institution-logo"></div>
                        <div style="flex-basis: 100%">
                           <div class="text"></div>
                        </div>
                    </div>
                </li>
            </ul>
    
            <p>
                Não encontrou seu banco ou quer registrar gastos manualmente?
            </p>
            <router-link class="institution" :to="{ name: 'accounts-connect-manual'}">
                <img class="institution-logo" src="@/assets/ManualAccountIcon.svg" />
                <div>
                    Conta manual
                </div>
            </router-link>
        </div>
        <div class="syncingModal" v-if="showSyncingModal">
            <font-awesome-icon icon="fa-solid fa-arrows-rotate" :spin="true" size="2xl"></font-awesome-icon>
            <p>{{ currentStep }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import api from '../config/axios.js'
import AppBar from '@/components/AppBar.vue'
import { Institution } from '../config/types';
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '../stores/userStore';
import { Item } from 'pluggy-sdk';
import { useRouter } from 'vue-router';
import { createAutomaticAccounts } from '../helpers/createAutomaticAccounts'

// @ts-ignore
import Toastify from 'toastify-js'

const router = useRouter()

const institutions = ref<Institution[]>([])

const personalInstitutions = computed(() => {
    return institutions.value.filter(institution => institution.type == 'PERSONAL_BANK')
})


const isLoading = ref(true)

async function getAvailableConnectors(): Promise<Institution[]> {
    isLoading.value = true
    console.log('get institutions')
  return api.guiabolsoServer({
    method: 'get',
    url: `/available-automatic-institutions`,
  }).then(function (response) {
      institutions.value = response.data
      isLoading.value = false
      console.log(personalInstitutions.value)
    return response.data
  }).catch(function (error) {
    console.log(error.response?.data);
  })
}

onMounted(async () => {
    await getAvailableConnectors()
    // Toastify({
    //         duration: 50000,
    //         text: `<h4 style='display: inline'>Get connectors.</h4> `,
    //         escapeMarkup: false,
    //         gravity: "bottom",
    //     }).showToast()
})

const userStore = useUserStore()



async function getConnectToken(itemId?: string | undefined) {
    return api.guiabolsoServer({
        method: 'get',
        url: `/pluggy/create-token${itemId ? '?itemId=' + itemId : ''}`,
    }).then((response) => {
        // console.log(response)
        return response.data.accessToken
    })
}

async function connectAutomaticAccounts(itemId: string, userId: string) {
    return api.guiabolsoServer({
        method: 'post',
        url: 'connect-accounts',
        data: {
            itemId,
            userId,
        }
    }).then((response) => {
        console.log(response)
        return response.data
    })
}

async function syncAutomaticAccount(accountId: string) {
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

const showSyncingModal = ref(false)
const currentStep = ref('Conectando com a instituição financeira')

async function openPluggyConnectWidget(providerConnectorId: number) {
    currentStep.value = 'Conectando com a instituição financeira'
    const accessToken: string = await getConnectToken()

    // configure the Pluggy Connect widget instance
    // @ts-ignore
    const pluggyConnect = new PluggyConnect({
        connectToken: accessToken,
        connectorTypes: ['PERSONAL_BANK'],
        // updateItem: existingItemIdToUpdate, // by specifying the Item id to update here, Pluggy Connect will attempt to trigger an update on it, and/or prompt credentials request if needed.
        includeSandbox: true, // note: not needed in production
        selectedConnectorId: providerConnectorId,
        onSuccess: async ({ item }: {item: Item}) => {
            currentStep.value = 'Importando suas contas'

            const accounts = await connectAutomaticAccounts(item.id,  userStore.user.data.id)

            for(const [i, account] of accounts.entries()) {
                currentStep.value = `Importando seu histórico de transações (${i+1}/${accounts.length})`
                console.log('start sync account', account.id)
                await syncAutomaticAccount(account.id)
                console.log('end sync account', account.id)
            }
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

            // if(object.event == "ITEM_RESPONSE" && (object.item.status == 'UPDATING' || object.item.status == 'UPDATED')) {
            //     currentStep.value++
            //     console.log(currentStep.value)
            // }
            // if(object.event == "ITEM_RESPONSE" && object.item.status == "UPDATED") {
            //     console.log("UPDATED")
            //     currentStep.value = 10
            // }
        },
        onClose: () => {
            console.log('pluggy modal closed')
            router.push({
                name: 'accounts'
            })
        }
    });

    // Open Pluggy Connect widget
    pluggyConnect.init();
}

function handleConnect(providerConnectorId: string, e: Event) {
    e.preventDefault()
    openPluggyConnectWidget(+providerConnectorId)
}
</script>

<style scoped>
.container {
  padding-top: 60px;
  margin: 0 15px;
  padding-bottom: 40px;
}

.institutions-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.institutions-list li {
    padding: 15px 0;
}

.institution {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #111111;
    text-decoration: none;
    width: 100%;
    border: 0;
    background-color: transparent;
    font-family: "Open Sans", sans-serif;
    font-size: 1em;
}

.institution .institution-logo {
    border: 1px solid #F2F2F2;
    width: 50px;
    height: 50px;
    border-radius: 100%;
    margin-right: 10px;
    flex-shrink: 0;
}

.institution.breve {
    color: #11111167;
    pointer-events: none;
}


.institution.breve .institution-logo {
    opacity: .5;
}

.institution.breve::after {
    content: 'em breve';
    background-color: #FFC969;
    color: white;
    border-radius: 8px;
    padding: 2px 7px;
    text-transform: uppercase;
    font-size: .6em;
    font-weight: 600;
    margin-left: 10px;
}

.institution:hover,
.institution:focus {
    background-color: rgb(0 0 0 / 5%);
}

.institutions-list--skeleton .institution-logo {
  background-color: rgb(0, 0, 0, 10%);
  animation: pulse-bg 1s infinite;
}
.institutions-list--skeleton .text {
    background-color: rgb(0, 0, 0, 10%);
    height: 22px;
    width: 60%;
    animation: pulse-bg 1s infinite;
}

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