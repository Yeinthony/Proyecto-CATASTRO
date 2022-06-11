const User = require("../models/User");
const Url = require("../models/Url");
const Citas = require("../models/Citas");
const {nanoid} = require("nanoid");

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

    // console.log(req.user);
    
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

/* --------------------CITAS---------------------- */

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

module.exports = {
    leerUrls,
    agregarUrls,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento,
    leerUser,
    agendarCita,
};