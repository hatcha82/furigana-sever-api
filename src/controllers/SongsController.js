var path = require('path')
var fs = require('fs')
let Parser = require('rss-parser')

const {Song, sequelize} = require('../models')
// import YahooWebAnalyzer from "kuroshiro-analyzer-yahoo-webapi";
const Kuroshiro = require('kuroshiro')
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji')
// const YahooWebAnalyzer = require('kuroshiro-analyzer-yahoo-webapi')
// const analyzer = new YahooWebAnalyzer({
//   appId: 'dj00aiZpPVVJcmZ3R3kzdTZEaiZzPWNvbnN1bWVyc2VjcmV0Jng9MWU-'
// })
const kuroshiro = new Kuroshiro()
kuroshiro.init(new KuromojiAnalyzer())
async function requestGet (options) {
  return new Promise(resolve => {
    var request = require('request')
    request.get(options, function (error, response, body) {
      var returnObj = {
        error: error,
        response: response,
        body: body
      }
      resolve(returnObj)
    })
  })
}
module.exports = {
  async index (req, res) {
    try {
      let songs = null
      const search = req.query.search
      const offset = parseInt(req.query.offset)
      const limit = parseInt(req.query.limit || 30)
      var count = 0

      var queryOption = {
        limit: limit,
        offset: offset
      }
      if (search) {
        queryOption.where = {
          $or: [
            'title', 'artist'
          ].map(key => ({
            [key]: {
              $like: `%${search}%`
            }
          }))
        }
        queryOption.attributes = [[Song.sequelize.fn('COUNT', Song.sequelize.col('id')), 'count']]
        count = await Song.findOne(queryOption)

        queryOption.attributes = {exclude: ['lyrics', 'tab', 'lyricsKor']}
        queryOption.order = [['rank', 'ASC']]
        songs = await Song.findAll(queryOption)
      } else {
        queryOption.attributes = [[Song.sequelize.fn('COUNT', Song.sequelize.col('id')), 'count']]
        count = await Song.findOne(queryOption)

        queryOption.attributes = {exclude: ['lyrics', 'tab', 'lyricsKor']}
        queryOption.order = [['rank', 'ASC']]
        songs = await Song.findAll(queryOption)
      }
      res.send({data: songs, count: count})
    } catch (err) {
      res.status(500).send({
        error: err
      })
    }
  },
  async indexImageTracker (req, res) {
    try {
      const Op = sequelize.Op
      let songs = null
      const search = req.query.search
      const offset = parseInt(req.query.offset)
      var count = 0
      if (search) {
        count = await Song.findOne({
          attributes: [[Song.sequelize.fn('COUNT', Song.sequelize.col('id')), 'count']],
          where: {
            albumImageUrl: {[Op.eq]: null},
            $or: [
              'title', 'artist'
            ].map(key => ({
              [key]: {
                $like: `%${search}%`
              }
            }))
          }
        })

        songs = await Song.findAll({
          attributes: {exclude: ['lyrics', 'tab']},
          where: {
            albumImageUrl: {[Op.eq]: null},
            $or: [
              'title', 'artist'
            ].map(key => ({
              [key]: {
                $like: `%${search}%`
              }
            }))
          },
          order: [
            ['rank', 'ASC'],
            ['updatedAt', 'DESC']
          ],
          limit: 30,
          offset: offset
        })
      } else {
        count = await Song.findOne({
          attributes: [[Song.sequelize.fn('COUNT', Song.sequelize.col('id')), 'count']],
          where: {
            albumImageUrl: {[Op.eq]: null}
          }
        })

        songs = await Song.findAll({
          attributes: {exclude: ['lyrics', 'tab']},
          where: {
            albumImageUrl: {[Op.eq]: null}
          },
          order: [
            ['rank', 'ASC'],
            ['updatedAt', 'DESC']
          ],
          limit: 30,
          offset: offset
        })
      }
      res.send({data: songs, count: count})
    } catch (err) {
      res.status(500).send({
        error: err
      })
    }
  },
  async iTunesSearch (req, res) {
    try {
      var keyword = req.query.keyword
      var offset = req.query.offset ? 1 : parseInt(req.query.offset)
      console.log(keyword)
      keyword = encodeURI(keyword) //       
      var apiUrl = `https://itunes.apple.com/search?term=${keyword}&country=JP&entity=song&lang=ja_jp&limit=${offset}`
      var reqeustOptions = {
        url: apiUrl
      }
      // console.log(reqeustOptions)      
      var result = await requestGet(reqeustOptions)
      var JSONBody = JSON.parse(result.body)
      res.send(JSONBody)
    } catch (err) {
      res.status(500).send({
        error: err
      })
    }

    // return Api().get(ituneSearchUrl, { crossDomain: true})
  },
  async randomSong (req, res) {
    var parser = new Parser()
    var feed = await parser.parseURL('https://rss.blog.naver.com/hatcha82.xml')
    var naverBlogRefNoList = []
    feed.items.forEach(item => {
      if (item.categories[0] === '일본 노래 가사') {
        var naverBlogRefNo = item.link.replace('https://blog.naver.com/hatcha82/', '')
        naverBlogRefNoList.push(naverBlogRefNo)
      }
    })
    try {
      const Op = sequelize.Op
      const songs = await Song.findAll({
        attributes: {exclude: ['lyrics', 'lyricsKor', 'tab']},
        where: {
          naverBlogRefNo: {
            [Op.in]: naverBlogRefNoList
          }
        },
        order: [
          [sequelize.random()]
        ],
        limit: 10
      })
      res.send({data: songs})
    } catch (err) {
      res.status(500).send({
        error: err
      })
    }
  },
  async songByArtist (req, res) {
    try {
      const artist = req.query.artist
      const Op = sequelize.Op
      const songs = await Song.findAll({
        attributes: {exclude: ['lyrics', 'lyricsKor', 'tab']},
        where: {
          artist: artist,
          albumImageUrl: {
            [Op.ne]: null
          },
          lyricsKor: {
            [Op.ne]: null
          }
        }
      })
      res.send(songs)
    } catch (err) {
      res.status(500).send({
        error: err
      })
    }
  },
  async meta (req, res) {
    var template = fs.readFileSync(path.join(__dirname, '../metaTemplate', 'metaSong.html'), 'utf-8')
    try {
      const song = await Song.findById(req.params.songId)
      template = template.replace(/\[\[title\]\]/g, song.title)
      template = template.replace(/\[\[artist\]\]/g, song.artist)
      template = template.replace(/\[\[lyrics\]\]/g, song.lyrics.substring(0, 200) + '...')
      template = template.replace(/\[\[albumImageUrl\]\]/g, song.albumImageUrl)
      res.send(template)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the songs'
      })
    }
  },
  async show (req, res) {
    try {
      const song = await Song.findById(req.params.songId)
      res.send(song)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the songs'
      })
    }
  },
  async post (req, res) {
    try {
      const song = await Song.create(req.body)
      res.send(song)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to create the song'
      })
    }
  },
  async put (req, res) {
    try {
      await Song.update(req.body, {
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
      const song = await Song.findOne({
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
    //   await Song.destroy(req.body, {
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
