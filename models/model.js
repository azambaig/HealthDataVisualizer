var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var xlsx = require('node-xlsx').default;
var fs = require('file-system');

let connection = mongoose.connect('mongodb://localhost:27017/HealthDataVisualizer', { useNewUrlParser: true });

mongoose.connection.once('open', () => {
});


const dataSchema = new Schema({
    Name: String,
    State: String,
    "FIPS Codes": String,
    County: String,
    Year: [{
        year: Number,
        number: Number,
        percent: Number,
        "lower confidence limit": Number,
        "upper confidence limit": Number,
        "age-adjusted percent": Number,
        "age-adjusted lower confidence limit": Number,
        "age-adjusted upper confidence limit": Number
    }]
});

var dataModel = mongoose.model('dataModel', dataSchema);

const fetchData = async () => {
    try {


        let allData = [];
        const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(`${__dirname}/allStateFile.xlsx`));
        let filtered = [];
        const fetchData = workSheetsFromBuffer[0].data;

        for (let i = 0; i < fetchData.length; i++) {
            if (i == 0) {
                filtered = fetchData[i].filter(function (a) {
                    return a != null;
                })
            }
            else if (i > 1) {
                let j = 0;
                let k = 0;
                let l = 0;
                let body = {};
                body.Year = [{}];

                body.Name = filtered[k++];
                body.State = fetchData[i][j++]
                console.log(body.State);

                body["FIPS Codes"] = fetchData[i][j++]
                body.County = fetchData[i][j++]
                body.Year = new Array();

                while (j < fetchData[i].length) {
                    body.Year.push(new Object());
                    body.Year[l].year = filtered[k++]
                    body.Year[l].number = fetchData[i][j++];
                    body.Year[l].percent = fetchData[i][j++];
                    body.Year[l]["lower confidence limit"] = fetchData[i][j++];
                    body.Year[l]["upper confidence limit"] = fetchData[i][j++];
                    body.Year[l]["age-adjusted percent"] = fetchData[i][j++];
                    body.Year[l]["age-adjusted lower confidence limit"] = fetchData[i][j++];
                    body.Year[l]["age-adjusted upper confidence limit"] = fetchData[i][j++];
                    ++l;
                }
                let insertData = await dataModel.collection.insertOne(body);
                if (insertData) {
                    allData.push(insertData.ops)
                } else {
                    return 'Data Not inserted';
                }
            }
        }
        return allData;
    } catch (error) {
        return error;
    }
}

const getData = async (body) => {
    try {
        const getDataFromDatabase = await dataModel.aggregate([{
            $match: {
                "Name": body.Name,
                "State": body.State,
                "County": body.County,
                "Year.year": body.Year
            }
        },
        { $unwind: "$Year" },
        {
            $match: {
                "Year.year": body.Year
            }
        }
        ])
        if (getDataFromDatabase) {
            return getDataFromDatabase
        } else {
            throw `No Data found`
        }
    } catch (error) {
        return error;
    }
}

module.exports = {
    fetchData,
    getData
}
