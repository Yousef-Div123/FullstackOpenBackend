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

app.post("/api/persons/", async (req, res, next)=>{
    let body = req.body
    let exist = await Person.find({name:body.name})

    if (!body.name || !body.number) {
      return next({name:"noContent"})
    }
    
    if(exist.length !== 0){
      return next({name:"duplicate"})
    }

    let person = new Person({
        name: body.name,
        number: body.number
    })
    try{
      let result = await person.save()
      res.json(result)
    }
    catch(error){
      next(error)
    }
})

app.get("/api/persons/:id", (req, res, next)=>{
    let id = req.params.id
    Person.findById(id)
      .then((result)=>{
        res.json(result)
      })
      .catch(error => next(error))
})

app.delete("/api/persons/:id", async (req, res, next)=>{
    let id = req.params.id
    try{
      let result = await Person.findByIdAndDelete(id)
      res.status(204).end()
    }
    catch(error){
      return next(error)
    }
})

app.put("/api/persons/:id", async (req, res, next)=>{
  try{
      let body = req.body
      let id = req.params.id
      let person = {
        name: body.name,
        number: body.number
      }
      let result = await Person.findByIdAndUpdate(id, person, {new:true, runValidators: true, context:"query"})
      res.json(result)
    }
    catch(error){
      return next(error)
    }
})

app.get("/info", (req, res)=>{
    Person.countDocuments().then(count =>{
      let date = new Date()
      res.send(`Phonebook has info for ${count} people<p>${date}</p>`)
    })
})

const errorHandler = (error, req, res, next) =>{
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  else if(error.name === "noContent"){
    return res.status(400).send({ 
      error: 'content missing' 
    })
  } 
  else if(error.name === "duplicate"){
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }
  else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port http://127.0.0.1:${PORT}/`)
})