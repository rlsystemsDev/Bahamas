const firebase = require('firebase');
const auth = firebase.auth();

function signInWithEmailPassword (email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function authOnStateChange () {
  return auth.onAuthStateChanged();
}