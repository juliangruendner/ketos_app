import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment'
import { Prediction } from '../models/prediction'
import { ActivatedRoute, Params } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';
import { Chart } from 'chart.js';
import {PredictionService} from '../services/prediction.service';
import { thisExpression } from 'babel-types';

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

  patientGroupsMale: any [] = []
  patientGroupsFemale: any [] = []
  curPatientGroups: any [] = []
  patientAge: number = -1
  patientGender: string
  patientHbLevel: number 
  patientPercentile: number

  data025thPer: any[] = []
  data957thPer: any[] = []
  dataMean: any[] = []
  dataLabels: any[] = []


  patientData: any[] = []
  patientHbLevels: any[]= []
  curPatientAgeGroup : any

  @ViewChild('hbChartElem') hbChartElem: any;
  hbChart: any;

  constructor(private activatedRoute: ActivatedRoute, private authorizationService: AuthorizationService, private predictionService: PredictionService) {}

  ngOnInit() {
    
    this.predictionService.predict(2, {"patient_ids": "1"}).subscribe(resp => {
      console.log(resp)
      for (var group in resp.prediction["M"]){
        this.patientGroupsMale[group] = resp.prediction["M"][group]
      }

      for (var group in resp.prediction["F"]){
        this.patientGroupsFemale[group] = resp.prediction["F"][group]
      }
      
      

    }, err => {
      console.log( 'we are sorry, but it seems that the ml-model does not like you!')
    });

  }

  emptyArray(array: any []){
    while(array.length > 0) {
      array.pop();
    }
  }

  prepareGraphInfo(){

    this.emptyArray(this.dataLabels)
    this.emptyArray(this.dataMean)
    this.emptyArray(this.data025thPer)
    this.emptyArray(this.data957thPer)

    for(var pGroup in this.curPatientGroups){
      var patientGroup =  this.curPatientGroups[pGroup]
      this.dataLabels.push(patientGroup['minAge'] + "-" + patientGroup['maxAge'])
      this.dataMean.push(patientGroup['percentile50'])
      this.data025thPer.push(patientGroup['percentile2.5'])
      this.data957thPer.push(patientGroup['percentile97.5'])
    }

  }

  getPatientAgeGroup(age: number){

    for(var i in this.curPatientGroups){
      if(this.curPatientGroups[i]['minAge'] <= age && this.curPatientGroups[i]['maxAge'] >= age){
        return this.curPatientGroups[i]
      }
    }

    return undefined;
  }


  showPatientInfo(){

    if(this.patientGender == "M"){
      this.curPatientGroups = this.patientGroupsMale
      console.log(this.patientGroupsMale)
    } else {
      this.curPatientGroups = this.patientGroupsFemale
    }
    this.prepareGraphInfo()
    this.initNewChart()

    var curPageG = this.getPatientAgeGroup(this.patientAge)
    this.curPatientAgeGroup = curPageG

    if(curPageG){
      this.patientPercentile = (this.calculatePercentile(this.patientHbLevel, curPageG['lambda'], curPageG['mu'], curPageG['sigma'] ) * 100)

      while(this.patientData.length > 0) {
        this.patientData.pop();
      }

      this.patientData.push(
        {x:this.curPatientAgeGroup['minAge'] + "-" + this.curPatientAgeGroup['maxAge'] , y:this.patientHbLevel, r:5}
      )
      this.hbChart.update();
    } else {
      this.patientPercentile = -1
    }

  }

  addPatientData(){

    while(this.patientData.length > 0) {
      this.patientData.pop();
    }

    if(this.patientHbLevels['data2040'] != undefined && this.patientHbLevels['data2040'] !=null){
      this.patientData.push(
        {x:"20-30", y:this.patientHbLevels['data2040'], r:5}
      )
    }

    if(this.patientHbLevels['data4060'] != undefined && this.patientHbLevels['data4060'] !=null){
      this.patientData.push(
        {x:"40-60", y:this.patientHbLevels['data4060'], r:5}
      )
    }

    if(this.patientHbLevels['data60'] != undefined && this.patientHbLevels['data60'] !=null){
      this.patientData.push(
        {x:"> 60", y:this.patientHbLevels['data60'], r:5}
      )
    }

    
    this.hbChart.update();

    this.calculatePercentile(9.0, 1, 9.0081, 0.98299)
  }

  calculatePercentile(value: number, lambda: number, mean: number, variance: number){
    
      var x_bc = 0;
      if(lambda != 0) {
         
         x_bc = ( Math.pow(value, lambda) - 1) / lambda;
      } else {
         x_bc = Math.log(value);
      }
      
      var zScore = (x_bc - mean) / variance;

      return this.getZPercent(zScore)


  }

  getZPercent(z: number) 
  {
    //z == number of standard deviations from the mean

    //if z is greater than 6.5 standard deviations from the mean
    //the number of significant digits will be outside of a reasonable 
    //range
    if ( z < -6.5)
      return 0.0;
    if( z > 6.5) 
      return 1.0;

    var factK = 1;
    var sum = 0;
    var term = 1;
    var k = 0;
    var loopStop = Math.exp(-23);
    while(Math.abs(term) > loopStop) 
    {
      term = .3989422804 * Math.pow(-1,k) * Math.pow(z,k) / (2 * k + 1) / Math.pow(2,k) * Math.pow(z,k+1) / factK;
      sum += term;
      k++;
      factK *= k;

    }
    sum += 0.5;

    return sum;
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




  initNewChart(){

    this.hbChart = new Chart(this.hbChartElem.nativeElement, {
      type: 'line',
      data: {
          labels: this.dataLabels,
          datasets: [
            {
              label: "97.5th percentile",
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
              data: this.data957thPer,
              spanGaps: false,
          },
              {
                  label: "2.5th percentile",
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
                  data: this.data025thPer,
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
          xAxes: [{
            scaleLabel:{
              display: true,
              labelString: "Patient Age Groups from-to (Years)"
            }
        }],
            yAxes: [{
                scaleLabel:{
                  display: true,
                  labelString: "Haemoglobin Amount (g/dl)"
                }
            }]
        },
        title: {
          display: true,
          text: 'Patient Haemoglobin Levels compared to age group'
      }
    }
      
  });

  console.log(this.hbChart)
  }

}
