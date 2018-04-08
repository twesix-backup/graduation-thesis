const mongodb = require('../mongodb')

const $conn = mongodb.$conn

;(async function()
{
    const $db = await $conn
    const $user = $db.collection('user')
    const $follow = $db.collection('follow')
    const $follow_sex = $db.collection('follow_sex')

    const cursor = $user.find
    (
        {
            'profile.gender':
                {
                    $in: [1, 2]
                },
            '__processed.follow': true
        }
    )
    const skip = 1875
    cursor.skip(skip)
    // console.log(cursor)
    console.log(`find ${await cursor.count()} users`)
    let num = skip
    while(await cursor.hasNext())
    {
        console.log(num ++)
        const _user = await cursor.next()

        const cursor1 = $follow.find
        (
            {
                from: _user.profile.userId
            }
        )
        console.log(`find ${await cursor1.count()} follow record from user ${_user.profile.userId}`)
        while(await cursor1.hasNext())
        {
            const _follow = await cursor1.next()
            const _to = await $user.findOne({'profile.userId': _follow.to})
            // console.log(_to)

            if( ! _to)
            {
                console.log(`user ${_follow.to} has no profile`)
                continue
            }

            console.log(`insert one follow record: ${_user.profile.userId} --> ${_to.profile.userId}`)
            const record =
                {
                    from: _user.profile,
                    to: _to.profile
                }
            await $follow_sex.updateOne
            (
                record,
                {
                    $set:
                        {
                            forAnalyse: true
                        }
                },
                {
                    upsert: true
                }
            )

            // break
        }

        // break
    }
})()