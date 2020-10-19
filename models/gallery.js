const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gallerySchema = new Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    image: [
        
    ],
    desc: {
        type: String,
        required: true,
        trim: true
    }
    
},
{
    timestamps: true,
    versionKey: false,
})

module.exports = mongoose.model("Gallery", gallerySchema, 'gallery');