import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Transaction } from './../models/transaction';
import { TransactionType, TransactionMovement } from './../models/transaction-type';
import { Config } from './../app.config';
import { AuthService } from './auth.service';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { MovementOfCash } from 'app/models/movement-of-cash';

@Injectable()
export class TransactionService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public getTransaction(_id: string): Observable<any> {

        const URL = `${Config.apiURL}transaction`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }

	public getTransactions(
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}transactions`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')           
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('query', query);

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }

    public getTransactionsV2(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}v2/transactions`;

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

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }

	public getTransactionsByMovement(
		transactionMovement: TransactionMovement,
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}transactions-by-movement/${transactionMovement}`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')           
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('query', query);

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }

	public getTotalTransactionsBetweenDates(
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}total-transactions`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')           
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('query', query);

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
	}

	public getVATBook(
		query?: string
	): Observable<any> {

		const URL = `${Config.apiURL}get-vat-book`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')           
			.set('Authorization', this._authService.getToken());

		const params = new HttpParams()
			.set('query', query);

		return this._http.get(URL, {
			headers: headers,
			params: params
		}).pipe(
			map(res => {
				return res;
			}),
			catchError((err) => {
				return empty();
			})
		);
	}

	public exportCiti(
		VATPeriod: string, 
		transactionMovement: TransactionMovement
	): Observable<any> {

		const URL = `${Config.apiURL}export-citi`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')           
			.set('Authorization', this._authService.getToken());

		let query = '{ "VATPeriod": "' + VATPeriod + '", "transactionMovement": "' + transactionMovement + '" }';

		const params = new HttpParams()
			.set('query', query);

		return this._http.get(URL, {
			headers: headers,
			params: params
		}).pipe(
			map(res => {
				return res;
			}),
			catchError((err) => {
				return empty();
			})
		);
	}

	public downloadFile(
		fileName: string
	): Observable<any> {

		const URL = `${Config.apiURL}download-file`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')           
			.set('Authorization', this._authService.getToken());

		const params = new HttpParams()
			.set('fileName', fileName);

		return this._http.get(URL, {
			headers: headers,
			params: params
		}).pipe(
			map(res => {
				return res;
			}),
			catchError((err) => {
				return empty();
			})
		);
	}

	public saveTransaction(transaction: Transaction): Observable<any> {

        const URL = `${Config.apiURL}transaction`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, transaction, {
            headers: headers
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
	}

	public validateElectronicTransactionAR(transaction: Transaction): Observable<any> {

        const URL = `${Config.apiURL}transaction`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/x-www-form-urlencoded');
			
		let body = 'transaction=' + JSON.stringify(transaction) + '&' + 'config=' + '{"companyIdentificationValue":"' + Config.companyIdentificationValue + '","vatCondition":' + Config.companyVatCondition.code + ',"database":"' + Config.database + '"}';

        return this._http.post(URL, body, {
            headers: headers
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
	}

	public validateElectronicTransactionMX(
		transaction: Transaction,
		movementsOfArticles: MovementOfArticle[],
		movementsOfCashes: MovementOfCash[]
	): Observable<any> {

        const URL = `${Config.apiURL}transaction`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/x-www-form-urlencoded');
			
			let body =      'transaction=' + JSON.stringify(transaction) + '&' +
			'movementsOfArticles=' + JSON.stringify(movementsOfArticles) + '&' +
			'movementsOfCashes=' + JSON.stringify(movementsOfCashes) + '&' +
			'config=' + '{"companyIdentificationValue":"' + Config.companyIdentificationValue + '","vatCondition":' + Config.companyVatCondition.code + ',"companyName":"' + Config.companyName + '","companyPostalCode":"' + Config.companyPostalCode + '","database":"' + Config.database + '"}';

        return this._http.post(URL, body, {
            headers: headers
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
	}
	  
	public updateTransaction(transaction: Transaction): Observable<any> {

        const URL = `${Config.apiURL}transaction`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', transaction._id);

        return this._http.put(URL, transaction, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }

	public updateBalance(transaction: Transaction): Observable<any> {

        const URL = `${Config.apiURL}update-balance`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.put(URL, transaction, {
            headers: headers,
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }
	  
	public deleteTransaction(_id: string): Observable<any> {

        const URL = `${Config.apiURL}transaction`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this._http.delete(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }
}
