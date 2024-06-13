const mongoose = require("mongoose")

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI


mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
})

const personNumberValidator = (value)=>{
  if(value.length - 1 < 8)
    return false
  let firstPart = value.indexOf("-")
  if(firstPart == -1 ||value.slice(0,firstPart).length > 3 || value.slice(0,firstPart).length < 2)
    return false
  for(let c of value.slice(firstPart + 1)){
    if(!/^\d+$/.test(c)){
      return false
    }
  }
  return true
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: personNumberValidator,
      message:props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person