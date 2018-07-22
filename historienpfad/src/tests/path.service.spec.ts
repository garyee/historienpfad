import Spy = jasmine.Spy;
import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import "rxjs-compat/add/observable/of";
import {AngularFireDatabase, AngularFireDatabaseModule} from "angularfire2/database";
import {AngularFireDatabaseMock} from "./AngularFireDatabase.mocks";
import {GeoService} from "../../services/database/geo.service";
import {AngularFireModule} from 'angularFire2';
import {firebaseConfig} from "../../firebase.credentials";

describe("Add Path Test", () => {

  let service: GeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GeoService,
        {provide: AngularFireDatabase, useClass: AngularFireDatabaseMock},
      ],
    });
  });


  it('should be created', () => {
    service = TestBed.get(GeoService);
    expect(service.getTestValue()).toBe(true);
  });

  // it('should be created', async(inject([PathService],(service) => {
  //   expect(service).toBeTruthy();
  // })));

});
