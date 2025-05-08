import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConfigurationsService} from "./configurations.service";
import {Observable, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private appConfig: ConfigurationsService, private httpClient: HttpClient) {
  }

  logIn(loginData: any): Observable<any> {
    return this.httpClient.post(`${this.appConfig.getApiUrl()}/auth/login`, loginData);
  }

  register(registerData: any): Observable<any> {
    return this.httpClient.post(`${this.appConfig.getApiUrl()}/auth/register`, registerData);
  }

  logout(): Observable<any> {
    return this.httpClient.post(`${this.appConfig.getApiUrl()}/auth/logout`, {}).pipe(
      tap(() => {
        // Optional: Clear any stored tokens or user data here.
        // For example, if you store a token in localStorage:
        localStorage.removeItem('authToken');
      })
    );

    return new Observable(observer => {
      localStorage.removeItem('authToken');
      observer.next({ message: 'Logged out successfully' });
      observer.complete();
    });
  }
}
