const mongodb = require('../mongodb')

const $conn = mongodb.$conn

;(async function()
{
    const $db = await $conn
    const $user = $db.collection('user')
    const $follow_sex = $db.collection('follow_sex')
    const $vertex = $db.collection('vertex')
    const $matrix = $db.collection('matrix')

    const userIds = new Set()

    const cursor =  $follow_sex.find()
    cursor.batchSize(1000)

    const num = await cursor.count()

    await new Promise(function(resolve, reject)
    {
        let n = 0
        cursor.forEach(function(e)
        {
            userIds.add(e.from.userId)
            userIds.add(e.to.userId)
            n ++
            console.log(n)
            if(n >= num) resolve()
        })
    })


    console.log(userIds.size)
    return
    let batch = []

    let index = 0
    userIds.forEach(async function(e)
    {
        batch.push
        (
            {
                index: index,
                userId: e
            }
        )
        index ++
        console.log(index)
        if(batch.length === 1000)
        {
            console.log(`insert 1000 items into [vertex]`)
            await $vertex.insert(batch)
            batch = []
        }
    })
})()