const mongodb = require('../mongodb')
const fs = require('fs')
const path = require('path')

const $conn = mongodb.$conn

const createMatrix = function(n, init = Inf)
{
    const result = []
    for(let i = 0; i < n; i ++)
    {
        const row = []
        for(let i = 0; i < n; i ++)
        {
            row.push(init)
        }
        result.push(row)
    }
    return result
}

;(async function()
{
    const $db = await $conn
    const $follow_sex = $db.collection('follow_sex')

    const cursor =  $follow_sex.find().limit(10 * 10000)
    cursor.batchSize(1000)

    while(await cursor.hasNext())
    {
    }
})()