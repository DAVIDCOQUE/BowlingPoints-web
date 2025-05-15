import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../app/material.module';
import { JugadoresComponent } from './pages/jugadores/jugadores.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ResumenTorneoComponent } from './pages/resultadosTorneos/resumen-torneo/resumen-torneo.component';
import { DatallesTorneoComponent } from './pages/resultadosTorneos/datalles-torneo/datalles-torneo.component';
import { DatallesJugadorComponent } from './pages/resultadosTorneos/datalles-jugador/datalles-jugador.component';
import { ListaTorneosComponent } from './pages/resultadosTorneos/lista-torneos/lista-torneos.component';
import { HttpClientModule } from '@angular/common/http';
import { CarouselComponent } from './layouts/carousel/carousel.component';
import { ClubesComponent } from './pages/clubes/clubes.component';
import { BodyComponent } from './layouts/body/body.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { SidebarComponent } from './layouts/header-sidenav/sidebar/sidebar.component';

import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './layouts/header-sidenav/header/header.component';
import { MisTorneosComponent } from './pages/mis-torneos/mis-torneos.component';
import { MisResultadosComponent } from './pages/mis-resultados/mis-resultados.component';
import { ClubComponent } from './pages/club/club.component';
import { UsersComponent } from './pages/users/users.component';
import { TorneosComponent } from './pages/torneos/torneos.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';







@NgModule({
  declarations: [
    AppComponent,
    RegistroComponent,
    LoginComponent,
    DashboardComponent,
    JugadoresComponent,
    FooterComponent,
    PerfilComponent,
    ResumenTorneoComponent,
    DatallesTorneoComponent,
    DatallesJugadorComponent,
    ListaTorneosComponent,
    CarouselComponent,
    ClubesComponent,
    BodyComponent,
    SidebarComponent,
    HeaderComponent,
    MisTorneosComponent,
    MisResultadosComponent,
    ClubComponent,
    UsersComponent,
    TorneosComponent,


  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxPaginationModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
