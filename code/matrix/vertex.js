const mongodb = require('../mongodb')
const fs = require('fs')
const path = require('path')

const $conn = mongodb.$conn

;(async function()
{
    const $db = await $conn
    const $user = $db.collection('user')
    const $follow_sex = $db.collection('follow_sex')
    const $vertex = $db.collection('vertex')
    const $matrix = $db.collection('matrix')

    const idSet = new Set()

    const cursor =  $follow_sex.find().limit(10 * 10000)
    cursor.batchSize(1000)

    let n = 0
    while(await cursor.hasNext())
    {
        const e = await cursor.next()
        idSet.add(e.from.userId)
        idSet.add(e.to.userId)
        n ++
        console.log(n)
    }

    console.log(idSet.size)

    const idList = []
    let index = 0
    idSet.forEach(async function(e)
    {
        const item =
            {
                index: index,
                userId: e
            }
        idList.push(item)
        index ++
        console.log(index)
    })
    // await $vertex.insert(idList)

    fs.writeFileSync(path.resolve(__dirname, 'vertex.json'), JSON.stringify(idList))
})()