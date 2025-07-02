import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IGenerico } from 'src/app/model/generico.interface';
import { IAmbit } from 'src/app/model/ambit.interface';

@Component({
  selector: 'app-lista-torneos',
  templateUrl: './lista-torneos.component.html',
  styleUrls: ['./lista-torneos.component.css']
})
export class ListaTorneosComponent {

  ambitId!: number;
  ambitName: string = "";

  listaTorneos: any = null;

  constructor(private router: Router, private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.ambitId = +this.route.snapshot.paramMap.get('ambitId')!;
    this.getAmbitNameById(this.ambitId);
    this.getListaTorneos()
  }

  getAmbitNameById(id: number): void {
    this.http.get<IGenerico<IAmbit>>(`${environment.apiUrl}/ambits/${id}`)
      .subscribe(res => {
        this.ambitName = res.data?.name ?? '';
      });
  }

  getListaTorneos() {
    this.http.get<any>(`${environment.apiUrl}/results/by-ambit?ambitId=${this.ambitId}`)
      .subscribe(res => {
        this.listaTorneos = res.data;
      });
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }

}
