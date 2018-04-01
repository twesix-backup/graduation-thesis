const mongodb = require('./mongodb')
const fs = require('fs')
const regions = JSON.parse(fs.readFileSync('./region.json').toString())
console.log(regions)

const $conn = mongodb.$conn

;(async function()
{
    const db = await $conn
    const user = db.collection('user')


})()

