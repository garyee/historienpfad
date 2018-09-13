import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

/**
 *  This service wraps the firebase auth lib for this project
 */
@Injectable()
export class AuthService {
  private user: firebase.User;

  constructor(public afAuth: AngularFireAuth) {
    afAuth.authState.subscribe(user => {
      this.user = user;
    });
  }

  /**
   * Subscribe to the auth state
   *
   * @param cb
   */
  subscribeToAuthState(cb){
    this.afAuth.authState.subscribe(cb);
  }

  /**
   * Sign user in with e-mail adress
   *
   * @param credentials
   * @returns {Promise<any>}
   */
  signInWithEmail(credentials) {
    return this.afAuth.auth.signInWithEmailAndPassword(credentials.email,
      credentials.password);
  }


  /**
   * Sign user out
   * @returns {Promise<void>}
   */
  signOut(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  authenticated(): boolean {
    return this.user !== null;
  }

  /**
   * Get the E-Mail adress of the user
   * @returns {string | null}
   */
  getEmail() {
    return this.user && this.user.email;
  }

  /**
   * Get the UId of the User
   * @returns {string}
   */
  getUID() {
    return this.user.uid;
  }

  /**
   * Sign User in with Google
   * @returns {Promise<any> | Promise<void>}
   */
  signInWithGoogle() {
    return this.oauthSignIn(new GoogleAuthProvider());
  }

  /**
   * internal signIn function
   * @param {firebase.auth.AuthProvider} provider
   * @returns {any}
   */
  private oauthSignIn(provider: firebase.auth.AuthProvider) {
    if (!(<any>window).cordova) {
      return this.afAuth.auth.signInWithPopup(provider);
    } else {
      return this.afAuth.auth.signInWithRedirect(provider)
        .then(() => {
          return this.afAuth.auth.getRedirectResult().then( result => {
            // This gives you a Google Access Token.
            // You can use it to access the Google API.
            let token = result.credential.accessToken;
            // The signed-in user info.
            let user = result.user;
          }).catch(function(error) {
            // Handle Errors here.
            alert(error.message);
          });
        });
    }
  }

}
