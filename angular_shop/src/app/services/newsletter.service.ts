import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigurationsService } from './configurations.service';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private config: ConfigurationsService
  ) {
    this.apiUrl = `${this.config.getApiUrl()}/newsletter`;
  }

  private handleError(error: HttpErrorResponse, operation = 'operation'): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error occurred
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            break;
          case 400:
            errorMessage = error.error?.error || 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 409:
            errorMessage = error.error?.error || 'A conflict occurred. The resource may already exist.';
            break;
          case 500:
            errorMessage = 'A server error occurred. Please try again later.';
            break;
          default:
            errorMessage = `Server returned code ${error.status}, error message was: ${error.message}`;
        }
      }
    }
    
    console.error(`Newsletter service: ${operation} failed`, error);
    return throwError(() => new Error(errorMessage));
  }

  subscribe(email: string, name: string = '', isCustomer: boolean = false): Observable<any> {
    console.log('Attempting newsletter subscription for:', email);
    return this.http.post(`${this.apiUrl}/subscribe`, {
      email,
      name,
      isCustomer
    }).pipe(
      tap(response => console.log('Newsletter subscription successful:', response)),
      catchError(error => this.handleError(error, 'subscribe'))
    );
  }

  unsubscribe(email: string): Observable<any> {
    console.log('Attempting newsletter unsubscription for:', email);
    const url = `${this.apiUrl}/unsubscribe`;
    console.log('Unsubscribe URL:', url);
    return this.http.post(url, { 
      email 
    }).pipe(
      tap(response => console.log('Newsletter unsubscription successful:', response)),
      catchError(error => {
        console.error('Newsletter unsubscription failed:', error);
        return this.handleError(error, 'unsubscribe');
      })
    );
  }

  sendNewsletter(subject: string, content: string): Observable<any> {
    console.log('Attempting to send newsletter');
    if (!subject.trim() || !content.trim()) {
      return throwError(() => new Error('Subject and content are required.'));
    }
    
    return this.http.post(`${this.apiUrl}/send`, {
      subject,
      content
    }).pipe(
      tap(response => console.log('Newsletter sent successfully:', response)),
      catchError(error => this.handleError(error, 'sendNewsletter'))
    );
  }

  getSubscribers(): Observable<string[]> {
    console.log('Fetching newsletter subscribers');
    return this.http.get<any>(`${this.apiUrl}/subscribers`).pipe(
      map(response => {
        console.log('Raw response:', response);
        return response.data || [];
      }),
      tap(subscribers => console.log(`Found ${subscribers.length} subscribers`)),
      catchError(error => this.handleError(error, 'getSubscribers'))
    );
  }
}
