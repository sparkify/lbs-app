import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';

import {LivyService} from './shared/services/livy.service';
import {UploadService} from './shared/services/upload.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    public fileForm: FormGroup;
    public message: string;
    public operationForm: FormGroup;
    public result: string;
    public selectedFile: File;
    public showMessage: boolean;
    private title = 'LBS Application';
    public uploadedPercentage: number;

    // TODO result object
    public static extractFileNameAndExtension(nameWithExtension: string): object {
        const filename = nameWithExtension.split('.');
        return {extension: filename.pop(), name: filename.join('.')};
    }

    public static parseResult(obj: any): any {
        return obj[`output`][`data`][`text/plain`].split('= ')[1].replace('\n', '');
    }

    constructor(private http: HttpClient, private livyService: LivyService, private uploadService: UploadService) {
        this.fileForm = new FormGroup({
            fileCtrl: new FormControl('', Validators.required),
        });
        this.message = '';
        this.operationForm = new FormGroup({
            firstNumber: new FormControl('1', Validators.required),
            secondNumber: new FormControl('1', Validators.required),
            op: new FormControl('', Validators.required),
        });
        this.selectedFile = null;
        this.showMessage = false;
        this.uploadedPercentage = 0;
    }

    public ngOnInit(): void {
        this.result = 'Submit operation...';
    }

    public callLivyService(statement: string): void {
        this.livyService.initiateLivySession().subscribe(
            (sessionID) => {
                this.livyService.pollLivyTillIdle(sessionID[`sessionID`]).subscribe((state) => {
                    if (state === 'idle') {
                        this.livyService.postStatement(sessionID[`sessionID`], statement).subscribe((statementID) => {
                            this.livyService.pollLivyTillResult(sessionID[`sessionID`], statementID[`statementID`]).subscribe((result) => {
                                this.result = AppComponent.parseResult(result);
                            });
                        });
                    } else if (state === 'dead') {
                        console.log('500');
                    } else {
                        console.log('500');
                    }
                });
            }
        );
    }

    public onSubmit(): void {
        this.result = 'Fetching results...';
        const obj = this.operationForm.controls;
        const firstNumber = +obj[`firstNumber`][`value`];
        const secondNumber = +obj[`secondNumber`][`value`];
        if (!isNaN(firstNumber) && !isNaN(secondNumber) ) {
            const operation = firstNumber + obj[`op`][`value`] + secondNumber;
            this.callLivyService(operation);
        } else {
            this.result = 'Both Fields should contain only numbers.';
        }
    }

    public onFileSelect(event): void {
        this.selectedFile = event.target.files[0];
    }

    public onUpload(): void {
        this.showMessage = false;
        const formData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);
        this.uploadService.uploadRemoteServer(formData).subscribe(
            (event: HttpEvent<any>) => {
                this.showMessage = true;
                switch (event.type) {
                    case HttpEventType.Sent:
                        break;
                    case HttpEventType.Response:
                        this.message = `Uploaded Successfully`;
                        break;
                    case 1: {
                        if (this.uploadedPercentage !== event[`loaded`] / event[`total`] * 100) {
                            this.uploadedPercentage = event[`loaded`] / event[`total`] * 100;
                            this.message = Math.round(this.uploadedPercentage) + '%';
                        }
                        break;
                    }
                }
            },
            (error) => {
                console.log(error);
                this.message = `Something went wrong`;
                this.showMessage = true;
            });
    }

}
