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
var cookies = require('cookie-parser');
var session = require('express-session');
var cors = require('cors');
const PORT = process.env.PORT || 5000;

var app = express();

// Middleware
app.use(session({secret: "Shh, its a secret!"}));
app.use(cookies());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser());
app.use(methodOverride('_method'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

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

app.post('/register_data', (req, res) =>
  {
            data={
                username:req.body.username,
                password:req.body.password,
                confrimpassword:req.body.confrimpassword,
                email:req.body.email

            };
            //console.log(data); //-------------------------แปลงข้อมูลจาก String เป็น JSON
            //console.log(data.bodyParser);
            conn.collection("user").insertOne(data, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              conn.close();
            });
            res.redirect('/login');
    })

//@ index page
app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', {files: false});
    }else{
      files.map(file =>{
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
          file.isImage = true;
        }else{
          file.isImage = false;
        }
      });
      //console.log(oid);
      res.render('index', {files: files});
    }
  });
});

// @route GET /image/:filename
// @desc Display Image
app.get('/image/:id', (req, res) => {
  gfs.files.findOne({_id:ObjectId(req.params.id) }, (err, file) => {
    if (err) throw err
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      const readstream = gfs.createReadStream(file._id);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route GET /
// @desc Loads form
//Cart page
app.get('/cart', function(req, res){

  var data2cart = req.session.cart_ID;
  var name2name = req.session.cart_Name;
  var price2price = req.session.cart_Price;
  var money2money = req.session.money;
  console.log(data2cart);
  console.log(name2name);
  console.log(price2price);
  console.log(money2money);
  money = {money:money2money};
  res.render('cart', {data2cart:data2cart, name2name:name2name, price2price:price2price, money:money});
})

app.get('/index', function(req, res){
  res.render('CMlogin');
})


//product-details
app.get('/product', (req, res) => {
  res.render('product-details');
});

//Shop page 
app.get('/shop', function(req, res){
  res.render('shop');
});

//@Route add product
app.get('/add-product', function(req, res){
  status ={status: false};
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('add-product', {files: false});
    }else{
      files.map(file =>{
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
          file.isImage = true;
        }else{
          file.isImage = false;
        }
      });
      res.render('add-product', {files: files, status:status});
    }
  });
});

//@Route trade
app.get('/trade', function(req, res){
  res.render('trade');
});

app.get('/product/:id', (req, res) => {
  data = {id:ObjectId(req.params.id)};
  console.log(data);
  res.render('product-details',{data:data});
});


// @route GET /files
// @desc  Display all files in JSON
app.get('/files', (req, res) => {
gfs.files.find().toArray((err, files) => {
  // Check if files
  if (!files || files.length === 0) {
    return res.status(404).json({
      err: 'No files exist'
    });
  }
  // Files exist
  return res.json(files);
});
});

//product-details
app.get('/product-detail/:id', (req, res) => {
gfs.files.findOne({_id:ObjectId(req.params.id) }, (err, file) => {
  if (err) throw err
  // Check if file
  if (!file || file.length === 0) {
    return res.status(404).json({
      err: 'No file exists'
    });
  }
  // Check if image
  if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
    res.render('product-details', {file:file});
  } else {
    res.status(404).json({
      err: 'Not an image'
    });
  }
}); 
});
// @route GET /image/:filename
// @desc Display Image
app.get('/image/:id', (req, res) => {
gfs.files.findOne({_id:ObjectId(req.params.id) }, (err, file) => {
  if (err) throw err
  // Check if file
  if (!file || file.length === 0) {
    return res.status(404).json({
      err: 'No file exists'
    });
  }
  // Check if image
  if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
    const readstream = gfs.createReadStream(file._id);
    readstream.pipe(res);
  } else {
    res.status(404).json({
      err: 'Not an image'
    });
  }
});
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
  if (err) {
    return res.status(404).json({ err: err });
  }
  res.redirect('/');
});
});

