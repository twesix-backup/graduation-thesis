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

    const froms = await $follow_sex.distinct('from.userId')
    froms.forEach(function(e)
    {
        userIds.add(e)
    })
    return

    const tos =  await $follow_sex.distinct('to.userId')
    tos.forEach(function(e)
    {
        userIds.add(e)
    })

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