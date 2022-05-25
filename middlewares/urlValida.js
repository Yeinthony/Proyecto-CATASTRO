const { URL } = require("url");

const urlValidar = (req, res, next) => {

    try {
        const { origin } = req.body;
        const urlFronted = new URL(origin);
        if (urlFronted.origin !== "null") {
            if(
                urlFronted.protocol === "http:" ||
                urlFronted.protocol === "https:"
            ){
                return next();
            }
            throw new Error("Tiene que tener https://");  
        }

        throw new Error("No válida");
        
    } catch (error) {
        if(error.message === "Invalid URL"){
            req.flash("mensajes", [{msg: "URL no valida"}]); 
        }else{
            req.flash("mensajes", [{msg: error.message}]);
        }
        return res.redirect("/");
    }

};

module.exports = urlValidar;