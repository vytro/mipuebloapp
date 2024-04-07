import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { EventType } from '@angular/router';
import { Observable, BehaviorSubject, map, startWith, catchError, of } from 'rxjs';
import { DataState } from 'src/app/enum/datastate.enum';
import { CustomHttpResponse, Page, Profile, UserData } from 'src/app/interface/appstates';
import { Customer } from 'src/app/interface/customer';
import { State } from 'src/app/interface/state';
import { CustomerService } from 'src/app/service/customer.service';
import { UserService } from 'src/app/service/user.service';
import { saveAs } from 'file-saver';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  // homeState$: Observable<State<CustomHttpResponse<Page & User>>> | undefined;
  homeState$: Observable<State<CustomHttpResponse<UserData>>> | undefined;
  // private dataSubject = new BehaviorSubject<CustomHttpResponse<Page & User>>({} as CustomHttpResponse<Page & User>);
  private dataSubject = new BehaviorSubject<CustomHttpResponse<UserData>>({} as CustomHttpResponse<UserData>);

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  private showLogsSubject = new BehaviorSubject<boolean>(false);
  showLogs$ = this.showLogsSubject.asObservable();

  // private filStatusSubject = new BehaviorSubject<{ status: string, type: string, percent: number }>({ status: '', type: '', percent: 0 });
  private filStatusSubject = new BehaviorSubject<{ status: string, type: string, percent: number } | undefined>(undefined);
  fileStatus$ = this.filStatusSubject.asObservable();

  readonly DataState = DataState;
  // readonly EventType = EventType;

  constructor(private router: Router, private userService: UserService, private customerService: CustomerService,
    private notificationService: NotificationService) { }

  // going to fire every time the component is loaded
  ngOnInit(): void {
    console.log('Function Fired, ngOnInit, home.component.ts')
    // this is the observable that is going to be used in the template
    this.homeState$ = this.customerService.customers$()
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
    // console.log('Function Fired, goToPage, home.component.ts')
    this.homeState$ = this.customerService.customers$(pageNumber)
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

  selectedCustomer(customer: Customer): void {
    this.router.navigate([`/customers/${customer.id}`]);
  }


  //if it takes too much resources, we can use a switchMap
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


  report(): void {
    this.homeState$ = this.customerService.downloadReport$()
      .pipe(
        map(response => {
          console.log(response);
          // this.notificationService.onDefault(response.message); //response doesn't have an http message
          this.reportProgress(response); //response is of httpevent and not of ultimate response
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          return of({ dataState: DataState.LOADED, error, appData: this.dataSubject.value })
        })
      )
  }

  private reportProgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch (httpEvent.type) {
      case HttpEventType.Sent:
        console.log('Downloading has started');
        break;
      // case HttpEventType.UploadProgress:
      //   const percentDone = Math.round(100 * httpEvent.loaded / (httpEvent.total || 100));
      //   console.log(`File is ${percentDone}% uploaded`);
      //   break;
      case HttpEventType.DownloadProgress:
        // const percentDownloaded = Math.round(100 * httpEvent.loaded / (httpEvent.total || 100)); // || or ??
        // console.log(`File is ${percentDownloaded}% downloaded`);
        this.filStatusSubject.next({
          status: 'progress', type: 'Downloading...',
          percent: Math.round(100 * httpEvent.loaded / (httpEvent.total || 100))
        })
        break;
      case HttpEventType.ResponseHeader:
        console.log('Response headers received', httpEvent);
        break;
      case HttpEventType.Response:
        this.notificationService.onDefault('Descargando Archivo...');
        // saveAs(new File([httpEvent.body as BlobPart], 'report.pdf', { type: 'application/pdf' }));
        saveAs(new File([<Blob>httpEvent.body], httpEvent.headers.get('File-Name') || 'report.pdf',
          { type: `${httpEvent.headers.get('Content-Type')}; charset = utf - 8` }));
        this.filStatusSubject.next({ status: '', type: '', percent: 0 });
        console.log('Request has been completed');
        break;
      default:
        console.log(httpEvent);
        break;
    }
  }

}