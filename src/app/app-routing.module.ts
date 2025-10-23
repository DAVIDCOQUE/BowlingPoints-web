import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { BodyComponent } from './layouts/body/body.component';
import { PlayersComponent } from './pages/players/players.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ClubsComponent } from './pages/clubs/clubs.component';
import { UserTournamentsComponent } from './pages/user-tournaments/user-tournaments.component';
import { UserStatsComponent } from './pages/user-stats/user-stats.component';
import { ClubComponent } from './pages/club/club.component';
import { TournamentsComponent } from './pages/tournaments/tournaments.component';
import { UsersComponent } from './pages/users/users.component';
import { TournamentlistComponent } from './pages/tournament-history/tournament-list/tournament-list.component';
import { TournamentDetailsComponent } from './pages/tournament-history/tournament-details/tournament-details.component';
import { TournamentSummaryComponent } from './pages/tournament-history/tournament-summary/tournament-summary.component';
import { PlayerDetailsComponent } from './pages/tournament-history/player-details/player-details.component';

import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { ModalityComponent } from './pages/modality/modality.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { AmbitComponent } from './pages/ambit/ambit.component';
import { ResultsComponent } from './pages/results/results.component';
import { TournamentParticipantsComponent } from './pages/tournament-history/tournament-participants/tournament-participants.component';
import { ResultsAndStatsComponent } from './pages/results-and-stats/results-and-stats.component';
import { TournamentResultComponent } from './pages/tournament-result/tournament-result.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: '',
    component: BodyComponent,
    children: [
      // VISITANTES (sin login, sin protección)
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tournament-list/:ambitId', component: TournamentlistComponent },
      { path: 'tournament-summary/:tournamentId', component: TournamentSummaryComponent },
      { path: 'tournament-details/:tournamentId/:modalityId', component: TournamentDetailsComponent },
      { path: 'tournament-participants/:tournamentId', component: TournamentParticipantsComponent },
      { path: 'player-details/:userId', component: PlayerDetailsComponent },

      // JUGADORES (rol: JUGADOR, ENTRENADOR, ADMIN)
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['JUGADOR', 'ENTRENADOR', 'ADMIN'] } },
      { path: 'user-tournaments', component: UserTournamentsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['JUGADOR', 'ENTRENADOR', 'ADMIN'] } },
      { path: 'user-stats', component: UserStatsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['JUGADOR', 'ENTRENADOR', 'ADMIN'] } },

      // ENTRENADORES Y ADMINISTRADORES
      { path: 'club', component: ClubComponent },
      { path: 'club/:id', component: ClubComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ENTRENADOR', 'ADMIN', 'JUGADOR'] } },

      // ACCESO GENERAL (requiere login pero sin restricción por rol)
      { path: 'players', component: PlayersComponent, canActivate: [AuthGuard] },

      // ADMINISTRADORES
      { path: 'clubs', component: ClubsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['JUGADOR', 'ADMIN'] } },
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'tournaments', component: TournamentsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'ENTRENADOR'] } },
      { path: 'tournament-results/:tournamentId', component: TournamentResultComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'ENTRENADOR'] } },
      { path: 'results-stats', component: ResultsAndStatsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'ENTRENADOR'] } },
      { path: 'reults', component: ResultsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'ENTRENADOR'] } },
      { path: 'modalitys', component: ModalityComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
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
