/**
 * @deprecated
 */

import netlifyIdentity from 'netlify-identity-widget';


// @ts-ignore
netlifyIdentity.on('init', user => console.log('init', user));
// @ts-ignore
netlifyIdentity.on('login', user => console.log('login', user));
netlifyIdentity.on('logout', () => console.log('Logged out'));
// @ts-ignore
netlifyIdentity.on('error', err => console.error('Error', err));
netlifyIdentity.on('open', () => console.log('Widget opened'));
netlifyIdentity.on('close', () => console.log('Widget closed'));

netlifyIdentity.init({
  // container: '#netlify-modal', // defaults to document.body
  locale: 'en' // defaults to 'en'
});

export function useNetlifyIdentity() {

    function onOpen(callback: any) {
        // @ts-ignore
        netlifyIdentity.on('open', user => callback(user));
    }

    function onClose(callback: any) {
        netlifyIdentity.on('close', () => callback);
    }

    function onLogin(callback: any) {
        // @ts-ignore
        netlifyIdentity.on('login', user => callback(user));
    }

    // TODO tem um bug aqui! quando userStore faz logout
    function onLogout(callback: any) {
        // @ts-ignore
        netlifyIdentity.on('logout', callback);
        // const userStore = useUserStore()
        // userStore.logout()
    }


    function openModal() {
        netlifyIdentity.open(); // open the modal
    }

    function closeModal() {
        netlifyIdentity.close(); // close the modal
    }

    function logout() {
        // Log out the user
        netlifyIdentity.logout();
    }

    function getUser() {
        // Get the current user:
        // Available after on('init') is invoked
        return netlifyIdentity.currentUser();
    }
        

    return {
        openModal,
        closeModal,
        getUser,
        logout,
        onOpen,
        onClose,
        onLogin,
        onLogout,
    }

}