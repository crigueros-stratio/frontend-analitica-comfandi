import { Component, OnInit } from '@angular/core';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-categorias-credisubsidio',
  templateUrl: './categorias-credisubsidio.component.html',
  styleUrls: ['./categorias-credisubsidio.component.css']
})
export class CategoriasCredisubsidioComponent implements OnInit {

  constructor(private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document) { }

  ngOnInit() {
    console.log('Se inicializo categoria credisubsidio component')

    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = './assets/credisusidiosCategoria.js';
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);

  }


}