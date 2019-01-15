const {Douwa, sequelize} = require('../models')
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
      let douwas = null
      console.log(req.query)
      const limit = parseInt(req.query.limit || 50)
      const search = req.query.search
      const offset = parseInt(req.query.offset)
      var count = 0
      const Op = sequelize.Op
      var queryOption = {
        limit: limit,
        offset: offset
      }
      if (search) {
        queryOption.where = {
          $or: [
            'title', 'titleTranslate'
          ].map(key => ({
            [key]: {
              $like: `%${search}%`
            }
          }))
        }
        queryOption.attributes = [[Douwa.sequelize.fn('COUNT', Douwa.sequelize.col('id')), 'count']]
        count = await Douwa.findOne(queryOption)
        queryOption.attributes = ['id', 'title', 'titleFurigana', 'ImageUrl', 'articleType', [sequelize.fn('LEFT', sequelize.col('articelOnlyText'), 100), 'articelOnlyText']]

        // {exclude: ['article', 'furigana', 'articleOnlyText', 'translateText']}

        queryOption.order = [['updatedAt', 'DESC']]
        douwas = await Douwa.findAll(queryOption)
      } else {
        if (req.query.updatedAt) {
          queryOption.where = {
            updatedAt: {[Op.lt]: req.query.updatedAt}
          }
        }
        queryOption.attributes = [[Douwa.sequelize.fn('COUNT', Douwa.sequelize.col('id')), 'count']]
        count = await Douwa.findOne(queryOption)
        queryOption.attributes = ['id', 'title', 'titleFurigana', 'ImageUrl', 'articleType', [sequelize.fn('LEFT', sequelize.col('articelOnlyText'), 100), 'articelOnlyText']]
        queryOption.order = [['updatedAt', 'DESC']]
        douwas = await Douwa.findAll(queryOption)
      }
      res.send({data: douwas, count: count})
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the douwas'
      })
    }
  },
  async recentNews (req, res) {
    const limit = parseInt(req.query.limit || 4)
    const offset = parseInt(req.query.offset || 0)
    try {
      const douwas = await Douwa.findAll({
        attributes: {exclude: ['douwa', 'furigana', 'translateText']},
        order: [
          ['updatedAt', 'DESC']
        ],
        limit: limit,
        offset: offset
      })
      res.send({data: douwas})
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the douwas'
      })
    }
  },
  async show (req, res) {
    try {
      const douwa = await Douwa.findById(req.params.douwaId)
      console.log(douwa)
      res.send(douwa)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the douwas'
      })
    }
  },
  async post (req, res) {
    try {
      const douwa = await Douwa.create(req.body)
      res.send(douwa)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to create the Douwa'
      })
    }
  },
  async put (req, res) {
    try {
      console.log(req.params.douwaId)
      await Douwa.update(req.body, {
        where: {
          id: req.params.douwaId
        }
      })
      res.send(req.body)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to update the Douwa'
      })
    }
  },
  async remove (req, res) {
    try {
      const douwaId = req.params.douwaId
      console.log('param:')
      console.log(req.params)
      const douwa = await Douwa.findOne({
        where: {
          id: douwaId
        }
      })
      if (!douwa) {
        return res.status(403).send({
          error: 'you do not have access to this bookmark'
        })
      }
      await douwa.destroy()
      res.send(douwa)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to delete the bookmark'
      })
    }
    // try {
    //   await Douwa.destroy(req.body, {
    //     where: {
    //       id: req.params.songId
    //     }
    //   })
    //   res.send(req.body)
    // } catch (err) {
    //   res.status(500).send({
    //     error: 'an error has occured trying to update the Douwa'
    //   })
    // }
  }
}
