const express = require('express');
const Routes = express.Router();
const bcrypt = require('bcryptjs');
const fromExcelDate = require('js-excel-date-convert').fromExcelDate;
const xlsx = require('node-xlsx');
const fs = require('fs')
const User = require('../models/user');

const reports = require('../models/reports');

const Tally = require("../models/tally");

const multer = require('multer');
const csv = require('csvtojson');
const isAuthenticated = require('../middleware/isAuthenticated');


// var storage = multer.diskStorage({dest : 'uploads/' , filename : (req, file, cb) => {
//             console.log("In Storage" , req.file, file);
//             cb(null, file.originalname);
// }});

var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        
          cb(null, 'uploads'); 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
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

Routes.post('/covid-csv', isAuthenticated, upload.single('covidcsv'), async (req,res,next) => {
    console.log(req.file);
    var filepath = req.file.path;


    var obj = await xlsx.parse(filepath);
    //console.log(obj);
    let mydata  = [];
    res.render('pages/success')
    console.log(new Date(obj[0].data[1][6]));
    for(var i = 1 ; i < (obj[0].data).length; i++){
        let dataone = obj[0].data[i];
        let srf =  dataone[0];
        if(dataone.length > 0){
        //console.log(srf);
            var repdate = fromExcelDate(dataone[6]).toDateString();
            console.log(repdate);
            if(srf){
                srf = srf.toString();
                srf = srf.replace(/[^0-9]/g, "")
                let updated = {
                    SRF_Number : srf,  //check it is undefined
                    Name: dataone[1] ? dataone[1] : '-' ,
                    Sex: dataone[3] ? dataone[3] : '-',
                    Address: dataone[4] ? dataone[4] : '-',
                    Contact_No: dataone[2] ? dataone[2] : '-',
                    Date_of_collection_of_sample : repdate ? repdate : '-',
                    Lab_where_sample_sent: dataone[7] ? dataone[7] : '-',
                    LAB_ID2 : dataone[8] ? dataone[8] : '-',
                    Result: dataone[9] ? dataone[9] : '-'
                }
                console.log(updated);
                
                let isSrfExist = await reports.findOne({'SRF_Number': srf.toString()})
                    
                if (isSrfExist) {
                    let isUpdated = await reports.findOneAndUpdate({'SRF_Number' : srf.toString()} , updated)

                    if (isUpdated) {
                        console.log('Report updated')
                    } else {
                        console.log('Report not updated')
                    }

                    continue

                }
                    

                mydata.push(updated)
            }
            }
            
        }

             reports
               .insertMany(mydata , async (err, response) => {
                   if(err) throw err;
                   let isDeleted =  await fs.unlinkSync(req.file.path)

                   console.log('Reports Uploaded successfully!');
                    
                   
               })

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

