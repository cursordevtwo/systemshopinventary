import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface WorkInstruction {
    id: string | number; 
    companyName: string;
    contactName: string;
    mobile: string;
    progress: number;
    status: string; 
    created: string;
    updated: string;
    expand: any;
    
  }
@Injectable({
  providedIn: 'root'
})
export class WorkInstructionService {
    private baseUrl = 'https://db.buckapi.com:8095/api';

  constructor(private http: HttpClient) { }

  getWorkInstructions(): Observable<WorkInstruction[]> {
    return this.http.get<WorkInstruction[]>(this.baseUrl + '/collections/workInstructions/records')
      .pipe(
        catchError(error => {
          console.error('Error fetching work instructions:', error);
          return throwError(() => error);
        })
      );
  }
} 