import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Note } from '../../models/note/note.model';
import { NoteListService } from '../../../services/database/note-list.service';
import 'rxjs/Rx';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  noteList: Observable<Note[]>

    constructor(private noteListService: NoteListService) {
      this.noteList = this.noteListService.getNoteList()
        .snapshotChanges()
        .map(
          changes => {
            return changes.map(c => ({
              key: c.payload.key, ...c.payload.val()
            }))
          });
    }

  addRandomPoint(){
    const randPoint={
      title:Math.random()+'',
      content:Math.random()+'',
    };
    this.noteListService.addNote(randPoint).then(ref => {
      console.log(ref.key);
    });
  }
}
