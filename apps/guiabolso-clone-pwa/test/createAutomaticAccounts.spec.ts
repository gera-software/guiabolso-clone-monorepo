import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import serverApiWrapper from '../src/helpers/serverApiWrapper'
import { createAutomaticAccounts } from '../src/helpers/createAutomaticAccounts'
import { Item } from 'pluggy-sdk'

describe("create automatic accounts unit test", () => {

    const spy = vi.spyOn(serverApiWrapper, 'connectAutomaticAccounts')

    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('Provider Status UPDATED', () => {
        test('data provider updated all accounts', async () => {
            const lastUpdatedAt = new Date("2023-05-29T20:59:39.793Z")
            const executionStatus = "SUCCESS"
            const item: Item = {
                "id": "d0ab10e7-c52d-45c9-8f88-e6d4ce44daa5",
                "connector": {
                    "id": 2,
                    "name": "Pluggy Bank",
                    "primaryColor": "ef294b",
                    "institutionUrl": "https://pluggy.ai",
                    "country": "BR",
                    "type": "PERSONAL_BANK",
                    "credentials": [
                        {
                            "label": "User",
                            "name": "user",
                            "type": "text",
                            "placeholder": "",
                            "validation": "^user-.{2,50}$",
                            "validationMessage": "O user deve começar com \"user-\"",
                            "optional": false
                        },
                        {
                            "label": "Password",
                            "name": "password",
                            "type": "password",
                            "placeholder": "",
                            "validation": "^.{6,20}$",
                            "validationMessage": "A senha deve ter entre 6 e 20 caracteres",
                            "optional": false
                        }
                    ],
                    "imageUrl": "https://cdn.pluggy.ai/assets/connector-icons/sandbox.svg",
                    "hasMFA": false,
                    "health": {
                        "status": "ONLINE",
                        "stage": null
                    },
                    "products": [
                        "ACCOUNTS",
                        "CREDIT_CARDS",
                        "TRANSACTIONS",
                        "PAYMENT_DATA",
                        "INVESTMENTS",
                        "INVESTMENTS_TRANSACTIONS",
                        "OPPORTUNITIES",
                        "IDENTITY",
                        // "PORTFOLIO",
                        // "INCOME_REPORTS"
                    ],
                    "createdAt": new Date("2020-09-07T00:08:06.588Z")
                },
                "createdAt": new Date("2023-05-29T20:59:15.805Z"),
                "updatedAt": new Date("2023-05-29T20:59:39.821Z"),
                "status": "UPDATED",
                "executionStatus": executionStatus,
                "lastUpdatedAt": lastUpdatedAt,
                "webhookUrl": null,
                "error": null,
                "clientUserId": null,
                "consecutiveFailedLoginAttempts": 0,
                "statusDetail": null,
                "parameter": null,
                "userAction": null,
                // "nextAutoSyncAt": null
            }
    
            const userId = 'valid'
    
            const data = await createAutomaticAccounts(item, userId)
            expect(spy).toHaveBeenCalledWith(
                item.id, 
                userId, 
                { 
                    bankAccounts: { syncStatus: "UPDATED", lastSyncAt: lastUpdatedAt },
                    creditCardAccounts: { syncStatus: "UPDATED", lastSyncAt: lastUpdatedAt }
                })
        })
    
        test('data provider did not update bank accounts', async () => {
    
            const lastUpdatedAt = new Date("2023-05-29T20:59:39.793Z")
            const bankLastUpdatedAt = null
            const creditCardLastUpdatedAt = new Date("2023-05-29T21:00:00.793Z")
            const executionStatus = "PARTIAL_SUCCESS"
            const item: Item = {
                "id": "6df4ee72-f3c4-458e-a40f-c904dd0de525",
                "connector": {
                    "id": 2,
                    "name": "Pluggy Bank",
                    "primaryColor": "ef294b",
                    "institutionUrl": "https://pluggy.ai",
                    "country": "BR",
                    "type": "PERSONAL_BANK",
                    "credentials": [
                        {
                            "label": "User",
                            "name": "user",
                            "type": "text",
                            "placeholder": "",
                            "validation": "^user-.{2,50}$",
                            "validationMessage": "O user deve começar com \"user-\"",
                            "optional": false
                        },
                        {
                            "label": "Password",
                            "name": "password",
                            "type": "password",
                            "placeholder": "",
                            "validation": "^.{6,20}$",
                            "validationMessage": "A senha deve ter entre 6 e 20 caracteres",
                            "optional": false
                        }
                    ],
                    "imageUrl": "https://cdn.pluggy.ai/assets/connector-icons/sandbox.svg",
                    "hasMFA": false,
                    "health": {
                        "status": "ONLINE",
                        "stage": null
                    },
                    "products": [
                        "ACCOUNTS",
                        "CREDIT_CARDS",
                        "TRANSACTIONS",
                        "PAYMENT_DATA",
                        "INVESTMENTS",
                        "INVESTMENTS_TRANSACTIONS",
                        "OPPORTUNITIES",
                        "IDENTITY",
                        // "PORTFOLIO",
                        // "INCOME_REPORTS"
                    ],
                    "createdAt": new Date("2020-09-07T00:08:06.588Z")
                },
                "createdAt": new Date("2023-05-30T00:05:38.637Z"),
                "updatedAt": new Date("2023-05-30T00:05:58.608Z"),
                "status": "UPDATED",
                "executionStatus": executionStatus,
                "lastUpdatedAt": lastUpdatedAt,
                "webhookUrl": null,
                "error": null,
                "clientUserId": null,
                "consecutiveFailedLoginAttempts": 0,
                "statusDetail": {
                    "accounts": {
                        "isUpdated": false,
                        "lastUpdatedAt": bankLastUpdatedAt
                    },
                    "identity": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "creditCards": {
                        "isUpdated": true,
                        "lastUpdatedAt": creditCardLastUpdatedAt
                    },
                    "investments": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "paymentData": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "transactions": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    // "investmentTransactions": null,
                    // "investmentsTransactions": {
                    //     "warnings": [],
                    //     "isUpdated": true,
                    //     "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    // }
                },
                "parameter": null,
                "userAction": null,
                // "nextAutoSyncAt": null
            }
    
            const userId = 'valid'
    
            const data = await createAutomaticAccounts(item, userId)
            expect(spy).toHaveBeenCalledWith(
                item.id, 
                userId, 
                { 
                    bankAccounts: { syncStatus: 'OUTDATED', lastSyncAt: bankLastUpdatedAt },
                    creditCardAccounts: { syncStatus: 'UPDATED', lastSyncAt: creditCardLastUpdatedAt }
                })
        })
    
        test('data provider did not update credit card accounts', async () => {
    
            const lastUpdatedAt = new Date("2023-05-29T20:59:39.793Z")
            const bankLastUpdatedAt = new Date("2023-05-29T21:00:00.793Z")
            const creditCardLastUpdatedAt = null
            const executionStatus = "PARTIAL_SUCCESS"
            const item: Item = {
                "id": "6df4ee72-f3c4-458e-a40f-c904dd0de525",
                "connector": {
                    "id": 2,
                    "name": "Pluggy Bank",
                    "primaryColor": "ef294b",
                    "institutionUrl": "https://pluggy.ai",
                    "country": "BR",
                    "type": "PERSONAL_BANK",
                    "credentials": [
                        {
                            "label": "User",
                            "name": "user",
                            "type": "text",
                            "placeholder": "",
                            "validation": "^user-.{2,50}$",
                            "validationMessage": "O user deve começar com \"user-\"",
                            "optional": false
                        },
                        {
                            "label": "Password",
                            "name": "password",
                            "type": "password",
                            "placeholder": "",
                            "validation": "^.{6,20}$",
                            "validationMessage": "A senha deve ter entre 6 e 20 caracteres",
                            "optional": false
                        }
                    ],
                    "imageUrl": "https://cdn.pluggy.ai/assets/connector-icons/sandbox.svg",
                    "hasMFA": false,
                    "health": {
                        "status": "ONLINE",
                        "stage": null
                    },
                    "products": [
                        "ACCOUNTS",
                        "CREDIT_CARDS",
                        "TRANSACTIONS",
                        "PAYMENT_DATA",
                        "INVESTMENTS",
                        "INVESTMENTS_TRANSACTIONS",
                        "OPPORTUNITIES",
                        "IDENTITY",
                    ],
                    "createdAt": new Date("2020-09-07T00:08:06.588Z")
                },
                "createdAt": new Date("2023-05-30T00:05:38.637Z"),
                "updatedAt": new Date("2023-05-30T00:05:58.608Z"),
                "status": "UPDATED",
                "executionStatus": executionStatus,
                "lastUpdatedAt": lastUpdatedAt,
                "webhookUrl": null,
                "error": null,
                "clientUserId": null,
                "consecutiveFailedLoginAttempts": 0,
                "statusDetail": {
                    "accounts": {
                        "isUpdated": true,
                        "lastUpdatedAt": bankLastUpdatedAt
                    },
                    "identity": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "creditCards": {
                        "isUpdated": false,
                        "lastUpdatedAt": creditCardLastUpdatedAt
                    },
                    "investments": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "paymentData": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "transactions": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    // "investmentTransactions": null,
                    // "investmentsTransactions": {
                    //     "warnings": [],
                    //     "isUpdated": true,
                    //     "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    // }
                },
                "parameter": null,
                "userAction": null,
                // "nextAutoSyncAt": null
            }
    
            const userId = 'valid'
    
            const data = await createAutomaticAccounts(item, userId)
            expect(spy).toHaveBeenCalledWith(
                item.id, 
                userId, 
                { 
                    bankAccounts: { syncStatus: 'UPDATED', lastSyncAt: bankLastUpdatedAt },
                    creditCardAccounts: { syncStatus: 'OUTDATED', lastSyncAt: creditCardLastUpdatedAt }
                })
        })
    
        test('data provider did not update any accounts', async () => {
    
            const lastUpdatedAt = new Date("2023-05-29T20:59:39.793Z")
            const bankLastUpdatedAt = null
            const creditCardLastUpdatedAt = null
            const executionStatus = "PARTIAL_SUCCESS"
            const item: Item = {
                "id": "6df4ee72-f3c4-458e-a40f-c904dd0de525",
                "connector": {
                    "id": 2,
                    "name": "Pluggy Bank",
                    "primaryColor": "ef294b",
                    "institutionUrl": "https://pluggy.ai",
                    "country": "BR",
                    "type": "PERSONAL_BANK",
                    "credentials": [
                        {
                            "label": "User",
                            "name": "user",
                            "type": "text",
                            "placeholder": "",
                            "validation": "^user-.{2,50}$",
                            "validationMessage": "O user deve começar com \"user-\"",
                            "optional": false
                        },
                        {
                            "label": "Password",
                            "name": "password",
                            "type": "password",
                            "placeholder": "",
                            "validation": "^.{6,20}$",
                            "validationMessage": "A senha deve ter entre 6 e 20 caracteres",
                            "optional": false
                        }
                    ],
                    "imageUrl": "https://cdn.pluggy.ai/assets/connector-icons/sandbox.svg",
                    "hasMFA": false,
                    "health": {
                        "status": "ONLINE",
                        "stage": null
                    },
                    "products": [
                        "ACCOUNTS",
                        "CREDIT_CARDS",
                        "TRANSACTIONS",
                        "PAYMENT_DATA",
                        "INVESTMENTS",
                        "INVESTMENTS_TRANSACTIONS",
                        "OPPORTUNITIES",
                        "IDENTITY",
                    ],
                    "createdAt": new Date("2020-09-07T00:08:06.588Z")
                },
                "createdAt": new Date("2023-05-30T00:05:38.637Z"),
                "updatedAt": new Date("2023-05-30T00:05:58.608Z"),
                "status": "UPDATED",
                "executionStatus": executionStatus,
                "lastUpdatedAt": lastUpdatedAt,
                "webhookUrl": null,
                "error": null,
                "clientUserId": null,
                "consecutiveFailedLoginAttempts": 0,
                "statusDetail": {
                    "accounts": {
                        "isUpdated": false,
                        "lastUpdatedAt": bankLastUpdatedAt
                    },
                    "identity": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "creditCards": {
                        "isUpdated": false,
                        "lastUpdatedAt": creditCardLastUpdatedAt
                    },
                    "investments": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "paymentData": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    "transactions": {
                        "isUpdated": true,
                        "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    },
                    // "investmentTransactions": null,
                    // "investmentsTransactions": {
                    //     "warnings": [],
                    //     "isUpdated": true,
                    //     "lastUpdatedAt": new Date("2023-05-30T00:05:58.567Z")
                    // }
                },
                "parameter": null,
                "userAction": null,
                // "nextAutoSyncAt": null
            }
    
            const userId = 'valid'
    
            const data = await createAutomaticAccounts(item, userId)
            expect(spy).toHaveBeenCalledWith(
                item.id, 
                userId, 
                { 
                    bankAccounts: { syncStatus: 'OUTDATED', lastSyncAt: bankLastUpdatedAt },
                    creditCardAccounts: { syncStatus: 'OUTDATED', lastSyncAt: creditCardLastUpdatedAt }
                })
        })
    })

})