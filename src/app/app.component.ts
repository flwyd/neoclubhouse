import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { AuthService } from './auth/auth.service';
import { AuthState } from './auth/auth-state';

/**
 * Component defining the UI shell for the whole app.  This class shouldn't accumulate a lot of
 * logic; most work will be done by components which are included from app.component.html.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Ranger Neoclubhouse';
  authState: Observable<AuthState>;

  // See https://github.com/flauc/angular2-notifications/blob/master/docs/toastNotifications.md
  notificationOptions = {
    position: ['top', 'right'],
  };

  constructor(
    private auth: AuthService,
    private notifications: NotificationsService,
  ) {
    this.authState = auth.getAuthState();
  }

  /** Put application-level initialization code here. */
  ngOnInit() {
    this.auth.getKnownAuthState()
      .subscribe((state) =>  {
        const id = 'not-logged-in';
        this.notifications.remove(id);
        if (!state.loggedIn) {
          this.notifications.error('You are not logged in',
            'Most Clubhouse features will be unavailable', { id: id,  });
        }
      });
    this.auth.checkAuthPeriodically();
  }
}
