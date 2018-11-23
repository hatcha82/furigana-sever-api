const {
  AuthenticationController,
  HomeController,
  ImageController,
  VisitorContoller,
  ArticleController,
  SongsController,
  TwitterController,
  KanjisController,
  BookmarksController,
  HistoriesController,
  FuriganaController
} = require('./controllers/index')

const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const isAuthenticated = require('./policies/isAuthenticated')

const passport = require('passport')

module.exports = (app) => {
  app.use(passport.initialize())
  app.use(passport.session())
  app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('http://localhost:8083/login/' + req.session.passport.user)
  })
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }))
  app.get('/auth/naver/redirect', passport.authenticate('naver'), (req, res) => {
    res.redirect('http://localhost:8083/login/' + req.session.passport.user)
  })
  app.get('/auth/naver', passport.authenticate('naver', {
    scope: ['profile', 'email', 'nickname']
  }))

  app.get('/home', HomeController.index)
  app.post('/visitor/increase', VisitorContoller.increase)
  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)
  app.post('/oAuthLogin',
    AuthenticationController.oAuthLogin)
  app.post('/login',
    AuthenticationController.login)
  app.post('/logout', function (req, res) {
    req.logout()
    res.send({
      logout: 'ok'
    })
  })
  app.get('/image/search', ImageController.search)
  app.post('/furigana',
    FuriganaController.convert)
  app.get('/articles',
    ArticleController.index)
  app.get('/articles/recentNews',
    ArticleController.recentNews)
  app.get('/article/:articleId',
    ArticleController.show)
  app.put('/article/:articleId',
    ArticleController.put)
  app.post('/article',
    ArticleController.post)
  app.delete('/article/:articleId',
    isAuthenticated,
    ArticleController.remove)

  app.get('/twitters/userTimeLine', TwitterController.userTimeLine)
  app.get('/twitters/homeTimeline', TwitterController.homeTimeline)
  app.get('/twitters/twitterUserList', TwitterController.twitterUserList)

  app.get('/songs',
    SongsController.index)
  app.get('/songs/indexImageTracker',
    SongsController.indexImageTracker)
  app.get('/songs/iTunesSearch',
    SongsController.iTunesSearch)
  app.get('/songs/randomSong',
    SongsController.randomSong)
  app.get('/songs/songByArtist',
    SongsController.songByArtist)
  app.get('/song/meta/:songId',
    SongsController.meta)
  app.get('/song/:songId',
    SongsController.show)
  app.put('/song/:songId',
    SongsController.put)
  app.post('/song',
    SongsController.post)
  app.delete('/song/:songId',
    isAuthenticated,
    SongsController.remove)

  app.get('/kanjis/randomKanjis',
    KanjisController.randomKanjis)

  app.get('/bookmarks',
    isAuthenticated,
    BookmarksController.index)
  app.post('/bookmarks',
    isAuthenticated,
    BookmarksController.post)
  app.delete('/bookmarks/:bookmarkId',
    isAuthenticated,
    BookmarksController.remove)
  app.get('/histories',
    isAuthenticated,
    HistoriesController.index)
  app.post('/histories',
    isAuthenticated,
    HistoriesController.post)
}
