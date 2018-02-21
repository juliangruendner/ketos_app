import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment'

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

  constructor() {}

  ngOnInit() {}

  predict() {
    const ids: number[] = [];

    this.patient_ids.split(',').forEach(element => {
      ids.push(parseInt(element));
    });

    var smart = FHIR.client({
      serviceUrl: this.fhirUrl,
    });

    console.log(smart);
  }

}
