const db = require('../../models');
const { sequelize } = require("../../models");
const uniqid = require("uniqid");
const Url = db.UrlModel;

const getShortUrl = async (original_url) => {

    let id = req.params.id.toString()

    const available_map = await Url.findOne({
        where: { original_url }
    })

    if (available_map !== null) {
        return available_map.id;
    }

    let url_id = uniqid();
    const new_link = await Url.create({
        id: url_id,
        original_url: original_url,
        created_by: 2
    })
    return url_id;
}


module.exports = {
    getShortUrl
}