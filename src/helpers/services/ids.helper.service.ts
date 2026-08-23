/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as shortid from 'shortid';

export class IdsHelperService {
  constructor() {}

  newShortId(): string {
    return shortid.generate();
  }
}
