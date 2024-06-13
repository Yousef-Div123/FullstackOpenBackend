const mongoose = require("mongoose")

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@phonebook.fstyipd.mongodb.net/persons?retryWrites=true&w=majority&appName=phonebook`
mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    let name = process.argv[3]
    let number = process.argv[4]
    const newPerson = new Person({
        name: name,
        number: number
    })

    newPerson.save().then((result) =>{
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()
    })
}
else if(process.argv.length === 3){
    Person.find({}).then((res)=>{
        console.log("phonebook:")
        res.forEach(person=>{
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}