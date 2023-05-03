const oldRoutes = require('./routes.old');
const newRoutes = require('./routes.new');

module.exports = function (app) {
  oldRoutes(app);
  newRoutes(app);
};
