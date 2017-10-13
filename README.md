# Faced on Restify & React with Docker-Compose #

## MacOS ##

### Installing OpenCV ###

```shell
brew tap homebrew/science
brew install opencv@2
```

### Setup Server ###

```shell
cd server
export PKG_CONFIG_PATH=/usr/local/opt/opencv@2/lib/pkgconfig
yarn install
```
