<template>
    <a @click="router.back()" class="back-icon">
      <font-awesome-icon icon="fa-solid fa-arrow-left-long" />
    </a>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

</script>

<style scoped>
.back-icon {
  color: #F9386A;
}
</style>