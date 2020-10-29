import { Component, OnInit } from '@angular/core';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-anios-credisubsidio',
  templateUrl: './anios-credisubsidio.component.html',
  styleUrls: ['./anios-credisubsidio.component.css']
})
export class AniosCredisubsidioComponent implements OnInit {

  constructor(private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document) { }

  ngOnInit() {
    console.log('Se inicializo años credisubsidio component')

    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = './assets/credisubsidiosAnios.js';
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);

  }


}
