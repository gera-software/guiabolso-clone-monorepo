import { createApp, markRaw } from 'vue'
import './style.css'
import './assets/ManualAccountIcon.svg'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import IncomeBonusIcon from '@/components/icons/IncomeBonusIcon.vue'
import IncomeLoanIcon from '@/components/icons/IncomeLoanIcon.vue'
import NewCategoryIcon from '@/components/icons/NewCategoryIcon.vue'
import IncomeOtherIcon from '@/components/icons/IncomeOtherIcon.vue'
import IncomeWageIcon from '@/components/icons/IncomeWageIcon.vue'
import IncomeReturnIcon from '@/components/icons/IncomeReturnIcon.vue'
import EssentialResidentialBillsIcon from '@/components/icons/EssentialResidentialBillsIcon.vue'
import EssentialEducationIcon from '@/components/icons/EssentialEducationIcon.vue'
import EssentialMarketIcon from '@/components/icons/EssentialMarketIcon.vue'
import EssentialLivingIcon from '@/components/icons/EssentialLivingIcon.vue'
import EssentialHealthIcon from '@/components/icons/EssentialHealthIcon.vue'
import EssentialCommuteIcon from '@/components/icons/EssentialCommuteIcon.vue'
import LifestyleRestaurantsIcon from '@/components/icons/LifestyleRestaurantsIcon.vue'
import LifestyleShoppingIcon from '@/components/icons/LifestyleShoppingIcon.vue'
import LifestylePersonalCareIcon from '@/components/icons/LifestylePersonalCareIcon.vue'
import LifestyleWorkExpensesIcon from '@/components/icons/LifestyleWorkExpensesIcon.vue'
import LifestyleEmployeesIcon from '@/components/icons/LifestyleEmployeesIcon.vue'
import LifestyleFamilyIcon from '@/components/icons/LifestyleFamilyIcon.vue'
import LifestyleBankTaxesIcon from '@/components/icons/LifestyleBankTaxesIcon.vue'
import LifestyleRecreationIcon from '@/components/icons/LifestyleRecreationIcon.vue'
import LifestyleOtherIcon from '@/components/icons/LifestyleOtherIcon.vue'
import LifestyleGiftsIcon from '@/components/icons/LifestyleGiftsIcon.vue'
import LifestyleWithdrawalIcon from '@/components/icons/LifestyleWithdrawalIcon.vue'
import LifestyleServicesIcon from '@/components/icons/LifestyleServicesIcon.vue'
import LifestyleTvInternetIcon from '@/components/icons/LifestyleTvInternetIcon.vue'
import LifestyleTaxesIcon from '@/components/icons/LifestyleTaxesIcon.vue'
import LifestyleTravelIcon from '@/components/icons/LifestyleTravelIcon.vue'
import LoanPayrollIcon from '@/components/icons/LoanPayrollIcon.vue'
import LoanOverdraftIcon from '@/components/icons/LoanOverdraftIcon.vue'
import LoanBillIcon from '@/components/icons/LoanBillIcon.vue'
import LoanCreditIcon from '@/components/icons/LoanCreditIcon.vue'
import LoanInterestIcon from '@/components/icons/LoanInterestIcon.vue'
import LoanCardInterestIcon from '@/components/icons/LoanCardInterestIcon.vue'
import LoanOtherIcon from '@/components/icons/LoanOtherIcon.vue'
import BankPostingsApplicationIcon from '@/components/icons/BankPostingsApplicationIcon.vue'
import BankPostingsCreditCardIcon from '@/components/icons/BankPostingsCreditCardIcon.vue'
import BankPostingsRescueIcon from '@/components/icons/BankPostingsRescueIcon.vue'
import BankPostingsTransferIcon from '@/components/icons/BankPostingsTransferIcon.vue'
import UncategorizedIcon from '@/components/icons/UncategorizedIcon.vue'
import { registerSW } from "virtual:pwa-register";
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faArrowLeftLong, faArrowRightLong, faWallet, faArrowsRotate, faBan, faUser, faPlus, faEllipsisVertical, faXmark, faTriangleExclamation, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
/* add icons to the library */

library.add(faArrowLeftLong)
library.add(faArrowRightLong)
library.add(faWallet)
library.add(faArrowsRotate)
library.add(faBan)
library.add(faUser)
library.add(faPlus)
library.add(faEllipsisVertical)
library.add(faXmark)
library.add(faTriangleExclamation)
library.add(faCircleNotch)

