const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    name: {
        type:String,
        required:true,
        unique:true
    },
    videoUrl: {
        type:String,
        required:true,
        unique:true
    },
    mimeType:String,
    size:String,
    description: String,
})

const Videos = mongoose.model('Videos', videoSchema);

module.exports = Videos;