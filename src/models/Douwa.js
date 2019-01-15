module.exports = (sequelize, DataTypes) => {
  const Douwa = sequelize.define('Douwa', {
    episod: DataTypes.STRING,
    title: DataTypes.STRING,
    titleFurigana: DataTypes.STRING,
    titleTranslate: DataTypes.STRING,
    linkUrl: DataTypes.STRING,
    ImageUrl: DataTypes.STRING,
    audioUrl: DataTypes.STRING,
    article: DataTypes.TEXT,
    articleType: DataTypes.STRING,
    articelOnlyText: DataTypes.STRING,
    furigana: DataTypes.TEXT,
    translateText: DataTypes.TEXT,
    createdUserId: DataTypes.INTEGER,
    updatedUserId: DataTypes.INTEGER
  })

  Douwa.associate = function (models) {
  }

  return Douwa
}
