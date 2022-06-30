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


const getCart = async (req,res,next) => {
  //Get currentUser from JWT
  const currentUser = req.cust_no

  console.log(currentUser)

  //Find the cart associated with this customer id

  try{
    const cartForUser = await Cart.findAll({
      where : {
        cust_no : currentUser
      },
      include : {
        model : Item,
      }
    })

    if(cartForUser.length === 0){
      return res.status(404).send({
        success : false,
        data : null,
        message : "There is no cart for current user"
      })
    }

    // const promises = cartForUser.map(async(currentItem)=>{

    //   const item = await Item.findOne({
    //     where : {id:currentItem.item_id}
    //   })

    //   return({
    //       itemID : currentItem.item_id,
    //       quantity : currentItem.quantity,
    //       itemName : item.name,
    //       description : item.description,
    //       image : item.image
    //   })
    // })

    // const responseArray = await Promise.all(promises)


    const promises = cartForUser.map(async(current)=>{
      
      const item = current.t_item_models[0];
      
      return({
        itemID : current.item_id,
        quantity : current.quantity,
        itemName : item.name,
        description : item.description,
        image : item.image,
      })
    })

    const responseArray = await Promise.all(promises)

    return res.status(200).send({
      success : true,
      data : responseArray,
      message : "Cart successfully fetched for user"
    })


  }catch(error){
    return res.status(400).send({
      success : false,
      data : error.message,
      message : "Error while fetching cart, check data field for more details"
    })
  }

  
}

module.exports = {
  saveCart,
  addItemToCart,
  removeItemFromCart,
  getCart
};
