const express = require("express")
const morgan = require("morgan")
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get("/api/persons/", (req, res)=>{
    res.json(persons)
})

app.post("/api/persons/", (req, res)=>{
    let body = req.body
    let id = Math.floor(Math.random() * 100)
    let exist = persons.find(person => person.name === body.name)

    if (!body.name || !body.number) {
        return res.status(400).json({ 
          error: 'content missing' 
        })
    }
    
    if(exist){
        return res.status(400).json({ 
          error: 'name must be unique' 
        })
    }

    let person = {
        id: id,
        name: body.name,
        number: Number(body.number)
    }

    persons.push(person)
    res.json(person)
})

app.get("/api/persons/:id", (req, res)=>{
    let id = Number(req.params.id)
    let person = persons.find(person => person.id === id)
    if(person)
        res.json(person)
    else
        res.status(404).end()
})

app.delete("/api/persons/:id", (req, res)=>{
    let id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

app.get("/info", (req, res)=>{
    let len = persons.length
    let date = new Date()
    res.send(`Phonebook has info for ${len} people<p>${date}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`Server running on port http://127.0.0.1:${PORT}/`)
})