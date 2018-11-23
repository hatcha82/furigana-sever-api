module.exports = (sequelize, DataTypes) => {
  const TwitterUsers = sequelize.define('TwitterUsers', {
    twitterId: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    profileImage: DataTypes.STRING,
    createdUserId: DataTypes.INTEGER,
    updatedUserId: DataTypes.INTEGER
  })
  TwitterUsers.associate = function (models) {
  }
  return TwitterUsers
}
