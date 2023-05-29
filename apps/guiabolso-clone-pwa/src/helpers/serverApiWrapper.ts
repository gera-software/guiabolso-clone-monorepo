import api from '../config/axios.js'

async function connectAutomaticAccounts(itemId: string, userId: string) {
    return api.guiabolsoServer({
        method: 'post',
        url: 'connect-accounts',
        data: {
            itemId,
            userId,
        }
    }).then((response) => {
        console.log(response)
        return response.data
    })
}

export default {
    connectAutomaticAccounts,
}