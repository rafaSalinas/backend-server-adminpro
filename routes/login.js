var express = require('express');
// libreria para encriptar contraseña
var bcrypt = require('bcryptjs');
// Importacion de jsonwebtoken
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED; //directamente solo usamos la constante.

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    //Necesitamos recibir el body con mail y password
    var body = req.body;

    //Buscamos el unico usuario con ese corre
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales incorretas - email', // -email es para saber el punto del error  , se quita en produccion
                errors: err
            });
        }

        // Aqui comparamos la contraseña enviada con la guardada usando la funcion bcrypt.compareSync. Hacemos si no coinciden
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales incorretas - password',
                errors: err
            });
        }

        // Crear un token !!!
        // A la funcion le pasamos tres parametros
        // Payload, o usuario del token
        // SEED, string que hace el token unioco
        // expiresIn, con el tiempo para que expire
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});



module.exports = app;