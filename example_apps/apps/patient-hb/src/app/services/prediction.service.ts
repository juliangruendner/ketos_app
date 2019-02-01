import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';


const routes = {
    prediction: (id : number) => environment.predictionUrl + `/models/${id}/prediction?ownInputData=True&writeToFhir=False`
};

@Injectable()
export class PredictionService {

  constructor(private httpClient: HttpClient) { }

  predict(id: number, patientIds: any): Observable<any> {
    return this.httpClient.post(routes.prediction(id), patientIds);
  }
}
