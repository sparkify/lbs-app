import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {timer} from 'rxjs';
import {delayWhen, map, retryWhen, tap} from 'rxjs/operators';

import {environment} from '../../environments/environment';


const HTTP_HEADERS = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
const MAIN_REQUEST_URL = environment.API + '/livy';


@Injectable({
    providedIn: 'root'
})
export class LivyService {

    readonly sessionInitiationPath = 'initiate-session';
    readonly sessionState = 'get-session-state';
    readonly sendStatementPath = 'execute-statement';
    readonly getStatementResultPath = 'get-statement-result';

    private static formRequestURL(local: string): string {
        return MAIN_REQUEST_URL + `/${local}`;
    }

    constructor(private http: HttpClient) {}

    public initiateLivySession() {
        return this.http.post(LivyService.formRequestURL(this.sessionInitiationPath), {},
            {headers: HTTP_HEADERS});
    }

    public pollLivyTillIdle(sessionID) {
        const body = {sessionID};
        return this.http.post(LivyService.formRequestURL(this.sessionState), body, {headers: HTTP_HEADERS}).pipe(
            map((state) => {
                const value = state[`state`];
                if (value === 'starting') {
                    throw value;
                }
                return value;
            }),
            retryWhen(errors =>
                errors.pipe(
                    tap((val) => {
                        console.log(`${val}`);  // TODO: Update state and assign value to it
                    }), delayWhen(() => timer(500))
                )
            )
        );
    }

    public pollLivyTillResult(sessionID, statementID) {
        const body = {sessionID, statementID};
        return this.http.post(LivyService.formRequestURL(this.getStatementResultPath), body, {headers: HTTP_HEADERS}).pipe(
            map((state) => {
                if (!state[`completed`]) {
                    throw state;
                }
                return state;
            }),
            retryWhen(errors =>
                errors.pipe(
                    tap((value) => {
                        // TODO: Update state and assign value to it
                    }), delayWhen(() => timer(50))
                )
            )
        );
    }

    public postStatement(sessionID: string, statement: string): any {
        const body = {statement, sessionID};
        return this.http.post(LivyService.formRequestURL(this.sendStatementPath), body, {headers: HTTP_HEADERS});
    }

}
