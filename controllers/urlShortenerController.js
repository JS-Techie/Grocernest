const db = require('../models');
const { sequelize } = require("../models");

const Url = db.UrlModel;

const getOriginalUrl = async (req, res, next) => {

    let id = req.params.id.toString()

    const current_url = await Url.findOne({
        where: { id: id }
    })

    if (current_url == null) {
        return res.send("<center><h3>This url does not exist..</h3></center>",);
    }
    return res.redirect(current_url.original_url);
}


module.exports = {
    getOriginalUrl
}