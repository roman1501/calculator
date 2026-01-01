import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';

import { routes } from './app.routes';
import { SameDayRangeStrategy } from './same-day-range.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: MAT_DATE_RANGE_SELECTION_STRATEGY, useClass: SameDayRangeStrategy },
  ]
};
