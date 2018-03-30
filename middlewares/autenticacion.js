var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// =======================================================================================
// Middelware verificar token si el token es valido se puede continuar. 
//  lo incluimos aqui porque las peticiones que vienen despues necesitan de su aprobacion
// La ruta get de peticiones seguira siendo publica
// =======================================================================================

// Pasamos todo el codigo del middlewar a un metodo para exportar.

exports.verificaToken = function(req, res, next) {
    var token = req.query.token; // Suponemos que nos pasan el token por ruta. Si no lo envian es undefined y falla

    // Verificar token
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({ // 401 Unahutorized
                ok: false,
                mensaje: 'Invalid Token',
                errors: err
            });
        }

        // el parametro decoded de la funcion tiene toda la informacion del usuario, despues de pasar por aqui
        // podemos ejecutar esta sentencia y le añadimos a todas las request que hagamos la informacion del usuario.
        req.usuario = decoded.usuario;

        //Para continuar necesitamos llamar a next
        next();
    });
}