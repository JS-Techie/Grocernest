const { sequelize } = require("../models");
const db = require("../models");

const Cart = db.CartModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;

const saveCart = async (req, res, next) => {
  //Get current user from JWT
  //const currentUser = req.cust_no
  //Already saving to DB in adding items and removing from DB based on certain conditions in remove route
};

const addItemToCart = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  //get item-id from params
  const itemId = req.params.itemId;

  //get quantity from params
  const enteredQuantity = parseInt(req.params.quantity);

  try {
    const itemAlreadyExists = await Cart.findOne({
      where: {
        item_id: itemId,
        cust_no: currentUser,
      },
    });

    if (!itemAlreadyExists) {
      try {
        const newItem = await Cart.create({
          cust_no: currentUser,
          item_id: itemId,
          quantity: enteredQuantity,
          created_by: 1,
        });
        return res.status(200).send({
          success: true,
          data: {
            itemID: newItem.item_id,
            quantity: newItem.quantity,
          },
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
    try {
      const updatedItem = await Cart.update(
        { quantity: itemAlreadyExists.quantity + enteredQuantity },
        { where: { item_id: itemId, cust_no: currentUser } }
      );
      return res.status(201).send({
        success: true,
        data: {
          itemID: itemAlreadyExists.item_id,
          quantity: itemAlreadyExists.quantity + enteredQuantity,
        },
        message: "Updated quantity of item successfully",
      });
    } catch (error) {
      return res.status(400).send({
        success: false,
        data: error.message,
        message: "Could not update quantity of item in cart",
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error occured while adding item to the cart",
    });
  }
};

const subtractItemFromCart = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  //Get item-id from params
  const itemId = req.params.itemId;

  //Get quantity from params
  // const quantity = req.params.quantity;

  // console.log(currentUser, itemId);
  try {
    //Find if the item exists in the cart
    const itemExists = await Cart.findOne({
      where: {
        cust_no: currentUser,
        item_id: itemId,
      },
    });

    if (!itemExists) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Requested item not found in cart",
      });
    } else {
      let itemQuantity = itemExists.dataValues.quantity;
      // console.log(itemQuantity);
      if (itemQuantity == 1) {
        //if only one item exist, remove it from cart table
        Cart.destroy({
          where: {
            cust_no: currentUser,
            item_id: itemId,
            quantity: 1,
          },
        })
          .then(() => {
            return res.status(200).json({
              success: true,
              message: "Item successfully deleted from cart.",
            });
          })
          .catch((error) => {
            return res.status(400).json({
              success: false,
              data: error.message,
              message: "Error while deleting item from database",
            });
          });
      } else if (itemQuantity > 1) {
        //Subtract quantity in params from current quantity
        // console.log("subtracting qty");
        Cart.update(
          { quantity: itemQuantity - 1 },
          { where: { cust_no: currentUser, item_id: itemId } }
        )
          .then(() => {
            return res.status(200).send({
              success: true,
              data: {
                quantity: itemQuantity - 1,
              },
              message: "Quantity Successfully Subtracted",
            });
          })
          .catch((error) => {
            return res.status(400).json({
              success: false,
              data: error.message,
              message: "Error while subtracting quantity from database",
            });
          });
      }
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Some error occured while removing the requested item from cart",
    });
  }
};

const removeItemFromCart = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  //Get item-id from params
  const itemId = req.params.itemId;

  // console.log(currentUser, itemId);
  Cart.destroy({
    where: {
      cust_no: currentUser,
      item_id: itemId,
    },
  })
    .then((resData) => {
      if (resData == 0) {
        return res.status(400).json({
          success: true,
          data: "",
          message: "No item found with this item id",
        });
      } else {
        return res.status(200).json({
          success: true,
          data: "",
          message: "Item successfully deleted from cart.",
        });
      }
    })
    .catch((error) => {
      return res.status(400).json({
        success: false,
        data: error.message,
        message: "Error while deleting item from database",
      });
    });
};

const getItemCount = async (req, res, next) => {
  //Get currentUser from JWT
  const currentUser = req.cust_no;

  Cart.count({
    where: {
      cust_no: currentUser,
    },
  })
    .then((resData) => {
      return res.status(200).json({
        success: true,
        data: {
          itemcount: resData,
        },
        message: "Successfully fetched Item count",
      });
    })
    .catch((error) => {
      return res.status(400).json({
        success: false,
        data: error.message,
        message: "Error while counting item from Database",
      });
    });
};

const getCart = async (req, res, next) => {
  //Get currentUser from JWT
  const currentUser = req.cust_no;

  //Find the cart associated with this customer id

  try {
    const [cartForUser, metadata] =
      await sequelize.query(`select t_cart.item_id, t_cart.quantity,t_item.name, t_item.image, t_item.description,
    t_batch.MRP,t_batch.sale_price, t_batch.discount,t_lkp_color.color_name, t_lkp_brand.brand_name, t_cart.is_offer,t_cart.is_gift,t_cart.offer_item_price
    from ((((t_cart
    inner join t_item on t_item.id = t_cart.item_id)
    inner join t_batch on t_batch.item_id = t_cart.item_id )
    inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
    inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
    where t_cart.cust_no = "${currentUser}" order by t_batch.created_at desc`);

    if (cartForUser.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There is no cart for current user",
      });
    }

    const promises = cartForUser.map(async (current) => {
      let availableQuantity = 0;
      const batches = await Batch.findAll({
        where: { item_id: current.item_id },
      });

      batches.map((currentBatch) => {
        availableQuantity += currentBatch.quantity;
      });


      return {
        itemID: current.item_id,
        quantity: current.quantity,
        availableQuantity,
        itemName: current.name,
        description: current.description,
        image: current.image,
        MRP: current.MRP,
        salePrice: current.is_offer === 1 ? current.offer_item_price : current.sale_price,
        discount: current.discount,
        color: current.color_name,
        brand: current.brand_name,
        isGift : current.is_gift === 1 ? true : false,
        isOffer : current.is_offer === 1 ? true : false,
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

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
  getItemCount,
  addItemToCart,
  subtractItemFromCart,
  removeItemFromCart,
  getCart,
};
