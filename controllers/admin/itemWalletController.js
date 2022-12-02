const db = require("../../models");

const Customer = db.CustomerModel;
const ItemWallet = db.ItemSpecificWalletModel;
const Item = db.ItemModel;

const getAllItemWallet = async (req, res, next) => {
  try {
    const wallets = await ItemWallet.findAll({});

    if (wallets.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no item specific wallets defined right now",
      });
    }

    return res.status(200).send({
      success: true,
      data: wallets,
      message: "Found all item specific wallet strategies",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const getItemWalletById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const wallet = await ItemWallet.findOne({ where: { id } });

    if (!wallet) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested wallet strategy not found",
      });
    }

    return res.status(200).send({
      success: true,
      data: wallet,
      message: "Found requested wallet strategy details successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const createItemWallet = async (req, res, next) => {
  const { item_id, cashback, is_percent, use,desc } = req.body;
  try {
    if (!item_id || !cashback || !use) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter all required details",
      });
    }

    // const currentItem = await Item.findOne({
    //   where: { id: item_id, available_for_ecomm: 1 },
    // });

    // if(!currentItem){
    //     return res.status(404).send({
    //         success : false,
    //         data : [],
    //         message : "This item is not available for ecommerce, hence wallet for this cannot be created"
    //     })
    // }

    const existing = await ItemWallet.findOne({ where: { item_id } });
    if (existing) {
      return res.status(400).send({
        success: false,
        data: existing,
        message:
          "This item already has an existing wallet, please choose a different item",
      });
    }
    const newWallet = await ItemWallet.create({
      item_id,
      cashback,
      is_percent,
      use,
      is_active: 1,
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: newWallet,
      message: "Succesfully created new wallet for requested item",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const editWallet = async (req, res, next) => {
  const { id } = req.params;
  const { item_id, cashback, is_percent, use } = req.body;
  try {
    const currentWallet = await ItemWallet.findOne({ where: { id } });

    if (!currentWallet) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested wallet does not exist",
      });
    }

    const existingWallet = await ItemWallet.findOne({ where: { item_id } });

    if (existingWallet) {
      return res.status(400).send({
        success: false,
        data: existingWallet,
        message:
          "This item already has an existing wallet, please choose a different item",
      });
    }

    const updated = await ItemWallet.update(
      {
        item_id,
        cashback,
        is_percent,
        use,
      },
      {
        where: { id },
      }
    );

    const newWallet = await ItemWallet.findOne({ where: { id } });

    return res.status(200).send({
      success: true,
      data: newWallet,
      message: "Succesfully updated wallet for requested item",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const activateWallet = async (req, res, next) => {
  const { id } = req.params;
  try {
    const currentWallet = await ItemWallet.findOne({ where: { id } });

    if (!currentWallet) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested wallet does not exist",
      });
    }
    const updated = await ItemWallet.update(
      {
        is_active: 1,
      },
      {
        where: { id },
      }
    );

    const newWallet = await ItemWallet.findOne({ where: { id } });
    return res.status(200).send({
      success: true,
      data: newWallet,
      message: "Succesfully activated wallet for requested item",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const deactivateWallet = async (req, res, next) => {
  const { id } = req.params;
  try {
    const currentWallet = await ItemWallet.findOne({ where: { id } });

    if (!currentWallet) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested wallet does not exist",
      });
    }
    const updated = await ItemWallet.update(
      {
        is_active: null,
      },
      {
        where: { id },
      }
    );

    const newWallet = await ItemWallet.findOne({ where: { id } });
    return res.status(200).send({
      success: true,
      data: newWallet,
      message: "Succesfully deactivated wallet for requested item",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

module.exports = {
  createItemWallet,
  activateWallet,
  editWallet,
  deactivateWallet,
  getAllItemWallet,
  getItemWalletById,
};
