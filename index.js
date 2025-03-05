const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware 
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bkijc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const campaignCollection = client.db("campaignDB").collection("campaigns");

        const donationCollection = client.db("campaignDB").collection("donations");

        app.post("/campaigns", async(req, res) => {
            const newCampaign = req.body;
            const result = await campaignCollection.insertOne(newCampaign);
            res.send(result);
        })

        app.get("/campaigns", async(req, res) => {
            const cursor = campaignCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await campaignCollection.findOne(query);
            res.send(result);
        })

        app.put('/campaign/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = {upsert: true};
            const updatedCampaign = req.body;
            const campaign = {
                $set: {
                    image: updatedCampaign.image,
                    title: updatedCampaign.title,
                    type: updatedCampaign.type,
                    description: updatedCampaign.description,
                    amount: updatedCampaign.amount,
                    deadline: updatedCampaign.deadline,
                    email: updatedCampaign.email,
                    name: updatedCampaign.name,
                }
            }
            const result = await campaignCollection.updateOne(filter, campaign, options);
            res.send(result);
        })

        app.delete('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await campaignCollection.deleteOne(query);
            res.send(result);
        })

        // app.get('myCampaign/:email', async(req, res) => {
        //     const email = req.params.email;
        //     const query = {email: email};
        //     const cursor = campaignCollection.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        app.post("/donations", async(req, res) => {
            const newDonation = req.body;
            const result = await donationCollection.insertOne(newDonation);
            res.send(result);
        })

        app.get("/donations/:email", async(req, res) => {
            const email = req.params.email;
            const query = {donorEmail: email};
            const cursor = donationCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Hello World");
})

app.listen(port, () => {
    console.log(`App is listening on port - ${port}`);
})