import { Injectable } from '@angular/core';

export class Settings {
    constructor(public name: string, public theme: string, public rtl: boolean) { }
}

@Injectable()
export class AppSettings {
    public settings = new Settings(
        'Sophia',
        'orange',
        false
    );
}
