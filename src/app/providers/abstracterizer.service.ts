import { Injectable } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';

@Injectable({
  providedIn: 'root'
})
export class AbstracterizerService {
  /* The Abstracterizer will handle abstracting the Workbook objects into
  something more usable in the HTML. Having a bunch of arrays and objects
  sitting around in a component to handle very specific tasks just doesn't
  seem like a good idea, and it gets harder and harder to use them.
  Basically, this service will be all the methods that create
  an ASWorkbook
  */

  constructor() { }


}
