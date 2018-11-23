const {Kanji, sequelize} = require('../models')
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
  async randomKanjis (req, res) {
    try {
      const Op = sequelize.Op
      const kanjis = await Kanji.findAll({
        where: {
          strokeOrderGifUri: {
            [Op.ne]: null
          }
        },
        order: [
          [sequelize.random()]
        ],
        limit: 5
      })
      res.send({data: kanjis})
    } catch (err) {
      res.status(500).send({
        error: err
      })
    }
  }
}
