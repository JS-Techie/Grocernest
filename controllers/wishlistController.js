const db = require("../models");
const uniqid = require("uniqid");

const Wishlist = db.WishlistModel;
const WishlistItems = db.WishlistItemsModel;
const Customer = db.CustomerModel;

const getAllWishlists = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  try {
    //get all wishlists for that customer
    const wishlists = await Wishlist.findAll({
      where: {
        cust_no: currentUser,
      },
      include: WishlistItems,
    });

    return res.status(200).send({
      success: true,
      data: wishlists,
      message: "Found wishlists",
    });
  } catch (error) {
    return res.status(404).send({
      success: false,
      data: error.message,
      message: "Could not find wishlists for requested user",
    });
  }
};

const createWishlist = async (req, res, next) => {
  //Get wishlist name
  const wishlistName = req.body.wishlistName;

  //Get currentUser from JWT
  const currentUser = req.cust_no;

  const currentCustomer = await Customer.findOne({
    where: { cust_no: currentUser },
  });

  try {
    //Find if wishlist with that same name already exists
    const existingWishlist = await Wishlist.findOne({
      where: {
        wishlist_name: wishlistName,
        cust_no: currentUser,
      },
    });

    //If there is an existing wishlist, ask user to make a wishlist with a different name
    if (existingWishlist) {
      return res.status(400).send({
        success: false,
        data: existingWishlist,
        message:
          "Wishlist already exists, please name your wishlist differently",
      });
    }

    //If wishlist does not exist, make a new wishlist
    const newWishlist = {
      cust_no: currentUser, //currentUser
      wishlist_id: uniqid(),
      wishlist_name: wishlistName,
      created_at: Date.now(),
      updated_at: Date.now(),
      created_by: 6, //currentUser
      updated_by: 6, //currentUser
    };

    //Save wishlist to DB
    const result = await Wishlist.create(newWishlist);

    //Send success message
    return res.status(200).send({
      success: true,
      data: result,
      message: "New wishlist successfully created",
    });

    //If there is any error, send error message
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error,
      message: "wishlist could not be created",
    });
  }
};

const addItemToWishlist = async (req, res, next) => {
  //Get currentUser from JWT
  //const currentUser = req.cust_no

  //Get wishlist id and item id from params
  const wishlistToWhichItemIsToBeAdded = req.params.wishlistId;
  const itemToBeAddedToSelectedWishlist = req.params.itemId;

  try {
    // check if item already is in wishlist
    const itemAlreadyInWishlist = await WishlistItems.findAll({
      where: {
        item_id: itemToBeAddedToSelectedWishlist,
        wishlist_id: wishlistToWhichItemIsToBeAdded,
        //cust_no : currentUser
      },
    });

    //if item is already in wishlist, just increase the quantity

    //////// NEEDS TESTING //////////

    if (itemAlreadyInWishlist) {
      const res = WishlistItems.update(
        {
          quantity: itemAlreadyInWishlist[0].dataValues.quantity + 1,
        },
        {
          where: {
            item_id: itemToBeAddedToSelectedWishlist,
            wishlist_id: wishlistToWhichItemIsToBeAdded,
          },
        }
      );
      console.log(res);
      return res.status(200).send({
        success: true,
        data: res,
        message: "Increased quantity of item in wishlist",
      });
    }

    //if item is not in wishlist, add it to wishlist
    const result = await WishlistItems.create({
      wishlist_id: wishlistToWhichItemIsToBeAdded,
      item_id: itemToBeAddedToSelectedWishlist,
      quantity: 1,
      created_by: 3,
      updated_by: 3,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    console.log(result);

    return res.status(200).send({
      success: true,
      data: result,
      message: "Item added successfully",
    });
    //Catch any errors
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Could not add item to wishlist",
    });
  }
};

const getWishlistById = async (req, res, next) => {
  //Get currentUser from JWT
  const currentUser = req.cust_no;

  const currentCustomer = await Customer.findOne({
    where: { cust_no: currentUser },
  });

  console.log(currentCustomer);

  //fetch all the items in the wishlist
  try {
    const wishlist = await Wishlist.findAll({
      include: [{ model: WishlistItems }],
      where: {
        wishlist_id: req.params.wishlistId,
        cust_no: currentUser,
      },
    });

    return res.status(200).send({
      success: true,
      data: wishlist,
      message: "Found requested wishlist",
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Could not fetch requested wishlist",
    });
  }
};

const deleteWishlist = async (req, res, next) => {
  //Get currentUser from JWT
  //const currentUser = req.cust_no

  //Get wishlist id from params
  const wishlistId = req.params.wishlistId;

  try {
    const rowsDeletedFromWishlistTable = Wishlist.destroy({
      where: {
        wishlist_id: wishlistId,
        //cust_no : currentUser
      },
    });
    const rowsDeletedFromWishlistItemsTable = WishlistItems.destroy({
      where: { wishlist_id: wishlistId },
    });

    return res.status(200).send({
      success: true,
      data: {
        rowsDeletedFromWishlistTable,
        rowsDeletedFromWishlistItemsTable,
      },
      message: "Deleted requested wishlist",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Could not find requested wishlist",
    });
  }
};

module.exports = {
  createWishlist,
  addItemToWishlist,
  getWishlistById,
  deleteWishlist,
  getAllWishlists,
};
