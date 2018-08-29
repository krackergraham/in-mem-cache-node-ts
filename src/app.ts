import bodyParser from 'body-parser';
import compression from 'compression';  // compresses requests
// import dotenv from "dotenv";
import express from 'express';
import expressValidator from 'express-validator';
import path from 'path';


// Load environment variables from .env file, where API keys and passwords are configured
// dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import * as apiController from './controllers/api';
import * as homeController from './controllers/home';


// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());


app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);

/**
 * API routes.
 */
app.get('/api/tax', apiController.getTaxRateByAddress);


export default app;
