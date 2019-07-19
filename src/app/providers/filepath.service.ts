import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilepathService {
  path: string;

  constructor() { }

  setPath(filepath){
    this.path = filepath;
  }
}
