var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ==============================
// Busqueda especifia
// ==============================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda permitidos son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no valido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data // Ponemos tabla entre corchetes para indicar que es el valor de la variable tabla. Esto es debido a que ecma6 tiene variables computadas
        });
    });

});



// ==============================
// Busqueda general
// ==============================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // Necesitamos crear una expresion regular para la busqueda. Usamos el objeto RegExp de javascript
    // como primer parametrole pasamos el valor a buscar, que es la variable del request
    // La 'i' del segundo parametro indica que sea insensible a mayusculas y minusculas.
    var regex = new RegExp(busqueda, 'i');

    // Para recogerlo todo e incluirlo en el response, creamos objetos asincronos y esperamos que todos respondan. Usamos promesas
    // Todo lo que devuelven lo incluimos en el header

    // Como tenemos varias promesas, usamos el metodo all, del objeto Promise. Lo que hace este metodo es recibir todas las promesas que necesitamos
    // en un array, y se dispara la funcion then cuando todas han respondido. El objeto que devuelve then devuelve las respuestas en un array
    // en el mismo orden en el que hemos pasado las promesas como atributos
    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

// Promesas para busquedas asincronas
function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('hospital')
            .populate('usuario', 'nombre email')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al buscar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

// Para los usuarios queremos buscar por nombre y email, por lo que en vez de pasarle el campo nombre al find usamos la funcion or
// Esta funcion recibe un array de los objetos a buscar y crea una clausula or. Despues usamos exec , para ejecutarla
function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al buscar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;