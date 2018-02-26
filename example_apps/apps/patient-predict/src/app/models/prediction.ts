export class Prediction {
    patient_id: string;
    prediction_text: string;

    constructor(patient_id: string, prediction_text: string) {
        this.patient_id = patient_id.replace(/Patient\//, '');
        this.prediction_text = prediction_text;
    }
}
