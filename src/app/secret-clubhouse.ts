/** This file contains code for integrating with the legacy Ranger Secret Clubhouse system. */

import { environment } from '../environments/environment';

const conf = environment.secretClubhouse;

/**
 * Build a Secret Clubhouse Duty Management System URI.
 * @example
 * dmsUri('person', 'select', {personId: 1378, year: 2016}) ===
 * '/index.php?DMSc=person&DMSm=select&personId=1378&year=2016'
 *
 * @param {string} controller Controller name, e.g. person.
 * @param {string} method Method to call on the controller, e.g. select.
 * @param {Object} params={} Query parameters.
 */
export function dmsUri(controller: string, method: string, params = {}): string {
  // TODO consider using https://medialize.github.io/URI.js/ or something
  let chunks = [['DMSc', controller], ['DMSm', method]];
  return conf.dmsUri + queryString(params, chunks);
}

/**
 * Build a Secret Clubhouse API URI.
 *
 * @param {string} action Resource path, e.g. people/42.
 * @param {Object} params={} Query parameters.
 * @return {string} The constructed URI.
 */
export function apiUri(action: string, params = {}): string {
  let version = 'v0'; // TODO parameterize this, maybe by becoming a factory
  return `${conf.apiUri}/${version}/${action}${queryString(params)}`;
}

function queryString(params: Object, chunks = []): string {
  for (let param of Object.keys(params)) {
    let val = params[param];
    chunks.push([param, val === null || val === undefined ? '' : val]);
  }
  if (chunks.length === 0) {
    return '';
  }
  return '?' +
    chunks.map((c) => `${encodeURIComponent(c[0])}=${encodeURIComponent(c[1])}`).join('&');
}
