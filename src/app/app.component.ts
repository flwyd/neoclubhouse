import { Component } from '@angular/core';

import { AuthState, SecretClubhouseService } from './secret-clubhouse.service';

/**
 * Component defining the UI shell for the whole app.  This class shouldn't accumulate a lot of
 * logic; most work will be done by components which are included from app.component.html.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Ranger Neoclubhouse';
  authState = new AuthState();

  // See https://github.com/flauc/angular2-notifications/blob/master/docs/toastNotifications.md
  notificationOptions = {
    position: ['top', 'right'],
  };

  constructor(
    clubhouse: SecretClubhouseService
  ) {
    clubhouse.getAuthState().subscribe({
      next: (state) => this.authState = state
    });
  }
}
