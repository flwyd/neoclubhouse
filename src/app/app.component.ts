import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Ranger Neoclubhouse';

  // See https://github.com/flauc/angular2-notifications/blob/master/docs/toastNotifications.md
  notificationOptions = {
    position: ['top', 'right'],
  };
}
