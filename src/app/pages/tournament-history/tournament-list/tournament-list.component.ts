import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IGenerico } from 'src/app/model/generico.interface';
import { IAmbit } from 'src/app/model/ambit.interface';
import { ITournament } from 'src/app/model/tournament.interface';

@Component({
  selector: 'app-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.css']
})
export class TournamentlistComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  ambitId!: number;
  ambitName = '';

  listaTorneos: ITournament[] = [];

  ngOnInit(): void {
    this.ambitId = +(this.route.snapshot.paramMap.get('ambitId') || 0);
    if (this.ambitId > 0) {
      this.getAmbitNameById(this.ambitId);
      this.getListaTorneos();
    }
  }

  getAmbitNameById(id: number): void {
    this.http.get<IGenerico<IAmbit>>(`${environment.apiUrl}/ambits/${id}`)
      .subscribe({
        next: (res) => {
          this.ambitName = res.data?.name ?? '';
        },
        error: (err) => {
          console.error('Error al obtener el ámbito:', err);
        }
      });
  }

  getListaTorneos(): void {
    this.http.get<IGenerico<ITournament[]>>(`${environment.apiUrl}/results/by-ambit?ambitId=${this.ambitId}`)
      .subscribe({
        next: (res) => {
          this.listaTorneos = res.data ?? [];
        },
        error: (err) => {
          console.error('Error al obtener torneos:', err);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['dashboard']);
  }
}
