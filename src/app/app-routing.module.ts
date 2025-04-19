import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { TorneosComponent } from './pages/resultadosTorneos/torneos/torneos.component';
import { BodyComponent } from './layouts/body/body.component';
import { JugadoresComponent } from './pages/jugadores/jugadores.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ClubesComponent } from './pages/clubes/clubes.component';

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
      { path: 'torneos', component: TorneosComponent },
      { path: 'jugadores', component: JugadoresComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'clubes', component: ClubesComponent }
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