const pinia = createPinia()
pinia.use(({ store }) => {
    store.router = markRaw(router)
})

const app = createApp(App)
app.use(router)
app.use(pinia)

app.component('font-awesome-icon', FontAwesomeIcon)

app.component('IncomeBonusIcon', IncomeBonusIcon)
app.component('IncomeLoanIcon', IncomeLoanIcon)
app.component('NewCategoryIcon', NewCategoryIcon)
app.component('IncomeOtherIcon', IncomeOtherIcon)
app.component('IncomeWageIcon', IncomeWageIcon)
app.component('IncomeReturnIcon', IncomeReturnIcon)

app.component('EssentialResidentialBillsIcon', EssentialResidentialBillsIcon)
app.component('EssentialEducationIcon', EssentialEducationIcon)
app.component('EssentialMarketIcon', EssentialMarketIcon)
app.component('EssentialLivingIcon', EssentialLivingIcon)
app.component('EssentialHealthIcon', EssentialHealthIcon)
app.component('EssentialCommuteIcon', EssentialCommuteIcon)

app.component('LifestyleRestaurantsIcon', LifestyleRestaurantsIcon)
app.component('LifestyleShoppingIcon', LifestyleShoppingIcon)
app.component('LifestylePersonalCareIcon', LifestylePersonalCareIcon)
app.component('LifestyleWorkExpensesIcon', LifestyleWorkExpensesIcon)
app.component('LifestyleEmployeesIcon', LifestyleEmployeesIcon)
app.component('LifestyleFamilyIcon', LifestyleFamilyIcon)
app.component('LifestyleBankTaxesIcon', LifestyleBankTaxesIcon)
app.component('LifestyleRecreationIcon', LifestyleRecreationIcon)
app.component('LifestyleOtherIcon', LifestyleOtherIcon)
app.component('LifestyleGiftsIcon', LifestyleGiftsIcon)
app.component('LifestyleWithdrawalIcon', LifestyleWithdrawalIcon)
app.component('LifestyleServicesIcon', LifestyleServicesIcon)
app.component('LifestyleTvInternetIcon', LifestyleTvInternetIcon)
app.component('LifestyleTaxesIcon', LifestyleTaxesIcon)
app.component('LifestyleTravelIcon', LifestyleTravelIcon)

app.component('LoanPayrollIcon', LoanPayrollIcon)
app.component('LoanOverdraftIcon', LoanOverdraftIcon)
app.component('LoanBillIcon', LoanBillIcon)
app.component('LoanCreditIcon', LoanCreditIcon)
app.component('LoanInterestIcon', LoanInterestIcon)
app.component('LoanCardInterestIcon', LoanCardInterestIcon)
app.component('LoanOtherIcon', LoanOtherIcon)

app.component('BankPostingsApplicationIcon', BankPostingsApplicationIcon)
app.component('BankPostingsCreditCardIcon', BankPostingsCreditCardIcon)
app.component('BankPostingsRescueIcon', BankPostingsRescueIcon)
app.component('BankPostingsTransferIcon', BankPostingsTransferIcon)

app.component('UncategorizedIcon', UncategorizedIcon)

app.mount('#app')



// if ("serviceWorker" in navigator && !/localhost/.test(window.location)) {
//   registerSW();
// }

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register(
//       import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw',
//       { type: import.meta.env.MODE === 'production' ? 'classic' : 'module' }
//     )
//   }

if ("serviceWorker" in navigator) {
    // && !/localhost/.test(window.location) && !/lvh.me/.test(window.location)) {
    const updateSW = registerSW({
      onNeedRefresh() {
        Toastify({
          duration: -1,
          text: `<h4 style='display: inline'>Nova atualização disponível!</h4>
                 <br><br>
                 <a class='do-sw-update'>Click to update and reload</a>  `,
          escapeMarkup: false,
          gravity: "bottom",
          onClick() {
            updateSW(true);
          }
        }).showToast();
      },
      onOfflineReady() {
        // Toastify({
        //     duration: -1,
        //     text: `<h4 style='display: inline'>Seu dispositivo parece que está offline?</h4>
        //            <br><br>
        //            <a class='do-sw-update'>Click to update and reload</a>  `,
        //     escapeMarkup: false,
        //     gravity: "bottom",
        //     onClick() {
        //       window.alert('parece que sim')
        //     }
        //   }).showToast();
      },
    });
  }