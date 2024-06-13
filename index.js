require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require('cors')
const Person = require("./models/person")

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

app.get("/api/persons/", (req, res)=>{
    Person.find({}).then((result)=>{
      res.json(result)
    })
})

app.post("/api/persons/", async (req, res)=>{
    let body = req.body
    let exist = await Person.find({name:body.name})

    if (!body.name || !body.number) {
        return res.status(400).json({ 
          error: 'content missing' 
        })
    }
    
    if(exist.length !== 0){
        return res.status(400).json({ 
          error: 'name must be unique' 
        })
    }

    let person = new Person({
        name: body.name,
        number: Number(body.number)
    })

    let result = await person.save()
    res.json(result)
})

app.get("/api/persons/:id", (req, res)=>{
    let id = req.params.id
    Person.findById(id).then((result)=>{
      res.json(result)
    })
})

app.delete("/api/persons/:id", async (req, res)=>{
    let id = req.params.id
    let result = await Person.findByIdAndDelete(id)
    res.status(204).end()
})

app.get("/info", (req, res)=>{
    Person.countDocuments().then(count =>{
      let date = new Date()
      res.send(`Phonebook has info for ${count} people<p>${date}</p>`)
    })
})

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port http://127.0.0.1:${PORT}/`)
})