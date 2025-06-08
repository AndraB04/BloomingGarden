import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router'; // Am combinat importurile
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http'; // Am combinat importurile
import { AuthInterceptor } from './services/auth.interceptor'; // Calea e corectă

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [ // <-- Array-ul `providers` începe aici
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    
    provideAnimations(),
    
    provideHttpClient(),

    // --- MUTAȚI ACEST OBIECT AICI, ÎN INTERIORUL ARRAY-ULUI ---
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
    
  ] // <-- Array-ul `providers` se termină aici
};