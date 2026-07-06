import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';

/**
 * @description
 * Configuración de la aplicación Angular.
 * Este archivo define la configuración global de la aplicación, incluyendo proveedores de servicios y configuración regional.
 * Se registran los datos de localización para el idioma español (Chile) y se proporcionan servicios como enrutamiento y manejo de errores globales.
 */
import localeEsCl from '@angular/common/locales/es-CL';
registerLocaleData(localeEsCl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(),

    { provide: LOCALE_ID, useValue: 'es-CL'}
  ]
};
