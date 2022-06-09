const express = require('express');
const { leerUser, leerUrls, agregarUrls, eliminarUrl, editarUrlForm, editarUrl, agendarCita, redireccionamiento } = require('../controllers/homeControllers');
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

router.get("/:shortURL", redireccionamiento); 




module.exports = router;