import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import {UserDataService} from "./database/user-data.service";

@Injectable()
export class AuthService {
  private user: firebase.User;

  constructor(public afAuth: AngularFireAuth,
              private userService: UserDataService) {
    afAuth.authState.subscribe(user => {
      this.user = user;
      this.checkUser(user);
    });
  }

  checkUser(user){
    this.userService.onSignOnActions(user);
  }

  signInWithEmail(credentials) {
    return this.afAuth.auth.signInWithEmailAndPassword(credentials.email,
      credentials.password);
  }

  signOut(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  get authenticated(): boolean {
    return this.user !== null;
  }

  getEmail() {
    return this.user && this.user.email;
  }

  getUID() {
    return this.user.uid;
  }

  signInWithGoogle() {
    return this.oauthSignIn(new GoogleAuthProvider());
  }

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
