import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  token = ""

  constructor(private http: HttpClient) { }

  APIGet(url: string) {
    return this.http.get<any>(url);
  }

  serialize = (obj: Object) => {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent((obj as any)[p]));
      }
    str.push("appToken" + "=" + this.token)
    return str.join("&");
  }

  APIPost(url: string, data: Object){
    // console.log(this.serialize(data))

    (data as any)["appToken"] = this.token

    // let res 

    return this.http.post(url, data)
      // .subscribe((response) => {
      //   console.log(response);
      // }, (error) => {
      //   console.log(error);
      // });
  }

}
