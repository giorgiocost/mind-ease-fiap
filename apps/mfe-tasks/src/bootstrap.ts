import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { RemoteEntryComponent } from './app/remote-entry/entry.component';
import { setupGlobalErrorHandler } from './app/utils/error-handler';

// Setup global error handling for Chrome extension interference
setupGlobalErrorHandler();

bootstrapApplication(RemoteEntryComponent, appConfig).catch((err) => console.error(err));
