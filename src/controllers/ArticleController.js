const {Article} = require('../models')
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
      let articles = null
      const limit = parseInt(req.query.limit || 50)
      const search = req.query.search
      const offset = parseInt(req.query.offset)
      if (search) {
        articles = await Article.findAll({
          attributes: {exclude: ['article', 'furigana', 'translateText']},
          where: {
            $or: [
              'title', 'type', 'article'
            ].map(key => ({
              [key]: {
                $like: `%${search}%`
              }
            }))
          },
          order: [
            ['newsPublishedDate', 'DESC']
          ]
        })
      } else {
        var count = await Article.findOne({
          attributes: [[Article.sequelize.fn('COUNT', Article.sequelize.col('id')), 'count']]
        })
        articles = await Article.findAll({
          attributes: {exclude: ['article', 'furigana', 'translateText']},
          order: [
            ['newsPublishedDate', 'DESC']
          ],
          limit: limit,
          offset: offset
        })
      }
      res.send({data: articles, count: count})
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the articles'
      })
    }
  },
  async recentNews (req, res) {
    const limit = parseInt(req.query.limit || 4)
    const offset = parseInt(req.query.offset || 0)
    try {
      const articles = await Article.findAll({
        attributes: {exclude: ['article', 'furigana', 'translateText']},
        order: [
          ['newsPublishedDate', 'DESC']
        ],
        limit: limit,
        offset: offset
      })
      res.send({data: articles})
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the articles'
      })
    }
  },
  async show (req, res) {
    try {
      const article = await Article.findById(req.params.articleId)
      console.log(article)
      res.send(article)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the articles'
      })
    }
  },
  async post (req, res) {
    try {
      const article = await Article.create(req.body)
      res.send(article)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to create the Article'
      })
    }
  },
  async put (req, res) {
    try {
      console.log(req.params.articleId)
      await Article.update(req.body, {
        where: {
          id: req.params.articleId
        }
      })
      res.send(req.body)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to update the Article'
      })
    }
  },
  async remove (req, res) {
    try {
      const articleId = req.params.articleId
      console.log('param:')
      console.log(req.params)
      const article = await Article.findOne({
        where: {
          id: articleId
        }
      })
      if (!article) {
        return res.status(403).send({
          error: 'you do not have access to this bookmark'
        })
      }
      await article.destroy()
      res.send(article)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to delete the bookmark'
      })
    }
    // try {
    //   await Article.destroy(req.body, {
    //     where: {
    //       id: req.params.songId
    //     }
    //   })
    //   res.send(req.body)
    // } catch (err) {
    //   res.status(500).send({
    //     error: 'an error has occured trying to update the Article'
    //   })
    // }
  }
}
