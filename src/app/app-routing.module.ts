import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { BodyComponent } from './layouts/body/body.component';
import { JugadoresComponent } from './pages/jugadores/jugadores.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ClubesComponent } from './pages/clubes/clubes.component';
import { MisTorneosComponent } from './pages/mis-torneos/mis-torneos.component';
import { MisResultadosComponent } from './pages/mis-resultados/mis-resultados.component';
import { ClubComponent } from './pages/club/club.component';
import { TorneosComponent } from './pages/torneos/torneos.component';
import { UsersComponent } from './pages/users/users.component';
import { JugadorComponent } from './pages/jugador/jugador.component';
import { ListaTorneosComponent } from './pages/resultadosTorneos/lista-torneos/lista-torneos.component';
import { DatallesTorneoComponent } from './pages/resultadosTorneos/datalles-torneo/datalles-torneo.component';
import { ResumenTorneoComponent } from './pages/resultadosTorneos/resumen-torneo/resumen-torneo.component';
import { DatallesJugadorComponent } from './pages/resultadosTorneos/datalles-jugador/datalles-jugador.component';

const routes: Routes = [
  //Redirección inicial al dashboard
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Rutas sin layout (fuera de BodyComponent)
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  //Rutas con layout principal
  {
    path: '',
    component: BodyComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'mis-torneos', component: MisTorneosComponent },
      { path: 'mis-resultados', component: MisResultadosComponent },
      { path: 'club', component: ClubComponent },

      { path: 'jugadores', component: JugadoresComponent },
      { path: 'jugador/:id', component: JugadorComponent },

      { path: 'lista-torneos', component: ListaTorneosComponent },
      { path: 'detalle-torneo/:id', component: DatallesTorneoComponent },
      { path: 'resumen-torneo/:id', component: ResumenTorneoComponent },
      { path: 'detalle-jugador/:id', component: DatallesJugadorComponent },

      { path: 'clubes', component: ClubesComponent },
      { path: 'Usuarios', component: UsersComponent },
      { path: 'torneos', component: TorneosComponent },
    ]
  },

  // Catch-all para rutas no encontradas (404)
  { path: '**', redirectTo: 'dashboard' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
