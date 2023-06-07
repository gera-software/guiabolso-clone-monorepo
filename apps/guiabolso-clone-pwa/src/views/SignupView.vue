<template>
    <div class="page">
        <AppBar title="Cadastro" />
        <div class="container" v-if="!loading">
            <form @submit.prevent="handleSubmit">
                <div class="alert alert--error" v-show="errorMessage">
                    {{ errorMessage }}
                </div>
                <div class="alert alert--success" v-show="successMessage">
                    {{ successMessage }}
                </div>
                <div class="form-group">
                    <label class="form-label">Nome</label>
                    <input class="form-input" type="text" placeholder="Seu nome" required v-model="form.name">
                </div>
                <div class="form-group">
                    <label class="form-label">E-mail</label>
                    <input class="form-input" type="email" placeholder="example@email.com" required v-model="form.email">
                </div>
                <div class="form-group">
                    <label class="form-label">Senha</label>
                    <input class="form-input" type="password" placeholder="Senha" required v-model="form.password">
                </div>
                <div class="form-group">
                    <label class="form-label">Repetir senha</label>
                    <input class="form-input" type="password" placeholder="Senha" required v-model="form.repeatPassword">
                </div>
                <div class="form-group">
                    <button type="submit" class="button" :disabled="loading">Salvar</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import AppBar from '@/components/AppBar.vue'
import { ref } from 'vue';
import api from '../config/axios.js'

type UserForm = {
    name: string,
    email: string,
    password: string,
    repeatPassword: string,
}

const form = ref<UserForm>({
    name: '',
    email: '',
    password: '',
    repeatPassword: '',
})

const loading = ref(false)

async function handleSubmit() {
    loading.value = true

    errorMessage.value = ''
    successMessage.value = ''
    if(form.value.password !== form.value.repeatPassword) {
        console.log('As senhas não conferem')
        errorMessage.value = 'As senhas não conferem'
        loading.value = false
        return
    }

    const payload = {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
    }

    await createUser(payload)

    loading.value = false
}

const errorMessage = ref('')
const successMessage = ref('')

async function createUser(payload: any): Promise<any> {
    errorMessage.value = ''
    successMessage.value = ''
    return api.guiabolsoServer({
        method: 'post',
        url: '/signup',
        data: payload,
    }).then(response => {
        console.log(response)
        successMessage.value = 'Usuário criado com sucesso! Por favor, verifique seu e-mail. Nós enviamos um link para ativação da sua conta.'
        form.value = {
            name: '',
            email: '',
            password: '',
            repeatPassword: '',
        }
        return response.data
    }).catch((error) => {
        console.error(error.response)
        errorMessage.value = (error.response?.data.message || error.response?.data.name) ?? 'Ocorreu um erro inesperado'
    })
}

</script>

<style scoped>
.container {
  padding-top: 60px;
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
.form-input:disabled {
  opacity: .35;
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
}

.button.button-outline {
  background-color: transparent;
  color: #F9386A;
}

.button:disabled, .button.disabled {
    opacity: .35;
}

.form-info {
  color: #404040;
  font-family: 'Open Sans';
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  margin: 5px 0;
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