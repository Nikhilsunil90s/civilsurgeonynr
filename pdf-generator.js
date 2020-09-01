const fs = require('fs');
const pdf = require("pdf-creator-node");

const DriverInfo = require('../models/driver-info');
const DriverStats = require('../models/driver-stats');
const TruckStats = require('../models/truck-stats');
const TruckEvents = require('../models/truck-events');

const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'dcubedeveloper123@gmail.com',
        pass: 'Dairymilk@1'
    }
});

const options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "20mm",
        contents: '<h2 style="text-align: center">Truck Embedded Solutions</h2>'
    },
    footer: {
        height: "20mm",
        contents: {
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
        }
    }
}

exports.generatePDF = async (req, res, next) => {

    const { email, startDate, endDate } = req.body;
    const html = fs.readFileSync('pdf/email.html', 'utf8');

    lastDate = new Date(new Date().setDate(new Date(endDate).getDate() + 1)).toISOString().replace(/T/, ' ').split(' ')[0];


    DriverInfo.findOne({ email: email })
        .populate('truck trailer')
        .exec()
        .then(async (driver) => {
            console.log(driver)
            let details = {};

            details['driver'] = driver;
            details['driverStats'] = await DriverStats.findOne({ driverId: driver._id })
            details['truckStats'] = await TruckStats.findOne({ truck: driver.truck._id })
            details['truckEvents'] = await TruckEvents.find({ truck: driver.truck._id, createdAt: { $gte: startDate, $lte: lastDate } });
            return details

        })
        .then((response) => {
            const events = JSON.parse(JSON.stringify(response.truckEvents));

            var data = {
                date: startDate + " - " + endDate,
                driverId: response.driver._id ? response.driver._id : '',
                firstname: response.driver.firstname ? response.driver.firstname : '',
                lastname: response.driver.lastname ? response.driver.lastname : '',
                truck: (response.driver.truck.name + response.driver.truck.model) ? response.driver.truck.name + " " + response.driver.truck.model : '',
                trailer: response.driver.trailer.number ? response.driver.trailer.number : '',
                load: response.driver.trailer.load ? response.driver.trailer.load : '',
                onDuty: response.driverStats.onDuty ? response.driverStats.onDuty : '',
                offDuty: response.driverStats.offDuty ? response.driverStats.offDuty : '',
                sleeperBirth: response.driverStats.sleeperBirth ? response.driverStats.sleeperBirth : '',
                onDutyDriving: response.driverStats.onDutyDriving ? response.driverStats.onDutyDriving : '',
                ofDutyDriving: response.driverStats.ofDutyDriving ? response.driverStats.ofDutyDriving : '',
                onDutyDeferal: response.driverStats.onDutyDeferal ? response.driverStats.onDutyDeferal : '',
                distance: response.truckStats.kmDriven ? response.truckStats.kmDriven : '',
                plateNumber: response.driver.truck.plateNumber ? response.driver.truck.plateNumber : '',
                startOdometer: response.truckStats.startOdometer ? response.truckStats.startOdometer : '',
                endOdometer: response.truckStats.endOdometer ? response.truckStats.endOdometer : '',
                events: events
            }


            var document = {
                html: html,
                data: data,
                path: `./pdf/${response.driver._id}.pdf`
            };

            return pdf.create(document, options)


        })
        .then((response) => {

            const file = fs.readFileSync(response.filename)

            res.sendFile(file)
            // let content = Buffer.from(fs.readFileSync(response.filename), 'base64')

            // var mailOptions = {
            //     from: 'dcubedeveloper123@gmail.com',
            //     to: `${email}`,
            //     subject: 'Driver Logs Details',
            //     text: `ELD Driver logs from  ${startDate} to ${endDate}` ,
            //     attachments: [
            //         {
            //             filename: 'logs.pdf',
            //             content: content,
            //             contentType: 'application/pdf'
            //         }
            //     ]
            // };

            // // yaha res.sendFile kar lena
            // transporter.sendMail(mailOptions, function (error, info) {
            //     if (error) {
            //         console.log(error)
            //         res.status(500).send({ status: false, message: 'Internal Server Error while Sending Mail!', error: 'INTERNAL_SERVER_ERROR' });
                    
            //     } else {
            //         res.status(200).send({ status: true, message: 'File sent to your Email Successfully!' });

            //     }
            // });


        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ status: false, message: 'Internal Server Error while Generating Pdf!', error: 'INTERNAL_SERVER_ERROR' });

        })
}
