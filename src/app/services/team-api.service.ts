import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITeam } from 'src/app/model/team.interface';

@Injectable({
  providedIn: 'root'
})
export class TeamApiService {
  private readonly apiUrl = `${environment.apiUrl}/teams`;

  constructor(private readonly http: HttpClient) { }

  getTeams(): Observable<ITeam[]> {
    return this.http.get<{ success: boolean; message: string; data: ITeam[] }>(this.apiUrl)
      .pipe(map(res => res.data));
  }

  getActiveTeams(): Observable<{ success: boolean; message: string; data: ITeam[] }> {
    return this.http.get<{ success: boolean; message: string; data: ITeam[] }>(
      `${this.apiUrl}/actives`
    );
  }

  createTeam(payload: Partial<ITeam>): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  updateTeam(id: number, payload: Partial<ITeam>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
