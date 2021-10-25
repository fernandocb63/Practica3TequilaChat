const express = require ('express');
const app = express();
const path=require('path')
const mongooose = require('mongoose')
const User = require('./model/user')
const Sesion = require('./model/sesiones')
const Grupo = require('./model/Grupo')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'adsanlfjand%&^*@$%ma9349234mwflnasf209'
const router=express.Router();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');


mongooose.connect('mongodb+srv://UserP3:1234@cluster0.cxrxn.mongodb.net/Practica3?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology: true
})

//Comprobar si esta conectada la base de datos
const db = mongooose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

const port = process.env.PORT || 3001;

const SwaggerOptions={
    swaggerDefinition:{
        swagger: "2.0",
        info:{
            "title": "Swagger Test API",
            "description": "test api for swagger documentation",
            "version": "1.0.0",
            "servers":['http://localhost:'+port],
            "contact": {
                "name": "FC",
                "email":"fer@email.com"
            }
        }
    },
    apis:['index.js']
}



app.use('/api/register',express.static(path.join(__dirname,'static', 'index.html')))
app.use('/api/login',express.static(path.join(__dirname,'static', 'login.html')))
//app.use('/api/sesiones',express.static(path.join(__dirname,)))
app.use(express.json());


/**
 * @swagger
 * /api/login:
 *  post:
 *      description: login endpoint
 *      parameters:
 *            - in: body
 *              name: username
 *              description: Login user
 *              schema:
 *                  type: object
 *                  required:
 *                      -username
 *                      -password
 *                  properties:
 *                      username:
 *                          type: string
 *                      password:
 *                          type: string
 *      responses:
 *          200:
 *              description: success response
 *          400:
 *              description: bad dara request
 * 
 *
 *  
 */
app.post('/api/login', async(req, res)=>{
    const {username, password} = req.body
    const user = await User.findOne({username}).lean()

    if(!user){
        return res.json({status: 'error', error: 'Invalid username/passowrd'})
    }

    if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({
            id: user._id, 
            username: user.username
        }, JWT_SECRET)
        return res.json({status: 'ok', data: token})
    }
    res.json({status:'error', error: 'Invalid username/password'})
})

/**
 * @swagger
 * /api/register:
 *  post:
 *      description: register endpoint
 *      parameters:
 *            - in: body
 *              name: username
 *              description: Login user
 *              schema:
 *                  type: object
 *                  required:
 *                      -username
 *                      -password
 *                  properties:
 *                      username:
 *                          type: string
 *                      password:
 *                          type: string
 * 
 * 
 *      responses:
 *          200:
 *              description: register sucess
 *          400:
 *              description: bad data request
 * 
 *
 *  
 */
app.post('/api/register', async (req,res)=>{

    const {username, password: plainTextPassword} = req.body

    if(!username || typeof username!='string'){
        return res.json({status: 'error', error:'Invalid username'})
    }
    if(!plainTextPassword || typeof plainTextPassword!='string'){
        return res.json({status: 'error', error:'Invalid password'})
    }
    if(plainTextPassword.length<5){
        return res.json({
            status: 'error', 
            error:'Passowrd to small'
        })
    }
    

    const password = await bcrypt.hash(plainTextPassword,10)
    try{
        const response = await User.create({
            username,
            password
        })
        console.log('sucess',response)
    }catch(error){
        if(error.code===11000){
            return res.json({status: 'error', error: 'Username already use'})
        }
        throw error
    }


    res.json({status:'ok', data: password})
})

//Midleware Auth
const authenticateJWT = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
          throw new Error('Authentication failed!');
        }
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;  
        next();
      } catch (err) {
        res.status(400).send('Invalid token !');
      }
};



/**
 * @swagger
 * securityDefinitions:
 *  Bearer:
 *      type: apiKey
 *      name: Authorization
 *      in: header
 * /api/sesiones:
 *  post:
 *      security:
 *           - Bearer: []
 *      description: Sessions endpoint
 *      parameters:
 *            - in: body
 *              name: username
 *              description: Login user
 *              schema:
 *                  type: object
 *                  required:
 *                      -username
 *                      -token
 *                  properties:
 *                      username:
 *                          type: string
 *                      token:
 *                          type: string
 * 
 * 
 *      responses:
 *          200:
 *              description: register sucess
 *          400:
 *              description: bad data request
 * 
 *
 *  
 */
app.post('/api/sesiones', authenticateJWT, async (req, res) => {
    const { username, token } = req.body;
    const response  = await Sesion.create({
        username,
        token
    })

    res.send('Session added successfully');
    console.log(response);
});

app.post('/api/grupos', authenticateJWT, async (req, res) => {
    const { username, titulo, fecha, usuarios } = req.body;
    const response  = await Grupo.create({
        username,
        titulo,
        fecha: Date(),
        usuarios
    })
    res.send(`http://localhost:${port}/${titulo}`);
    console.log(response.username,
        response.titulo,
        response.fecha,
        response.usuarios);
});

app.post('/api/mensaje',authenticateJWT, async(req,res)=>{
    const mess = req.body.message;
    const user = req.user;
    let newMsg = {mess, user}
    try{
        let messages = await Grupos.findOne({ titulo: t });
        messages = messages.messages
        let pMsg = messages.titulo
        pMsg.push(newMsg);
        const gp = await Grupos.updateOne(
            {titulo},
            {messages}
        );
        const messages = {title: gp.titulo,mess: gp.messages}
        res.send(messages);
    }
    catch(err){
        res.send(err);
    }
})


const swaggerDocs = swaggerJsDoc(SwaggerOptions);
app.use('/swagger-ui', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.listen(port, () => {
    console.log('App is listening in port: ' + port);
});