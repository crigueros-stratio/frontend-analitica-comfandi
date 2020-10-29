import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-compras-credito-rotativo-horizonchart',
  templateUrl: './compras-credito-rotativo-horizonchart.component.html',
  styleUrls: ['./compras-credito-rotativo-horizonchart.component.css']
})
export class ComprasCreditoRotativoHorizonchartComponent implements OnInit {

  constructor(private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document) { }

  ngOnInit() {
    console.log('ComprasCreditoRotativoHorizonchartComponent')
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = './assets/horizont-chart-graphic.js';
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);
  }

}
