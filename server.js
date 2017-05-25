/**
 * Created by Jeongho on 2017-05-10.
 */
const passport = require('passport');
const express =require('express');
const bodyParser=require('body-parser');
const app= express();
// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({limit: "50mb", extended: false}));
app.use(bodyParser.json({limit: "50mb"}));

const routes_auth = require('./routes/api/auth/index');
const routes_main = require('./routes/api/main/index');

// app.use('/api',require('./routes/api'));
app.use('/auth',routes_auth);
app.use('/main',routes_main);
// app.use('/',routes_history);

app.listen(3000,()=>console.log('execute complete'));