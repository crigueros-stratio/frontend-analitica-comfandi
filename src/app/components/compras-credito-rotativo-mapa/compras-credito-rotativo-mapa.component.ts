import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-compras-credito-rotativo-mapa',
  templateUrl: './compras-credito-rotativo-mapa.component.html',
  styleUrls: ['./compras-credito-rotativo-mapa.component.css']
})
export class ComprasCreditoRotativoMapaComponent implements OnInit {

  constructor(private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document) { }

  ngOnInit() {
    console.log('ComprasCreditoRotativoComponent')
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = './assets/map-graphic.js';
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);
  }

}
