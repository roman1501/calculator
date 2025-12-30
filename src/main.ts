import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeUk from '@angular/common/locales/uk';

import { provideAnimations } from '@angular/platform-browser/animations';
import { LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import type { MatDateFormats } from '@angular/material/core';

import { App } from './app/app';

registerLocaleData(localeUk);

const UA_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
  },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { month: 'long', year: 'numeric' },
    dateA11yLabel: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};

bootstrapApplication(App, {
  providers: [
    provideZoneChangeDetection(),provideAnimations(),

    // 🇺🇦 Українська локаль
    { provide: LOCALE_ID, useValue: 'uk-UA' },
    { provide: MAT_DATE_LOCALE, useValue: 'uk-UA' },

    // 📅 Формат дд.мм.рррр
    provideNativeDateAdapter(UA_DATE_FORMATS),
  ],
}).catch(console.error);
