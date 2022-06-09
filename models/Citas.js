const mongoose = require("mongoose");
const {Schema} = mongoose;

const citasSchema = new Schema({
    fecha: {
        type: String,
        require: true
    },
    hora: {
        type: String,
        require: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        require: true,
    }
});

const Citas = mongoose.model("citas", citasSchema);
module.exports = Citas;