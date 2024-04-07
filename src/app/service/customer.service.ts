import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { CustomHttpResponse, CustomerState, CustomersState, Page, Profile, UserData, UserPage } from '../interface/appstates';
import { User } from '../interface/user';
import { Key } from '../enum/key.enum';
import { Customer } from '../interface/customer';
import { Invoice } from '../interface/invoice';
import { environment } from 'src/environments/environment';

@Injectable()
export class CustomerService {
    private readonly server: string = environment.API_BASE_URL;

    constructor(private http: HttpClient) { }

    // customers$ = (page: number = 0) => <Observable<CustomHttpResponse<Page & User>>>
    customers$ = (page: number = 0) => <Observable<CustomHttpResponse<UserData>>>
        this.http.get<CustomHttpResponse<UserData>>
            (`${this.server}/customer/list?page=${page}`)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );


    customer$ = (customerId: number) => <Observable<CustomHttpResponse<CustomerState>>>
        this.http.get<CustomHttpResponse<CustomerState>>
            (`${this.server}/customer/get/${customerId}`)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );

    update$ = (customer: Customer) => <Observable<CustomHttpResponse<CustomerState>>>
        this.http.put<CustomHttpResponse<CustomerState>>
            (`${this.server}/customer/update`, customer)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );

    searchCustomers$ = (name: string = '', page: number = 0) => <Observable<CustomHttpResponse<UserData>>>
        this.http.get<CustomHttpResponse<UserData>>
            (`${this.server}/customer/search?name=${name}&page=${page}`)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );


    newCustomer$ = (customer: Customer) => <Observable<CustomHttpResponse<User & Customer>>>
        this.http.post<CustomHttpResponse<UserData>>
            (`${this.server}/customer/create`, customer)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );

    newInvoice$ = () => <Observable<CustomHttpResponse<CustomersState>>>
        this.http.get<CustomHttpResponse<CustomersState>>
            (`${this.server}/customer/invoice/new`)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );

    createInvoice$ = (customerId: number, invoice: Invoice) => <Observable<CustomHttpResponse<CustomersState>>>
        this.http.post<CustomHttpResponse<CustomersState>>
            (`${this.server}/customer/invoice/addtocustomer/${customerId}`, invoice)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );

    invoices$ = (page: number = 0) => <Observable<CustomHttpResponse<UserPage>>>
        this.http.get<CustomHttpResponse<UserPage>>
            (`${this.server}/customer/invoice/list?page=${page}`)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );

    invoice$ = (invoiceId: number) => <Observable<CustomHttpResponse<{ customer: Customer, invoice: Invoice, user: User }>>>
        this.http.get<CustomHttpResponse<{ customer: Customer, invoice: Invoice, user: User }>>
            (`${this.server}/customer/invoice/get/${invoiceId}`)
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );

    downloadReport$ = () => <Observable<HttpEvent<Blob>>>
        this.http.get(`${this.server}/customer/download/report`,
            { reportProgress: true, observe: 'events', responseType: 'blob' })
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            );


    private handleError(error: HttpErrorResponse): Observable<never> {
        console.log('Function Fired, handleError, user.service.ts');
        console.log(error);
        let errorMessage: string;
        if (error.error instanceof ErrorEvent) {
            errorMessage = `A client error occurred - ${error.error.message}`;
        } else {
            if (error.error.reason) {
                errorMessage = error.error.reason;
                console.log(errorMessage);
            } else {
                errorMessage = `An error occurred - Error status ${error.status}`;
            }
        }
        return throwError(() => errorMessage);
    }
}
