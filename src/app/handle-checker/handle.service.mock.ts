import { PHONETIC_ALPHABET } from './static-handles';
import { Handle } from './handle';

/** HandleService implementation for tests.  Only includes static handle lists. */
export class MockHandleService {
  getHandles(): Promise<Handle[]> {
    return Promise.resolve(PHONETIC_ALPHABET);
  }
}
