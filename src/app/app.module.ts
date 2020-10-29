import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';
import { CategoriasCredisubsidioComponent } from './components/categorias-credisubsidio/categorias-credisubsidio.component';
import { RangosCredisubsidioComponent } from './components/rangos-credisubsidio/rangos-credisubsidio.component';
import { AniosCredisubsidioComponent } from './components/anios-credisubsidio/anios-credisubsidio.component';
import { ComprasCreditoRotativoComponent } from './components/compras-credito-rotativo/compras-credito-rotativo.component';
import { ComprasCreditoRotativoMapaComponent } from './components/compras-credito-rotativo-mapa/compras-credito-rotativo-mapa.component';
import { ComprasCreditoRotativoHorizonchartComponent } from './components/compras-credito-rotativo-horizonchart/compras-credito-rotativo-horizonchart.component';



const appRoutes: Routes = [
  { path: 'categorias-credisubsidio', component:  CategoriasCredisubsidioComponent},
  { path: 'rangos-credisubsidio', component:  RangosCredisubsidioComponent },
  { path: 'anios-credisubsidio', component:  AniosCredisubsidioComponent },
  { path: 'compras-credito-rotativo', component:  ComprasCreditoRotativoComponent },
  { path: 'compras-credito-rotativo-mapa', component:  ComprasCreditoRotativoMapaComponent },
  { path: 'compras-credito-rotativo-horizontchart', component:  ComprasCreditoRotativoHorizonchartComponent },
  { path: '', redirectTo: 'categorias-credisubsidio', pathMatch: 'full' },
  { path: '**', component: CategoriasCredisubsidioComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    CategoriasCredisubsidioComponent,
    RangosCredisubsidioComponent,
    AniosCredisubsidioComponent,
    ComprasCreditoRotativoComponent,
    ComprasCreditoRotativoMapaComponent,
    ComprasCreditoRotativoHorizonchartComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
