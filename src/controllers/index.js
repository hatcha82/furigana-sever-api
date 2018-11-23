const fs = require('fs')
const path = require('path')
const constollers = {}
fs
  .readdirSync(__dirname)
  .filter((file) =>
    file !== 'index.js'
  )
  .forEach((file) => {
    const constroller = require(path.join(__dirname, file))
    constollers[file.replace('.js', '')] = constroller
  })

module.exports = constollers
