var express = require('express');
// libreria para encriptar contraseña
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;

// Impotamos clase del token para usarlo
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();



var Usuario = require('../models/usuario');

// rutas

// ==================================== 
// Obtener todos los usuario
// ====================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role') // Pasamos los campos que queremos recuperar como un string de palabras
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios // Con el standar de EcmaScript6 aqui seria suficiente con poner el objeto usuarios y por defecto le daria el nombre, pero asi es mas claro
            });
        }); // cierra exec
}); // cierra app


// ==================================== 
// Actualizar usuario
// ====================================

// Al poner :id hacemo el parametro obligatorio
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    /*return res.status(200).json({
        id: id
    });*/
    var body = req.body;

    // Comprobar si existe usuario con ese id

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({ // Error 500 porque es base de datos, si no encuentra el usuario devuelve objeto usuario vacio
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({ // Si no existe usuario viene vacio
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe el usuario con este id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });
});




// ==================================== 
// Crear usuario
// ====================================
// para usar la funcion verificaToken, la añadimos como segundo parametro a la funcion post.
// No le ponemos los parentesis como metodo porque no la estamos invocando solo se ejecuta
// Todas las validaciones que hagamos deben ir en el segundo parametro, si es mas de una las pasamos en un array [val1, val2, ..]

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    // Para no hacerlo manualmente usamos la librerir body parser node que bindea los campos del form a un objeto javascript
    var body = req.body;

    // Guardar con moongose en modelo usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        // bcrypt.hashSync es la sentencia de bcrypt para encriptar en una sola linea, le pasamos el dato a encriptar y el numero de bucles de encriptacion
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });

});

// ==================================== 
// Eliminar usuario por id
// ====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;