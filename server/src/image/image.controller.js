import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';

let db;

// eslint-disable-next-line no-unused-vars
const listAllImages = (req, res, next) => {
  const images = [];
  db.createReadStream()
    .on('data', (data) => {
      images.push(data);
    })
    .on('error', (err) => {
      res.send(400, err);
      return next();
    })
    .on('end', () => {
      res.send(200, images);
      return next();
    });
};

const readImage = (req, res, next) => {
  const { id } = req.params;
  db.get(id, (err, value) => {
    if (err) {
      res.send(400, err);
    } else {
      res.send(200, value);
    }
    return next();
  });
};

const uploadImage = (req, res, next) => {
  const { blob } = req.body;
  const imageId = uniqid();
  const imageObj = {
    ext: req.body.ext,
    timestamp: req.body.timestamp,
    title: req.body.title,
    description: req.body.description,
  };
  const filename = `${imageId}.${imageObj.ext}`;

  const writePromise = new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, '..', '..', 'storage', filename), blob, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  const putPromise = new Promise((resolve, reject) => {
    db.put(imageId, imageObj, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
  writePromise
    .then(() => putPromise)
    .then(() => {
      res.send(200, { key: imageId });
      return next();
    })
    .catch((reason) => {
      res.send(400, reason);
      return next();
    });

  return writePromise;
};

const controller = {
  init(setDB) {
    db = setDB;
    return this;
  },
  listAllImages,
  readImage,
  uploadImage,
};

export default controller;
