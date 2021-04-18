const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const ObjectId = require("mongodb").ObjectID;
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
  const bookingsCollection = client.db(`${process.env.DB_NAME}`).collection("bookings");
  const adminsCollection = client.db(`${process.env.DB_NAME}`).collection("admins");


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

  app.delete("/deleteService/:id", (req, res) => {
    servicesCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        // console.log(result.deletedCount)
        res.send(result.deletedCount > 0);

      })
  })

  app.get('/service/:serviceId', (req, res) => {
    servicesCollection.find({ _id: ObjectId(req.params.serviceId) })
      .toArray((err, services) => {
        res.send(services[0])
      })
  })

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookingsCollection.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/bookings', (req, res) => {
    bookingsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.patch('/updateBooking', (req, res) => {
    // console.log(req.body);
    bookingsCollection.updateOne({ _id: ObjectId(req.body.bookingId) },
      {
        $set: { status: req.body.status }
      })
      .then(result => {
        // console.log(result);
        res.send(result.modifiedCount > 0);
      })
  })

  app.post('/addAdmin', (req, res) => {
    const newAdmin = req.body;
    adminsCollection.insertOne(newAdmin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

});


app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
