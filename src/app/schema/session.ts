import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private sessionDataKey = 'userSession';

    userId = "";
    userSysId = "";
    appToken = "";
    nombre = ""
    adminToken = ""
    email = ""
    lastIndex = 0
    id_responsable_servicios = 0
    sucursal = ""

    accountList = <any>[];

    constructor() {
        this.loadSession();
    }

    private loadSession(): void {
        const sessionData = sessionStorage.getItem(this.sessionDataKey);
        if (sessionData) {
            const session = JSON.parse(sessionData);
            this.userId = session.userId;
            this.userSysId = session.userSysId;
            this.appToken = session.appToken;
            this.adminToken = session.adminToken;
            this.accountList = session.accountList;
            this.nombre = session.nombre
            this.email = session.email
            this.lastIndex = session.lastIndex
            this.id_responsable_servicios = session.id_responsable_servicios
            this.sucursal = session.sucursal

        }
    }

    initializeSession(userId: string, userSysId: string, appToken: string, adminToken: string,nombre: string, accountList: Array<any>,email: string,lastIndex: number,id_responsable_servicios: number,sucursal: string): void {
        this.userId = userId;
        this.userSysId = userSysId;
        this.appToken = appToken;
        this.adminToken = adminToken;
        this.accountList = accountList;
        this.nombre = nombre
        this.email = email
        this.lastIndex = lastIndex
        this.id_responsable_servicios = id_responsable_servicios
        this.sucursal = sucursal

        this.saveSession();
    }

    private saveSession(): void {
        const sessionData = {
            userId: this.userId,
            userSysId: this.userSysId,
            appToken: this.appToken,
            adminToken: this.adminToken,
            accountList: this.accountList,
            nombre: this.nombre,
            email: this.email,
            lastIndex: this.lastIndex,
            id_responsable_servicios: this.id_responsable_servicios,
            sucursal: this.sucursal
        };
        // console.log(sessionData)
        this.clearSession();
        sessionStorage.setItem(this.sessionDataKey, JSON.stringify(sessionData));

    }

    getSession(): { userId: string, appToken: string, adminToken: string, userSysId: string, nombre: string, accountList: Array<any>,email :string,lastIndex: number,id_responsable_servicios: number, sucursal: string} | null {
        if (this.userId && this.appToken && this.userSysId) {
            return {
                userId: this.userId,
                appToken: this.appToken,
                adminToken: this.adminToken,
                userSysId: this.userSysId,
                accountList: this.accountList,
                nombre: this.nombre,
                email: this.email,
                lastIndex: this.lastIndex,
                sucursal: this.sucursal,
                id_responsable_servicios: this.id_responsable_servicios,


            };
        } else {
            this.clearSession();
            return null;
        }
    }

    clearSession(): void {
        
        this.userId = '';
        this.appToken = '';
        this.adminToken = '';
        this.userSysId = '';
        this.accountList = [];
        this.nombre = '';
        this.email = '';
        this.lastIndex = 0;
        this.sucursal = "";
        
        sessionStorage.removeItem(this.sessionDataKey);

    }
}
