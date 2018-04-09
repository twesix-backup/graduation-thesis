const Inf = Infinity

const matrix =
    [
        [0,   12,  Inf, Inf, Inf, 16,  14 ],
        [12,  0,   10,  Inf, Inf, 7,   Inf],
        [Inf, 10,  0,   3,   5,   6,   Inf],
        [Inf, Inf, 3,   0,   4,   Inf, Inf],
        [Inf, Inf, 5,   4,   0,   2,   8  ],
        [16,  7,   6,   Inf, 2,   0,   9  ],
        [14,  Inf, Inf, Inf, 8,   9,   0  ]
    ]

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

console.log(createSameSize(matrix))


const floyd = async function(matrix)
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
}