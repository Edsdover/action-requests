import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import * as hash from 'object-hash';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { Upload } from './upload.model';

@Injectable()
export class UploadService {
  private basePath = '/uploads';

  constructor(private db: AngularFireDatabase) { }

  getUploadByHash(attachmentHash: string): Observable<Upload> {
    return this.db
      .list(this.basePath, ref => ref.orderByChild('fileHash').equalTo(attachmentHash))
      .valueChanges()
      .pipe(
        map(attachments => attachments && attachments.length && attachments[0] as Upload)
      );
  }

  deleteUpload(upload: Upload) {
    this.deleteFileData(upload.key)
    .then( () => {
      this.deleteFileStorage(upload.name);
    })
    .catch(error => console.log(error));
  }

  push(upload: Upload) {
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`${this.basePath}/${upload.name}`).put(upload.file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot: any) =>  {
        // upload in progress
        upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        // upload failed
        console.log(error);
      },
      (): any => {
        // upload success
        upload.url = uploadTask.snapshot.downloadURL;
      }
    );
  }

  private generateHash(name, file): string {
    const metadata = {
      lastModified: file.lastModified,
      lastModifiedDate: file.lastModifiedDate,
      name: name,
      size: file.size,
      type: file.type
    };
    return hash(metadata);
  }

  // Writes the file details to the realtime db
  private deleteFileData(key: string) {
    return this.db.list(`${this.basePath}`).remove(key);
  }

  // Firebase files must have unique names in their respective storage dir
  // So the name serves as a unique key
  private deleteFileStorage(name: string) {
    const storageRef = firebase.storage().ref();
    storageRef.child(`${this.basePath}/${name}`).delete();
  }

  // Writes the file details to the realtime db
  private saveFileData(upload: Upload) {
    const pushKey = this.db.createPushId();
    const fileHash = this.generateHash(name, upload.file);
    this.db.object(`${this.basePath}/${pushKey}`).set({ key: pushKey, ...upload });
  }
}
