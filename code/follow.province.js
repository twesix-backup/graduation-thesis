const mongodb = require('./mongodb')
const fs = require('fs')
const regions = JSON.parse(fs.readFileSync('./region.json').toString())
const path = require('path')

const $conn = mongodb.$conn

;(async function()
{
    const $db = await $conn
    const $user = $db.collection('user')
    const $follow_sex = $db.collection('follow_sex')

    const rows = []

    for(let name in regions)
    {
        const row = []
        for(let name_inner in regions)
        {
            const query =
                {
                    'from.city':
                        {
                            $gte: Number(name),
                            $lt: Number(name) + 9999
                        },
                    'to.city':
                        {
                            $gte: Number(name_inner),
                            $lt: Number(name_inner) + 9999
                        }
                }
            console.log(query)
            const num = await $follow_sex.find(query).count()
            console.log(num)
            row.push(num)
        }
        rows.push(row)
    }
    console.log(rows)
    fs.writeFileSync(path.resolve(__dirname, 'follow.province.json'), JSON.stringify(rows))
})()

