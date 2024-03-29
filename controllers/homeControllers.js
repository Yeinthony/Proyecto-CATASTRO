const User = require("../models/User");
const Url = require("../models/Url");
const Citas = require("../models/Citas");
const {nanoid} = require("nanoid");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

/* ------------ CIUDADANO ---------- */

const leerUser = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { ruta } = req.params;

        if (ruta === undefined) {
            return res.render("home", {userName: user.userName, imagen: user.imagen, cedula: user.cedula});
        }

        res.render(ruta, {userName: user.userName, imagen: user.imagen, cedula: user.cedula}); 
        
    } catch (error) {
        req.flash("mensajes", [{msg: "Error al leer el usuario"}]);
        res.redirect("/");
    }
}

const leerUrls = async(req, res) => {
    
    try {

        const urls = await Url.find({user: req.user.id}).lean(); 
        res.render("home", {urls});
        
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }

};

const eliminarUrl = async(req, res) => {  

    const {id} = req.params;

    try {

        // await Url.findByIdAndDelete(id);
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)){
            throw new Error("No es tu url")
        } 

        await url.remove();
        req.flash("mensajes", [{msg: "URL eliminada"}]);
        return res.redirect("/");
        
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }

};

const agregarUrls = async(req, res) => {

    const {origin} = req.body;

    try {
        const url = new Url({origin: origin, shortURL: nanoid(8), user: req.user.id});
        await url.save();
        req.flash("mensajes", [{msg: "URL agregada"}]);
        return res.redirect("/");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }

}; 

const editarUrlForm = async(req, res) => {

    const { id } = req.params;
    
    try {

        const url = await Url.findById(id).lean();

        if(!url.user.equals(req.user.id)){
            throw new Error("No es tu url")
        } 

        return res.render("home", {url});
        
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }

}; 

const editarUrl = async(req, res) => {

    const { id } = req.params;
    const { origin } = req.body;
    
    try {
        const url = await Url.findById(id);

        if(!url.user.equals(req.user.id)){
            throw new Error("No es tu url")
        } 

        await url.updateOne({origin});
        req.flash("mensajes", [{msg: "url editada"}]);

        res.redirect("/");
        
        // const Url = await Url.findByIdAndUpdate(id, {origin}).lean();
        // res.render("home", {url});
        
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/");
    }

}; 

/* CITAS */

const agendarCita = async(req, res) => {

    const fechaFront = new Date(req.body.fecha);
    const horaFront = req.body.hora;

    const numeroDia = new Date(fechaFront).getDay();    
    
    try {

        if(numeroDia === 5 || numeroDia === 6){
            throw new Error("Fines de semana no laborables");
        }

        let diaDisponible = await Citas.count({fecha: fechaFront});
        if (diaDisponible >= 13) throw new Error("Citas llenas para este dia");
        console.log(diaDisponible);

        let horaDisponible = await Citas.findOne({fecha: fechaFront, hora: horaFront});
        if(horaDisponible) throw new Error("hora no disponible");

        const citas = new Citas({fecha: req.body.fecha, hora: req.body.hora, user: req.user.id});
        await citas.save();
        req.flash("mensajes", [{msg: "Cita agendada"}]);
        return res.redirect("/citas");

    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/citas");
    }

}; 

/* ---------------------- ADMINISTRADORES ------------------ */

const homeMasterTable = (req, res) => {
    console.log("Hola");
    res.render("homeMaster"); 
}

const registerAdminForm = (req, res) => {
    res.render("registerAdmin"); 
}


/* LEER USUARIOS ADMINISTRATIVOS */
const leerUserAdmins = async(req, res) => {

    console.log("Hola");
    
    try {

        const adminUsers = await User.find({rol: {$ne:"5"}}).lean(); //{and: [rol: {$lte: "5"}, rol: {$gte: "1"}]}
        console.log(adminUsers);
        res.render("homeMaster", {adminUsers});
        
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/homeMaster");
    }

};

const redireccionamiento = async(req, res) => {
    const {shortURL} = req.params;
    try {
        const urlDB = await Url.findOne({shortURL: shortURL});
        res.redirect(urlDB.origin);
        
    } catch (error) {
        req.flash("mensajes", [{msg: "No exise esta url confirmada"}]);
        return res.redirect("/auth/login");
    }
};

/*RGISTRAR ADMINISTRADORES*/
const registerUserAdmin = async(req, res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());
        return res.redirect("/homeMaster/registerAdmin");
    }

    const cedulaCompleta = req.body.tipoci + req.body.cedula;  

    const { userName, email, rol, password } = req.body;

    try {

        let user = await User.findOne({email});
        if(user) throw new Error("Ya existe el usuario");

        user = new User({userName, cedula: cedulaCompleta, email, rol, password, tokenConfirm: nanoid()});
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

        req.flash("mensajes", [{msg: "Revisa el correo electronico de "+userName + " y valida la cuenta"}]);
        return res.redirect("/homeMaster/registerAdmin");  
        
        // res.json(user);
        
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/homeMaster/registerAdmin"); 
    }
};


module.exports = {
    registerAdminForm,
    leerUrls,
    agregarUrls,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento,
    leerUser,
    agendarCita,
    registerUserAdmin,
    homeMasterTable,
    leerUserAdmins,
};