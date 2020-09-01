const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reportSchema = new Schema({
    SRF_Number : {
        type: String,
        required : true,
        trim : true
    },
    Name : {
        type: String,
        required: true,
        trim: true
    },
    Son_Daughter_Wife_Of : {
        type: String,
        required: true,
        trim: true
    },
    Gender : {
        type: String,
        required: true,
        trim: true
    },
    Address : {
        type: String,
        required: true,
        trim: true
    },
    Contact_Number : {
        type: String,
        required: true,
        trim: true
    },
    Date_Sample_Taken : {
        type: String,
        required: true,
        trim: true
    },
    Lab_Name : {
        type: String,
        required: true,
        trim: true
    },
    Sample_ID : {
        type: String,
        required: true,
        trim: true
    },
    Result : {
        type: String,
        required: true,
        trim: true
    }
})

module.exports = mongoose.model("Reports", reportSchema, 'reports');