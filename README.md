# 正文

## 摘要

网易云音乐中的用户大致可以分为两类, 一类是普通听众, 另一类是歌手, 音乐创作人这类发布音乐的人.在整个用户群体中, 存在着许多的关联关系. 这些用户可以随意的互相关注, 而每个用户又有着自己独特的特征, 比如性别, 地域, 年龄等等.用户之间相互关注的情况可以用一个很大的有向图来表示, 用户是有向图中的点, 每一个用户对另外一个用户的关注就是有向图的一条边. 这篇论文对部分用户信息(大概N用户)进行了采集,分析了用户的个体特征, 用户之间相互关注, 用户之间间接性的相互关联(基于floyd算法)等等在地域上的分布情况,并且基于分析结果进行回归预测, 从而估计整个用户群体的情况, 最后进行可视化展现, 使得结果直观明了.

## 目录

1. 数据的爬取方法
2. 数据的存储方法
3. 数据的结构和内容
4. 数据分析
5. 对分析结果进行可视化

### 1. 数据的爬取方法

#### 1. 原理

跨站请求伪造 (CSRF), 伪造请求头 , 调用官方 API. 爬虫通过提供与正常请求相同的参数, 通过post方法向网易云的后台发起请求, 从而获取相应的数据.

#### 2. 反爬虫策略

由于网易云的后台设置有反爬虫的机制, 所以不能爬取的太快, 否则IP会被封掉. 但是, 由于做分析需要的数据量较大,爬取的速度太慢无法再短时间内怕取到足够的数据. 因此必须采取一定的策略加快数据爬取的速度. 根据网易云的反爬虫机制, 单个IP地址一分钟最多发送20个请求. 因此, 这里采用多个代理并行爬取的方式. 同时, 在http请求头中, 随机化user-agent, 更好的把爬虫伪装成正常用户.

#### 3. 代理程序

在搭建代理的时候, 由于我们的代理是为了隐藏爬虫, 所以必须使用http正向代理中的高匿代理, 否则会被网易云的后台发现异常. 这里使用的是自己使用Node.js编写的一个简单的匿名代理.

代理的原理是客户端先将请求发送到代理服务器, 由代理服务器向目标服务器发起请求, 并将请求结果发回客户端.

代码如下:

```javascript
const PROXY_PORT = 65535

const http = require('http')
const net = require('net')
const url = require('url')

function request(cReq, cRes)
{
    const u = url.parse(cReq.url)

    console.log(`[http.request] ${cReq.method} ${u.hostname}:${u.port || 80} ${u.path}`)

    const options =
        {
            hostname : u.hostname,
            port     : u.port || 80,
            path     : u.path,
            method   : cReq.method,
            headers  : cReq.headers,
        }

    const pReq = http.request(options, function(pRes)
    {
        cRes.writeHead(pRes.statusCode, pRes.headers)
        pRes.pipe(cRes);
    }).on('error', function(e)
    {
        console.error(e)
        cRes.end()
    });

    cReq.pipe(pReq)
}

function connect(cReq, cSock)
{
    console.log(`[http.connect] ${cReq.url}`)
    const u = url.parse('http://' + cReq.url);

    const pSock = net.connect(u.port, u.hostname, function()
    {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function(e)
    {
        console.error(e)
        cSock.end();
    });

    cSock.pipe(pSock);
}

http.createServer()
    .on('request', request)
    .on('connect', connect)
    .on('error', function(err)
    {
        console.error(err)
    })
    .listen(PROXY_PORT, function()
    {
        console.log(`proxy server online: http://localhost:${PROXY_PORT}`)
    });
```

### 2. 数据的存储方法

#### 1. 数据库

数据存储在自己搭建的MongoDB数据库中, 共五个collection, 总计N万条用户数据. MongoDB数据库是一种结构自由, 无schema的文档数据库, 便于存储这种对象化的用户数据.

#### 2. 用户数据结构

##### 1. user

用户的个人profile存储在user这个collection中, 主要的结构如下:

```json
{
    "_id":"5a51ba300604d374f28af6fb",
    "profile":
    {
        "userId":363516402,
        "gender":0,
        "birthday":-2209017600000,
        "city":220100,
    },
    "__processing":
    {
        "follow":false,
        "followed":false,
        "playlist":false,
        "detail":false
    },
    "__processed":
    {
        "follow":true,
        "followed":true,
        "playlist":false,
        "detail":true
    }
}
```

各个字段的含义如下:

1. _id(数据库主键)
2. profile.userId(用户id)
3. profile.gender(用户性别, 0为男性, 1为女性)
4. profile.birthday(用户的出生日期)
5. profile.city(用户所在的城市)
6. __processing(互斥锁, 用于并发)
7. __processed(表示这个用户是否已经处理过了)

##### 2. follow

用户的个人profile存储在follow这个collection中, 主要的结构如下:

```json
{
    "_id":"5a4b488c954454ebecda66cb",
    "from":"test",
    "to":"test1",
    "updatedAt":1515168662545
}
```

### 3. 数据的结构和内容

pass

### 4. 数据分析

1. 用户关注情况, 主要包括以下几个方面

   1. 男女之间互相关注的数量的对比
   2. 不同省份的用户之间相互关注数量的对比
   3. 不同年龄的用户的互相关注数量对比

2. 用户之间的距离问题, 打算采用floyd算法进行计算

   1. 计算平均经过多少人, 两个用户之间可以产生关联
   2. 用tensorflow对结果进行回归预测, 预测更大的用户量情况下的结果

3. 用户在全国范围内的分布

   1. 男女分布
   2. 年龄分布
