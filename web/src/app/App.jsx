import React, { Component } from 'react';
import Webcam from 'react-webcam';
import req from 'superagent';
import './App.css';

class App extends Component {
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
      })
      .end((err, res) => {
        if (err) {
          document.getElementById('message').innerHTML = err;
        } else {
          document.getElementById('message').innerHTML = `Image uploaded ${res.body.key}`;
        }
      });
  }

  render() {
    return (
      <div className="App">
        <div id="message" />
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
      </div>
    );
  }
}

export default App;
