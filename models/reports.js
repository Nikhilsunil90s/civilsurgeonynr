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
    Sex : {
        type: String,
        required: true,
        trim: true
    },
    Address : {
        type: String,
        required: true,
        trim: true
    },
    Contact_No : {
        type: String,
        required: true,
        trim: true
    },
    Date_of_collection_of_sample : {
        type: String,
        required: true,
        trim: true
    },
    Lab_where_sample_sent : {
        type: String,
        required: true,
        trim: true
    },
    LAB_ID2 : {
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