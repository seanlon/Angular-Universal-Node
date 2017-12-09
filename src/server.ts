import 'reflect-metadata';
import 'zone.js/dist/zone-node';
import { renderModuleFactory } from '@angular/platform-server'
import { enableProdMode } from '@angular/core'
import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';
import { request } from 'request';
import * as environment from '../environment.json';

var jwt = require('jsonwebtoken');
var moment = require('moment');
var nodeCookie = require('node-cookie');
var isFirstTime = true;
const cookie = require('cookie');
enableProdMode();
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

const PORT = process.env.PORT || 4200;
const DIST_FOLDER = join(process.cwd(), 'dist');

const app = express();

const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();
const { AppServerModuleNgFactory } = require('main.server');

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';

var secretKey = (<any>environment).pwd;
/* Server-side rendering */
function angularRouter(req, res) {

  console.log('req.url', req.url);
  var generatedToken = generateToken();
  res.setHeader('Set-Cookie', cookie.serialize('authTokenCookieKey', generatedToken, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 1 // 1 day 
  }));
 

  res.render(join(DIST_FOLDER, 'browser', 'index.html'), {
    req: req,
    res: res,
    providers: [{
      provide: 'serverUrl',
      useValue: `http://localhost:4200`
    }, {
      provide: 'token',
      useValue: generatedToken
    }]
  });

}

function generateToken() {
  const expiryDate = moment().add(1, 'hours').valueOf();
  // const expiryDate = moment().add(-1, 'hours').valueOf();
  return jwt.sign({ expiryDate: expiryDate, targetAudience: '', id: (<any>environment).userName }, secretKey, {
    expiresIn: 60 * 60
  });
}

//app.get('/', angularRouter);

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory
}));

app.set('view engine', 'html');
app.set('views', 'src')

app.get("/api/*", (req, res) => {

  return res.send({
    "res": "test"
  });
});

app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));
app.get('*', angularRouter);

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});