/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare module 'https://*'


// declare module 'https://cdn.pluggy.ai/pluggy-connect/v2.3.1/pluggy-connect.js' {
//     export * from 'pluggy-connect'
// }