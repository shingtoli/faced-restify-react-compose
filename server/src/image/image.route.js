import imageController from './image.controller';

// Declare routes for images
const initImageRoutes = (server, db) => {
  const ctrl = imageController.init(db);
  server.get('/images', ctrl.listAllImages);
  server.get('/images/:id', ctrl.readImage);
  server.post('/images', ctrl.uploadImage);
};

export default initImageRoutes;
