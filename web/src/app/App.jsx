import React, { Component } from 'react';
import Webcam from 'react-webcam';
import req from 'superagent';
import './App.css';

class App extends Component {
  static readImage(imageId) {
    req.get(`http://${process.env.REACT_APP_SERVER_URL}/images/${imageId}?feature=1`)
      .end((err, res) => {
        if (err) {
          document.getElementById('error').innerHTML = err;
        }
        document.getElementById('faced_img').src = 'data:image/png;base64,'.concat(res.text);
      });
  }

  constructor(props) {
    super(props);
    this.state = { webcam: null };
    this.setRef = this.setRef.bind(this);
    this.capture = this.capture.bind(this);
  }

  setRef(wc) {
    this.setState({ webcam: wc });
  }

  capture() {
    const imageSrc = this.state.webcam.getScreenshot();
    req.post(`http://${process.env.REACT_APP_SERVER_URL}/images`)
      .field({
        ext: 'png',
        timestamp: (new Date()).toUTCString(),
        title: 'Uploaded Image',
        description: 'Upload Image Test',
        base64: imageSrc,
        isRunFace: true,
      })
      .end((err, res) => {
        if (err) {
          document.getElementById('error').innerHTML = err;
        } else {
          App.readImage(res.body.key);
          document.getElementById('message').innerHTML = `Image uploaded ${JSON.stringify(res.body)}`;
        }
      });
  }

  render() {
    return (
      <div className="App">
        <div id="message" />
        <div id="error" />
        <div>
          <Webcam
            audio={false}
            height={512}
            ref={this.setRef}
            screenshotFormat="image/png"
            width={512}
          />
          <button onClick={this.capture}>Capture photo</button>
        </div>
        <div>
          <img id="faced_img" alt="Detected Face" />
          <div id="debug" />
        </div>
      </div>
    );
  }
}

export default App;
