import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
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
import { ListaTorneosComponent } from './pages/resultadosTorneos/lista-torneos/lista-torneos.component';
import { DatallesTorneoComponent } from './pages/resultadosTorneos/datalles-torneo/datalles-torneo.component';
import { ResumenTorneoComponent } from './pages/resultadosTorneos/resumen-torneo/resumen-torneo.component';
import { DatallesJugadorComponent } from './pages/resultadosTorneos/datalles-jugador/datalles-jugador.component';

import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { ModalityComponent } from './pages/modality/modality.component';
import { CategorysComponent } from './pages/categorys/categorys.component';
import { AmbitComponent } from './pages/ambit/ambit.component';
import { ResultsComponent } from './pages/results/results.component';
import { TorneoInscritosComponent } from './pages/resultadosTorneos/torneo-inscritos/torneo-inscritos.component';
import { TournamentResultComponent } from './pages/tournament-result/tournament-result.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: '',
    component: BodyComponent,
    children: [
      // VISITANTES (sin login, sin protección)
      { path: 'dashboard', component: DashboardComponent },
      { path: 'lista-torneos/:ambitId', component: ListaTorneosComponent },
      { path: 'torneo-inscrito/:tournamentId', component: TorneoInscritosComponent },
      { path: 'resumen-torneo/:tournamentId', component: ResumenTorneoComponent },
      { path: 'detalle-torneo/:tournamentId/:modalityId', component: DatallesTorneoComponent },
      { path: 'detalle-jugador/:userId', component: DatallesJugadorComponent },

      // JUGADORES (rol: JUGADOR, ENTRENADOR, ADMIN)
      { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['JUGADOR', 'ENTRENADOR', 'ADMIN'] } },
      { path: 'mis-torneos', component: MisTorneosComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['JUGADOR', 'ENTRENADOR', 'ADMIN'] } },
      { path: 'mis-resultados', component: MisResultadosComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['JUGADOR', 'ENTRENADOR', 'ADMIN'] } },

      // ENTRENADORES Y ADMINISTRADORES
      { path: 'club', component: ClubComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ENTRENADOR', 'ADMIN', 'JUGADOR'] } },

      // ACCESO GENERAL (requiere login pero sin restricción por rol)
      { path: 'jugadores', component: JugadoresComponent, canActivate: [AuthGuard] },

      // ADMINISTRADORES
      { path: 'clubes', component: ClubesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['JUGADOR', 'ADMIN'] } },
      { path: 'Usuarios', component: UsersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'torneos', component: TorneosComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'ENTRENADOR'] } },
      { path: 'torneos-result', component: TournamentResultComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'ENTRENADOR'] } },
      { path: 'reults', component: ResultsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'ENTRENADOR'] } },
      { path: 'modalitys', component: ModalityComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'categorys', component: CategorysComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'ambits', component: AmbitComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
