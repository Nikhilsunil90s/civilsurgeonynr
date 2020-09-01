const express = require('express');
const Routes = express.Router();
const bcrypt = require('bcryptjs');
const reports = require("../models/reports")
const tally = require("../models/tally")
const fs = require('fs');
const pdf = require('pdf-creator-node');


const options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "20mm",
        contents: '<h2 style="text-align: center">Civil Surgeon\'s Office, Yamunanagar</h2>'
    },
    footer: {
        height: "20mm",
        contents: {
            default: '<span style="color: #444;text-align: center">{{page}}</span>/<span>{{pages}}</span>'
        }
    }
}


Routes.get('/', (req,res,next) => {
    res.redirect('/home');
})

Routes.get('/home', (req,res,next) => {
    res.render('pages/home')
})

Routes.get('/covid', async (req,res,next) => {
    var result = await tally.find()
    //var totalPositi = await reports.find({Result: 'Negative'})

    const data = result[result.length - 1] ;
    console.log(data)
   // reports.find({})
    res.render('pages/covid' , data)
})

Routes.get('/doctors', (req,res,next) => {
    res.render('pages/doctors')
})

Routes.get('/contact', (req,res,next) => {
    res.render('pages/contact')
})

Routes.post("/generate-report" , (req,res,next) => {
    
    
    console.log(req.body)
    reports
        .findOne({SRF_Number : req.body.srfno})
        .then((response) => {
            console.log(response)

            if (!response){
                return res.render('pages/srfnotfound' , req.body);
            }
            //console.log("Response : " , res);
            const html = fs.readFileSync('pdf/report.html', 'utf8');
            console.log(response.SRF_Number, response.Name);
            //console.log(html);
            var data = {
                SRF_Number: response.SRF_Number,
                Name: response.Name,
                Son_Daughter_Wife_Of: response.Son_Daughter_Wife_Of,
                Gender: response.Gender,
                Address: response.Address,
                Contact_Number: response.Contact_Number,
                Date_Sample_Taken: response.Date_Sample_Taken,
                Lab_Name: response.Lab_Name,
                Sample_ID: response.Sample_ID,
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


module.exports = Routes;

