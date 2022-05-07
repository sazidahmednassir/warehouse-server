const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
var cors = require('cors')
const jwt = require('jsonwebtoken');


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

    //login
    app.post("/login", (req, res) => {
      const email = req.body;
      console.log(email);

      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
      console.log(token)
      res.send({ token })
  })

    //firstsixmobile data  & all mobile data
    app.get("/mobile", async (req, res) => {
      const  limit=Number(req.query.limit);
    //  console.log(limit)

      const cursor = mobileCollection.find( );

      const result = await cursor.limit(limit).toArray();

      res.send(result);


    });

    //get one data details
    app.get('/mobile/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const service = await mobileCollection.findOne(query);
      res.send(service);
  });

    //post mobile data
    app.post("/createmobile", async(req, res)=>{
      const data=req.body;
      console.log(data)
      const tokenInfo = req.headers.authorization;
      console.log(tokenInfo)
       const [email, accessToken] = tokenInfo.split(" ")

       const decoded = verifyToken(accessToken)

       if (email === decoded.email) {
        const result = await mobileCollection.insertOne(data);
           res.send ({ success: 'Product Upload Successfully' })
       }
       else {
           res.send({ success: 'UnAuthoraized Access' })
       }
    
    })

    //get mobile data using jwt
    app.get("/myitem", async (req, res) => {
      const tokenInfo = req.headers.authorization;

            console.log(tokenInfo)
            const [email, accessToken] = tokenInfo.split(" ")
            // console.log(email, accessToken)

            const decoded = verifyToken(accessToken)
            if (email === decoded.email) {
              const items = await mobileCollection.find({email:email}).toArray();
              res.send(items);
          }
          else {
              res.send({ success: 'UnAuthoraized Access' })
          }
    })

  //update mobile data
  app.put("/mobile/:id", async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };

    const updateDoc = {
      $set: {
        // name: data.name,
        // des: data.des,
        // price: data.price,
        // supplierName: data.supplierName,
        // image: data.image,
        quantity: data.quantity,


      },
    };

    const result = await mobileCollection.updateOne(
      filter,
      updateDoc,
      options
    );
    res.send(result);

  })

  //delete mobile data
  app.delete("/mobile/:id", async (req, res) => {
    const id = req.params.id;
      const filter = { _id: ObjectId(id) };

      const result = await mobileCollection.deleteOne(filter);

      res.send(result);
  })


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

  // verify token function
function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
          email = 'Invalid email'
      }
      if (decoded) {
          console.log(decoded)
          email = decoded
      }
  });
  return email;
}