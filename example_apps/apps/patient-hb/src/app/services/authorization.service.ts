import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/authResponse';


const routes = {
    token: environment.authUrl + '/token',
    authorize: environment.authUrl + '/authorize',
};

@Injectable()
export class AuthorizationService {

  constructor(private httpClient: HttpClient) { }

  /** Redirects to auth server */
  requestCode(clientID: string, redirect_uri: string, aud: string, scope: string) {
    window.location.href = `${routes.authorize}?response_type=code&client_id=${clientID}&redirect_uri=${redirect_uri}&aud=${aud}&scope=${scope}`;
  }

  authorizeCode(clientID: string, secret: string, code: string, redirect_uri: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(routes.token, '', { 
        headers: {
            Authorization: 'Basic ' + btoa(clientID + ':' + secret),
            ContentType: 'application/x-www-form-urlencoded'
        },
        params: {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        }
    });
  }
}
