import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IAmbit } from 'src/app/model/ambit.interface';

@Injectable({
  providedIn: 'root'
})
export class AmbitApiService {
  private readonly apiUrl = `${environment.apiUrl}/ambits`;

  constructor(private  readonly http: HttpClient) { }

  getAmbits(): Observable<IAmbit[]> {
    return this.http.get<{ success: boolean; message: string; data: IAmbit[] }>(this.apiUrl)
      .pipe(map(res => res.data));
  }

  getActiveAmbits(): Observable<{ success: boolean; message: string; data: IAmbit[] }> {
    return this.http.get<{ success: boolean; message: string; data: IAmbit[] }>(
      `${this.apiUrl}/actives`
    );
  }

  createAmbit(payload: Partial<IAmbit>): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  updateAmbit(id: number, payload: Partial<IAmbit>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteAmbit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
