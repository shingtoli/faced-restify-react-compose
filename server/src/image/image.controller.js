import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';
import base64 from 'base64-min';
import Faced from 'faced';

let db;
const imageDir = path.join(__dirname, '..', '..', 'storage');
const faced = new Faced();

const detectFace = (filePath, key, ext) => {
  // eslint-disable-next-line no-unused-vars
  const detectPromise = new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    faced.detect(filePath, (faces, image, file) => {
      let output = file;
      const colours = {
        face: [0, 0, 0],
        mouth: [255, 0, 0],
        nose: [255, 255, 255],
        eyeLeft: [0, 0, 255],
        eyeRight: [0, 255, 0],
      };
      const drawFeatures = (feature, colour) => {
        image.rectangle(
          [feature.getX(), feature.getY()],
          [feature.getWidth(), feature.getHeight()],
          colour,
          2,
        );
      };

      if (!faces) {
        return resolve({
          faces: 0,
        });
      }
      faces.forEach((faceItem) => {
        const itemFeatures = faceItem.getFeatures();
        drawFeatures(faceItem, colours.face);
        if (itemFeatures) {
          Object.keys(itemFeatures).forEach((itemKeys) => {
            const features = itemFeatures[itemKeys];
            features.forEach((feature) => {
              drawFeatures(feature, colours[itemKeys]);
            });
          });
        }
      });
      output = path.join(imageDir, `${key}.features.${ext}`);
      image.save(output);
      return resolve({
        faces: faces.length,
        faceData: faces,
      });
    });
  });
  return detectPromise;
};

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
  const { feature } = req.query || false;
  const midStr = !feature ? '.' : '.features.';
  db.get(id, (err, value) => {
    const filepath = path.join(imageDir, `${id}${midStr}${value.ext}`);
    if (err) {
      res.send(400, err);
      return next();
    }
    res.writeHead(200);
    res.write(base64.encodeFile(filepath));
    res.end();
    return next();
  });
};

const uploadImage = (req, res, next) => {
  // Obtain request variables
  // TODO Write face data to database and run detection before writing to DB
  const { blob } = req.files;
  const imageId = uniqid();
  const imageObj = {
    ext: req.body.ext,
    timestamp: req.body.timestamp,
    title: req.body.title,
    description: req.body.description,
  };
  const isRunFace = req.body.isRunFace || false;
  const filename = `${imageId}.${imageObj.ext}`;
  const filepath = path.join(imageDir, filename);

  // Function and Promise declarations
  const complete = () => {
    const imageDetailsOutput = { key: imageId, ext: imageObj.ext };
    if (!isRunFace) {
      res.send(200, imageDetailsOutput);
      return next();
    }
    return detectFace(filepath, imageId, imageObj.ext)
      .then((val) => {
        res.send(200, Object.assign({}, imageDetailsOutput, val));
        return next();
      })
      .catch(err => next(err));
  };

  const putPromise = new Promise((resolve, reject) => {
    db.put(imageId, imageObj, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });

  const readTempPromise = new Promise((resolve, reject) => {
    fs.readFile(blob.path, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });

  const writePromise = data => new Promise((resolve, reject) => {
    fs.writeFile(
      filepath,
      data,
      'binary',
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      },
    );
  });

  // Actually run stuff here
  if (!blob) {
    // Process Camera Image, usually in base64
    const imgSrc = req.body.base64;
    if (imgSrc) {
      base64.decodeToFile(imgSrc.replace(/^data:image\/png;base64,/, ''), filepath);
      return putPromise.then(complete).catch(err => next(err));
    }

    return next(new Error('Bad image request'));
  }

  // Process File Upload, assuming Binary File
  readTempPromise
    .then(data => writePromise(data))
    .then(() => putPromise)
    .then(complete)
    .catch(reason => next(reason));

  return writePromise;
};

// eslint-disable-next-line no-unused-vars
const faceDectectionAPI = (req, res, next) => {
  // TODO
};

const controller = {
  init(setDB) {
    db = setDB;
    return this;
  },
  listAllImages,
  readImage,
  uploadImage,
  faceDectectionAPI,
};

export default controller;
