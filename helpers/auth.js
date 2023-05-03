const firebase = require('firebase');
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User Exists ==>', user.uid);
  } else {
    console.log('USer Error ==> user does not exists');
  }
});

const checkIfUserLoggedIn = () => new Promise((resolve, reject) => {
  setTimeout(function() {
    resolve(auth.currentUser && auth.currentUser.uid);
  }, 2000);
});

const loggedInEmailPassword = (email, password) => new Promise((resolve, reject) => {
  auth.signInWithEmailAndPassword(email, password)
    .then(resolve('Success'))
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      if (errorCode === 'auth/wrong-password') {
        reject('Wrong password.');
      } else {
        reject(errorMessage);
      }
  });
});

const signOut = () => auth.signOut();

const signUpUser = (email, password) => new Promise((resolve, reject) => {
  auth.createUserWithEmailAndPassword(email, password)
    .then(resolve('Success'))
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('errorCode', errorCode);

      if (errorCode === 'auth/wrong-password') {
        reject('Wrong password.');
      } else {
        reject(errorMessage);
      }
  });
});

module.exports = {
  loggedIn: loggedInEmailPassword,
  logInCheck: checkIfUserLoggedIn,
  signOut,
  auth,
  signUpUser
}