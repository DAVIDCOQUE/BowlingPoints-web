import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
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
import { CategorysComponent } from './pages/categorys/categorys.component';
import { ModalityComponent } from './pages/modality/modality.component';
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
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './auth/jwt.interceptor';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { AmbitComponent } from './pages/ambit/ambit.component';
import { ResultsComponent } from './pages/results/results.component';
import { LoadingComponent } from './components/loading/loading.component';
import { TournamentResultComponent } from './pages/tournament-result/tournament-result.component';



providers: [
  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
]
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    JugadoresComponent,
    ClubesComponent,
    FooterComponent,
    PerfilComponent,
    ResumenTorneoComponent,
    DatallesTorneoComponent,
    DatallesJugadorComponent,
    ListaTorneosComponent,
    CarouselComponent,
    BodyComponent,
    SidebarComponent,
    HeaderComponent,
    MisTorneosComponent,
    MisResultadosComponent,
    ClubComponent,
    UsersComponent,
    TorneosComponent,
    UnauthorizedComponent,
    CategorysComponent,
    ModalityComponent,
    AmbitComponent,
    ResultsComponent,
    LoadingComponent,
    TournamentResultComponent
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
    NgbModule,
    BrowserAnimationsModule,
    NgSelectModule,

  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
