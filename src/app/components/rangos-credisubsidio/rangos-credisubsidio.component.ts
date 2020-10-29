import { Component, OnInit } from '@angular/core';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-rangos-credisubsidio',
  templateUrl: './rangos-credisubsidio.component.html',
  styleUrls: ['./rangos-credisubsidio.component.css']
})
export class RangosCredisubsidioComponent implements OnInit {

  constructor(private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document) { }

  ngOnInit() {
    console.log('Se inicializo rangos credisubsidio component')

    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = './assets/credisubsidiosRangos.js';
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);

  }

}
