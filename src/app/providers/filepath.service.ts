import { Injectable } from '@angular/core';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class FilepathService {
  path: string;

  constructor() { }

  setPath(filepath) {
    this.path = filepath;
  }

  deleteFile(filename: string, callback) {
    fs.rename(this.path + '/sheets/' + filename, this.path + '/sheets/deleted/' + filename, err => {
      callback(err);
    });
  }
}
