import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  private pb = new PocketBase('https://db.buckapi.com:8095');

  constructor(
    private http: HttpClient
  ) {}

  async createSupervisor(data: any): Promise<any> {
    try {
      const record = await this.pb.collection('supervisors').create(data);
      return record;
    } catch (error) {
      console.error('Error creating supervisor:', error);
      throw error;
    }
  }
  getSupervisors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.pb.baseUrl}/supervisors`);
  }
}
