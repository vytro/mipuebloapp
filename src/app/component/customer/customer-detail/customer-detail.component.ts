import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, BehaviorSubject, map, startWith, catchError, of, switchMap } from 'rxjs';
import { DataState } from 'src/app/enum/datastate.enum';
import { CustomHttpResponse, CustomerState } from 'src/app/interface/appstates';
import { State } from 'src/app/interface/state';
import { CustomerService } from 'src/app/service/customer.service';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDetailComponent implements OnInit {
  customerState$: Observable<State<CustomHttpResponse<CustomerState>>> | undefined;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<CustomerState>>({} as CustomHttpResponse<CustomerState>);

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;
  private readonly CUSTOMER_ID: string = 'id';

  constructor(private activatedRoute: ActivatedRoute, private customerService: CustomerService,
    private notificationService: NotificationService) { }


  ngOnInit(): void {
    console.log('Function Fired, ngOnInit, customer.component.ts')
    // customerState gets a specific customer
    // from the customer$ function /customer/get/${customerId}
    this.customerState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.customerService.customer$(Number(params?.get(this.CUSTOMER_ID)) ?? 0)
          .pipe(
            map(response => {
              console.log(response);
              this.notificationService.onDefault(response.message);
              this.dataSubject.next(response);
              return { dataState: DataState.LOADED, appData: response };
            }),
            startWith({ dataState: DataState.LOADING }),
            catchError((error: string) => {
              this.notificationService.onError(error);
              return of({ dataState: DataState.ERROR, error })
            })
          )
      })
    );
  }


  // original way:
  // updateCustomer(customerForm: NgForm): void {
  //   this.isLoadingSubject.next(true);
  //   this.customerState$ = this.customerService.update$(customerForm.value)
  //     .pipe(
  //       map(response => {
  //         console.log(response);
  //         this.dataSubject.next({ ...response, 
  //           data: { ...response.data, 
  //             customer: { ...response.data.customer, 
  //               invoices: this.dataSubject.value.data.customer.invoices }}});

  //         this.isLoadingSubject.next(false);
  //         return { dataState: DataState.LOADED, appData: this.dataSubject.value };
  //       }),
  //       startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
  //       catchError((error: string) => {
  //         this.isLoadingSubject.next(false);
  //         return of({ dataState: DataState.ERROR, error })
  //       })
  //     )
  // }

  // second way:
  // updateCustomer(customerForm: NgForm): void {
  //   this.isLoadingSubject.next(true);
  //   this.customerState$ = this.customerService.update$(customerForm.value)
  //     .pipe(
  //       map(response => {
  //         console.log(response);
  //         this.dataSubject.next({
  //           ...response,
  //           data: {
  //             ...response.data,
  //             customer: {
  //               ...(response.data?.customer || {}),
  //               id: response.data?.customer?.id || 0,
  //               invoices: this.dataSubject.value.data?.customer.invoices,
  //               name: response.data?.customer?.name ?? '',
  //               email: response.data?.customer?.email ?? '',
  //               addresss: response.data?.customer?.addresss ?? '',
  //               type: response.data?.customer?.type ?? '',
  //               status: response.data?.customer?.status ?? '',
  //               imageUrl: response.data?.customer?.imageUrl ?? '',
  //               phone: response.data?.customer?.phone ?? '',
  //               createdAt: response.data?.customer?.createdAt ?? new Date()
  //             }
  //           },
  //           user: this.getUser(response) || {} as User 
  //         } as CustomHttpResponse<CustomerState>); 

  //         this.isLoadingSubject.next(false);
  //         return { dataState: DataState.LOADED, appData: this.dataSubject.value };
  //       }),
  //       startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
  //       catchError((error: string) => {
  //         this.isLoadingSubject.next(false);
  //         return of({ dataState: DataState.ERROR, error })
  //       })
  //     )
  // }

  // getUser(response: any): User {
  //   if (response.data?.user) {
  //     return response.data.user;
  //   } else {
  //     return {
  //       id: 0,
  //       firstName: 'Default',
  //       lastName: 'User',
  //       email: 'default@user.com',
  //       enabled: true,
  //       notLocked: true,
  //       usingMfa: false,
  //       roleName: 'Default Role',
  //       permissions: 'Default Permission'
  //     };
  //   }
  // }

  // another way:
  // updateCustomer(customerForm: NgForm): void {
  //   this.isLoadingSubject.next(true);
  //   this.customerState$ = this.customerService.update$(customerForm.value)
  //     .pipe(
  //       map(response => {
  //         console.log(response);
  //         const customer = response.data?.customer;
  //         const user = this.getUser(response);
  //         if (customer && user) {
  //           this.dataSubject.next({
  //             ...response,
  //             data: {
  //               ...response.data,
  //               customer: {
  //                 ...customer,
  //                 invoices: this.dataSubject.value.data?.customer.invoices,
  //                 imageUrl: `${customer.imageUrl}?time=${new Date().getTime()}`,
  //               },
  //               user: user
  //             }
  //           });
  //         }
  //         this.isLoadingSubject.next(false);
  //         return { dataState: DataState.LOADED, appData: this.dataSubject.value };
  //       }),
  //       startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
  //       catchError((error: string) => {
  //         this.isLoadingSubject.next(false);
  //         return of({ dataState: DataState.ERROR, error })
  //       })
  //     )
  // }


  updateCustomer(customerForm: NgForm): void {
    this.isLoadingSubject.next(true);
    this.customerState$ = this.customerService.update$(customerForm.value)
      .pipe(
        map(response => {
          console.log(response);
          this.notificationService.onDefault(response.message);
          const customer = response.data?.customer;
          const user = response.data?.user;
          if (customer && user) {
            this.dataSubject.next({
              ...response,
              data: {
                ...response.data,
                customer: {
                  ...customer,
                  invoices: this.dataSubject.value.data?.customer.invoices,
                  // imageUrl: `${customer.imageUrl}?time=${new Date().getTime()}`,
                },
                user: user
              }
            });
          }
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.ERROR, error })
        })
      )
  }



}
