aimport 'reflect-metadata';
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

enableProdMode();

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

  var token = generateToken();
  res.render(join(DIST_FOLDER, 'browser', 'index.html'), {
    req: req,
    res: res,
    providers: [{
      provide: 'serverUrl',
      useValue: `http://localhost:4200`
    }, {
      provide: 'token',
      useValue: token
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
  console.log(req.headers.authorization);
  console.log(req.headers.authorization.split(" ")[1]);
  jwt.verify(req.headers.authorization.split(" ")[1], secretKey, function (err, decoded) {
    //  console.log('decoded', decoded); console.log('err', err);
    if (err || !decoded) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    const currentDateTime = moment();
    const expiryDateTime = moment(decoded.expiryDate);
    const differenceTimeMs = expiryDateTime.diff(currentDateTime);
    const messageResponse = differenceTimeMs < 0 ? 'Please check expired token' : 'success'

    console.log('currentDateTime', currentDateTime);
    console.log('expiryDateTime', expiryDateTime);
    console.log('differenceTimeMs', differenceTimeMs);
    return res.send({
      "differenceTimeMs": differenceTimeMs, "isTokenExpired": (differenceTimeMs < 0), "message": messageResponse
    });
  });
});

app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

app.get('*', angularRouter);

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}!`);
});