import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {badgrConfig} from '../firebase.credentials';
import {TokenResponse} from "../src/models/responses/token.response.model";
import {map, take} from 'rxjs/operators';
import {Observable} from "rxjs/Observable";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import moment from "moment";
import {UserDataService} from "./database/user-data.service";

/**
 *  This service implements a client for the badgr.io api
 *  https://api.badgr.io/docs/v2/
 */
@Injectable()
export class BadgrService {

  issuerRef: AngularFireList<Object>;
  issuerList: Observable<Object[]>;

  token: Observable<String>;

  constructor(public http: HttpClient,
              private db: AngularFireDatabase,
              private user: UserDataService) {
    this.issuerRef = db.list<Object>('badgr-data');
    this.issuerList = this.issuerRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      ));
    this.getToken();
    this.snycDB();
  }

  /**
   * Get an access token for secure Api calls
   */
  getToken() {
    if (badgrConfig) {
      this.token = this.http.post<TokenResponse>('https://api.badgr.io/api-auth/token', badgrConfig)
        .pipe(map(res => res.token));
    }
  }

  /**
   * internal api call wrapper
   *
   * @param {string} endpoint e.g. 'users/self'
   * @param {string} method
   * @param cb
   * @param {any} data
   */
  private callBadgr(endpoint: string, method: string, cb = undefined, data = undefined) {
    this.token.subscribe((token) => {
      switch (method) {
        case 'get':
          this.http.get('https://api.badgr.io/v2/' + endpoint, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Token ' + token
            }
          }).subscribe(cb);
          break;
        case 'post':
          this.http.post<TokenResponse>('https://api.badgr.io/v2/' + endpoint,
            data,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Token ' + token
              }
            }
          ).subscribe(cb);
          break;
      }
    });
  }

  /**
   * Get the Issuer (A Badgr Api Entity) It is the Parent-entity to Badges
   * @param cb
   */
  getFirstIssuer(cb) {
    this.callBadgr('issuers', 'get',
      (res) => {
        cb(res['result'][0]);
      });
  }

  /**
   * Get All Badges from an Issuer
   * @param issuerID
   * @param cb
   */
  getBadges(issuerID, cb) {
    this.callBadgr('issuers/' + issuerID + '/badgeclasses', 'get', (res) => {
      cb(res['result']);
    });
  }

  /**
   * Does just that
   * @param badgeID
   * @param cb
   */
  getBadgeByID(badgeID, cb) {
    this.callBadgr('badgeclasses/' + badgeID, 'get', (res) => {
      cb(res['result']);
    });
  }

  /**
   * checks for Badgr Data in DB and updates it if needed
   * Cache the Badge & Issuer-Ids to firebase so save time on Api calls
   */
  snycDB() {
    var that = this;
    this.issuerList.subscribe((data) => {
      if (data == null || (Array.isArray(data) && data.length == 0)) {
        that.getBadgrDataSetToDB(that);
      } else {
        if (data[0]['lastUpdated'] && moment(data[0]['lastUpdated']).diff(moment(), 'days') > 7) {
          that.getBadgrDataSetToDB(that);
        }
      }
    });
  }

  /**
   * gets Badgr Data from api and does breaking update on the issuerList id
   *
   * @param that
   */
  private getBadgrDataSetToDB(that) {
    that.getFirstIssuer((issuer_data) => {
      const issuerID = issuer_data['entityId'];
      that.getBadges(issuerID, (badgeClasses_res) => {
        const data = {};
        if (badgeClasses_res != null && Array.isArray(badgeClasses_res)) {
          badgeClasses_res.forEach((val) => {
            if (!data.hasOwnProperty('badges')) {
              data['badges'] = {};
            }
            data['badges'][val.entityId] = val.name;
          });
        }
        data['lastUpdated'] = moment().valueOf();
        that.issuerRef.set(issuerID, data);
      })
    });
  }

  /**
   * Reward a Badge to the current User
   * @param badgeID
   */
  assertBadgeToUser(badgeID,cb=undefined) {
    var that = this;
    this.getIssuerIDFromDB((issuerID) => {
      this.user.getUserObsv((userData) => {
        if (userData != null && userData.email && issuerID != null) {
          that.getAllBadgesForUser((userAssertions) => {
            const userBadgesFiltered = userAssertions['result'].map(val => val['badgeclass']);
            if(userBadgesFiltered.indexOf(badgeID)<0) {
              const data = {
                badgeclass: badgeID,
                recipient:
                  {
                    identity: userData.email,
                    hashed: false,
                    type: "email",
                    plaintextIdentity: userData.email,
                  }
              };
              that.callBadgr('issuers/' + issuerID + '/assertions', 'post', cb, data);
            }
          });
        }
      },true);
    });
  }

  /**
   * Get all Badges from all Issuers -> all Badges available
   * @param cb
   */
  getAllPossibleBadges(cb){
    var that = this;
    this.getIssuerIDFromDB((issuerID) => {
        if ( issuerID != null ) {
          that.getAllBadgesFromIssuer(issuerID, cb);
        }
    });
  }

  private getAllBadgesFromIssuer(issuerID,cb) {
    var that = this;
      this.callBadgr('issuers/' + issuerID + '/badgeclasses', 'get', cb);
  }

  /**
   * Get A List of what badges got rewarded to the user (getting a badge is called assertion)
   * @param issuerID
   * @param cb
   * @param {string} mail
   */
  private getAllAssertionsFromIssuer(issuerID, cb, mail = '') {
    this.callBadgr('issuers/' + issuerID + '/assertions'+(mail!=''?'?recipient=' + mail:''), 'get', cb);
  }

  /**
   * Get All Badges the current user has been rewarded (assertions)
   * The callback will get a List of Assertion-Objects
   * for further details on the assertion object refer to the Badgr Api Doc (Url in class doc)
   * @param cb - callback function
   */
  getAllBadgesForUser(cb) {
    var that = this;
    this.getIssuerIDFromDB((issuerID) => {
      this.user.getUserObsv((userData) => {
        if (userData != null && userData.email && issuerID != null) {
          that.getAllAssertionsFromIssuer(issuerID, cb, userData.email);

        }
      },true);
    });
  }

  /**
   * Get All Badges the current user has been rewarded (assertions)
   * The callback will get a List of Assertion-Objects enriched with data from other
   * Badgr Objects necessary for the frontend
   * @param cb - callback function
   */
  getAllBadgesAndUserForFE(cb) {
    var that=this;
    this.getAllPossibleBadges((allBadgeClasses) => {
      that.getAllBadgesForUser((userAssertions) => {
        const userBadgesFiltered = userAssertions['result'].map(val => val['badgeclass']);
        const resArr = allBadgeClasses['result'].map(val => {
          let rtnObj = {};
          rtnObj['entityId'] = val['entityId'];
          rtnObj['name'] = val['name'];
          rtnObj['description'] = val['description'].replace('\\n', '<br/>');
          rtnObj['image'] = val['image'];
          rtnObj['url'] = val['openBadgeId'];
          if (userBadgesFiltered.indexOf(val.entityId) > -1) {
            rtnObj['earned'] = true;
          }
          return rtnObj;
        });
        cb(resArr);
      });
    });
  }

  /**
   * Gets IssuerID from the firebase DB
   * @param cb
   * @returns {Observable<string>}
   */
  getIssuerIDFromDB(cb): Observable<string> {
    const observable = this.issuerList.pipe(map((data) => {
      return data[0]['key']
    }),take(1))
    if (cb !== undefined) {
      observable.subscribe(cb)
    }
    return observable;
  }

}
