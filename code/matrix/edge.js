const fs = require('fs')
const path = require('path')

const vertex = JSON.parse(fs.readFileSync('vertex.list.json').toString())

const Inf = Infinity

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

console.log(createMatrix(5))