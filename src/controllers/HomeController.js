
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
    try {
      const articles = await Article.findAll({
        attributes: {exclude: ['article', 'furigana', 'translateText']},
        order: [
          ['newsPublishedDate', 'DESC']
        ],
        limit: 12
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

      console.log(naverBlogRefNoList)

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
        limit: 12
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
