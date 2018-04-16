const Inf = Infinity
const fs = require('fs')

const matrix = JSON.parse(fs.readFileSync('matrix.json').toString())

for(let row = 0; row < matrix.length; row ++)
{
    for(let col = 0; col < matrix.length; col ++)
    {
        if(matrix[row][col] === null)
        {
            matrix[row][col] = Inf
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

console.log(numberOfNotInf(matrix))

// console.log(matrix)

const createSameSize = function(matrix, init = 0)
{
    const result = []
    for(let i = 0; i < matrix.length; i ++)
    {
        const row = []
        for(let i = 0; i < matrix.length; i ++)
        {
            row.push(init)
        }
        result.push(row)
    }
    return result
}

// console.log(createSameSize(matrix))

const floyd = function(matrix)
{
    const dist = createSameSize(matrix, Inf)
    const path = createSameSize(matrix, Inf)

    for (let i = 0; i < matrix.length; i ++)
    {
        for (let j = 0; j < matrix.length; j ++)
        {
            dist[i][j] = matrix[i][j]
            path[i][j] = j // 顶点i"到"顶点j"的最短路径是经过顶点j,  path[i][j] = i 也是一样的
        }
    }

    for (let i = 0; i < matrix.length; i ++) // 循环遍历每个节点
    {
        console.log(`i: ${i}`)
        for (let j = 0; j < matrix.length; j ++) // 每一行
        {
            for (let k = 0; k < matrix.length; k ++) // 每一列
            {
                const temp = (dist[i][k] === Inf || dist[k][j] === Inf) ? Inf : dist[i][k] + dist[k][j]
                if(dist[i][j] > temp)
                {
                    dist[i][j] = temp
                    path[i][j] = k
                }
            }
        }
    }
    return [dist, path]
}

const result = floyd(matrix)
fs.writeFileSync('result.json', JSON.stringify(result))
console.log(numberOfNotInf(result[0]))
console.log(numberOfNotInf(result[1]))
