import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';
import base64 from 'base64-min';

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
  const { blob } = req.files;
  const imageId = uniqid();
  const imageObj = {
    ext: req.body.ext,
    timestamp: req.body.timestamp,
    title: req.body.title,
    description: req.body.description,
  };
  const filename = `${imageId}.${imageObj.ext}`;
  const filepath = path.join(__dirname, '..', '..', 'storage', filename);

  const complete = () => {
    res.send(200, { key: imageId });
    return next();
  };

  const putPromise = new Promise((resolve, reject) => {
    db.put(imageId, imageObj, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });

  if (typeof blob === 'undefined') {
    const imgSrc = req.body.base64;
    if (imgSrc) {
      base64.decodeToFile(imgSrc.replace(/^data:image\/png;base64,/, ''), filepath);
      return putPromise.then(complete).catch((err) => {
        next(err);
      });
    }

    return next(new Error('Bad image request'));
  }

  const readTempPromise = new Promise((resolve, reject) => {
    fs.readFile(blob.path, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });

  const writePromise = data => new Promise((resolve, reject) => {
    fs.writeFile(
      filepath,
      data,
      'binary',
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });

  readTempPromise
    .then(data => writePromise(data))
    .then(() => putPromise)
    .then(complete)
    .catch(reason => next(reason));

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
