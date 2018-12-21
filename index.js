const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
var ObjectId = require('objectid');
const PORT = process.env.PORT || 5000;

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

app.get('/', (req, res) => res.render('test'));

// Mongo URI
const mongoURI = 'mongodb://trade:a00000@ds049486.mlab.com:49486/mongodbuploads';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});
// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = path.parse(file.originalname).name;
        //console.log(filename);
         const fileInfo = {
          filename: filename,
		      "metadata":{
			      "filename":filename,
			      "feature": "",
            "type": "",
            "hero": "",
            "rarity":"",
			      "detail": "",
			      "price" : "",
			      "owner" : ""
		    },
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });