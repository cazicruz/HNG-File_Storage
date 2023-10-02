require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer')
const ejs = require('ejs');
const db = require('./config/connectDB');
const mongoose = require('mongoose');
const session = require('express-session');
const morgan = require("morgan");
const {multerConfig} = require('./config/multerConf');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // Import the Swagger configuration


const upload = multer({storage: multerConfig});
const port=process.env.PORT || 3000;
db();
const app = express();


app.set('view engine', 'ejs');

app.use('/public',express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use morgan middleware for logging HTTP requests
app.use(morgan("dev"));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use(session({
//     secret: 'this is private',
//     resave: false,
//     saveUninitialized: true,
//     // configure other session options as needed
//   }));

// Create a post route to collect and store videos in disk
const videoRouter = require('./routes/saveVideo');
// mounting the upload middleware
app.use('/api', upload.single('newFile') , videoRouter); // file upload route

// route to save video in chunks
const chunkRouter = require('./routes/saveChunk');
app.use('/api', chunkRouter);


// start rendering templates with ejs and showing details of all videos
app.get('/videos', async (req, res) => {
    const Videos = mongoose.model('Videos');
    const videos = await Videos.find({});
    res.render('videos', {videos:videos});
});

app.get('/video/:id', async (req, res) => {
    const Videos = mongoose.model('Videos');
    const video = await Videos.findById(req.params.id);
    res.render('singleVideo', {video:video});
})

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

app.use('/*', function (req, res) {
    res.sendStatus(404)
})

mongoose.connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
    app.listen(port, () => {console.log(`Server is running on port ${port}`)});
})