var clientId = process.env.NAVER_CLIENT_ID
var clientSecret = process.env.NAVER_CLIENT_SECRET
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
  async search (req, res) {
    try {
      var search = encodeURI(req.query.keyword) //       
      var apiUrl = `https://openapi.naver.com/v1/search/image.json?query=${search}&display=100`
      var reqeustOptions = {
        url: apiUrl,
        headers: {'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret}
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
  }

}
