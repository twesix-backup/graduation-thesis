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
        const female = await user.find
        (
            {
                'profile.province': Number(gb),
                'profile.gender': 2
            }
        ).count()
        const male = await user.find
        (
            {
                'profile.province': Number(gb),
                'profile.gender': 1
            }
        ).count()
        console.log(`| ${regions[gb]} | ${male} | ${female} |`)
        result[regions[gb]] = [male, female]
    }
    fs.writeFileSync(path.resolve(__dirname, 'sex.json'), JSON.stringify(result))
})()

