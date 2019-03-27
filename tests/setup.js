require('../models/User');

// Configure how long a jest test can take. 
jest.setTimeout(30000);

const mongoose = require('mongoose');
const keys = require('../config/keys');

// Specify implementation of Promise to use.
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);
