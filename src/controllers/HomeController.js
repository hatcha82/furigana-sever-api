
const {Song, Article, sequelize} = require('../models')
let Parser = require('rss-parser')
// import YahooWebAnalyzer from "kuroshiro-analyzer-yahoo-webapi";
const Kuroshiro = require('kuroshiro')
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji')
// const YahooWebAnalyzer = require('kuroshiro-analyzer-yahoo-webapi')
// const analyzer = new YahooWebAnalyzer({
//   appId: 'dj00aiZpPVVJcmZ3R3kzdTZEaiZzPWNvbnN1bWVyc2VjcmV0Jng9MWU-'
// })
const kuroshiro = new Kuroshiro()
kuroshiro.init(new KuromojiAnalyzer())
const Op = sequelize.Op
module.exports = {
  async index (req, res) {
    try {
      const recenstNews = await module.exports.recentNews(res, req)
      const randomSongs = await module.exports.randomSong(res, req)

      res.send({recenstNews: recenstNews, randomSongs: randomSongs})
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the articles' + err
      })
    }
  },
  async recentNews (req, res) {
    const attributes = [
      'id',
      'title',
      'titleFurigana',
      'titleTranslate',
      'newsImageUrl',
      'newsPubllisherImageUrl',
      'newsPublishedDate',
      [sequelize.fn('LEFT', sequelize.col('article'), 100), 'article'],
      [sequelize.fn('LEFT', sequelize.col('translateText'), 100), 'translateText']]

    try {
      const articles = await Article.findAll({
        attributes: attributes,
        where: {
          titleTranslate: {[Op.ne]: null}

        },
        order: [
          ['newsPublishedDate', 'DESC']
        ],
        limit: 6
      })
      return articles
    } catch (err) {
      return null
    }
  },

  async randomSong (req, res) {
    try {
      var parser = new Parser()
      var feed = await parser.parseURL('https://rss.blog.naver.com/hatcha82.xml')
      var naverBlogRefNoList = []
      feed.items.forEach(item => {
        if (item.categories[0] === '일본 노래 가사') {
          var naverBlogRefNo = item.link.replace('https://blog.naver.com/hatcha82/', '')
          naverBlogRefNoList.push(naverBlogRefNo)
        }
      })

      const Op = sequelize.Op

      const attributes = [
        'id',
        'title',
        'artist',
        'album',
        'albumImageUrl',
        [sequelize.fn('LEFT', sequelize.col('lyrics'), 100), 'lyrics'],
        [sequelize.fn('LEFT', sequelize.col('lyricsKor'), 100), 'lyricsKor']
      ]

      const songs = await Song.findAll({
        attributes: attributes,
        where: {
          naverBlogRefNo: {
            [Op.in]: naverBlogRefNoList
          }
        },
        order: [
          [sequelize.random()]
        ],
        limit: 6
      })
      return songs
    } catch (err) {
      return null
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
        },
        order: [
          [sequelize.random()]
        ],
        limit: 10
      })
      res.send(songs)
    } catch (err) {
      res.status(500).send({
        error: err
      })
    }
  }
}
