const fs = require('fs')
var path = require('path')

console.log(__dirname)
module.exports = {
  google: {
    callbackURL: '/auth/google/redirect',
    clientID: '101271609028-qt8p60ktp498m87ectb1arhsq1pbvj7f.apps.googleusercontent.com',
    clientSecret: 'mmTCA9ZdlC2I6RDw0_mzC79d'
  },
  naver: {
    callbackURL: '/auth/naver/redirect',
    clientID: 'H7ywV465eutZ9S93jlBg',
    clientSecret: 'RFkzUQgIWs'
  },
  kakao: {
    callbackURL: '/auth/kakao/redirect',
    clientID: '2323',
    clientSecret: '2323'
  },
  facebook: {
    callbackURL: '/auth/facebook/redirect',
    clientID: '3232',
    clientSecret: '2323'
  },
  session: {
    cookieKey: 'oauthtutorial'
  },
  ssl: {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
  }
}
