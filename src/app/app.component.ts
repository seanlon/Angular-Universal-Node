import { Component, Optional, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
const DATA_KEY = makeStateKey('data');
const TOKEN_KEY = makeStateKey('tokenKey');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  data: any;
  tokenKey: any;





  constructor(
    private http: HttpClient,
    private state: TransferState,
    @Optional() @Inject('token') protected token: string
  ) {
    // if(this.token){
    //   this.state.set(TOKEN_KEY, this.token as any);
    // }

    console.log("AppComponent" );
    const found = this.state.hasKey(TOKEN_KEY);
    if (found && isPlatformBrowser) {
      this.tokenKey = this.state.get(TOKEN_KEY, 'none' as any);
      this.state.remove(TOKEN_KEY);
      console.log('this.tokenKey', this.tokenKey);
    }

    if (!found && isPlatformServer) {
      const apiData = [];
      //set api 
      this.state.onSerialize(TOKEN_KEY, () => this.data as any);
      this.http
        .get('/api/getData')
        .subscribe(
        (data) => {
          this.data = data;
        },
        (error) => {
          console.log("error" + error);
        });
    }


  }

  ngOnInit() {

    // this.data = this.state.get(DATA_KEY, null as any);
    // this.tokenKey = this.state.get(TOKEN_KEY,null as any);

    // let _httpHeader = new HttpHeaders();
    // let _headers = _httpHeader.set('Authorization','Bearer '+this.tokenKey);
    // //if (!this.data) {
    //   console.log('app called');
    //   this.http
    //   .get('/api/getData',{headers: _headers})
    //   .subscribe(
    //     (data) => {
    //       this.state.set(DATA_KEY, data as any);
    //       this.data = data;
    //     },
    //     (error) => {
    //       console.log("error"+error);
    //   });
    // //}
  }
}
