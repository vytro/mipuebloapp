import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, BehaviorSubject, map, startWith, catchError, of, switchMap } from 'rxjs';
import { DataState } from 'src/app/enum/datastate.enum';
import { AccountType, VerifyState } from 'src/app/interface/appstates';
import { User } from 'src/app/interface/user';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyComponent implements OnInit {
  verifyState$: Observable<VerifyState> | undefined;

  private userSubject = new BehaviorSubject<User>({} as User);
  user$ = this.userSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  private readonly ACCOUNT_KEY: string = 'key';

  //activatedRoute to know which route is being used, either account or password
  constructor(private activatedRoute: ActivatedRoute, private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    console.log('Function Fired, ngOnInit, customer.component.ts')
    this.verifyState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        console.log(this.activatedRoute)
        const type: AccountType = this.getAccountType(window.location.href);
        return this.userService.verify$(params.get(this.ACCOUNT_KEY) ?? '', type)
          .pipe(
            map(response => {
              console.log(response);
              this.notificationService.onDefault(response.message);
              type === 'password' ? this.userSubject.next(response.data?.user ?? {} as User) : null;
              return { type, title: 'Verificado!', dataState: DataState.LOADED, message: response.message, verifySuccess: true };
            }),
            startWith({ title: 'Verificando...', dataState: DataState.LOADING, message: 'Espere mientras verificamos la informacion', verifySuccess: false }),
            catchError((error: string) => {
              this.notificationService.onError(error);
              return of({ title: 'Ocurrio un error...', dataState: DataState.ERROR, error, message: error, verifySuccess: false })
            })
          )
      })
    );
  }

  renewPassword(resetPasswordForm: NgForm): void {
    console.log('Function Fired, renewPassword, verify.component.ts')
    this.isLoadingSubject.next(true);
    //getting those 3 variables from the form, we saved it on the ngOnInit, as the response
    this.verifyState$ = this.userService.renewPassword$({
      userId: this.userSubject.value.id,
      password: resetPasswordForm.value.password,
      confirmPassword: resetPasswordForm.value.confirmPassword
    })
      .pipe(
        map(response => {
          console.log(response);
          this.notificationService.onDefault(response.message);
          this.isLoadingSubject.next(false);
          return { type: 'account' as AccountType, title: 'Exitoso!', dataState: DataState.LOADED, message: response.message, verifySuccess: true };
        }),
        startWith({ type: 'password' as AccountType, title: 'Verificado!', dataState: DataState.LOADED, verifySuccess: false }),
        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          this.notificationService.onError(error);
          resetPasswordForm.resetForm(); //maybe because of the nulls or backend
          return of({ type: 'password' as AccountType, title: 'Verificado!', dataState: DataState.LOADED, error, verifySuccess: true })
        })
      )
  }


  private getAccountType(url: string): AccountType {
    return url.includes('password') ? 'password' : 'account';
  }
}