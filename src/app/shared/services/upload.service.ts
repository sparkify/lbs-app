import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {environment} from '../../../environments/environment';


const MAIN_REQUEST_URL = environment.API + '/upload';


@Injectable({
    providedIn: 'root'
})
export class UploadService {

    readonly sendRemoteServerPath = 'remote-server';

    private static formRequestURL(local: string): string {
        return MAIN_REQUEST_URL + `/${local}`;
    }

    constructor(private http: HttpClient) {}

    public uploadRemoteServer(formData: FormData) {
        return this.http.put(UploadService.formRequestURL(this.sendRemoteServerPath), formData,
            { reportProgress: true, observe: 'events'});
    }
}
