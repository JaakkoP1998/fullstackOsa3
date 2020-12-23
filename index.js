require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(cors())
app.use(express.static('build'))

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Matti Makinen',
        number:'45-6912441'
    },
    {
        id: 3,
        name: 'Dan Danikton',
        number:'66-12351424'
    },
    {
        id: 4,
        name: 'Mr Krabs',
        number: '040-098765'
    }
]

//Aloitus sivu http://localhost:3001/
app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

//http://localhost:3001/api/persons
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

//http://localhost:3001/api/persons/ - Yksittäisen henkilön tiedot
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if(person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})

// http://localhost:3001/info - sivu
app.get('/info', (request, response) => {
    const amount = persons.length
    let date = new Date()
    response.send(`<div> 
     <div>Phonebook has ${amount} people </div>
     <div>${date}</div>
     </div>`)
})

// Yksittäisen henkilötietojen poisto
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})
// Apufunktio uuden id:n luomiselle (ennen MONGODB:n käyttöön ottamista)
/* const generateId = (max) => {
    return Math.floor(Math.random() * Math.floor(max))
} */

/* //Apufunktio nimen tarkistusta varten (ennen MONGODB:n käyttöön ottamista)
const checkName = (name) => {
    //Kerätään nimet listaan tarkistamista varten
    let apu = []
    for (let y = 0; y < persons.length; y++){
      apu.push(persons[y].name)
    }
    //Tarkistetaan onko nimi jo listassa
    return apu.includes(name)
} */

//Uuden henkilön lisäys
app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.number || !body.name){
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }

    const person = new Person({
        //id: generateId(100),
        name: body.name,
        number: body.number
    })

    person.save().then (savedPerson => {
        response.json(savedPerson)
    })

    /* if (checkName(person.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    } */
})

//Virheiden käsittely middlewareina
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

//Olemattomat osoitteet
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error:'malform id' })
    } else if (error.name === 'ValidationError'){
        return response.status(400).json({ error : error.message })
    }
    next(error)
}
//Virheelliset pyynnöt
app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})