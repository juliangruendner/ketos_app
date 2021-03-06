// `.env.json` is generated by the `npm run build` command
import * as env from './.env.json';

export const environment = {
  production: true,
  version: env.npm_package_version,
  authUrl: 'http://ketos.ai:8060',
  predictionUrl: '/api',
  serverUrl: 'http://localhost:5000',
  fhirURL: 'http://ketos.ai:8080/gtfhir/base',
  clientID: '41f8ae6d-5b2d-45f6-b44c-57067394cbe5',
  clientSecret: 'AIBJKmCmdgJqdkk3gtTETQ1Qf8hewQhBHMUyZSnqxLEZaWeXKrfyb4l9Iq1hgoz2fioB4ifoSu3t6c87nZ7DaXw',
  defaultLanguage: 'en-US',
  supportedLanguages: [
    'en-US',
    'fr-FR'
  ]
};
