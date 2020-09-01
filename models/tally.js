const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tally = new Schema({

    total_sample_taken: {
        type: String,
        required: true,
        trim: true
    },
    positive_reported: {
        type: String,
        required: true,
        trim: true
    },
    patient_under_treatment: {
        type: String,
        required: true,
        trim: true
    },
    negative_reported : {
        type: String,
        required: true,
        trim: true
    }
},
{
    timestamps: true,
    versionKey: false,
})

module.exports = mongoose.model("Tally", tally, 'tally');