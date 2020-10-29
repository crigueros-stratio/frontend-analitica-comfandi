import { Component, OnInit } from '@angular/core';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-compras-credito-rotativo',
  templateUrl: './compras-credito-rotativo.component.html',
  styleUrls: ['./compras-credito-rotativo.component.css']
})
export class ComprasCreditoRotativoComponent implements OnInit {

  constructor(private renderer2: Renderer2,
              @Inject(DOCUMENT) private _document) { }

  ngOnInit() {
    console.log('ComprasCreditoRotativoComponent')
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = './assets/treemap-graphic.js';
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);
  }

}
