import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, BehaviorSubject, map, startWith, catchError, of } from 'rxjs';
import { DataState } from 'src/app/enum/datastate.enum';
import { CustomHttpResponse, UserData } from 'src/app/interface/appstates';
import { State } from 'src/app/interface/state';
import { CustomerService } from 'src/app/service/customer.service';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-newcustomer',
  templateUrl: './newcustomer.component.html',
  styleUrls: ['./newcustomer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewcustomerComponent implements OnInit {
  // homeState$: Observable<State<CustomHttpResponse<Page & User>>> | undefined;
  newCustomerState$: Observable<State<CustomHttpResponse<UserData>>> | undefined;
  // private dataSubject = new BehaviorSubject<CustomHttpResponse<Page & User>>({} as CustomHttpResponse<Page & User>);
  private dataSubject = new BehaviorSubject<CustomHttpResponse<UserData>>({} as CustomHttpResponse<UserData>);

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;
  // readonly EventType = EventType;

  constructor(private customerService: CustomerService, private notificationService: NotificationService) { }

  // going to fire every time the component is loaded
  ngOnInit(): void {
    console.log('Function Fired, ngOnInit, profile.component.ts')
    // this is the observable that is going to be used in the template
    this.newCustomerState$ = this.customerService.customers$()
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
  }


  createCustomer(newCustomerForm: NgForm): void {
    console.log('Function Fired, newCustomerForm, newcustomer.component.ts')
    this.isLoadingSubject.next(true);
    // this is the observable that is going to be used in the template
    this.newCustomerState$ = this.customerService.newCustomer$(newCustomerForm.value)
      .pipe(
        map(response => {
          console.log(response);
          this.notificationService.onDefault(response.message);
          newCustomerForm.reset({ type: 'INDIVIDUAL', status: 'ACTIVE' });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, error })
        })
      )
  }
}