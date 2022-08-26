'use strict';

const HashMap = require('hashmap');
const express = require('express');
const bodyParser = require('body-parser');
const controller = require('./controller/api');
const port = process.env.PORT || 3001;
const app = express();
const userHashmap = new HashMap();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use((req, res, next) => {
	req.users = userHashmap;
    next();
});

app.use('/api/', controller);

app.listen(port, "0.0.0.0", function () {
    console.log('Express app listening on port ' + port);
});
