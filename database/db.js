const mongoose = require('mongoose');

mongoose.
    connect(process.env.URI).
    then(() => console.log("db conectada")).
    catch(err => console.log("Falló la conexión "+err));

// async function main() {
//   await mongoose.connect(process.env.URI);
// }