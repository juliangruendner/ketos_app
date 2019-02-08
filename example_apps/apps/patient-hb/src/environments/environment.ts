// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  version: '(dev)',
  predictionUrl: 'http://localhost:5000',
  authUrl: 'http://ketos.ai:8060',
  serverUrl: 'http://localhost:5000',
  clientID: '41f8ae6d-5b2d-45f6-b44c-57067394cbe5',
  clientSecret: 'AIBJKmCmdgJqdkk3gtTETQ1Qf8hewQhBHMUyZSnqxLEZaWeXKrfyb4l9Iq1hgoz2fioB4ifoSu3t6c87nZ7DaXw',
  defaultLanguage: 'en-US',
  supportedLanguages: [
    'en-US',
    'fr-FR'
  ]
};
