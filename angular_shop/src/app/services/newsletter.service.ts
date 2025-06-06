import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationsService } from './configurations.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  constructor(
    private http: HttpClient,
    private config: ConfigurationsService
  ) {}

  subscribe(email: string, name: string = '', isCustomer: boolean = false): Observable<any> {
    return this.http.post(`${this.config.getApiUrl()}/newsletter/subscribe`, {
      email,
      name,
      isCustomer
    });
  }

  unsubscribe(email: string): Observable<any> {
    return this.http.post(`${this.config.getApiUrl()}/newsletter/unsubscribe`, { email });
  }

  sendNewsletter(subject: string, content: string): Observable<any> {
    return this.http.post(`${this.config.getApiUrl()}/newsletter/send`, {
      subject,
      content
    });
  }

  getSubscribers(): Observable<any> {
    return this.http.get(`${this.config.getApiUrl()}/newsletter/subscribers`);
  }
}
