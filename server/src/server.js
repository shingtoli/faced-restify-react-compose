import restify from 'restify';
import db from './db';
import initRoutes from './routes';

const server = restify.createServer();
const port = process.env.PORT || '9009';

// Init routes
initRoutes(server, db);

// Start server
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started and listening to port ${port}`);
});

export default server;
