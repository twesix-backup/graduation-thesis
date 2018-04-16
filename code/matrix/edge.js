const fs = require('fs')

const result = JSON.parse(fs.readFileSync('result.json').toString())
const dist = result[0]

const Inf = Infinity

for(let row = 0; row < dist.length; row ++)
{
    for(let col = 0; col < dist.length; col ++)
    {
        if(dist[row][col] === null)
        {
            dist[row][col] = Inf
        }
    }
}

const numberOfNotInf = function(matrix)
{
    let n = 0
    for(let row = 0; row < matrix.length; row ++)
    {
        for(let col = 0; col < matrix.length; col ++)
        {
            if(matrix[row][col] !== Inf)
            {
                n ++
            }
        }
    }
    return n
}

const maxValueOfMatrix = function(matrix)
{
    let max = 0
    for(let row = 0; row < matrix.length; row ++)
    {
        for(let col = 0; col < matrix.length; col ++)
        {
            if(matrix[row][col] > max && matrix[row][col] !== Inf)
            {
                max = matrix[row][col]
            }
        }
    }
    return max
}

console.log(dist.length)
const nxn = dist.length * dist.length
const noni = numberOfNotInf(dist)
const max = maxValueOfMatrix(dist)
console.log(nxn, noni, max)