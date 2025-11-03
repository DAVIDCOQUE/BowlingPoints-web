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
import { PlayersComponent } from './pages/players/players.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TournamentSummaryComponent } from './pages/tournament-history/tournament-summary/tournament-summary.component';
import { TournamentDetailsComponent } from './pages/tournament-history/tournament-details/tournament-details.component';
import { PlayerDetailsComponent } from './pages/tournament-history/player-details/player-details.component';
import { TournamentlistComponent } from './pages/tournament-history/tournament-list/tournament-list.component';
import { TournamentParticipantsComponent } from './pages/tournament-history/tournament-participants/tournament-participants.component';
import { HttpClientModule } from '@angular/common/http';
import { ClubsComponent } from './pages/clubs/clubs.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ModalityComponent } from './pages/modality/modality.component';
import { BodyComponent } from './layouts/body/body.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { SidebarComponent } from './layouts/header-sidenav/sidebar/sidebar.component';

import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './layouts/header-sidenav/header/header.component';
import { UserTournamentsComponent } from './pages/user-tournaments/user-tournaments.component';
import { UserStatsComponent } from './pages/user-stats/user-stats.component';
import { ClubComponent } from './pages/club/club.component';
import { UsersComponent } from './pages/users/users.component';
import { TournamentsComponent } from './pages/tournaments/tournaments.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './auth/jwt.interceptor';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { AmbitComponent } from './pages/ambit/ambit.component';
import { LoadingComponent } from './components/loading/loading.component';
import { ResultsAndStatsComponent } from './pages/results-and-stats/results-and-stats.component';
import { TournamentResultComponent } from './pages/tournament-result/tournament-result.component';
import { TournamentDetailsSummaryComponent } from './pages/tournament-history/tournament-details-summary/tournament-details-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    PlayersComponent,
    ClubsComponent,
    FooterComponent,
    ProfileComponent,
    TournamentSummaryComponent,
    TournamentDetailsComponent,
    PlayerDetailsComponent,
    TournamentlistComponent,
    BodyComponent,
    SidebarComponent,
    HeaderComponent,
    UserTournamentsComponent,
    UserStatsComponent,
    ClubComponent,
    UsersComponent,
    TournamentsComponent,
    UnauthorizedComponent,
    CategoriesComponent,
    ModalityComponent,
    AmbitComponent,
    LoadingComponent,
    ResultsAndStatsComponent,
    TournamentResultComponent,
    TournamentParticipantsComponent,
    TournamentDetailsSummaryComponent
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
