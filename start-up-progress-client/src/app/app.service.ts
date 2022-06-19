import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PhaseWithTasks } from './types';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { };
  
  rootURL = 'http://localhost:3000/startUpProgress';
  getStructuredList(): Observable<PhaseWithTasks[]>{
    const result = this.http.get<PhaseWithTasks[]>(this.rootURL);
    return result;
  }

  addPhase(name: string, orderNo: number): Observable<any> {
    const body = orderNo ? {name, orderNo} : {name};
    return this.http.post<any>(this.rootURL + '/phase',  body);
  }

  addTask(name: string, orderNo: number, phaseId: string): Observable<any> {
    const body = orderNo ? {name, orderNo, phaseId} : {name, phaseId};
    return this.http.post<any>(this.rootURL + '/task', body);
  }

  deletePhase(id: string): Observable<any> {
    return this.http.delete<any>(this.rootURL + '/phase/' + id);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete<any>(this.rootURL + '/task/' + id);
  }
  
  updateStatus(id: string, status: boolean): Observable<any> {
    const body = { status };
    return this.http.patch<any>(this.rootURL + '/task/' + id, body);
  }
}