app.post('/add-inventory', upload.single('file'),function(req, res){
//res.redirect(res.json({file:req.file.id}));
data={
  file:req.file.id,
  hero_str:req.body.hero_str,
  hero_agi:req.body.hero_agi,
  hero_int:req.body.hero_int,
  item_type:req.body.item_type,
  rarity:req.body.rarity,
  feature:req.body.feature,
  price:req.body.price,
  detail:req.body.detail
  
};

if(data.hero_str !== '0'){
  console.log('not');
  status ={status: true};
  res.render('add-product', {status:status});
}else{
  hero = data.hero_str;
}

console.log(data);
gfsId = ObjectId(data.file);
gfs.files.update(
  { _id: gfsId },
  { $set: {
    'metadata.feature': data.feature,
    'metadata.type': data.item_type,
    'metadata.hero': data.hero_str,
    'metadata.rarity': data.rarity,
    'metadata.detail': data.detail,
    'metadata.price': data.price,
  } }
)
//console.log(data.price); 
res.redirect('add-product');
});

//Add item from cart
var cartID = [];
var cartName = [];
var cartPrice = [];
var total = 0;
app.post('/product-detail/addCart/:id', function(req, res){

gfs.files.findOne({_id:ObjectId(req.params.id) }, (err, file) => {
  if(err) throw err;
      if(req.session.cart_Name || req.session.cart_Price){
        new_name = {name:file.filename};
        new_price = {price:file.metadata.price};
        cartName.push(new_name);
        cartPrice.push(new_price);
        req.session.cart_Name =  cartName;
        req.session.cart_Price =  cartPrice;
        new_id = {id: req.params.id };
        cartID.push(new_id);
        req.session.cart_ID =  cartID;
        total = total + parseFloat(new_price.price);
        req.session.money = total;
      }else{
        new_name = {name:file.filename};
        new_price = {price:file.metadata.price};
        cartName.push(new_name);
        cartPrice.push(new_price);
        req.session.cart_Name =  cartName;
        req.session.cart_Price =  cartPrice;
        new_id = {id: req.params.id};
        cartID.push(new_id);
        req.session.cart_ID = cartID;
        total = total + parseFloat(new_price.price);
        req.session.money = total;
      }
      var data2cart = req.session.cart_ID;
      var name2name = req.session.cart_Name;
      var price2price = req.session.cart_Price;
      var money2money = req.session.money;
      console.log(data2cart);
      console.log(name2name);
      console.log(price2price);
      console.log(money2money);
      money = {money:money2money};
      res.render('cart', {data2cart:data2cart, name2name:name2name, price2price:price2price, money:money});
  });
});
//Send file to CART
app.get('/product-detail/addCart/:id', function(req, res){
gfs.files.find().toArray((err, files) => {
  // Check if files
  if (!files || files.length === 0) {
    res.render('cart', {files: false});
  }else{
    files.map(file =>{
      if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
        file.isImage = true;
      }else{
        file.isImage = false;
      }
    });
    res.render('cart', {files: files});
  }
});
})

// @route GET /image/:filename
// @desc Display Image
app.get('/product-detail/addCart/image/:id', (req, res) => {
gfs.files.findOne({_id:ObjectId(req.params.id) }, (err, file) => {
  if (err) throw err
  // Check if file
  if (!file || file.length === 0) {
    return res.status(404).json({
      err: 'No file exists'
    });
  }
  // Check if image
  if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
    const readstream = gfs.createReadStream(file._id, file.filename);
    readstream.pipe(res);
  } else {
    res.status(404).json({
      err: 'Not an image'
    });
  }
});
});

app.get('/login', function(req, res){
  res.render('login');
})
app.post('/login_data', function(req, res){
  console.log("username: "+req.body.username);
  console.log("password: "+req.body.password);

      conn.collection('user').findOne({ username:req.body.username},
      function(err, user){
          if(user == null){
              res.end("User Invalid");
          }else if(user.username === req.body.username && 
              user.password === req.body.password)
              {
                  res.redirect('/');
          }else{
              console.log("Credentials wrong");
              res.end("User incorrect");
          }
      });
});

app.get('/register', function(req, res){
  res.render('register');

});

const port = 8000;

app.listen(port, ()=>console.log('Sever 8000'));