import {Injectable} from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { badgrConfig } from '../firebase.credentials';
import {TokenResponse} from "../src/models/responses/token.response.model";
import {map, mergeMap, filter, take } from 'rxjs/operators';
import {Observable} from "rxjs/Observable";

@Injectable()
export class BadgrService {

  token:Observable<String>;

  constructor(public http: HttpClient) {
      this.getToken();
      this.token.subscribe((res)=>{/*console.log(res)*/},(err)=>console.error(err));
      this.getUserSelf();
  }

  getToken(){
    if(badgrConfig) {
      this.token = this.http.post<TokenResponse>('https://api.badgr.io/api-auth/token', badgrConfig)
        .pipe(map(res => res.token));
    }
  }

  getUserSelf(){
    this.token.subscribe((token)=>{
      this.http.get('https://api.badgr.io/v2/users/self',{
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Token ' + token
        }
      }).subscribe((res)=>{/*console.log(res)*/});
    });

  }



}
