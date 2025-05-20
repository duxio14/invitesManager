
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('config', {
    logsId: DataTypes.STRING,
    guildId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    msg: {
        type: DataTypes.TEXT,  // Utilisation du type TEXT pour une colonne longue
        allowNull: true,  // Permet de stocker des valeurs nulles si nécessaire
      }
  });
};
