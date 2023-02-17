<template>
    <div class="calendar-summary" @click="handleClick(bill)" :class="bill.type">
        <div class="row">
            <span class="description">{{ bill.description }}</span>
            <span class="badge" :class="{ 'PAYABLE': bill.type === 'PAYABLE', 'RECEIVABLE': bill.type === 'RECEIVABLE', 'ATRASADO': isAtrasado(bill) }">{{ getStatus(bill) }}</span>
        </div>
        <span class="amount">R$ {{ (+bill.amount / 100).toFixed(2) }}</span>
    </div>
</template>
<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { useRouter } from 'vue-router';
import { BillStatus, BillType, CalendarBill } from '../config/types';

const router = useRouter()

defineProps<{
    bill: CalendarBill
}>()

function handleClick(bill: CalendarBill) {
    router.push({ name: 'bill', params: { id: bill._id }})
}

function isAtrasado(bill: CalendarBill) {
    if(bill.status === BillStatus.PAID) {
        return false
    }
    
    const dueDateWithoutTime = bill.dueDate.setHours(0, 0, 0, 0)
    const nowDateWithoutTime = (new Date()).setHours(0, 0, 0, 0)

    return (dueDateWithoutTime <= nowDateWithoutTime)
}

function getStatus(bill: CalendarBill) {
    
    if(bill.status === BillStatus.PAID) {
        return  bill.type === BillType.PAYABLE ?  'pago' : 'recebido'
    } else {
        const dueDateWithoutTime = bill.dueDate.setHours(0, 0, 0, 0)
        const nowDateWithoutTime = (new Date()).setHours(0, 0, 0, 0)
        console.log(dueDateWithoutTime, nowDateWithoutTime, dueDateWithoutTime > nowDateWithoutTime )

        if(isAtrasado(bill)) {
            return 'atrasado'
        } else {
            return  bill.type === BillType.PAYABLE ?  'a pagar' : 'a receber'
        }

    }
}

</script>

<style scoped>

.calendar-summary {
    background-color: white;
    margin: 15px 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
                       0px 1px 1px 0px rgba(0, 0, 0, 0.14),
                       0px 2px 1px -1px rgba(0, 0, 0, 0.12);
    border-left: 5px solid gray;
    padding: 15px 15px;
    gap: 8px;
}

.calendar-summary.PAYABLE {
    border-color: #5B64DE;
}

.calendar-summary.RECEIVABLE {
    border-color: #00BD6E;
}

.calendar-summary .row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.calendar-summary .description {
    font-size: 1em;
    color: #454545;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.calendar-summary .amount {
    font-size: 1.3em;
    font-weight: bold;
    color: #222222;
}

.calendar-summary .badge {
    font-size: .7em;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
    background-color: gray;
    border-radius: 10px;
    padding: 2px 15px;
    width: fit-content;
}
.calendar-summary .badge.PAYABLE {
    background-color: #5B64DE;
}
.calendar-summary .badge.RECEIVABLE {
    background-color: #00BD6E;
}
.calendar-summary .badge.ATRASADO {
    background-color: #ED4A4A;
}

</style>