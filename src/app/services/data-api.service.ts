import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { map} from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { WorkInstructionService } from './work-instruction.service';
import { ProductService } from './product.service';
export interface workInstructionsInterface{
}
export interface productInterface{
}
export interface ventaInterface{
}
@Injectable({
  providedIn: 'root'
})
export class DataApiService {
  private baseUrl = 'https://db.buckapi.com:8095/api';

  constructor(
    private http: HttpClient,           
    public global: GlobalService,
    private fb: FormBuilder
  ) { }
  headers : HttpHeaders = new HttpHeaders({  		
    "Content-Type":"application/json"	
});

  getAllWorkInstructions(): Observable<WorkInstructionService []> {
    return this.http.get<WorkInstructionService[]>(`${this.baseUrl}/collections/workInstructions/records`);
  }
  saveworkInstructions(request: workInstructionsInterface) {
    const url_api = this.baseUrl + '/collections/workInstructions/records';
		return this.http.post<workInstructionsInterface>(url_api, request).pipe(
		  map(data => data)
		);
	  }
  
  addProduct(request: productInterface) {
    const url_api = this.baseUrl + '/collections/productsInventory/records';
		return this.http.post<productInterface>(url_api, request).pipe(
		  map(data => data)
		);
	  }
  saveVenta(request: ventaInterface) {
    const url_api = this.baseUrl + '/collections/ventas/records';
		return this.http.post<ventaInterface>(url_api, request).pipe(
		  map(data => data)
		);
	  }
   
  getAllProducts(): Observable<ProductService []> {
    return this.http.get<ProductService[]>(`${this.baseUrl}/collections/products/records`);
  }
  updateProduct(id: string, request: productInterface) {
    const url_api = this.baseUrl + `/collections/products/records/${id}`;
		return this.http.put<productInterface>(url_api, request).pipe(
		  map(data => data)
		);
	  }
  deleteSale(saleId: string) {
    const url_api = this.baseUrl + `/collections/ventas/records/${saleId}`;
    return this.http.delete<ventaInterface>(url_api).pipe(
      map(data => data)
    );
  }
}
