import restify from 'restify';
import initImageRoutes from './image/image.route';

const initRoutes = (server, db) => {
  // Deploy middleware
  server.use(restify.plugins.bodyParser({
    mapParams: true,
    mapFiles: true,
  }));
  server.use(restify.plugins.queryParser());
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    return next();
  });

  initImageRoutes(server, db);
};

export default initRoutes;
