const fs = require('fs')
const path = require('path')

const vertex = JSON.parse(fs.readFileSync('vertex.json').toString())

const list = []

vertex.forEach(function(e)
{
    console.log(e.index)
    list.push(e.userId)
})

console.log(list)

fs.writeFileSync('vertex.list.json', JSON.stringify(list))