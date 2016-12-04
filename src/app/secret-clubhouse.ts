/** This file contains code for integrating with the legacy Ranger Secret Clubhouse system. */

import { environment } from '../environments/environment';

const conf = environment.secretClubhouse;

/**
 * Build a Secret Clubhouse Duty Management System URI.
 * @example
 * dmsUri('person', 'select', {personId: 1378, year: 2016}) ===
 * '/index.php?DMSc=person&DMSm=select&personId=1378&year=2016'
 */
export function dmsUri(controller: string, method: string, params = {}): string {
  // TODO consider using https://medialize.github.io/URI.js/ or something
  let chunks = [['DMSc', controller], ['DMSm', method]];
  for (let param of Object.keys(params)) {
    let val = params[param];
    chunks.push([param, val === null || val === undefined ? '' : val]);
  }
  let query = chunks.map((c) => `${encodeURIComponent(c[0])}=${encodeURIComponent(c[1])}`)
    .join('&');
  return `${conf.dmsUri}?${query}`;
}
