# libreview-puppeteer-scraper

## Prerequisites and setup

* Install nodejs. And make sure that then environment variables "node" and "npm" are in you path variable
 https://nodejs.org/en/

* create a text document ".env" in the project (in windows you can do this running ``cd . > .env``, on linux ``touch .env``). In this file you shoud add the following contents
```
EMAIL=email@example
PASSWORD=your-pass-here
```
change the fields to match your libreview credentials

* run on the project folder
```
npm install
```

* To start the scraper run on the project folder
```
npm start
```

The results will be saved inside the "data" folder of the project.