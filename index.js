const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()
const port = 3003

const app = express()
app.use(bodyParser.json())
app.use(cors())

const { DB_USER, DB_PASS, DB_NAME } = process.env


const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.n7v5l.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const packagesCollection = client.db("internetService").collection("packages");
    const ordersCollection = client.db("internetService").collection("order");
    const reviewsCollection = client.db("internetService").collection("reviews");
    const adminsCollection = client.db("internetService").collection("admins");

    app.post('/addPackage', (req, res) => {
        const newPackage = req.body
        packagesCollection.insertOne(newPackage)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body
        ordersCollection.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/orders', (req, res) => {
        const userEmail = req.query.email
        ordersCollection.find({ email: userEmail })
            .toArray((error, document) => {
                res.send(document)
            })
    })
    app.get('/ordersList', (req, res) => {
        ordersCollection.find({})
            .toArray((error, document) => {
                res.send(document)
            })
    })

    app.get('/packages', (req, res) => {
        packagesCollection.find({})
            .toArray((error, documents) => {
                res.send(documents)
            })
    });

    app.get('/book/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        packagesCollection.find({ _id: id })
            .toArray((error, document) => {
                res.send(document[0]);
            })
    });

    app.get('/review', (req, res) => {
        reviewsCollection.find({})
            .toArray((error, document) => {
                res.send(document);
            })
    });

    app.post('/addReview', (req, res) => {
        const newReview = req.body
        reviewsCollection.insertOne(newReview)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body
        adminsCollection.insertOne(newAdmin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });
    app.get('/admin', (req, res) => {
        const userEmail = req.query.email
        adminsCollection.find({ email: userEmail })
            .toArray((error, document) => {
                res.send(document[0])
            })
    });

    // app.get('/managePackage', (req, res) => {
    //     const userEmail = req.query.email
    //     packagesCollection.find({ email: userEmail })
    //         .toArray((error, document) => {
    //             res.send(document)
    //         })
    // })


    // app.patch('/updated/:id', (req, res) => {
    //     const id = ObjectID(req.params.id)
    //     ordersCollection.updateOne({ _id: id }, {
    //             $set: { status: req.body.status }
    //         })
    //         .then((error, result) => {
    //             res.send(result.matchedCount > 0);
    //         })
    // });
    app.patch('/update-order-status', (req, res) => {
        const { id, status } = req.body;
        ordersCollection.findOneAndUpdate(
            { _id: ObjectID(id) },
            {
                $set: { status },
            }
        ).then(result => res.send(result.lastErrorObject.updatedExisting))
    })

    app.delete('/deleted/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        packagesCollection.deleteOne({ _id: id })
            .then(result => res.send(result.deletedCount > 0))
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)