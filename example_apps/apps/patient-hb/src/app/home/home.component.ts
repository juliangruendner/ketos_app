import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment'
import { Prediction } from '../models/prediction'
import { ActivatedRoute, Params } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';
import { AuthResponse } from '../models/authResponse';
import { Chart } from 'chart.js';
import {PredictionService} from '../services/prediction.service';

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
  authUrl = environment.authUrl;
  clientID = environment.clientID;
  clientSecret = environment.clientSecret;
  patient_ids: string;

  redirectUrl: string;
  authToken: string;
  loginErrorMsg: string;

  patient_predictions: Prediction[] = [];
  predictions_running = false;
  predictions_done = false;

  data5thPer: any[]
  data95thPer: any[]
  dataMean: any[]

  patientData: any[] = []
  patientHbLevels: any[]= []

  canvasWidth :any
  canvasHeight : any
  ctx : any
  canvasData: any

  @ViewChild('hbChartElem') hbChartElem: any;
  hbChart: any;

  constructor(private activatedRoute: ActivatedRoute, private authorizationService: AuthorizationService, private predictionService: PredictionService) {}

  ngOnInit() {
    
    this.predictionService.predict(1, {"patient_ids": "1"}).subscribe(resp => {
      console.log(resp)
      this.data5thPer = resp.prediction[0].prediction['quantile5']
      this.data95thPer = resp.prediction[0].prediction['quantile95']
      this.dataMean = resp.prediction[0].prediction['average']
      console.log(this.data5thPer)

      this.hbChart = new Chart(this.hbChartElem.nativeElement, {

        type: 'line',
        data: {
            labels: ["20-30", "40-60", "> 60"],
            datasets: [
              {
                label: "95th percentile",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "red",
                borderColor: "red",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: this.data95thPer,
                spanGaps: false,
            },
                {
                    label: "5th percentile",
                    fill: 0,
                    lineTension: 0.1,
                    backgroundColor: "#f909002b",
                    borderColor: "red",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: this.data5thPer,
                    spanGaps: false,
                },
              {
                label: "Durchschnittswert ",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "#0967c5",
                borderColor: "#0967c5",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: this.dataMean,
                spanGaps: false,
            },
              {
                type: 'bubble',
                label: "Wert Patient ",
                fill: 2,
                lineTension: 0.1,
                backgroundColor: "#2e9217",
                borderColor: "#2e9217",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: this.patientData,
                spanGaps: false,
            }
            ]
        },
        options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
        
    });

    }, err => {
      console.log( 'we are sorry, but it seems that the ml-model does not like you!')
    });


  }

  addPatientData(){

    while(this.patientData.length > 0) {
      this.patientData.pop();
    }

    if(this.patientHbLevels.data2040 != undefined && this.patientHbLevels.data2040 !=null){
      this.patientData.push(
        {x:"20-30", y:this.patientHbLevels.data2040, r:5}
      )
    }

    if(this.patientHbLevels.data4060 != undefined && this.patientHbLevels.data4060 !=null){
      this.patientData.push(
        {x:"40-60", y:this.patientHbLevels.data4060, r:5}
      )
    }

    if(this.patientHbLevels.data60 != undefined && this.patientHbLevels.data60 !=null){
      this.patientData.push(
        {x:"> 60", y:this.patientHbLevels.data60, r:5}
      )
    }
    
    this.hbChart.update();
  }

  login() {
    this.authorizationService.requestCode(this.clientID, this.redirectUrl, this.fhirUrl, 'patient/*.read');
  }

  predict() {
    const ids: number[] = [];
    this.patient_ids.split(',').forEach(element => {
      ids.push(parseInt(element));
    });
    
    var smart = FHIR.client({
      serviceUrl: this.fhirUrl,
      auth: {
        type: 'bearer',
        bearer: this.authToken
      }
    });

    (<any>window).smart = smart;
    
    this.predictions_done = false;
    this.predictions_running = true;
    this.patient_predictions = []
    
    var promises: any = [];
    ids.forEach(patient_id => {
      promises.push(smart.api.search({type: 'RiskAssessment', query: {subject: patient_id}}));
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
