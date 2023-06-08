<template>
    <div class="page">
        <div class="hero">
    
        </div>
        <div class="container" v-if="success">
            <h2>Seu email foi verificado!</h2>
            <router-link class="button" :to="{ name: 'login'}">Login</router-link>
        </div>
        <div class="container" v-else>
            <h2>Ocorreu um erro!</h2>
            <router-link class="button" :to="{ name: 'login'}">Tentar novamente</router-link>
        </div>
        <div class="load-spinner" v-if="isLoading">
            <font-awesome-icon icon="fa-solid fa-circle-notch" spin size="2xl" />
        </div>
  </div>

</template>
<script setup lang="ts">
import { appendFile } from 'fs';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../config/axios.js'

const route = useRoute()

const isLoading = ref(true)

const success = ref(false)

onMounted(async () => {
    const emailValidationToken = route.query?.t?.toString()
    await verifyEmailToken(emailValidationToken)
    isLoading.value = false
})

async function verifyEmailToken(token: string | undefined): Promise<any> {
  return api.guiabolsoServer({
    method: 'post',
    url: `/validate-email?t=${token}`
  }).then(response => {
    success.value = true
    return
  }).catch(error => {
    console.error(error.response)
    success.value = false
  })
}
</script>
<style scoped>

.load-spinner {
    position: absolute;
    inset: 0;
    background-color: white;
    color: #F9386A;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.hero {
  background-image: url('@/assets/EmailVerification.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100dvw;
  /* height: 80%; */
  background-color: #FFF5F8;
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
    text-decoration: none;
}

.button.button-outline {
  background-color: transparent;
  color: #F9386A;
}

.link {
  color: #F9386A;
  text-decoration: none;
  font-family: 'Open Sans';
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  padding: 12px 16px;
}

</style>