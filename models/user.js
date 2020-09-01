const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({


    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required:true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiration: {
        type: Date
    }
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("User", userSchema, 'users');