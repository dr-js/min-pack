import '@firebase/polyfill'
import firebase from '@firebase/app'
import '@firebase/auth'

import { createInsideOutPromise } from 'dr-js/module/common/function'
import { createStateStore } from 'dr-js/module/common/immutable/StateStore'

const initialState = {
  firebaseApp: null,
  user: null
}

const createFirebaseAuthStore = ({
  apiKey,
  authDomain,
  parseUser = (user) => user ? { // check: https://firebase.google.com/docs/reference/js/firebase.User
    name: user.displayName || user.providerData[ 0 ].displayName,
    email: user.email,
    avatar: user.photoURL,
    providerId: user.providerData[ 0 ].providerId || user.providerId
  } : null,
  onAuthError = (error) => { __DEV__ && console.error(error) }
}) => {
  const firebaseApp = firebase.initializeApp({ apiKey, authDomain })
  const { promise: initAuthPromise, resolve: initAuthResolve } = createInsideOutPromise()
  const { getState, setState, subscribe, unsubscribe } = createStateStore({ ...initialState, firebaseApp })

  firebaseApp.auth().onAuthStateChanged((user) => {
    __DEV__ && console.log('onAuthStateChanged', user)
    setState({ user: parseUser(user) })
    initAuthResolve()
  }, (error) => {
    __DEV__ && console.error('[error] onAuthStateChanged', error)
    firebaseApp.auth().signOut()
    setState({ user: null })
    initAuthResolve()
  })

  const getAuthToken = async () => {
    await initAuthPromise
    const idToken = await firebaseApp.auth().currentUser.getIdToken()
    __DEV__ && console.log('[getAuthToken]', { idToken })
    return idToken
  }
  const revokeAuth = async () => {
    await firebaseApp.auth().signOut()
    setState({ user: null })
  }
  const grantWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('profile')
    const { user } = await firebaseApp.auth().signInWithPopup(provider).catch(onAuthError)
    setState({ user: parseUser(user) })
  }
  const grantWithGitHub = async () => {
    const provider = new firebase.auth.GithubAuthProvider()
    provider.addScope('user:email')
    provider.setCustomParameters({ 'allow_signup': 'false' })
    const { user } = await firebaseApp.auth().signInWithPopup(provider).catch(onAuthError)
    setState({ user: parseUser(user) })
  }

  return {
    getState,
    setState,
    subscribe,
    unsubscribe,
    getAuthToken,
    revokeAuth,
    grantWithGoogle,
    grantWithGitHub
  }
}

export {
  initialState,
  createFirebaseAuthStore
}
