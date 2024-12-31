import { Injectable } from '@angular/core';
import { ApiServiceService } from './api-service.service';
import { SessionService } from '../schema/session';
import * as sha512 from 'js-sha512';
import { AppSettings } from '../appsettings';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInFlag: boolean = false;
  private isAdminFlag: boolean = false;

  // appSession: SessionService

  constructor(private apiService: ApiServiceService,private appSession: SessionService) { 

    this.appSession = new SessionService()

    if(appSession.appToken.length == 257 && appSession.userId != '0'){
      this.isLoggedInFlag = true
    }

    if(this.appSession.adminToken != undefined){

      if(appSession.adminToken.length == 257){
        this.isAdminFlag = true
      }
  
    }

    // console.log(this.appSession)

  }

  login(username: string, password: string, encrypt: boolean = true): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.apiService.APIPost(AppSettings.API_ENDPOINT + '/auth_flow.php', {

        email: username,
        pass: encrypt ? sha512.sha512(password) : password,
        request_token: AppSettings.REQUEST_TOKEN

      }).subscribe((data: any) => {

        this.isLoggedInFlag = true

        // console.log(data)
        var conv = (data as any)
        // console.log(data)

        if (conv["result"] == "success") {

          var ses = new SessionService()
          
          ses.clearSession()
          ses.initializeSession(conv["userid"], conv["usersysid"], conv["result_token"], conv["admin_token"], conv["nombre"], conv["account_list"], conv["email"],conv["last_index"],conv["id_responsable_servicios"],conv["sucursalnombre"])

          resolve({
            resultado: 'success',
            servicios: conv["id_responsable_servicios"] == 0 ? 0 : 1
          })

        }

        resolve({
          resultado: 'error'
        })

        // resolve(false)

      });

    })

  }

  logout(): void {
    this.isLoggedInFlag = false;

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/auth_flow.php",{
      logout: 1,
      userid: this.appSession.userId,
      appToken: this.appSession.appToken,
      module: 'isg'
    }).subscribe((data: any)=>{

      var ses = new SessionService()
      ses.clearSession()

    })

  }

  isLoggedIn(): boolean {
    return this.isLoggedInFlag;
  }

  isAdmin(): boolean {

    return this.isAdminFlag;

  }

}
