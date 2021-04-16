const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config()
const port = process.env.PORT || 5000

const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m8cui.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");

  app.post('/addService', (req, res)=>{
    const file = req.files.file;
    const title = req.body.title;
    const description= req.body.description;
    const price= req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    console.log(title);

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    servicesCollection.insertOne({ title, description, price, image })
    .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)
    })
  })

  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const review = req.body.review;
    const address = req.body.address;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    // console.log(title);

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    reviewsCollection.insertOne({ name, review, address, image })
      .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })


  app.get('/services', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.get('/reviews', (req, res) => {
    reviewsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

});


app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
