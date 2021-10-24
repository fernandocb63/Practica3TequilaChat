const mongoose = require('mongoose')

const SesionSchema = new mongoose.Schema(
    {
    username: {type: String, require:true, unique:true},
    token: {type: String, require:true}
    },
    {collection: 'sesiones'}


)

const Smodel = mongoose.model('SesionSchema',SesionSchema)

module.exports = Smodel