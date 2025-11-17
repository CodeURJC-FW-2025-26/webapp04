import express from 'express';
import mustacheExpress from 'mustache-express';
import bodyParser from 'body-parser';

import { SERVER } from './constants.js';
import router from './router.js';
import './dataLoader.js';

const app = express();

app.use(express.static('./public'));

app.set('view engine', 'html');
app.engine('html', mustacheExpress(), '.html');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

app.listen(SERVER.PORT, SERVER.HOST, () => {
    console.log(`Web ready at http://${SERVER.HOST}:${SERVER.PORT}/`);
});