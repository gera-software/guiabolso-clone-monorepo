<template>
    <input
      ref="inputRef"
      type="text"
    />
</template>
  
<script setup lang="ts">
  import { useCurrencyInput, CurrencyDisplay, ValueScaling } from 'vue-currency-input'
  import { watch } from 'vue'
  
    const props = defineProps({
        modelValue: Number,
    })

    const { inputRef, setValue  } = useCurrencyInput({
        locale: "pt-BR",
        currency: "BRL",
        currencyDisplay: CurrencyDisplay.symbol,
        precision: 2,
        hideCurrencySymbolOnFocus: false,
        hideGroupingSeparatorOnFocus: false,
        hideNegligibleDecimalDigitsOnFocus: false,
        autoDecimalDigits: true,
        valueScaling: ValueScaling.precision,
        useGrouping: true,
        accountingSign: false
    })

    watch(
      () => props.modelValue, // Vue 2: props.value
      (value) => {
        setValue(value ?? 0)
      }
    )
  
  </script>