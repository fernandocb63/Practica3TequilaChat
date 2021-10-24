const mongoose = require('mongoose')

const GrupoSchema = new mongoose.Schema(
    {
    username: {type: String, require:true, unique:true},
    titulo: {type: String, require:true},
    fecha: {type: Date},
    usuarios:{type: Array, require:true}
    },
    {collection: 'Grupos'}


)

const Gmodel = mongoose.model('GrupoSchema',GrupoSchema)

module.exports = Gmodel