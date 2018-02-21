// `.env.json` is generated by the `npm run build` command
import * as env from './.env.json';

export const environment = {
  production: true,
  version: env.npm_package_version,
  fhirURL: 'http://46.101.216.15:8080/gtfhir/base',
  defaultLanguage: 'en-US',
  supportedLanguages: [
    'en-US',
    'fr-FR'
  ]
};
