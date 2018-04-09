const mongodb = require('../mongodb')

const $conn = mongodb.$conn

;(async function()
{
    const $db = await $conn
    const $user = $db.collection('user')
    const $follow = $db.collection('follow')
    const $follow_sex = $db.collection('follow_sex')

    let skip = 168410
    process.on('uncaughtException', async function(e)
    {
        console.log(e)
        skip --
        console.log(`start from: ${skip}`)
        await start(skip)
    })

    async function start()
    {
        const userCursor = $user.find
        (
            {
                'profile.gender':
                    {
                        $in: [1, 2]
                    },
                '__processed.follow': true
            }
        )
        userCursor.skip(skip)

        console.log(`find ${await userCursor.count()} users`)

        while(await userCursor.hasNext())
        {
            console.log(skip ++)
            const user = await userCursor.next()

            const followCursor = $follow.find
            (
                {
                    from: user.profile.userId
                }
            )
            console.log(`find ${await followCursor.count()} follow record from user ${user.profile.userId}`)
            const records = []
            while(await followCursor.hasNext())
            {
                const followRecord = await followCursor.next()
                const to = await $user.findOne({'profile.userId': followRecord.to})

                if( ! to)
                {
                    console.log(`user ${followRecord.to} has no profile`)
                    continue
                }

                console.log(`insert one follow record: ${user.profile.userId} --> ${to.profile.userId}`)
                const record =
                    {
                        from: user.profile,
                        to: to.profile
                    }

                records.push(record)
            }
            if(records.length > 0)
            {
                await $follow_sex.insert(records)
            }
        }
    }

    await start()
})()