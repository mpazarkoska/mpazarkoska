import {Injectable} from '@angular/core';

import {Storage} from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage | null = null;

  constructor(private storageEngine: Storage) {
    this.init(storageEngine);
  }

  async init(storageEngine) {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    this.storage = await this.storageEngine.create();
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public set(key: string, value: any) {
    this.storage?.set(key, value);
  }
}
