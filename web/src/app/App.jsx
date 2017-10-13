import React, { Component } from 'react';
import Webcam from 'react-webcam';
import req from 'superagent';
import logo from '../logo.svg';
import './App.css';

class App extends Component {
  capture() {
    const imageSrc = this.webcam.getScreenshot();
    req.post('http://frrc-server:3008/images')
      .field({
        ext: 'png',
        timestamp: (new Date()).toUTCString(),
        title: 'Uploaded Image',
        description: 'Upload Image Test',
      })
      .attach('blob', imageSrc)
      .end((err) => {
        if (err) {
          alert(`Error:${err}`);
        } else {
          alert('Image uploaded.');
        }
      });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Faced Facial Detection App</h1>
        </header>
        <div>
          <Webcam
            audio={false}
            height={512}
            ref={this.setRef}
            screenshotFormat="image/jpeg"
            width={512}
          />
          <button onClick={this.capture}>Capture photo</button>
        </div>
      </div>
    );
  }
}

export default App;
