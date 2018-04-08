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
            const num = await $follow_sex.find
            (
                {
                    'from.province': regions[name],
                    'to.birthday': regions[name_inner],
                }
            ).count()
            row.push(num)
        }
        rows.push(row)
    }
    console.log(rows)
})()

