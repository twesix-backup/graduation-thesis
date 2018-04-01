const url = `mongodb://CloudMusic:CloudMusic@base.twesix.cn:27017/CloudMusic?authMechanism=SCRAM-SHA-1&authSource=CloudMusic`
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const getConnection = async function()
{
    return (await MongoClient.connect(url, {poolSize: 200})).db('CloudMusic')
}

module.exports.$conn = getConnection()