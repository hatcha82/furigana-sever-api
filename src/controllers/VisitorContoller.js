const {Visitor} = require('../models')
// import YahooWebAnalyzer from "kuroshiro-analyzer-yahoo-webapi";

module.exports = {
  async increase (req, res) {
    var body = req.body
    Visitor
      .findOrCreate({
        where: {
          visitedDate: new Date().toISOString().substring(0, 10),
          visitorIp: body.visitorIp,
          visitorRoute: body.visitorRoute
        },
        defaults: {
          vistedCount: 1,
          userAgent: body.userAgent,
          userLanguage: body.userLanguage
        }
      })
      .spread((visitor, created) => {
        if (created) {
          console.log(created)
          res.send(visitor)
        } else {
          visitor.vistedCount = visitor.vistedCount + 1
          visitor
            .save()
            .then(function () {
              res.send(visitor)
            })
        }
      })
  },
  async post (req, res) {
    try {
      const song = await Visitor.create(req.body)
      res.send(song)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to create the song'
      })
    }
  },
  async put (req, res) {
    try {
      await Visitor.update(req.body, {
        where: {
          visitDate: req.params.visitorIp,
          visitorIp: req.params.visitorIp
        }
      })
      res.send(req.body)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to update the song'
      })
    }
  }
}
