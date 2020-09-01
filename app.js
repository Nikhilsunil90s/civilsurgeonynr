const app = require('express')();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const flash = require('connect-flash');
const User = require('./models/user')

const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = 'mongodb+srv://cso:mlnch123@covid.inmrm.mongodb.net/covid?retryWrites=true&w=majority';

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'covid-19'
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static('uploads'));
app.use(express.static('pdf'));
// routes
const getRoutes = require('./routes/getRoutes')
const adminRoutes = require('./routes/adminRoutes');

//For set layouts of html view
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/public', express.static('public'));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(flash());

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});


app.use('/', getRoutes);
app.use('/', adminRoutes);

mongoose
  .connect(MONGODB_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(result => {
    app.listen(port, () => {
      console.log('App is Running on ' + port );
    });
  })
  .catch(err => {
    console.log(err);
  });
