const mongoose = require('mongoose')

const GrupoSchema = new mongoose.Schema(
    {
    username: {type: String, require:true, unique:true},
    titulo: {type: String, require:true},
    fecha: {type: Date},
    usuarios:{type: Array, require:true},
    mensaje:{type: String}
    },
    {collection: 'Grupos'}


)

const Gmodel = mongoose.model('GrupoSchema',GrupoSchema)

module.exports = Gmodel