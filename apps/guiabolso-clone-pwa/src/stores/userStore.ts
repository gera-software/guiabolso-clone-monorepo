import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export type authInfo = {
    data: {
        id: string,
        name: string,
        email: string,
    }
    accessToken: string,
    exp: number,
    iat: number,
}

export const useUserStore = defineStore('user', () => {

    // const router = useRouter()

    const user = useLocalStorage('pinia/auth', {
        data: {
            id: '',
            email: '',
            name: ''
        },
        accessToken: '',
        exp: 0,
        iat: 0,
    })

    function logout() {
        user.value = {
            data: {
                id: '',
                email: '',
                name: ''
            },
            accessToken: '',
            exp: 0,
            iat: 0,
        }
    }

    
    function setUser(u: authInfo) {
        user.value = u
        console.log('SET USER', u)
    }

    function tokenIsValid() {
        if(user.value.accessToken) {
            console.log('token is valid', user.value)
            // TODO verify expiration time of token
            console.log((new Date()).getTime() < (new Date(user.value.exp)).getTime())
            return true
        } 
        return false
    }

        
    return {
        user,
        logout,
        tokenIsValid,
        setUser,
    }
  
})