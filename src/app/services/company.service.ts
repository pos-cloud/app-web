import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Company } from './../models/company';
import { Config } from './../app.config';
import { AuthService } from './auth.service';
import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class CompanyService {

	constructor(
		public _http: Http,
    public _authService: AuthService,
    private http: HttpClient,
	) { }

  	getLastCompany () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'companies/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
  	}

  	getCompany (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "company/"+id, { headers: headers }).map (res => res.json());
  	}

  	getCompanies (query?: string) {
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._authService.getToken()
			});
			if (query) {
				return this._http.get(Config.apiURL + "companies/" + query, { headers: headers }).map (res => res.json());
			} else {
				return this._http.get(Config.apiURL + "companies", { headers: headers }).map(res => res.json());
			}
  	}

  	getCompaniesByType (type: string) {
	  	let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'companies/where="type":"' + type + '"', { headers: headers }).map (res => res.json());
		}

		saveCompany (company : Company) {
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._authService.getToken()
			});
		return this._http.post(Config.apiURL + "company",company, { headers: headers }).map (res => res.json());
		}

		deleteCompany (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "company/"+id, { headers: headers }).map (res => res.json());
		}

  	updateCompany (company: Company){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "company/"+company._id, company, { headers: headers }).map (res => res.json());
		}

		getQuantityOfCompaniesByType(type: string, startDate: string, endDate: string) {
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._authService.getToken()
			});
			var query = '{"type":"' + type +'","startDate":"' + startDate + '", "endDate":"' + endDate + '"}';
			return this._http.get(Config.apiURL + "quantity-of-companies-by-type/" + query, { headers: headers }).map(res => res.json());
		}

		getSalesByCompany(query: string) {
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._authService.getToken()
			});
			return this._http.get(Config.apiURL + 'sales-by-company/' + query, { headers: headers }).map(res => res.json());
		}

  	getSummaryOfAccountsByCompany(query: string) {
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._authService.getToken()
			});
    return this._http.get(Config.apiURL + "summary-of-accounts-by-company/" + query, { headers: headers }).map(res => res.json());
  	}

  	getSummaryOfAccounts(query: string) {
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._authService.getToken()
			});
			return this._http.get(Config.apiURL + "summary-of-accounts/" + query, { headers: headers }).map(res => res.json());
  	}

  // V2
  	public getCompaniesV2(
			project: {},
				match: {},
				sort: {},
				group: {},
				limit: number = 0,
				skip: number = 0
			): Observable<any> {

				const URL = `${Config.apiURL}v2/companies`;

				const headers = new HttpHeaders()
					.set('Content-Type', 'application/json')
					.set('Authorization', this._authService.getToken());

				const params = new HttpParams()
					.set('project', JSON.stringify(project))
					.set('match', JSON.stringify(match))
					.set('sort', JSON.stringify(sort))
					.set('group', JSON.stringify(group))
					.set('limit', limit.toString())
					.set('skip', skip.toString());

				return this.http.get(URL, {
					headers: headers,
					params: params
				}).pipe(
					map(res => {
						return res;
					})
				);
		}

		public getFieldByCompany(
			project: {},
			match: {},
			sort: {},
			group: {},
			limit: number = 0,
			skip: number = 0
		) : Observable <any> {
				const URL = `${Config.apiURL}/fields`;

				const headers = new HttpHeaders()
					.set('Content-Type', 'application/json')
					.set('Authorization', this._authService.getToken());
				//.set('Authorization', this._authService.getSession()["token"]);

				const params = new HttpParams()
					.set('project', JSON.stringify(project))
					.set('match', JSON.stringify(match))
					.set('sort', JSON.stringify(sort))
					.set('group', JSON.stringify(group))
					.set('limit', limit.toString())
					.set('skip', skip.toString());

				return this.http.get(URL, {
					headers: headers,
					params: params
				}).pipe(
					map(res => {
						return res;
					})
				);
		}
	

		public exportAsExcelFile(json: any[], excelFileName: string): void {
			const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
			const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
			const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
			this.saveAsExcelFile(excelBuffer, excelFileName);
		}
		private saveAsExcelFile(buffer: any, fileName: string): void {
			const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
			FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
		}
}
