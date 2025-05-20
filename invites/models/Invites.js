const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('invites', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    real: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    fake: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  });
};
