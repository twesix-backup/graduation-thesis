const mongodb = require('./mongodb')
const fs = require('fs')
const regions = JSON.parse(fs.readFileSync('./region.json').toString())
const path = require('path')

const $conn = mongodb.$conn

;(async function()
{
    const db = await $conn
    const user = db.collection('user')

    const result = {}
    for(const gb in regions)
    {
        const num = await user.find
        (
            {
                'profile.province': Number(gb)
            }
        ).count()
        console.log(`| ${regions[gb]} | ${num} |`)
        result[regions[gb]] = num
    }
    // console.log(result)
    fs.writeFileSync(path.resolve(__dirname, 'province.json'), JSON.stringify(result))
})()

