import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ListaTorneosComponent } from './pages/resultadosTorneos/lista-torneos/lista-torneos.component';
import { DatallesTorneoComponent } from './pages/resultadosTorneos/datalles-torneo/datalles-torneo.component';
import { DatallesJugadorComponent } from './pages/resultadosTorneos/datalles-jugador/datalles-jugador.component';
import { ResumenTorneoComponent } from './pages/resultadosTorneos/resumen-torneo/resumen-torneo.component';
import { TorneosComponent } from './pages/resultadosTorneos/torneos/torneos.component';
import { JugadorComponent } from './pages/jugador/jugador.component';

const routes: Routes = [
  { path: '', component: LoginComponent },  // Ruta principal o default
  { path: 'dashboard', component: DashboardComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'torneos', component: TorneosComponent },
  { path: 'listaTorneos/:eventType', component: ListaTorneosComponent },
  { path: 'detalleTorneo', component: DatallesTorneoComponent },
  { path: 'detalleJugador', component: DatallesJugadorComponent },  // Detalle de jugador existente
  { path: 'resumenTorneo', component: ResumenTorneoComponent },
  { path: 'jugador/:id', component: JugadorComponent }  // Nueva ruta para detalles de un jugador específico
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
