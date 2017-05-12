/**
 * Created by Jeongho on 2017-05-10.
 */
const passport = require('passport');
const express =require('express');
const bodyParser=require('body-parser');
const app= express();
// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); //parse application/json
const routes_auth = require('./routes/api/auth/index');

// const routes_history = require('./routes/overview')(app);

app.use('/api',require('./routes/api'));

app.use('/auth',routes_auth);
// app.use('/',routes_history);

app.listen(3000,()=>console.log('execute complete'));