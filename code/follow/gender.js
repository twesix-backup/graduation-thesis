const mongodb = require('../mongodb')

const $conn = mongodb.$conn

;(async function()
{
    const $db = await $conn
    const $follow_sex = $db.collection('follow_sex')

    const male2male = await $follow_sex.find
    (
        {
            'from.gender': 1,
            'to.gender': 1,
        }
    ).count()
    const male2female = await $follow_sex.find
    (
        {
            'from.gender': 1,
            'to.gender': 2,
        }
    ).count()
    const female2male = await $follow_sex.find
    (
        {
            'from.gender': 2,
            'to.gender': 1,
        }
    ).count()
    const female2female = await $follow_sex.find
    (
        {
            'from.gender': 2,
            'to.gender': 2,
        }
    ).count()

    const matrix =
        [
            [male2male, male2female],
            [female2male, female2female]
        ]
    console.log(matrix)
})()

