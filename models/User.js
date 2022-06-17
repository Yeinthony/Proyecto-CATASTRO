const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
    userName: {
        type: String,
        uppercase: true,
        required: true
    },
    cedula: {
        type: String,
        require: true 
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        index:{unique: true}
    },
    rol: {
        type: String,
        required: true,   
    },
    password: {
        type: String,
        required: true,   
    },
    tokenConfirm: {
        type: String,
        default: null
    },
    cuentaConfirmada: {
         type: Boolean,
         default: false
    },
    imagen: {
        type: String,
        default: null,
    },
});

userSchema.pre("save", async function (next){
    const user = this;
    if(!user.isModified("password")) return next();

    try {
        
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);

        user.password = hash;
        next();

    } catch (error) {
        console.log(error);
        throw new Error("Error al codificar la contraseña");
    }
});

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
}

module.exports = mongoose.model("User", userSchema);