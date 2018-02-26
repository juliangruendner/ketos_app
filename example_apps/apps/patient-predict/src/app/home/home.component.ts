import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment'
import { Prediction } from '../models/prediction'

// Hack: fhirclient has no typescript support and is only meant to be imported in a <script> tag
// This makes a object named FHIR globally available!
declare function require(s: string): any;
require('fhirclient');
declare var FHIR: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  fhirUrl = environment.serverUrl;
  patient_ids: string;

  patient_predictions: Prediction[] = [];
  predictions_running = false;
  predictions_done = false;

  constructor() {}

  ngOnInit() {}

  predict() {
    const ids: number[] = [];
    this.patient_ids.split(',').forEach(element => {
      ids.push(parseInt(element));
    });
    
    var smart = FHIR.client({
      serviceUrl: this.fhirUrl,
      auth: {
        type: 'basic',
        username: 'test',
        password: 'test',
      }
    });

    (<any>window).smart = smart;
    
    this.predictions_done = false;
    this.predictions_running = true;
    this.patient_predictions = []
    
    var promises: any = [];
    ids.forEach(patient_id => {
      promises.push(smart.api.search({type: "RiskAssessment", query: {subject: patient_id}}));
    });

    Promise.all(promises)
      .then((bundles: any) => {
        bundles.forEach((bundle: any) => {
          if (bundle.data.total < 1)
            return;

          bundle.data.entry.forEach((entry: any) => {
            this.patient_predictions.push(new Prediction(entry.resource.subject.reference, entry.resource.prediction[0].outcome.coding[0].display));
          });
        });

        this.predictions_done = true;
        this.predictions_running = false;
        console.log(this.patient_predictions)
    });
  }

}
