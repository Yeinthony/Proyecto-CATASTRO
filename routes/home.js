const express = require('express');
const { body } = require("express-validator");
const { registerAdminForm, leerUser, leerUrls, agregarUrls, eliminarUrl, editarUrlForm, editarUrl, agendarCita, redireccionamiento, registerUserAdmin, homeMasterTable, leerUserAdmins, } = require('../controllers/homeControllers');
const { formPerfil, editarFotoPerfil } = require('../controllers/perfilController');
const urlValidar = require('../middlewares/urlValida');
const verificarUser = require('../middlewares/verificarUser');
const router = express.Router();

router.get("/:ruta?", verificarUser, leerUser);
router.get("/", verificarUser, leerUrls);
router.post("/", verificarUser, urlValidar, agregarUrls);
router.get("/eliminar/:id", verificarUser, eliminarUrl);
router.get("/editar/:id", verificarUser, editarUrlForm); 
router.post("/editar/:id", verificarUser, urlValidar, editarUrl);

router.get("/perfil", verificarUser, formPerfil);
router.post("/perfil", verificarUser, editarFotoPerfil);

router.post("/citas", verificarUser, agendarCita);

// router.get("/homeMaster", homeMasterTable);
router.get("/homeMaster", verificarUser, leerUserAdmins);

router.get("/homeMaster/registerAdmin", registerAdminForm);
router.post("/homeMaster/registerAdmin", [
    body("userName", "Ingrese un nombre valido")
        .trim()
        .notEmpty()
        .escape(),
    body("email", "Ingrese un email válido")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body("password", "Contraseña de minimo 6 caracteres")
        .trim()
        .isLength({min: 6})
        .escape().custom((value, {req}) => {
            if(value !== req.body.repassword){
                throw new Error("No coinciden las contraseñas")
            }else{
                return value;
            }
        }),
], registerUserAdmin);

router.get("/:shortURL", redireccionamiento); 





module.exports = router;