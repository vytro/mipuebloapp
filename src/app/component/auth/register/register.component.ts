import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { DataState } from 'src/app/enum/datastate.enum';
import { RegisterState } from 'src/app/interface/appstates';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  registerState$: Observable<RegisterState> = of({ dataState: DataState.LOADED });
  readonly DataState = DataState;

  constructor(private userService: UserService, private notificationService: NotificationService) { }

  register(registerForm: NgForm): void {
    // console.log(registerForm);
    this.registerState$ = this.userService.save$(registerForm.value)
      .pipe(
        map(response => {
          this.notificationService.onDefault(response.message);
          console.log(response);
          registerForm.reset();
          // return {dataState: DataState.LOADED, registerSuccess: true, message: response.message};
          return { dataState: DataState.LOADED, registerSuccess: true, message: response.message };
        }),
        startWith({ dataState: DataState.LOADING, registerSuccess: false }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          return of({ dataState: DataState.ERROR, registerSuccess: false, error })
        })
      );
  }

  createAccountForm(): void {
    this.registerState$ = of({ dataState: DataState.LOADED, registerSuccess: false });
  }

}
