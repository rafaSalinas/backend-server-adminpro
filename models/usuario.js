var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // Plugin de moongose para controlar valores unicos en la BBDD

var Schema = mongoose.Schema;

// Objeto para controlar los roles de usuario permitidos.
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El email es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    // Como segundo parametro le pasamos el objeto con los roles como una enumeracion
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

// Controla los mensajes para los valores que hemos definidos como unique, en este caso el mail
// {PATH} se sustituye en el mensaje de retorno con el nombre del campo
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico ' });

module.exports = mongoose.model('Usuario', usuarioSchema);