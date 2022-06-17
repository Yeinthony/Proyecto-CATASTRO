const User = require("../models/User");
const { validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerForm = (req, res) => {
    res.render("register"); 
}

const loginForm = (req, res) => {
    res.render("login");  
}

const registerUser = async(req, res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());
        return res.redirect("/auth/register");
    }

    const cedulaCompleta = req.body.tipoci + req.body.cedula;  

    const { userName, email, password } = req.body;

    try {

        let user = await User.findOne({email});
        if(user) throw new Error("Ya existe el usuario");

        user = new User({userName, cedula: cedulaCompleta, email, rol: 5, password, tokenConfirm: nanoid()});
        await user.save(); 

        //enviar correo electronico con la confirmacionde la cuenta
        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.userEmail,
              pass: process.env.passEmail
            }
          });

        await transport.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>',
            to: user.email,
            subject: "verifique cuenta de correo",
            html: `<a href="http://localhost:5000/auth/confirmar/${user.tokenConfirm}">verificar cuenta aquí</a>`,
        });

        req.flash("mensajes", [{msg: "Revisa tu correo electronico y valida la cuenta"}]);
        return res.redirect("/auth/login");  
        
        // res.json(user);
        
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/auth/register"); 
    }
};

const confirmarCuenta = async(req, res) => {
    const { token } = req.params;

    try {
        
        const user = await User.findOne({tokenConfirm: token});
        if(!user) throw new Error ("No existe este usuario");
        
        user.cuentaConfirmada = true;
        user.tokenConfirm = null;

        await user.save();

        req.flash("mensajes", [{msg: "Cuenta Verificada, puedes iniciar sesión."}]);
        return res.redirect("/auth/login");

    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/auth/login");
    }

}

const loginUser = async(req, res) => { 

    const errors = validationResult(req);
    if(!errors.isEmpty()){ 
        req.flash("mensajes", errors.array());
        return res.redirect("/auth/login"); 
    }

    const { email, password } = req.body; 

    try {
        
        const user = await User.findOne({email})
        if(!user) throw new Error("No existe este email");

        if(!user.cuentaConfirmada) throw new Error("Falta confirmar cuenta");

        if(!(await user.comparePassword(password))) throw new Error("Contraseña incorrecta");

        if(user.rol === "0"){
            //Esta creando la sesion de ususario a tarvés de passport
            req.login(user, function(err){
                if(err) throw new Error("Error al crear la sesión");
                res.redirect("/homeMaster");
            });
        } 

        if(user.rol === "5"){
            //Esta creando la sesion de ususario a tarvés de passport
            req.login(user, function(err){
                if(err) throw new Error("Error al crear la sesión");
                res.redirect("/");
            });
        } 


    } catch (error) { 
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/auth/login");
    }
}

const cerrarSesion = (req, res) => {
    req.logout();
    return res.redirect("/auth/login");
}

module.exports = {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion,
}