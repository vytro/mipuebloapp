import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, map, startWith, catchError, of } from 'rxjs';
import { DataState } from 'src/app/enum/datastate.enum';
import { CustomHttpResponse, UserPage } from 'src/app/interface/appstates';
import { State } from 'src/app/interface/state';
import { CustomerService } from 'src/app/service/customer.service';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InvoicesComponent implements OnInit {
  invoicesState$: Observable<State<CustomHttpResponse<UserPage>>> | undefined;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<UserPage>>({} as CustomHttpResponse<UserPage>);

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  private showLogsSubject = new BehaviorSubject<boolean>(false);
  showLogs$ = this.showLogsSubject.asObservable();
  readonly DataState = DataState;
  // readonly EventType = EventType;

  constructor(private router: Router, private customerService: CustomerService,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    console.log('Function Fired, ngOnInit, profile.component.ts')
    this.invoicesState$ = this.customerService.invoices$()
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

  goToPage(pageNumber?: number): void {
    console.log('Function Fired, goToPage, home.component.ts')
    // this.customersState$ = this.customerService.customers$(pageNumber)
    this.invoicesState$ = this.customerService.invoices$(pageNumber)
      .pipe(
        map(response => {
          console.log(response);
          this.notificationService.onDefault(response.message);
          this.dataSubject.next(response);
          this.currentPageSubject.next(pageNumber || 0);
          return { dataState: DataState.LOADED, appData: response };
        }),
        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          return of({ dataState: DataState.LOADED, error, appData: this.dataSubject.value })
        })
      )
  }

  goToNextOrPreviousPage(direction?: string): void {
    this.goToPage(direction === 'forward' ? this.currentPageSubject.value + 1 : this.currentPageSubject.value - 1);
  }


  //if it takes too many resources, we can use a switchMap
  //or do *ngIf="(state?.appData?.data?.page?.content?.length ?? 0) > 0" in html
  hasContent(): boolean {
    const data = this.dataSubject.value;
    return Boolean(
      data
      && data.data
      && data.data.page
      && data.data.page.content
      && data.data.page.content.length > 0
    );
  }


}