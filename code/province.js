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
        const age70 = await user.find
        (
            {
                'profile.province': Number(gb),
                'profile.birthday': {$gte: 0, $lt: 315532800000}
            }
        ).count()
        const age80 = await user.find
        (
            {
                'profile.province': Number(gb),
                'profile.birthday': {$gte: 315532800000, $lt: 631152000000}
            }
        ).count()
        const age90 = await user.find
        (
            {
                'profile.province': Number(gb),
                'profile.birthday': {$gte: 631152000000, $lt: 946684800000}
            }
        ).count()
        const age00 = await user.find
        (
            {
                'profile.province': Number(gb),
                'profile.birthday': {$gte: 946684800000, $lt: 1262304000000}
            }
        ).count()
        const age10 = await user.find
        (
            {
                'profile.province': Number(gb),
                'profile.birthday': {$gte: 1262304000000}
            }
        ).count()
        console.log(`| ${regions[gb]} | ${age70} | ${age80} | ${age90} | ${age90} | ${age10} |`)
        result[regions[gb]] = [age70, age80, age90, age00, age10]
    }
    fs.writeFileSync(path.resolve(__dirname, 'age.json'), JSON.stringify(result))
})()

