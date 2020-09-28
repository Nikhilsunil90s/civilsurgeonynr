const express = require('express');
const Routes = express.Router();
const bcrypt = require('bcryptjs');
const reports = require("../models/reports")
const tally = require("../models/tally")
const Gallery = require('../models/gallery');

const fs = require('fs');
const pdf = require('pdf-creator-node');
const checkEmail = require('email-check');
const options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "20mm",
        contents: '<h4 style="text-align: center">HEALTH DEPARTMENT, YAMUNA NAGAR (HARYANA)</h4>'
    },
    
}


var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'csoynr@gmail.com',
    pass: 'csoynr123'
  }
});



Routes.get('/', (req,res,next) => {
    res.redirect('/home');
})

Routes.get('/home', async(req,res,next) => {
    
    var result = await tally.find()
    const data = result[result.length - 1] ;
    data.title="home"
    res.render('pages/home' , data)
    
})

Routes.get('/gallery', (req,res,next) => {

    Gallery
        .find()
        .limit(10)
        .then((gallery) => {
            return res.render('pages/gallery', {
                title: 'gallery',
                gallery: gallery
            })
        })
        .catch(err => {
            return res.render('pages/bad-request');
        })
    
})

Routes.post('/get-gallery', (req,res,next) => {

    let {skip} = req.body;

    skip = parseInt(skip)
    Gallery
        .find()
        .skip(skip)
        .limit(10)
        .then((gallery) => {
            return res.status(200).json({data: gallery})
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({'msg': 'cant fetch gallery'})

            
        })
})

Routes.get('/gallery-details/:id', (req,res,next) => {

    let id = req.params.id

    Gallery
        .findById(id)
        .then((gallery) => {
            return res.render('pages/gallery-details', {
                title: 'gallery',
                gallery: gallery
            })
        })
        .catch(err => {
            return res.render('pages/bad-request');
        })
    
})



Routes.get('/covid', async (req,res,next) => {
    var result = await tally.find()
    const data = result[result.length - 1] ;
    data.title="covid"
    res.render('pages/covid' , data)
})

Routes.get('/contact', (req,res,next) => {
    res.render('pages/contact', {
        title : 'contact',
        errorMessage: ''
    })
})


Routes.post("/generate-report" , (req,res,next) => {    
    //console.log(typeof(req.body.srfno))
    reports
        .findOne({SRF_Number : req.body.srfno})
        .then((response) => {
            req.body.title = 'not found'

            if ((!response) || (response.Result == '' || response.Result == '-')){ 
                console.log("Done In Response Not Found." , response)
                req.body['errorMessage'] = 'Report Not Found';
                req.body['description'] = '';
                return res.render('pages/srfnotfound' , req.body);
            }
            if ((response.Result == 'Positive')){ 
                req.body['errorMessage'] = ' ';
                req.body['description'] = 'Please contact Civil Hospital, Yamunanagar for your Report.'
                return res.render('pages/srfnotfound' , req.body);
            }
            if((response.Result != 'Negative') && (response.Result != 'NEGATIVE')){

                console.log("This"+response.Result+"Result" + response);
                req.body['errorMessage'] = response.Result;
                req.body['description'] = 'Please contact Civil Hospital, Yamunanagar for your Report.'
                return res.render('pages/srfnotfound' , req.body);
            }
            //console.log("Response : " , res);
            const html = fs.readFileSync('pdf/report.html', 'utf8');
            console.log(response.SRF_Number, response.Name);
            //console.log(html);
            var data = {
                SRF_Number: response.SRF_Number,
                Name: response.Name,
                Sex: response.Sex,
                Address: response.Address,
                Contact_No: response.Contact_No,
                Date_of_collection_of_sample: response.Date_of_collection_of_sample,
                Lab_where_sample_sent: response.Lab_where_sample_sent,
                LAB_ID2: response.LAB_ID2,
                Result: response.Result
            }
            console.log(data);
            var document = {
                html: html,
                data: data,
                path: `./pdf/${response.SRF_Number}.pdf`
            }
            return pdf.create(document, options)
        })
        .then((response) => {
            //console.log(response);
            //const file = fs.readFileSync()
            if (!response){
                return 0;
            }

            res.sendFile(response.filename)
            //fs.unlinkSync(response.filename);

        })
        .catch((err) => {
            if (err) throw err;
            //console.log(err);
        })
});


Routes.post('/send-query', (req,res,next) => {
    let email = req.body.email;
    let query = req.body.query;

    if (!email || !query ) {
        return res.render('pages/contact',{
            title: 'contact',
            errorMessage: 'Please enter email and query fields !'
        })
    }


    checkEmail(email)
        .then((data) => {
            if (data === false) {
                return res.render('pages/contact',{
                    title: 'contact',
                    errorMessage: 'Please enter a Valid Email Address !'
                })
            }


            var mailOptions = {
                from: 'csoynr@gmail.com',
                to: 'csoynr@gmail.com',
                subject: 'New Query',
                html: `You've Got A New Query From ${email}.<br><br> ${query}`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error)
                    return res.render('pages/contact',{
                        title: 'contact',
                        errorMessage: 'Something Went Wrong!'
                    })
                } else {
                    return res.redirect('/contact')
                }
              });
        })
        .catch(err => {
            return res.render('pages/contact',{
                title: 'contact',
                errorMessage: 'Please try again with other email address !'
            })
        })

})


module.exports = Routes;

