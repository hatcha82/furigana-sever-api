const {TwitterUsers} = require('../models')
var Twitter = require('twitter')
// import YahooWebAnalyzer from "kuroshiro-analyzer-yahoo-webapi";

const Kuroshiro = require('kuroshiro')
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji')
// const YahooWebAnalyzer = require('kuroshiro-analyzer-yahoo-webapi')
// const analyzer = new YahooWebAnalyzer({
//   appId: 'dj00aiZpPVVJcmZ3R3kzdTZEaiZzPWNvbnN1bWVyc2VjcmV0Jng9MWU-'
// })
const kuroshiro = new Kuroshiro()
kuroshiro.init(new KuromojiAnalyzer())
var client = new Twitter({
  consumer_key: 'WT8RWbxohsKLo7GYlrpPQzQ0A',
  consumer_secret: 'ufSb1xxaViCcP0HaOL7Ltl3g4JCTC7VzxfdNaZGzyqyL2kCTGx',
  access_token_key: '154533392-ERqhvCpOYDbjgGalpW18SMakNWXhxplXlMx7XDtC',
  access_token_secret: 'K2QjekGhokvzBbBLvvW7D2AmHLltVZWAUmB9DDfHHnofM'
})
async function getData (screenName, endPoint, maxId) {
  return new Promise(function (resolve, reject) {
    var params = {
      screen_name: screenName,
      tweet_mode: 'extended',
      stringify_ids: true,
      exclude_replies: true,
      include_rts: false,
      include_entities: true}
    if (maxId) {
      params.max_id = maxId.toString()
    }
    client.get(endPoint, params, function (error, tweets, response) {
      if (!error) {
        resolve(tweets)
      } else {
        reject(error[0])
      }
    })
  })
}
async function getDataWithFurigana (screenName, endPoint, maxId) {
  return new Promise(function (resolve, reject) {
    var params = {screen_name: screenName, tweet_mode: 'extended', stringify_ids: true, exclude_replies: true, include_rts: false, include_entities: true}
    if (maxId) {
      params.max_id = maxId.toString()
    }
    client.get(endPoint, params, function (error, tweets, response) {
      if (!error) {
        if (tweets.length === 0) {
          resolve(tweets)
        } else {
          tweets.forEach(async function (element, index, array) {
            if (element.lang === 'ja') {
              try {
                var result = await kuroshiro.convert(element.full_text, {mode: 'furigana', to: 'hiragana', romajiSystem: 'passport'})
                element.furigana = result
              } catch (error) {
                element.furigana = element.full_text
              }
            } else {
              element.furigana = element.full_text
            }
            if (index + 1 === array.length) {
              resolve(tweets)
            }
          })
        }
      } else {
        reject(error[0])
      }
    })
  })
}

module.exports = {
  async userTimeLine (req, res) {
    var search = req.query.search
    var maxId = req.query.maxId
    if (!search) {
      search = '_FURIGANA'
    }
    getDataWithFurigana(search, 'statuses/user_timeline', maxId).then(function (data) {
      res.send(data)
      // res.send(data); // response 값 출력
    }).catch(function (err) {
      res.send(err)// Error 출력
    })
  },
  async  homeTimeline (req, res) {
    var search = 'ZIP_TV'
    var maxId = req.query.maxId
    getDataWithFurigana(search, 'statuses/user_timeline', maxId).then(function (data) {
      res.send(data)
      // res.send(data); // response 값 출력
    }).catch(function (err) {
      res.status(500).send({
        error: err
      })
    })
  },
  async twitterUserList (req, res) {
    var search = req.query.search || 'hatcha82'
    var maxId = req.query.maxId
    getData(search, 'friends/list', maxId).then(function (data) {
      res.send(data)
      // res.send(data); // response 값 출력
    }).catch(function (err) {
      res.status(500).send({
        error: err
      })
    })
  },
  // async twitterUserList (req, res) {
  //   try {
  //     let twitterUsers = null
  //     const search = req.query.search
  //     const offset = parseInt(req.query.offset)
  //     var count = 0
  //     if (search) {
  //       count = await TwitterUsers.findOne({
  //         attributes: [[TwitterUsers.sequelize.fn('COUNT', TwitterUsers.sequelize.col('id')), 'count']],
  //         where: {
  //           $or: [
  //             'twitterId'
  //           ].map(key => ({
  //             [key]: {
  //               $like: `%${search}%`
  //             }
  //           }))
  //         }
  //       })

  //       twitterUsers = await TwitterUsers.findAll({
  //         where: {
  //           $or: [
  //             'twitterId'
  //           ].map(key => ({
  //             [key]: {
  //               $like: `%${search}%`
  //             }
  //           }))
  //         },
  //         order: [
  //           ['updatedAt', 'DESC']
  //         ],
  //         limit: 30,
  //         offset: offset
  //       })
  //     } else {
  //       count = await TwitterUsers.findOne({
  //         attributes: [[TwitterUsers.sequelize.fn('COUNT', TwitterUsers.sequelize.col('id')), 'count']]
  //       })
  //       twitterUsers = await TwitterUsers.findAll({
  //         order: [
  //           ['updatedAt', 'DESC']
  //         ],
  //         limit: 30,
  //         offset: offset
  //       })
  //     }
  //     res.send({data: twitterUsers, count: count})
  //   } catch (err) {
  //     res.status(500).send({
  //       error: err.toString()
  //     })
  //   }
  // },
  async show (req, res) {
    try {
      const song = await TwitterUsers.findById(req.params.songId)
      res.send(song)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the twitterUsers'
      })
    }
  },
  async post (req, res) {
    try {
      const song = await TwitterUsers.create(req.body)
      res.send(song)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to create the song'
      })
    }
  },
  async put (req, res) {
    try {
      await TwitterUsers.update(req.body, {
        where: {
          id: req.params.songId
        }
      })
      res.send(req.body)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to update the song'
      })
    }
  },
  async remove (req, res) {
    try {
      const songId = req.params.songId
      console.log('param:')
      console.log(req.params)
      const song = await TwitterUsers.findOne({
        where: {
          id: songId
        }
      })
      if (!song) {
        return res.status(403).send({
          error: 'you do not have access to this bookmark'
        })
      }
      await song.destroy()
      res.send(song)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to delete the bookmark'
      })
    }
    // try {
    //   await twitterUsers.destroy(req.body, {
    //     where: {
    //       id: req.params.songId
    //     }
    //   })
    //   res.send(req.body)
    // } catch (err) {
    //   res.status(500).send({
    //     error: 'an error has occured trying to update the song'
    //   })
    // }
  }
}
