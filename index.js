const express = require('express');
const { MongoClient } = require('mongodb');
const objectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yt3ul.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.opn5k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("Yooda_Hostel");
        const allFood = database.collection("All_Food");
        const allStudent = database.collection("All_Student");
        const servingFood = database.collection("Serving_Food");

        //ALL GET ROUTE

        app.get('/', async (req, res) => {
            res.send("Yooda Hostel Server is Running");
        })

        app.get('/all-foods', async (req, res) => {
            const { currentPage } = req.query;
            const { size } = req.query;
            const { foodId } = req.query;
            if (currentPage && size) {
                const result = await allFood.find({}).skip(currentPage * size).limit(parseInt(size)).toArray();
                const count = await allFood.find({}).count();
                res.status(200).json({
                    allFoods: result,
                    count,
                });
            }
            else if (foodId) {
                const result = await allFood.findOne({ _id: objectId(foodId) });
                res.status(200).json(result);
            }
            else if (currentPage !== true && size !== true && foodId !== true) {
                const result = await allFood.find({}).toArray();
                res.send(result);
            }
        })

        app.get('/all-students', async (req, res) => {
            const { currentPage } = req.query;
            const { size } = req.query;
            const result = await allStudent.find({}).skip(currentPage * size).limit(parseInt(size)).toArray();
            const count = await allStudent.find({}).count();
            res.status(200).json({
                allFoods: result,
                count,
            });
        })

        app.get('/single-student', async function (req, res) {
            const { studentRoll } = req.query;
            const { studentId } = req.query;
            if (studentRoll) {
                const result = await allStudent.findOne({ roll: studentRoll });
                res.status(200).json(result);
            }
            else if (studentId) {
                const result = await allStudent.findOne({ _id: objectId(studentId) });
                res.status(200).json(result);
            }
        })

        app.get('/serving-food', async (req, res) => {
            const { roll } = req.query;
            const { date } = req.query;
            const { shift } = req.query;

            const result = await servingFood.findOne(
                {
                    $and: [
                        {
                            roll,
                        },
                        {
                            date,
                        },
                        {
                            shift,
                        }
                    ]
                }
            )
            res.status(200).json(result);
        })


        //ALL POST ROUTE
        app.post('/add-food', async (req, res) => {
            const result = await allFood.insertOne(req.body);
            res.status(201).json(result);

        })
        app.post('/add-student', async (req, res) => {
            const result = await allStudent.insertOne(req.body);
            res.status(201).json(result);
        })

        app.post('/add-serving-food', async (req, res) => {
            const result = await servingFood.insertOne(req.body);
            res.status(201).json(result);
        })

        //ALL UPDATE API
        app.patch('/update-student-status', async (req, res) => {
            let { studentsId } = req.query;
            studentsId = studentsId.split(',');
            let result;
            for (let id of studentsId) {
                result = await allStudent.updateOne(
                    {
                        _id: objectId(id)
                    },
                    {
                        $set: {
                            studentStatus: req.body.status,
                        }
                    }
                )
            }
            res.send(result);
        })

        app.patch('/update-food-info', async (req, res) => {
            const { foodId } = req.query;
            const result = await allFood.updateOne(
                {
                    _id: objectId(foodId)
                },
                {
                    $set: {
                        ...req.body,
                    }
                }
            )

            res.status(200).json(result);
        })

        app.patch('/update-student-info', async (req, res) => {
            const { studentId } = req.query;
            const result = await allStudent.updateOne(
                {
                    _id: objectId(studentId),
                },
                {
                    $set: {
                        ...req.body,
                    }
                }
            )
            res.status(200).json(result);
        })

        // ALL DELETE API
        app.delete('/delete-single-food', async (req, res) => {
            const { foodId } = req.query;
            const result = await allFood.deleteOne({ _id: objectId(foodId) });
            res.status(200).json(result);
        })

        app.delete('/delete-single-student', async (req, res) => {
            const { studentId } = req.query;
            const result = await allStudent.deleteOne({ _id: objectId(studentId) });
            res.status(200).json(result);
        })
    }
    catch (error) {
        console.error(error.message);
    }
    finally {
        //await client.close();       
    }
}

run();

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running at ${port}`);
})