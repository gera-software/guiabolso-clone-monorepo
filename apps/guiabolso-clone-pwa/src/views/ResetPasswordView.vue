<template>
  <div class="page">
    <AppBar title="Reset password" />
    <div class="container">
      <form @submit.prevent="handleSubmit">
        <div class="alert alert--error" v-show="errorMessage">
          {{ errorMessage }}
        </div>
        <div class="alert alert--success" v-show="successMessage">
          {{ successMessage }}
        </div>
        <div class="form-group">
          <input class="form-input" type="password" placeholder="Senha" required v-model="form.password">
        </div>
        <div class="form-group">
          <input class="form-input" type="password" placeholder="Repetir Senha" required v-model="form.repeatPassword">
        </div>
        <div class="bottom">
          <div class="form-group">
            <button type="submit" class="button" :disabled="loading">Entrar</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../config/axios.js'
import AppBar from '@/components/AppBar.vue'

const route = useRoute()

const loading = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
    password: '',
    repeatPassword: '',
})

const resetPasswordToken = ref('')

onMounted(async () => {
    resetPasswordToken.value = '' + route.query?.t?.toString()
})

async function handleSubmit() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if(form.value.password != form.value.repeatPassword) {
    loading.value = false
    errorMessage.value = 'As senhas não conferem'
    return
  }

  const payload = {
    token: resetPasswordToken.value,
    password: form.value.password,
  }
  await resetPassword(payload)
  loading.value = false
}

async function resetPassword(payload: any): Promise<any> {
  errorMessage.value = ''
  successMessage.value = ''

  return api.guiabolsoServer({
    method: 'post',
    url: '/reset-password',
    data: payload
  }).then(response => {
    form.value.password = ''
    form.value.repeatPassword = ''
    successMessage.value = 'Senha alterada com sucesso'
    return
  }).catch(error => {
    console.error(error.response)
    errorMessage.value = (error.response?.data.message || error.response?.data.name) ?? 'Ocorreu um erro inesperado'
  })
}
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

.alert--error {
  background-color: red;
}

.alert--success {
  background-color: green;
}
</style>