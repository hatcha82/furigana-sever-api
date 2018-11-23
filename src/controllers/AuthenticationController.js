const {User} = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

function jwtSignUser (user) {
  // const ONE_WEEK = 60 * 60 * 24 * 7
  // const ONE_DAY = 60 * 60 * 24
  const ONE_HOUR = 60 * 60
  return jwt.sign(user, config.authentication.jwtSecret, {
    expiresIn: ONE_HOUR
  })
}

module.exports = {
  async register (req, res) {
    try {
      req.body.provider = 'furiganahub'
      const user = await User.create(req.body)
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      })
    } catch (err) {
      res.status(400).send({
        error: 'This email account is already in use.'
      })
    }
  },
  async oAuthLogin (req, res) {
    try {
      const {providerId} = req.body
      const user = await User.findOne({
        where: {
          providerId: providerId
        }
      })
      if (!user) {
        console.log('User Not exist')
        return res.status(403).send({
          error: 'The login information was incorrect'
        })
      }
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to log in'
      })
    }
  },
  async login (req, res) {
    try {
      const {email, password} = req.body
      const user = await User.findOne({
        where: {
          email: email,
          provider: 'furiganahub'
        }
      })
      if (!user) {
        console.log('User Not exist')
        return res.status(403).send({
          error: 'The login information was incorrect'
        })
      }

      const isPasswordValid = await user.comparePassword(password)
      console.log(isPasswordValid)
      if (!isPasswordValid) {
        console.log('Password Error')
        return res.status(403).send({
          error: 'The login information was incorrect'
        })
      }

      const userJson = user.toJSON()
      console.log(userJson)
      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to log in'
      })
    }
  }
}
