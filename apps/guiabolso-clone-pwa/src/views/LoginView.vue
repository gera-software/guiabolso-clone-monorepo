<template>
  <div class="page">
    <AppBar title="Login" />
    <div class="container">
      <form @submit.prevent="handleSubmit">
        <div class="alert" v-show="errorMessage">
          {{ errorMessage }}
        </div>
        <div class="form-group">
          <input class="form-input" type="email" placeholder="E-mail" required v-model="form.email">
        </div>
        <div class="form-group">
          <input class="form-input" type="password" placeholder="Senha" required v-model="form.password">
        </div>
        <div class="form-group">
          <router-link class="link" :to="{ name: 'forgot-password'}">Esqueceu a sua senha?</router-link>
        </div>
        
        <div class="bottom">
          <div class="form-group">
            <button type="submit" class="button" :disabled="loading">Entrar</button>
          </div>
          <div class="form-group">
            <span>
              Primeira vez aqui? <router-link class="link" :to="{ name: 'signup'}">Cadastre-se</router-link>
            </span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import AppBar from '@/components/AppBar.vue'
import api from '../config/axios.js'


const router = useRouter()

const userStore = useUserStore()


userStore.$subscribe((mutation, state) => {
  console.log('MUTATED STATE', state)
  if(state.user.accessToken) {
    router.push({ name: 'dashboard'})
  }
})

const form = ref({
    email: '',
    password: '',
})

const loading = ref(false)

const errorMessage = ref('')

async function handleSubmit() {
  loading.value = true
  const payload = {
    email: form.value.email,
    password: form.value.password,
  }
  await fazerLogin(payload)
  loading.value = false
}

async function fazerLogin(payload: any) : Promise<any> {
    errorMessage.value = ''
    return api.guiabolsoServer({
        method: 'post',
        url: '/signin',
        data: payload,
    }).then((response) => {
        console.log(response)
        userStore.setUser(response.data)
        return response.data
    }).catch(function (error) {
      console.error(error.response);
      errorMessage.value = error.response?.data.message ?? 'Ocorreu um erro inesperado'
    })
}

onMounted(async () => {
  if(userStore.tokenIsValid()) {
      router.push({ name: 'dashboard' })
  }
})



</script>
<style scoped>

.container {
    padding-top: 57px;
    /* padding-bottom: 80px; */
    display: flex;
    width: 100%;
    min-height: 100%;
    align-items: center;
}

.bottom {
  margin-top: 70px;
}

form {
  width: 100%;
}

.form-group {
    /* background-color: blue; */
    padding: 18px 15px;
    display: flex;
    flex-direction: column;
}

.form-group .form-label {
    /* background-color: green; */
    font-family: 'Open Sans';
    font-size: 18px;
    font-weight: 600;
    text-align: left;
    color: #404040;
    margin-bottom: 16px;

}

.form-input {
    /* background-color: blueviolet; */
    font-family: 'Open Sans';
    font-size: 20px;
    font-weight: 400;
    text-align: left;
    color: #404040;
    border: none;
    border-bottom: 1px solid black;
    background-color: transparent;
    padding: 8px 0;
    width: 100%;
}

.form-input.input-red {
  color: red;
}

.form-info {
  color: #404040;
  font-family: 'Open Sans';
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  margin: 5px 0;
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

.button:disabled, .button.disabled {
    opacity: .35;
}

.link {
  color: #F9386A;
  text-decoration: none;
  font-family: 'Open Sans';
  font-size: 20px;
  font-weight: 600;
  /* text-align: center; */
  /* padding: 12px 16px; */
}

.alert {
  margin: 15px;
  padding: 15px;
  background-color: red;
  color: white;
  border-radius: 4px;
  font-size: .8em;
}

</style>