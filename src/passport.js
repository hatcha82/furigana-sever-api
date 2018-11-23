const passport = require('passport')
const {User} = require('./models')
const GoogleStrategy = require('passport-google-oauth20')
const NaverStrategy = require('passport-naver').Strategy
const KakaoStrategy = require('passport-kakao').Strategy
const FacebookStrategy = require('passport-facebook').Strategy

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const config = require('./config/config')
const keys = require('./config/keys')

passport.use(
  new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.authentication.jwtSecret
  }, async function (jwtPayload, done) {
    try {
      const user = await User.findOne({
        where: {
          id: jwtPayload.id
        }
      })
      if (!user) {
        return done(new Error(), false)
      } else {
        return done(null, user)
      }
      // console.log(JSON.stringify(jwtPayload))
      // const user = await User.findOne({
      //   where: {
      //     id: jwtPayload.id
      //   }
      // })
      // if (!user) {
      //   return done(new Error(), false)
      // }
    } catch (err) {
      return done(new Error(), false)
    }
  })
)
passport.serializeUser((user, done) => {
  done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({
    where: {
      id: id
    }
  })
  if (!user) {
    return done(new Error(), false)
  } else {
    return done(null, user)
  }
})
const upsertUserInfo = (user, doneCallback) => {
  User
    .findOrCreate({where: {providerId: user.providerId}, defaults: user})
    .spread((user, created) => {
      if (user) {
        doneCallback(null, user[0])
      } else {
        doneCallback(null, created)
      }
    })
}
//   User.findOne({providerId : user.providerId}).then((currentUser)=>{
//     if(!currentUser){//if user is not exist create new user        
//       new User(user).save().then((newUser) =>{
//           console.log('User has been created ' , newUser);
//           doneCallback(null,newUser);  
//       }) ;
//     }else{
//         console.log('User already exists in datbase' , currentUser);
//         doneCallback(null,currentUser);  
//     }
//   });
passport.use(
  new GoogleStrategy(keys.google, // options for google strategy  end
    (accessToken, refreshTokken, profile, done) => { // passport callback function
      // var log = `
      //   name: ${profile.displayName},
      //   accessToken : ${accessToken},
      //   refreshTokken : ${refreshTokken},
      //   provider:'GOOGLE',
      //   providerId: ${profile.id},
      //   profileImage: ${profile._json.image.url}
      // `
      upsertUserInfo({
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: profile.provider,
        providerId: profile.id,
        profileImage: profile._json.image.url
      }, done)
      // console.log(log)
      done(null, profile)
    })
)
passport.use(
  new NaverStrategy(keys.naver, // options for naver strategy  end
    (accessToken, refreshTokken, profile, done) => { // passport callback function
      console.log(profile)
      upsertUserInfo({
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: profile.provider,
        providerId: profile.id,
        profileImage: profile._json.profile_image
      }, done)
      done(null, profile)
    })
)
passport.use(
  new KakaoStrategy(keys.kakao, // options for kakao strategy  end
    (accessToken, refreshTokken, profile, done) => { // passport callback function
      console.log(profile)
    // upsertUserInfo({
    //   name: profile.displayName,
    //   provider:'KAKAO',
    //   providerId: profile.id,
    //   profileImage: profile._json.properties.profile_image
    // },done);   
    })
)

passport.use(
  new FacebookStrategy(keys.facebook, // options for facebook strategy  end
    (accessToken, refreshTokken, profile, done) => { // passport callback function
      console.log(profile)
    // upsertUserInfo({
    //   name: profile.displayName,
    //   provider:'FACEBOOK',
    //   providerId: profile.id,
    //   profileImage: profile._json.picture.data.url,
    // },done);  
    })
)
module.exports = null
