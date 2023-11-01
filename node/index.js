const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Tietokantayhteys

const mongoose = require('mongoose')
const mongoDB = 'mongodb+srv://dbUser:GTlO6TOKX2i364Ar@democluster0.pnm6jnc.mongodb.net/HarjoitteluDB?retryWrites=true&w=majority'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("Database test connected")
})

const harjoitusSchema = new mongoose.Schema({
    pvm: { type: Date, required: true },
    matka: { type: Number },
    syke: { type: Number },
    aika: { type: Number }
})

const Harjoitus = mongoose.model('Harjoitus', harjoitusSchema, 'harjoitukset')

app.get('/', (request, response) => {    
    response.sendFile(__dirname, 'public/index.html')
    
})

app.get('/harjoitukset', async (request, response) => {
    const harjoitukset = await Harjoitus.find({})
    response.json(harjoitukset)
})

app.get('/harjoitukset/:id', async (request, response) => {
    const harjoitus = await Harjoitus.findById(request.params.id)
    if (todo) response.json(todo)
    else response.status(404).end()
})

app.post('/harjoitukset', async (request, response) => {
    const harjoitus = Harjoitus({
        pvm: request.body.pvm,
        matka: request.body.matka,
        syke: request.body.syke,
        aika: request.body.aika
    })
    const saved = await harjoitus.save()
    response.json(saved)
})

app.delete('/harjoitukset/:id', async (request, response) => {
    const deleted = await Harjoitus.findByIdAndRemove(request.params.id)
    if (deleted) response.json(deleted)
    else response.status(404).end()
})

app.listen(port, () => {
    console.log('Example app listening on port 3000')
})