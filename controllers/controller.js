const model = require('../models/model')

const fetchAndInsertData = async (req, res, next) => {
    try {
        const fetchDataFromFile = await model.fetchData();
        res.send(fetchDataFromFile)
    } catch (error) {
        res.status(401).send(error);
    }
}

const findData = async (req, res, next) => {
    try {
        const findDataFromDatabase = await model.getData(req.body);
        res.send(findDataFromDatabase)
    } catch (error) {
        res.status(401).send(error);
    }
}

module.exports = {
    fetchAndInsertData,
    findData
}