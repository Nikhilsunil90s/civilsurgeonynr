const express = require('express');
const Routes = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const reports = require('../models/reports');

const Tally = require("../models/tally");

const multer = require('multer');
const csv = require('csvtojson');
const isAuthenticated = require('../middleware/isAuthenticated');


var storage = multer.diskStorage({dest : 'uploads/' , filename : (req, file, cb) => {
            console.log("In Storage" , req.file, file);
            cb(null, file.originalname);
}});

var upload  = multer({storage : storage});



Routes.post("/tally-upload" , isAuthenticated, (req,res , next) => {
    console.log( req.body);
    const tally = new Tally({
        total_sample_taken : req.body.sample_taken,
        positive_reported : req.body.positive_reported,
        patient_under_treatment: req.body.under_treatment,
        negative_reported: req.body.negative_reported      
    })
    console.log(tally);
    tally.save();
    return res.render("pages/success")
})


Routes.get('/tally', isAuthenticated,(req,res,next) => {
    res.render('pages/tally');
})

Routes.post('/covid-csv', isAuthenticated, upload.single('covidcsv'), (req,res,next) => {
    //console.log(req.body);
    var filepath = req.file.path;
    const converter = csv();
    converter
     .fromFile(filepath)
     .then((json) => {
        console.log(json);
        //console.log(json[0]['Son_Wife_Daughter_Of'])
        for(let i = 0; i < json.length ; i++){
        var rep = new reports({
            SRF_Number : json[i]['SRF_ID'],
            Name: json[i]['Name'],
            //Son_Daughter_Wife_Of: json[i]['Son_Wife_Daughter_Of'],
            Sex: json[i]['Sex'],
            Address: json[i]['Address'],
            Contact_No: json[i]['Contact_No'],
            Date_of_collection_of_sample : json[i]['Date_of_collection_of_sample'],
            Lab_where_sample_sent: json[i]['Lab_where_sample_sent'],
            LAB_ID2 : json[i]['Lab_ID2'],
            Result: json[i]['Result']
        })
        rep.save();
    }
        //  reports
        //    .insertMany(json , (err, res) => {
        //        if(err) throw err;
        //        console.log(res);
        //    })
     })
    res.render('pages/success')
})


Routes.get('/admin', isAuthenticated,(req,res,next) => {
    res.render('pages/admin')
})

Routes.get('/signup', (req,res,next) => {
    res.render('pages/signup', {
        errorMessage: ''
    });
})

Routes.post('/signup', (req,res,next) => {
    const {email,password} = req.body;

    User
        .findOne({email: email.toLowerCase()})
        .then((user) => {
            if (user) {
                return res.render('pages/signup', {
                    errorMessage : 'User Already Exists!'
                })
            }

            bcrypt
                .hash(password, 12)
                .then((hashedPassword) => {
                    console.log(hashedPassword)
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        role: 'ADMIN'
                    });

                    return user.save()
                })
                .then((user) => {
                    console.log(user)
                    return res.redirect('/signin');
                })
                .catch(err => {
                    return res.render('pages/signup', {
                        errorMessage : 'Internal Server Error!'
                    })
                })
        })
        .catch(err => {
            console.log(err)
        })
})


Routes.get('/signin', (req,res,next) => {
    res.render('pages/signin', {
        errorMessage: ''
    });
})

Routes.post('/signin', (req,res,next) => {
    const {email,password} = req.body;
    

    User
        .findOne({email: email.toLowerCase()})
        .then((user) => {
            if (!user) {
                return res.render('pages/signin', {
                    errorMessage : 'User Not Exists!'
                })
            }

            bcrypt
                .compare(password, user.password)
                .then((doMatch) => {
                    if(!doMatch) {
                        return res.render('pages/signin', {
                            errorMessage : 'Incorrect Password!'
                        })
                    }

                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        return res.redirect('/admin')
                    });
                })  
                .catch(err => {
                     return res.render('pages/signin', {
                        errorMessage :'Internal Server Error!'
                    })
                })
        })
        .catch(err => {
            console.log(err)
            return res.render('pages/signin', {
                errorMessage :'Internal Server Error!'
            })
        })
})


Routes.get('/logout', isAuthenticated, (req,res,next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
})

module.exports = Routes;

