const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
var cors = require('cors')


app.use(cors())
app.use(express.json())



const port = process.env.PORT || 5000;




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2yyiw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.log('hi')
//   // perform actions on the collection object
//   client.close();
// });

async function run(){
  try{
    await client.connect();
    const mobileCollection = client.db("smartphoneinventory").collection("mobile");

    //firstsixmobile data  
    app.get("/firstmobile", async (req, res) => {
      const q = req.query;
     

      const cursor = mobileCollection.find( q);

      const result = await cursor.toArray();

      res.send(result);


    });

    console.log("db")
  }
  finally{

  }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is running')
  })


  app.listen(port, () => {
    console.log(`app listening on port ${port}`)
  })