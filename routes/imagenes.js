var express = require('express');
var app = express();

// Paqiete de node para crear rutas 
const path = require('path');

// verificar si existe imagen en el path
const fs = require('fs');

// rutas
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    // __dirname , da igual el entorno, siempre tiene la ruta donde nos encontramos. El segundo argumento 
    // es la ruta a concatenar a __dirname
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    // Comprobamos si existe la imagen del path, y la enviamos con sendFile. Si no existe enviamos la imagen por defecto
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImage);
    }
});

module.exports = app;