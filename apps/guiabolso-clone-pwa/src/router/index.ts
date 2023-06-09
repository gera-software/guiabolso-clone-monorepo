import { createRouter, createWebHistory } from 'vue-router'
import AccountsView from '@/views/AccountsView.vue'
import ExtractView from '@/views/ExtractView.vue'
import ExtractByAccountView from '@/views/ExtractByAccountView.vue'
import AddManualTransactionView from '@/views/AddManualTransactionView.vue'
import TransactionsView from '@/views/TransactionsView.vue'
import TransactionView from '@/views/TransactionView.vue'
import DashboardView from '@/views/DashboardView.vue'
import CalendarView from '@/views/CalendarView.vue'
import AddBillView from '@/views/AddBillView.vue'
import BillView from '@/views/BillView.vue'
import PluggyConnectWidgetView from '@/views/PluggyConnectWidgetView.vue'
import ConnectAccountView from '@/views/ConnectAccountView.vue'
import AddManualAccountView from '@/views/AddManualAccountView.vue'
import IndexView from '@/views/IndexView.vue'
import CreditCardInvoiceView from '@/views/CreditCardInvoiceView.vue'
import LoginView from '@/views/LoginView.vue'
import { useUserStore } from '../stores/userStore'
import SignupView from '@/views/SignupView.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
    // if (savedPosition) {
    //   return savedPosition
    // } else {
    //   return { top: 0 }
    // }
  },
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/email-validation',
      name: 'email-validation',
      component: VerifyEmailView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsView,
    },
    {
      path: '/accounts/connect',
      name: 'accounts-connect',
      component: ConnectAccountView,
    },
    {
      path: '/accounts/connect/manual',
      name: 'accounts-connect-manual',
      component: AddManualAccountView,
    },
    {
      path: '/extract',
      name: 'extract',
      component: ExtractView,
    },
    {
      path: '/extract/:id',
      name: 'extract-by-account',
      component: ExtractByAccountView,
    },
    // {
    //   path: '/creditcard/:id/invoices',
    //   name: 'creditcard-invoices',
    //   component: ExtractByAccountView,
    // },
    {
      path: '/creditcard/:accountId/invoices',
      name: 'creditcard-invoice',
      component: CreditCardInvoiceView,
    },
    {
      path: '/transactions/add-transaction',
      name: 'add-transaction',
      component: AddManualTransactionView,
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionsView, // @deprecated
    },
    {
      path: '/transactions/:id',
      name: 'transaction',
      component: TransactionView,
    },
    {
      path: '/bills',
      name: 'bills',
      component: CalendarView,
    },
    {
      path: '/bills/:id',
      name: 'bill',
      component: BillView,
    },
    {
      path: '/bills/add-bill',
      name: 'add-bill',
      component: AddBillView,
    },
    {
      path: '/pluggy-connect',
      name: 'pluggy-connect',
      component: PluggyConnectWidgetView, // @deprecated
    },
  ]
})

//TODO  checar se o usuario está autenticado e se o token ainda é válido
function isAuthenticated() {
  const userStore = useUserStore()
  return userStore.tokenIsValid()
}

router.beforeEach((to, from) => {
  // explicitly return false to cancel the navigation
  // return false

  console.log(to.name, isAuthenticated())
  const publicRoutes = [
    'index',
    'login',
    'signup',
    'email-validation',
    'forgot-password',
    'reset-password',
  ]

  // para acessar rotas privadas, deve estar autenticado, ou será redirecionado para o index
  if(!isAuthenticated() && publicRoutes.every((routeName) => routeName !== to.name )) {
    return { name: 'index' }
  }
})

router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transitionName = toDepth == fromDepth ? 'fade' : (toDepth < fromDepth ? 'slide-right' : 'slide-left')
})

export default router
