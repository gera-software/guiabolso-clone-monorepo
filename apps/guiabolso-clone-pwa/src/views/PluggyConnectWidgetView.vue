<template>
    DEPRECATED
    <div class="page">
        <!-- <component is="script" src="https://cdn.pluggy.ai/pluggy-connect/v2.3.1/pluggy-connect.js" async></component> -->
        pluggy connect
    
        <button @click="openPluggyConnectWidget">Connect new account</button>
        <button @click="updatePluggyConnectWidget">update account</button> 
        <div>
            Created at: {{
            // @ts-ignore 
            item.createdAt
            }}
        </div> 
        <div>
            Updated at: {{
            // @ts-ignore 
            item.updatedAt
            }}
        </div> 
        <div>
            Status: {{
            // @ts-ignore 
            item.status
            }}
        </div> 
        <div>
            ExecutionStatus: {{
            // @ts-ignore 
            item.executionStatus
            }}
        </div> 
        <div>
            LastUpdatedAt: {{
            // @ts-ignore 
            item.lastUpdatedAt
            }}
        </div> 
        <pre>
            {{item}}
        </pre>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../config/axios.js'
// @ts-ignore Import module
// import * as pluggy from '../config/pluggy-connect.js'


const item = ref<Object>({})


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

async function updatePluggyConnectWidget() {
    //@ts-ignore
    const existingItemIdToUpdate = item.value?.id
    console.log('update', existingItemIdToUpdate)
    //@ts-ignore
    const accessToken: string = await getConnectToken(existingItemIdToUpdate)

    // configure the Pluggy Connect widget instance
    // @ts-ignore
    const pluggyConnect = new PluggyConnect({
    connectToken: accessToken,
    updateItem: existingItemIdToUpdate, // by specifying the Item id to update here, Pluggy Connect will attempt to trigger an update on it, and/or prompt credentials request if needed.
    includeSandbox: true, // note: not needed in production
    onSuccess: (itemData: Object) => {
        // TODO: Implement logic for successful connection
        // The following line is an example, it should be removed when implemented.
        console.log('Yay! Pluggy connect success!', itemData);
        //@ts-ignore
        item.value = itemData.item
    },
    onError: (error: Object) => {
        // TODO: Implement logic for error on connection
        // The following line is an example, it should be removed when implemented.
        console.error('Whoops! Pluggy Connect error... ', error);
    },
    });

    // Open Pluggy Connect widget
    pluggyConnect.init();
}

async function openPluggyConnectWidget() {
    const accessToken: string = await getConnectToken()

    // configure the Pluggy Connect widget instance
    // @ts-ignore
    const pluggyConnect = new PluggyConnect({
    connectToken: accessToken,
    // updateItem: existingItemIdToUpdate, // by specifying the Item id to update here, Pluggy Connect will attempt to trigger an update on it, and/or prompt credentials request if needed.
    includeSandbox: true, // note: not needed in production
    onSuccess: (itemData: Object) => {
        // TODO: Implement logic for successful connection
        // The following line is an example, it should be removed when implemented.
        console.log('Yay! Pluggy connect success!', itemData);
        //@ts-ignore
        item.value = itemData.item
    },
    onError: (error: Object) => {
        // TODO: Implement logic for error on connection
        // The following line is an example, it should be removed when implemented.
        console.error('Whoops! Pluggy Connect error... ', error);
    },
    });

    // Open Pluggy Connect widget
    pluggyConnect.init();
}

onMounted(async () => {

})

</script>