import {Observable} from "rxjs/Observable";
import {of as observableOf} from 'rxjs/observable/of'

export class AngularFireDatabaseMock {

  private db = {
    "content": {
      "-LHFbSO8xzPFGzdROhym": {
        "html": "toller content_html2"
      }
    },
    "geofire": {
      "-LHFbSO8xzPFGzdROhym": {
        ".priority": "u311nsdcyw",
        "g": "u311nsdcyw",
        "l": [50.825838, 12.945958]
      }
    },
    "paths": {
      "-LGzbRfJa203kpVGyVOs": {
        "key": "-LGzbRfJa203kpVGyVOs",
        "name": "neuer Pfad"
      },
      "-LH7_-0W5ibIdyDSmQ8y": {
        "key": "-LH7_-0W5ibIdyDSmQ8y",
        "name": "neuer Pfad2",
        "points": ["-LHFbSO8xzPFGzdROhym"]
      }
    },
    "points": {
      "-LHFbSO8xzPFGzdROhym": {
        "isStartPoint": true,
        "name": "toller name2",
        "parentKey": "-LH7_-0W5ibIdyDSmQ8y"
      }
    },
    "users": {
      "Cs27RutC0qdP8THzaMW6NhPlUM83": {
        "lastLoginTs": 1531434786843,
        "uid": "Cs27RutC0qdP8THzaMW6NhPlUM83"
      }
    }
  }

  list(query: string): any {
    return observableOf(
      this.db[query]
    )
  }
  public query={ref:'ref'};
}
