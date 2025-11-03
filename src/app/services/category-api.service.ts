import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICategory } from '../model/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<ICategory[]> {
    return this.http.get<{ success: boolean; message: string; data: ICategory[] }>(this.apiUrl)
      .pipe(map(res => res.data));
  }

  getActiveCategories(): Observable<{ success: boolean; message: string; data: ICategory[] }> {
    return this.http.get<{ success: boolean; message: string; data: ICategory[] }>(
      `${this.apiUrl}/actives`
    );
  }

  createCategory(payload: Partial<ICategory>): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  updateCategory(id: number, payload: Partial<ICategory>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
