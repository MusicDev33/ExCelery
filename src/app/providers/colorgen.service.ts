import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorgenService {

  colors = ["#5496ff", "#0457db", "#07defa", "#00e8b2", "#02e665", "#1fff3d", "#a4f207",
   "#e6da00", "#e69200", "#ffc45e" ,"#d47202", "#f54f02", "#e60b07" ,"#ff9b99", "#9f8cff",
   "#2500e3", "#a142ff", "#6400c7", "#d000ff", "#ff00c8"]

  constructor() { }

  generateRandomColor(floor, ceiling){
    var color = (Math.random()*0xFFFFFF<<0).toString(16);
    return '#'+ color;
  }
}
