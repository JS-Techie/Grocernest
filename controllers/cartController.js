const { sequelize } = require("../models");
const db = require("../models");

const Cart = db.CartModel;
const Item = db.ItemModel;

const saveCart = async (req, res, next) => {
  //Get current user from JWT
  //const currentUser = req.cust_no
  //Already saving to DB in adding items and removing from DB based on certain conditions in remove route
};
const addItemToCart = async (req, res, next) => {
  //Get current user from JWT
  //const currentUser = req.cust_no

  //get item-id from params
  const itemId = req.params.itemId;

  //get quantity from params
  const quantity = req.params.quantity;

  try {
    const itemAlreadyExists = await Cart.findOne({
      where: {
        item_id: itemId,
      },
    });

    if (!itemAlreadyExists) {
      try {
        const newItem = await Cart.create({
          //cust_id : currentUser,
          item_id: itemId,
          quantity: quantity,
        });
        return res.status(200).send({
          success: true,
          data: newItem,
          message: "Successfully added new item to cart",
        });
      } catch (error) {
        return res.status(400).send({
          success: false,
          data: error,
          message: "Could not add item to the cart",
        });
      }
    }

    //If the item already exists just increase the quantity
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error occured while adding item to the cart",
    });
  }
};
const removeItemFromCart = async (req, res, next) => {
  //Get current user from JWT
  //const currentUser = req.cust_no

  //Get item-id from params
  const itemId = req.params.itemId;

  //Get quantity from params
  const quantity = req.params.quantity;

  try {
    //Find if the item exists in the cart
    const itemExists = await Cart.findOne({
      where: {
        //cust_no = currentUser,
        item_id: itemId,
      },
    });

    if (!itemExists) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Requested item not found in cart",
      });
    }

    //Subtract quantity in params from current quantity
    //if difference <=0 remove it from cart table
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Some error occured while removing the requested item from cart",
    });
  }
};

const getCart = async (req, res, next) => {
  //Get currentUser from JWT
  const currentUser = req.cust_no;

  //Find the cart associated with this customer id

  try {
    const [cartForUser, metadata] =
      await sequelize.query(`select t_cart.item_id, t_cart.quantity,t_item.name, t_item.image, t_item.description,
    t_batch.MRP,t_batch.sale_price, t_batch.discount,t_lkp_color.color_name, t_lkp_brand.brand_name
    from ((((t_cart
    inner join t_item on t_item.id = t_cart.item_id)
    inner join t_batch on t_batch.item_id = t_cart.item_id )
    inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
    inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
    where t_cart.cust_no = "${currentUser}"`);

    if (cartForUser.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "There is no cart for current user",
      });
    }
    const promises = cartForUser.map(async (current) => {
      return {
        itemID: current.item_id,
        quantity: current.quantity,
        itemName: current.name,
        description: current.description,
        image: current.image,
        MRP: current.MRP,
        salePrice: current.sale_price,
        discount: current.discount,
        color: current.color_name,
        brand: current.brand_name,
      };
    });

    const responseArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Cart successfully fetched for user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error while fetching cart, check data field for more details",
    });
  }
};

module.exports = {
  saveCart,
  addItemToCart,
  removeItemFromCart,
  getCart,
};
