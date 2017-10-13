import chai from 'chai';
import sinon from 'sinon';
import req from 'supertest';
import levelup from 'levelup';
import leveldown from 'leveldown';
import encode from 'encoding-down';
import restify from 'restify';
import path from 'path';
import fs from 'fs';
import initRoutes from '../../routes';

const { assert } = chai;
const sandbox = sinon.createSandbox();
let db;
let server;

describe('# Image', () => {
  before((done) => {
    server = restify.createServer({});
    done();
  });

  beforeEach((done) => {
    db = levelup(encode(leveldown('./test-data'), { valueEncoding: 'json' }), () => {
      initRoutes(server, db);
      done();
    });
  });

  afterEach((done) => {
    db.close(() => {
      leveldown.destroy('./test-data', (err) => {
        if (err) {
          throw new Error(err);
        }
        sandbox.restore();
        done();
      });
    });
  });

  it('should list all Images', (done) => {
    const values = [
      {
        key: '1',
        value: {
          ext: 'jpg',
          timestamp: (new Date()).toUTCString(),
          title: 'First Image',
          description: 'The first image added to the collection',
        },
      },
      {
        key: '2',
        value: {
          ext: 'png',
          timestamp: (new Date()).toUTCString(),
          title: 'Second Image',
          description: 'The Second image added to the collection',
        },
      },
    ];
    const testOps = values.map((val) => {
      const op = { ...val, type: 'put' };
      return op;
    });
    db.batch(testOps, (err) => {
      if (err) {
        return done(err);
      }
      return req(server).get('/images').expect(200, values).end(done);
    });
  });

  it('should retrieve an Image', (done) => {
    const testObj = {
      key: '99991',
      value: {
        ext: 'jpg',
        timestamp: (new Date()).toUTCString(),
        title: 'First Image',
        description: 'The first image added to the collection',
      },
    };

    db.put(testObj.key, testObj.value, (err) => {
      if (err) {
        return done(new Error(err));
      }
      return req(server).get(`/images/${testObj.key}`).expect(200, testObj.value).end(done);
    });
  });

  it('should insert an image and retrieve it', (done) => {
    const testObj = {
      ext: 'png',
      timestamp: (new Date()).toUTCString(),
      title: 'Uploaded Image',
      description: 'Upload Image Test',
    };

    const retrieve = (err, res) => {
      if (err) {
        return done(err);
      }
      const { key } = res.body;
      return db.get(key, (getErr, value) => {
        const filepath = path.join('.', 'storage', `${key}.png`);
        if (getErr) {
          return done(new Error(getErr));
        }
        assert.deepEqual(value, testObj, 'Image record inserted does not match test.');
        return fs.access(filepath, (accErr) => {
          assert.notExists(accErr, 'Uploaded image is not accessible.');
          if (!accErr) {
            fs.unlink(filepath, () => done());
          } else {
            done();
          }
        });
      });
    };

    req(server)
      .post('/images')
      .field(testObj)
      .attach('blob', path.join('.', 'public', 'test.png'))
      .end(retrieve);
  });

  /*
  it('should edit the image information and retrieve the updated information', () => {

  });

  it('should removes an image and it should not be retrievable.', () => {

  });
  */
});
