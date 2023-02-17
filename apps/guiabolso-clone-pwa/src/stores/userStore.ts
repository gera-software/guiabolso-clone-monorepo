import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNetlifyIdentity } from '../composables/useNetlifyIdentity'
import api from '../config/axios.js'
import { useLocalStorage } from '@vueuse/core'


type authInfo = {
    _id: string,
    name: string,
    email: string,
    netlifyId: string,
    token: {
        access_token: string,
        expires_at: EpochTimeStamp,
        expires_in: EpochTimeStamp,
        refresh_token: string,
        token_type: string,
    }
}

export const useUserStore = defineStore('user', () => {

    // const router = useRouter()

    const { onLogout, logout: netlifyLogout, onOpen, onLogin, openModal, closeModal, getUser } = useNetlifyIdentity()

    onLogout(()=> {
        console.log('não é que fez logout mesmo...')
        // router.push({ name: 'login' })
    })

    // user: { _id: import.meta.env.VITE_DEFAULT_USER_ID },
    const user = useLocalStorage('pinia/auth', {
        _id: '',
        email: '',
        name: '',
        netlifyId: '',
        token: {
            access_token: '',
            expires_at: 0,
            expires_in: 0,
            refresh_token: '',
            token_type: '',
        }
    })

    function logout() {
        console.log('porque ta fazendo logout aqui??????')
        user.value = {
            _id: '',
            email: '',
            name: '',
            netlifyId: '',
            token: {
                access_token: '',
                expires_at: 0,
                expires_in: 0,
                refresh_token: '',
                token_type: '',
            }
        }
        netlifyLogout()
    }

    onLogin(async (user: any) => {
        const { id: netlifyId, email, token, user_metadata } = user
        console.log('onLogin', netlifyId, email, token, user_metadata)
        const authInfo = await getUserByNetlifyId(user)
        setUser(authInfo)
        closeModal()
    })

    async function getUserByNetlifyId(u: any) {
        return api.guiabolsoApi({
          method: 'get',
          url: encodeURI(`/user-get-by-netlify-id?netlifyId=${u.id}&email=${encodeURIComponent(u.email)}&name=${u.user_metadata.full_name}`),
        }).then(function (response) {
          return {
            ...response.data,
            token: u.token,
          }
        }).catch(function (error) {
          console.log(error.response?.data);
        })
    }
    
    function setUser(u: authInfo) {
        user.value = u
        console.log('SET USER', u)
    }

    function tokenIsValid() {
        if(user.value.token.access_token) {
            console.log('token is valid', user.value)
            console.log((new Date()).getTime() < (new Date(user.value.token.expires_at)).getTime())
            return true
        } 
        return false
    }

        
    return {
        user,
        logout,
        openModal,
        tokenIsValid,
    }
  
})