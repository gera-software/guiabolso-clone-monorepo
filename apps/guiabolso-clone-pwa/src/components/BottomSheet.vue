<template>
    <div class="overlay" v-if="modelValue" @click="closeBottomSheet"></div>
    <Transition name="slideup">
        <div class="bottom-sheet" v-if="modelValue">
            <slot>
                Bottom sheet
            </slot>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    modelValue: String
}>()

watch(() => props.modelValue, (newValue, oldValue) => {
     document.body.classList.toggle('overflow--hidden', !!newValue)
})

const emit = defineEmits(['update:modelValue'])


function closeBottomSheet() {
    emit('update:modelValue', false)
}
</script>

<style scoped>
.overlay {
    background-color: black;
    opacity: .3;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
}

.bottom-sheet {
    background-color: white;
    /* padding: 30px; */
    position: fixed;
    bottom: 0;
    width: 100%;
    max-height: 80dvh;
    overflow-y: auto;
    z-index: 15;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
}


</style>