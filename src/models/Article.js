module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    title: DataTypes.STRING,
    titleFurigana: DataTypes.STRING,
    titleTranslate: DataTypes.STRING,
    type: DataTypes.STRING,
    newsUrl: DataTypes.STRING,
    newsImageUrl: DataTypes.STRING,
    newsPublisher: DataTypes.STRING,
    newsPubllisherImageUrl: DataTypes.STRING,
    newsPublishedDate: DataTypes.DATE,
    article: DataTypes.TEXT,
    furigana: DataTypes.TEXT,
    naverBlogUpload: DataTypes.STRING,
    naverBlogRefNo: DataTypes.STRING,
    translateText: DataTypes.TEXT,
    createdUserId: DataTypes.INTEGER,
    updatedUserId: DataTypes.INTEGER
  })

  Article.associate = function (models) {
  }

  return Article
}
