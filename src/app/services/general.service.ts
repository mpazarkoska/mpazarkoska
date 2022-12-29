import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  private subject$: Subject<IResponse> = new Subject<IResponse>();

  constructor() {
  }

  public send(data: IResponse) {
    this.subject$.next(data);
  }

  public get(): Observable<IResponse> {
    return this.subject$.asObservable();
  }
}

export interface IResponse {
  type: string;
  data: any;
}
