import { Component, OnInit } from '@angular/core';

import { dmsUri } from '../secret-clubhouse';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * Yo dawg, I heard you like the Clubhouse.  So we put the Secret Clubhouse in an iframe in the
 * Neoclubhouse so you can Ranger while you Ranger.
 *
 * This is mostly useful for showing an embedded login page.  In the future we could be somewhat
 * elegant about it and provide a more seamless experience.
 */
@Component({
  selector: 'app-clubhouse-embed',
  templateUrl: './clubhouse-embed.component.html',
  styleUrls: ['./clubhouse-embed.component.scss']
})
export class ClubhouseEmbedComponent implements OnInit {
  /**
   * The Clubhouse URL to show.  Don't allow arbitrary or untrusted user input.
   * @see https://angular.io/docs/ts/latest/guide/security.html#!#xss
   */
  clubhouseUri: SafeUrl;

  constructor(
    private sanitizer: DomSanitizer
  ) {
    this.clubhouseUri = sanitizer.bypassSecurityTrustResourceUrl(dmsUri('dashboard', 'index'));
  }

  ngOnInit() {
  }

}
