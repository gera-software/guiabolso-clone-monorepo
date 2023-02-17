<template>
    <div class="transaction" :class="{ 'transaction--ignored': transaction.ignored }" @click="showDetails(transaction._id ?? '')">
        <div class="col-1">
            <CategoryIcon :icon="transaction.category?.iconName ?? 'Uncategorized'" :color="transaction.category?.primaryColor ?? '#F9386A'" />
            <div class="flex">
                <span class="category">{{
                    transaction.category?.name ?? 'Categorizar'
                }}</span>
                <span class="description">{{
                    transaction.description ? transaction.description : transaction.descriptionOriginal 
                }}</span>
            </div>
        </div>
        <div class="col-2">
            <!-- <span class="accountOrDate">{{
                transaction.date.toISOString().slice(0,10)
            }}</span> -->
            <span class="value">R$ {{ (+transaction.amount / 100).toFixed(2) }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import CategoryIcon from '@/components/CategoryIcon.vue'
import { Transaction } from '../config/types';
import { useRouter } from 'vue-router';

const router = useRouter()

defineProps<{
    transaction: Transaction,
}>()

function showDetails(transactionId: string) {
    console.log('showDetails', transactionId)
    router.push({ name: 'transaction', params: { id: transactionId } })
}

</script>
<style scoped>

.transaction {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
}

/* .transaction:hover {
    background-color: rgba(0, 0, 0, 0.1);
}
.transaction:focus {
    background-color: rgba(0, 0, 0, 0.1);
} */

.transaction--ignored {
    opacity: .35;
}

.transaction .col-1 {
    display: flex;
    /* flex-direction: column; */
    flex-direction: row;
    flex-basis: min-content;
    overflow: hidden;
  }

.transaction .col-2 {
    display: flex;
    flex-direction: column;
    text-align: right;
    flex-shrink: 0;
  }

.transaction .flex {
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    flex-basis: min-content;
    overflow: hidden;
  }

.transaction .category {
    font-size: .8em;
    color: #454545;
    white-space: nowrap;
  }

.transaction .description {
    font-size: 1em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: #222222;
  }

.transaction .accountOrDate {
    font-size: .8em;
    color: #454545;
  }

.transaction .value {
    font-size: 1em;
    font-weight: bold;
    color: #222222;
}
</style>