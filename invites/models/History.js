
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('history', {
    guildId: DataTypes.STRING,
    userId: {
        type: DataTypes.STRING,
    },
    invitorId: {
        type: DataTypes.STRING, 
      }
  });
};
