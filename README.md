# 正文

## 摘要

网易云音乐中的用户大致可以分为两类, 一类是普通听众, 另一类是歌手, 音乐创作人这类发布音乐的人.在整个用户群体中, 存在着许多的关联关系. 这些用户可以随意的互相关注, 而每个用户又有着自己独特的特征, 比如性别, 地域, 年龄等等.用户之间相互关注的情况可以用一个很大的有向图来表示, 用户是有向图中的点, 每一个用户对另外一个用户的关注就是有向图的一条边. 这篇论文对部分用户信息(大概N用户)进行了采集,分析了用户的个体特征, 用户之间相互关注, 用户之间间接性的相互关联(基于floyd算法)等等在地域上的分布情况,并且基于分析结果进行回归预测, 从而估计整个用户群体的情况, 最后进行可视化展现, 使得结果直观明了.


### 1. 数据的爬取

#### 1. 原理

跨站请求伪造 (CSRF), 伪造请求头 , 调用官方 API. 爬虫通过提供与正常请求相同的参数, 通过post方法向网易云的后台发起请求, 从而获取相应的数据.

#### 2. 调用官方后台API的具体方法

##### 1. 访问方式

网易云音乐的后台api的url为`http://music.163.com/weapi/${api_name}?csrf_token=${token}, 通过发起http请求即可访问网易云音乐的后台api，但是后台的api需要加上正确的参数并对参数进行相应的处理，否则会被网易云音乐的后台判定为非法请求，直接屏蔽掉。

##### 2. 参数的处理

上面已经提到，在对网易云音乐的后台发起请求的时候，必须带上相应的参数并进行正确的处理，否则请求会被当做非法的而自己屏蔽掉。参数的具体处理方法如下(以获取歌曲的评论为例)：

1. csrf_token
   csrf(cross-site request forgery)即跨站请求伪造，这个参数主要是解决一些基于web的攻击，在请求的时候可以设为空字符串（假设客户端之前没有访问过网易云音乐的网站），但不能没有这个参数。
2. 其余的各个参数（offset，rid，limie）

网易云音乐的后台请求一律采取的是post方法，请求数据放在body部分。
将这些参数组成一个对象，如下所示，作为未加密处理的body部分。

```javascript
const body =
 {
    offset: req.query.offset || 0,
    rid: rid,
    limit: req.query.limit || 20,
    csrf_token: ""
  };
```

接下来通过相应的方法对请求进行加密处理：用一个16位长度的随机字符串作为加密的秘钥，然后按照下面代码所示的方法进行加密，最后返回一个对象，该对象具有两个属性：params是加密后的数据，encSecKey代表加密用的秘钥，用于服务器端对加密后的数据进行解密。

```javascript
function Encrypt(obj)
 {
    const text = JSON.stringify(obj)
    const secKey = createSecretKey(16)
    const encText = aesEncrypt(aesEncrypt(text, nonce), secKey)
    const encSecKey = rsaEncrypt(secKey, pubKey, modulus)
    return {
        params: encText,
        encSecKey: encSecKey
    }
}
```

然后通过post方法发起请求：url为该API对应的url，请求方法为post方法，body的内容就是上面返回的对象经过querystring序列化之后的返回结果。

##### 3. 结果

通过上面所述的请求方法，可以比较方便的通过调用网易云音乐后台API的方式进行数据的采集，免去了通过爬取网页来提取内容的麻烦，可以让爬虫以更快的速度进行数据的采集。但是，由于网易云音乐的后台设有严格的反爬虫机制，所以还要通过下面所说的方式来进行规避，防止爬虫被屏蔽。

#### 3. 反爬虫策略

由于网易云的后台设置有反爬虫的机制, 所以不能爬取的太快, 否则IP会被封掉. 但是, 由于做分析需要的数据量较大,爬取的速度太慢无法再短时间内怕取到足够的数据. 因此必须采取一定的策略加快数据爬取的速度. 根据网易云的反爬虫机制, 单个IP地址一分钟最多发送20个请求. 因此, 这里采用多个代理并行爬取的方式. 同时, 在http请求头中, 随机化user-agent, 更好的把爬虫伪装成正常用户.

#### 4. 代理程序

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

#### 4. Node.js基于事件循环的异步非阻塞并发机制

由于需要爬取的数据量较大, 传统的单线程同步程序耗时非常长, 所以必须采取并发机制. 这里采用的是Node.js基于事件循环的异步非阻塞并发机制. 在使用并发机制的时候, 需要使用互斥锁来确保程序有序运行.

---------------------------------------------------------------------------------------------------

### 2. 数据的存储

#### 1. 数据库

数据存储在自己搭建的MongoDB数据库中, 共五个collection, 总计N万条用户数据. MongoDB数据库是一种结构自由, 无schema的文档数据库, 便于存储这种对象化的用户数据.

-------------------------------------------------------------------------------------------------------

### 3. 数据的结构

#### 1. 用户数据结构

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
        "city":220100
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

各个字段的含义如下:

1. _id(数据库主键)
2. from(关注别人的那个人的userId)
3. to(被关注的那个人的userId)
4. updatedAt(这条记录的插入时间)

### 4. 数据分析

#### 1. 用户之间相互关注的情况的对比分析

1. 男女之间互相关注的数量的对比
2. 不同省份的用户之间相互关注数量的对比
3. 不同年龄的用户的互相关注数量对比

#### 2. 采用floyd算法进行计算用户之间的距离

##### 1. 用有向图展示用户之间的关联关系

为了直观的展现用户之间的关联, 我们用有向图来描述这种关系.
我们用有向图中的节点来代表用户实体, 用有向图中的边来代表用户之间的相互关注, 这样, 用户之间的关联关系就表示成了一个巨大的有向图(见图4.2.1.1), 我们下面的分析也是基于这个有向图来做的.

在这里, 用户之间的距离是指在由用户节点和关注边所构成的有向图中, 某个用户节点与另外一个用户节点之间的最短距离(见图4.2.1.2).

##### 2. 计算平均经过多少人, 两个用户之间可以产生关联

在代表用户关联的有向图中, 我们通过floyd算法来计算任意两点之间的最短距离

###### 1. 矩阵的存储

###### 2. 矩阵的运算

##### 3. 用tensorflow对结果进行回归预测, 预测更大的用户量情况下的结果

### 3. 用户在全国范围内的分布

#### 1. 男女分布

在基于所有的样本进行分析之后, 得到的不同性别的用户在全国各个省份的分布情况, 结果如下:

| 省份 | 男性用户数量 | 女性用户数量 |
|:----:|:-----------:| :----------:|
| 湖北省|     20     |      30     |

使用d3.js进行可视化展示之后的结果如下:

#### 2. 年龄分布

| 省份 | 男性用户数量 | 女性用户数量 |
|:----:|:-----------:| :----------:|
| 湖北省|     20     |      30     |
