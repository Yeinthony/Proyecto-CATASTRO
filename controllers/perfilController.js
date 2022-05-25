const formidable = require("formidable");
const jimp = require("jimp")
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

module.exports.formPerfil = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.render("perfil", {user: req.user, imagen: user.imagen});
    } catch (error) {
        req.flash("mensajes", [{msg: "Error al leer el archivo"}]);
        res.redirect("/perfil");
    }
}

module.exports.editarFotoPerfil = async(req, res) => {
    const form = new formidable.IncomingForm();
    form.maxFileSize = 50*1024*1024;

    form.parse(req, async(err, fields, files) => { 
        
        try {

            if(err){
                throw new Error("Falló la subida de imágenes"); 
            }

            // console.log(fields);
            // console.log(files.myFile);

            const file = files.myFile;

            if(file.originalFilename === ""){
                throw new Error("Por favor agrega una imagen");
            }

            const imageType = ["image/jpeg", "image/png"];

            if(!imageType.includes(file.mimetype)){
                throw new Error("Por favor agrega una imagen .jpeg o .png");
            }

            // if(!(file.mimetype === "image/jpeg" || file.mimetype === "image/png")){
            //     throw new Error("Por favor agrega una imagen .jpeg o .png");
            // }

            if(file.size > 50*1024*1024){
                throw new Error("Menos de 5MB por favor");
            }

            const extension = file.mimetype.split("/")[1];
            const dirFile = path.join(__dirname, `../public/img/perfiles/${req.user.id}.${extension}`);
            
            fs.renameSync(file.filepath, dirFile);

            const image = await jimp.read(dirFile);
            image.resize(200, 200).quality(90).writeAsync(dirFile);

            const user = await User.findById(req.user.id);
            user.imagen = `${req.user.id}.${extension}`;
            await user.save();

            req.flash("mensajes", [{msg: "ya se subió la imagen"}]);

        } catch (error) {
            req.flash("mensajes", [{msg: error.message}]);
        }finally{
            return res.redirect("/perfil"); 
        }
        
    });
}