const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config()

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload());

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fi07c.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointment");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");

  app.post('/addAppointment', (req,res) => {
      const appointment = req.body;
      console.log(appointment);
      appointmentCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  app.post('/AppointmentByDate', (req,res) => {
    const date = req.body;
    appointmentCollection.find({date: date.date})
    .toArray((err, documents) => {
        res.send(documents);
    })
  });

  app.get('/Appointments', (req,res) => {
    appointmentCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
  });


  app.post('/addDoctor', (req,res) => {
    const file = req.files.file;
    const name = req.body;
    const email = req.body;
    console.log(name, email, file);

    file.mv(`${__dirname}/doctors/${file.name}`, err => {
      if(err){
        console.log(err);
        return res.status(500).send({msg: 'failed to upload image'})
      }
      return res.send({name: file.name, path: `/${file.name}`}) 
    })

    const newImg = file.data;
    console.log(newImg);
    const encImg = newImg.toString('base64');
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    doctorCollection.insertOne({ name, email})
    .then(result => {
        res.send(result.insertedCount > 0);
    })


  });



});





app.get('/',(req,res) => {
    res.send('Hello world');
})

app.listen( process.env.PORT || 5000);