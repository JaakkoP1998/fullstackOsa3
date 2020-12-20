const express = require('express')
const app = express()

app.use(express.json())

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Matti Makinen",
    number: "45-6912441"
  },
  {
    id: 3,
    name: "Dan Danikton",
    number: "66-12351424"
  },
  {
    id: 4,
    name: "Mr Krabs",
    number: "040-098765"
  }
]

//Aloitus sivu http://localhost:3001/
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

//http://localhost:3001/api/persons
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

//http://localhost:3001/api/persons/ - Yksittäisen henkilön tiedot
app.get('/api/persons/:id', (request, response) => {
 //Muutetaan annetun henkilön id numero-tyypiksi
  const id = Number(request.params.id) 
  const person = persons.find(per => per.id === id)
  if (person) {
    response.json(person)
  } else {
    //Jos kyseistä henkilöä ei löydy annetaan virhekoodi 404
    response.status(404).end() 
  }
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
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(per => per.id !== id)
  
    response.status(204).end()
})
  
// Apufunktio uuden id:n luomiselle
const generateId = (max) => {
    return Math.floor(Math.random() * Math.floor(max))
}

//Apufunktio nimen tarkistusta varten
const checkName = (name) => {
    //Kerätään nimet listaan tarkistamista varten
    let apu = []
    for (let y = 0; y < persons.length; y++){
      apu.push(persons[y].name)
    }
    //Tarkistetaan onko nimi jo listassa
    return apu.includes(name)
}

//Uuden henkilön lisäys
app.post('/api/persons', (request, response) => {
    const body = request.body
    
    if(!body.number || !body.name){
        return response.status(400).json({ 
            error: 'name or number is missing' 
          })
    }

    const person = {
      id: generateId(100),
      name: body.name,
      number: body.number
    }
  
    if (checkName(person.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    persons = persons.concat(person)
    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})