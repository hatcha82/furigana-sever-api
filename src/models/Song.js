module.exports = (sequelize, DataTypes) => {
  const Song = sequelize.define('Song', {
    title: DataTypes.STRING,
    artistId: DataTypes.INTEGER,
    artist: DataTypes.STRING,
    genre: DataTypes.STRING,
    album: DataTypes.STRING,
    albumImageUrl: DataTypes.STRING,
    youtubeId: DataTypes.STRING,
    lyrics: DataTypes.TEXT,
    tab: DataTypes.TEXT,
    lyricsKor: DataTypes.TEXT,
    songLink: DataTypes.STRING,
    rank: DataTypes.STRING,
    createdUserId: DataTypes.INTEGER,
    updatedUserId: DataTypes.INTEGER
  })

  Song.associate = function (models) {
  }
  return Song
}
