module.exports = (sequelize, DataTypes) => {
  const Kanji = sequelize.define('Kanji', {
    kanji: DataTypes.STRING,
    onyomi: DataTypes.STRING,
    kunyomi: DataTypes.STRING,
    english: DataTypes.STRING,
    grade: DataTypes.STRING,
    strokeOrderGifUri: DataTypes.STRING,
    twitterUploaded: DataTypes.STRING,
    createdUserId: DataTypes.INTEGER,
    updatedUserId: DataTypes.INTEGER
  })
  Kanji.associate = function (models) {
  }
  return Kanji
}
