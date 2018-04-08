const mongodb = require('./mongodb')

const year70 = 0
const year80 = 315532800000
const year90 = 631152000000
const year00 = 946684800000
const year10 = 1262304000000
const year20 = 1562304000000
const years = [year70, year80, year90, year00, year10, year20]

const $conn = mongodb.$conn

;(async function()
{
    const $db = await $conn
    const $user = $db.collection('user')
    const $follow_sex = $db.collection('follow_sex')

    const rows = []

    for(let index = 0; index < years.length - 1; index ++)
    {
        const row = []
        for(let index_inner = 0; index_inner < years.length - 1; index_inner ++)
        {
            const num = await $follow_sex.find
            (
                {
                    'from.birthday':
                        {
                            $gte: years[index],
                            $lt: years[index + 1]
                        },
                    'to.birthday':
                        {
                            $gte: years[index_inner],
                            $lt: years[index_inner + 1]
                        },
                }
            ).count()
            row.push(num)
        }
        rows.push(row)
    }
    console.log(rows)
})()

