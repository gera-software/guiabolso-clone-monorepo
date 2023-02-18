<template>
  <div class="page">
    <div class="hero">
  
    </div>
    <div class="container">
      <button class="button" @click="openNetlifyModal">Começar</button>
      v{{ version }} - {{ node_env }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const router = useRouter()

const userStore = useUserStore()

// @ts-ignore
const version: string = __APP_VERSION__;
const node_env: string = import.meta.env.MODE

userStore.$subscribe((mutation, state) => {
  console.log('MUTATED STATE', state)
  if(state.user._id) {
    router.push({ name: 'dashboard'})
  }
})

function openNetlifyModal() {
  userStore.openModal()

}

onMounted(async () => {
  if(userStore.tokenIsValid()) {
      router.push({ name: 'dashboard' })
  }
})



</script>
<style scoped>
.page {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.hero {
  background-image: url('@/assets/LoginCover.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100dvw;
  /* height: 80%; */
  background-color: #250048;
  flex-basis: 80%;
}

.container {
  background-color: white;
  display: flex;
  gap: 10px;
  flex-direction: column;
  padding: 30px;
  flex-basis: 20%;
  /* min-height: 30%; */
}

.button {
    background-color: #F9386A;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Open Sans';
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    padding: 12px 16px;
    cursor: pointer;
}

.button.button-outline {
  background-color: transparent;
  color: #F9386A;
}
</style>