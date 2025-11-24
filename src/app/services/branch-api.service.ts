import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBranch } from '../model/branch.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {
  private readonly apiUrl = `${environment.apiUrl}/branches`;

  constructor(private readonly http: HttpClient) { }

  getAll(): Observable<IBranch[]> {
    return this.http.get<IBranch[]>(this.apiUrl);
  }

  getById(id: number): Observable<IBranch> {
    return this.http.get<IBranch>(`${this.apiUrl}/${id}`);
  }

  create(branch: Omit<IBranch, 'branchId'>): Observable<IBranch> {
    return this.http.post<IBranch>(this.apiUrl, branch);
  }

  update(branch: IBranch): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${branch.branchId}`, branch);
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

}
