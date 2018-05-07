import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import * as hash from 'object-hash';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { Upload } from './upload.model';

@Injectable()
export class UploadService {
  private basePath = '/uploads';

  constructor() { }

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

  // Firebase files must have unique names in their respective storage dir
  // So the name serves as a unique key
  private deleteFileStorage(name: string) {
    const storageRef = firebase.storage().ref();
    storageRef.child(`${this.basePath}/${name}`).delete();
  }
}
