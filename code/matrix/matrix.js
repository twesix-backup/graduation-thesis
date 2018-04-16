const mongodb = require('../mongodb')
const fs = require('fs')

const $conn = mongodb.$conn
const vertex = JSON.parse(fs.readFileSync('vertex.list.json').toString())
const Inf = Infinity

const findIndex = function(userId)
{
    return vertex.indexOf(userId)
}

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

    const cursor =  $follow_sex.find().limit(1 * 10000)
    cursor.batchSize(1000)

    const matrix = createMatrix(vertex.length)

    while(await cursor.hasNext())
    {
        const e = await cursor.next()
        const row = findIndex(e.from.userId)
        const col = findIndex(e.to.userId)
        console.log(`[${row}][${col}] 1`)
        try
        {
            matrix[row][col] = 1
        }
        catch(e)
        {

        }
    }

    console.log(matrix)
    fs.writeFileSync('matrix.json', JSON.stringify(matrix))
})()