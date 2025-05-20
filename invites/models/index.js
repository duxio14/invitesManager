const fs = require('fs');
const path = require('path');

module.exports = (sequelize) => {
  const models = {};

  fs.readdirSync(path.join(__dirname))
    .filter(file => file !== 'index.js' && file.endsWith('.js'))
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize);
      models[model.name] = model;
    });

  return models;
};
