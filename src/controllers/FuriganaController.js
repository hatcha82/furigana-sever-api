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
  async convert (req, res) {
    try {
      const furigana = await kuroshiro.convert(req.body.text, { mode: 'furigana', to: 'hiragana' })
      const okurigana = await kuroshiro.convert(req.body.text, { mode: 'okurigana', to: 'hiragana' })
      const result = {
        furigana: furigana,
        okurigana: okurigana
      }
      res.send({result: result})
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to convert the text'
      })
    }
  }
}
