import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, map, startWith, catchError } from 'rxjs';
import { DataState } from 'src/app/enum/datastate.enum';
import { EventType } from 'src/app/enum/event-type.enum';
import { Key } from 'src/app/enum/key.enum';
import { CustomHttpResponse, Profile } from 'src/app/interface/appstates';
import { State } from 'src/app/interface/state';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {
  profileState$: Observable<State<CustomHttpResponse<Profile>>> | undefined;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<Profile>>({} as CustomHttpResponse<Profile>);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private showLogsSubject = new BehaviorSubject<boolean>(false);
  showLogs$ = this.showLogsSubject.asObservable();
  readonly DataState = DataState;
  readonly EventType = EventType;

  constructor(private userService: UserService, private notificationService: NotificationService) { }

  // going to fire every time the component is loaded
  ngOnInit(): void {
    console.log('Function Fired, ngOnInit, profile.component.ts')
    // this is the observable that is going to be used in the template
    this.profileState$ = this.userService.profile$()
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
          return of({ dataState: DataState.ERROR, appData: this.dataSubject.value, error })
        })
      )
  }

  updateProfile(profileForm: NgForm): void {
    // loading spinner and observable
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.update$(profileForm.value)
      .pipe(
        map(response => {
          console.log(response);
          this.notificationService.onDefault(response.message);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
        })
      )
  }

  updatePassword(passwordForm: NgForm): void {
    // loading spinner and observable
    this.isLoadingSubject.next(true);
    // reason: trying to not make a call to the backend if the passwords don't match
    // if the passwords are not the same, then there is no reason to make a call to the backend
    // http calls are expensive and hitting the backend for no reason is not a good practice
    // delete this if statement for production, if needed, but the backend is going to do the same check
    if (passwordForm.value.newPassword === passwordForm.value.confirmNewPassword) {
      this.profileState$ = this.userService.updatePassword$(passwordForm.value)
        .pipe(
          map(response => {
            console.log(response);
            this.notificationService.onDefault(response.message);
            passwordForm.reset();
            this.dataSubject.next({ ...response, data: response.data });  //did I forget to add this?
            this.isLoadingSubject.next(false);
            return { dataState: DataState.LOADED, appData: this.dataSubject.value };
          }),
          startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
          catchError((error: string) => {
            this.notificationService.onError(error);
            passwordForm.reset();
            this.isLoadingSubject.next(false);
            return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
          })
        )
    } else {
      passwordForm.reset();
      console.log('Passwords do not match');
      this.isLoadingSubject.next(false);
    }
  }

  //another way of doing update password
  // updatePassword(passwordForm: NgForm): void {
  //   this.isLoadingSubject.next(true);
  //   if (passwordForm.value.newPassword === passwordForm.value.confirmNewPassword) {
  //     this.userService.updatePassword$(passwordForm.value)
  //       .subscribe(response => {
  //         console.log(response);
  //         passwordForm.reset();
  //         this.isLoadingSubject.next(false);
  //         this.dataSubject.next(response); // Update the dataSubject with the new state
  //         this.profileState$ = of({ dataState: DataState.LOADED, appData: response });
  //       }, error => {
  //         passwordForm.reset();
  //         this.isLoadingSubject.next(false);
  //         this.profileState$ = of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error });
  //       });
  //   } else {
  //     passwordForm.reset();
  //     console.log('Passwords do not match');
  //     this.isLoadingSubject.next(false);
  //   }
  // }


  updateRole(roleForm: NgForm): void {
    // loading spinner and observable
    this.isLoadingSubject.next(true);
    console.log(roleForm);
    this.profileState$ = this.userService.updateRoles$(roleForm.value.roleName)
      .pipe(
        map(response => {
          console.log(response);
          this.notificationService.onDefault(response.message);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
        })
      )
  }

  updateAccountSettings(settingsForm: NgForm): void {
    // loading spinner and observable
    this.isLoadingSubject.next(true);
    // console.log(settingsForm);
    this.profileState$ = this.userService.updateAccountSettings$(settingsForm.value)
      .pipe(
        map(response => {
          console.log(response);
          this.notificationService.onDefault(response.message);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
        })
      )
  }

  toggleMfa(): void {
    // loading spinner and observable
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.toggleMfa$()
      .pipe(
        map(response => {
          console.log(response);
          this.notificationService.onDefault(response.message);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),
        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
        })
      )
  }

  /*
  // updateImage(image: File): void {
  //   if (image) {
  //     this.isLoadingSubject.next(true);
  //     this.profileState$ = this.userService.updateImage$(this.getFormData(image))
  //       .pipe(
  //         map(response => {
  //           console.log(response);
  //           this.dataSubject.next({
  //             ...response,
  //             data: {
  //               ...response.data,
  //               user: {
  //                 ...response.data?.user,
  //                 // id: response.data?.user?.id || 0,
  //                 // firstName: response.data?.user?.firstName || '',
  //                 // lastName: response.data?.user?.lastName || '',
  //                 // email: response.data?.user?.email || '', 
  //                 imageUrl: `${response.data?.user.imageUrl}?time=${new Date().getTime()}`,
  //                 // enabled: response.data?.user?.enabled || false, 
  //                 // notLocked: response.data?.user?.notLocked || false, 
  //                 // usingMfa: response.data?.user?.usingMfa || false, 
  //                 // roleName: response.data?.user?.roleName!, 
  //                 // permissions: response.data?.user?.permissions || ''
  //               }
  //             }
  //           });
  //           this.isLoadingSubject.next(false);
  //           return { dataState: DataState.LOADED, appData: this.dataSubject.value };
  //         }),
  //         startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
  //         catchError((error: string) => {
  //           this.isLoadingSubject.next(false);
  //           return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
  //         })
  //       )
  //   }
  // }
  */


  /*
    //working
    // updateImage(image: File): void {
    //   if (image) {
    //     this.isLoadingSubject.next(true);
    //     this.profileState$ = this.userService.updateImage$(this.getFormData(image))
    //       .pipe(
    //         map(response => {
    //           console.log(response);
    //           const user = response.data?.user;
    //           if (user) {
    //             this.dataSubject.next({
    //               ...response,
    //               data: {
    //                 ...response.data,
    //                 user: {
    //                   ...user,
    //                   imageUrl: `${user.imageUrl}?time=${new Date().getTime()}`,
    //                 }
    //               }
    //             });
    //           }
    //           this.isLoadingSubject.next(false);
    //           return { dataState: DataState.LOADED, appData: this.dataSubject.value };
    //         }),
    //         startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
    //         catchError((error: string) => {
    //           this.isLoadingSubject.next(false);
    //           return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
    //         })
    //       )
    //   }
    // }
  */


  updateImage(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.isLoadingSubject.next(true);
      this.profileState$ = this.userService.updateImage$(this.getFormData(file))
        .pipe(
          map(response => {
            console.log(response);
            this.notificationService.onDefault(response.message);
            const user = response.data?.user;
            if (user) {
              this.dataSubject.next({
                ...response,
                data: {
                  ...response.data,
                  user: {
                    ...user,
                    imageUrl: `${user.imageUrl}?time=${new Date().getTime()}`,
                  }
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
            return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
          })
        )
    }
  }

  toggleLogs(): void {
    this.showLogsSubject.next(!this.showLogsSubject.value);
  }

  private getFormData(image: File): FormData {
    const formData = new FormData();
    formData.append('image', image);
    return formData;
  }

  /*
  // // better way to reduce code duplication
  // private getLoadedState(error?: string) {
  //   return { dataState: DataState.LOADED, appData: this.dataSubject.value, error };
  // }

  // toggleMfa(): void {
  //   this.isLoadingSubject.next(true);
  //   this.profileState$ = this.userService.toggleMfa$()
  //     .pipe(
  //       map(response => {
  //         this.dataSubject.next({ ...response, data: response.data });
  //         this.isLoadingSubject.next(false);
  //         return this.getLoadedState();
  //       }),
  //       startWith(this.getLoadedState()),
  //       catchError((error: string) => {
  //         this.isLoadingSubject.next(false);
  //         return of(this.getLoadedState(error))
  //       })
  //     )
  // }
  */

}
