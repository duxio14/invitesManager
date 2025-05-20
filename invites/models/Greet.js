// models/greet.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('greet', {
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    channelIds: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]',  // Valeur par défaut vide en JSON
      get() {
        // Récupérer les données sous forme de tableau
        const value = this.getDataValue('channelIds');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        // Sauvegarder les données en tant que chaîne JSON
        this.setDataValue('channelIds', JSON.stringify(value));
      }
    },
  });
};
