const mongodb = require('../mongodb')
const path = require('path')
const fs = require('fs')

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

    const idList = []
    userIds.forEach(async function(e)
    {
        idList.push
        (
            {
                index: index,
                userId: e
            }
        )
    })
    console.log(`idList.length: ${idList.length}`)
    fs.writeFileSync(path.resolve(__dirname, 'vertex.json'), JSON.stringify(idList))
    console.log('done write file')

    // let index = 0
    // index ++
    // console.log(`index: ${index}`)
    // console.log(`batch.length: ${idList.length}`)
    // if(idList.length === 1000)
    // {
    //     console.log(`insert 1000 items into [vertex]`)
    //     await $vertex.insert(idList)
    //     idList = []
    // }
    // await $vertex.insert(idList)
})()