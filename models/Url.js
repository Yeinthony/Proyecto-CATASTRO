const mongoose = require("mongoose");
const {Schema} = mongoose;

const urlSchema = new Schema({
    origin: {
        type: String,
        unique: true,
        require: true
    },
    shortURL: {
        type: String,
        unique: true,
        require: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        require: true,
    }
});

const Url = mongoose.model("url", urlSchema);
module.exports = Url;