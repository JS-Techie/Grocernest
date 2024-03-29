const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");

const Cart = db.CartModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Offers = db.OffersModel;
const Inventory = db.InventoryModel;
const {
  sendInvoiceToWhatsapp,
  sendOrderStatusToWhatsapp,
  sendOrderShippedToWhatsapp,
  sendAdminCancelledOrderStatusToWhatsapp,
} = require("../services/whatsapp/whatsapp");

const { collectAllYItem } = require("../services/offerService")

const {
  sendCouponToUser,
  sendOfferToUser,
  sendPOSInvoiceToUser,
  sendFirstCouponToUser,
} = require("../services/whatsapp/whatsappMessages");

const saveCart = async (req, res, next) => {
  //Get current user from JWT
  //const currentUser = req.cust_no
  //Already saving to DB in adding items and removing from DB based on certain conditions in remove route
};

const addItemToCart = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  //get item-id from params
  const itemId = parseInt(req.params.itemId);

  //get quantity from params
  const enteredQuantity = parseInt(req.params.quantity);

  try {
    const itemAlreadyExists = await Cart.findOne({
      where: {
        item_id: itemId,
        cust_no: currentUser,
        is_offer: null,
      },
    });

    const oldestBatch = await Batch.findOne({
      where: { item_id: itemId, mark_selected: 1 },
    });

    if (!oldestBatch) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "There is no batch selected for current item",
      });
    }

    if (!itemAlreadyExists) {
      // fetch avl qty if item
      //if current cart qty + entered qty is greater than avl qty, i will not let them add

      const currentInventory = await Inventory.findOne({
        where: {
          item_id: itemId,
          batch_id: oldestBatch.id,
          location_id: 4,
          balance_type: 1,
        },
      });

      if (enteredQuantity > currentInventory.quantity) {
        return res.status(402).send({
          success: false,
          data: currentInventory,
          message: `Could not add item to cart as available quantity is ${currentInventory.quantity} and your requested quantity is ${enteredQuantity} `,
        });
      }

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
      // fetch avl qty if item
      //if current cart qty + entered qty is greater than avl qty, i will not let them add
      const currentInventory = await Inventory.findOne({
        where: {
          item_id: itemId,
          batch_id: oldestBatch.id,
          location_id: 4,
          balance_type: 1,
        },
      });

      if (
        enteredQuantity + itemAlreadyExists.quantity >
        currentInventory.quantity
      ) {
        return res.status(402).send({
          success: false,
          data: currentInventory,
          message: `Could not add item to cart as available quantity is ${
            currentInventory.quantity
          } and your requested quantity is ${
            enteredQuantity + itemAlreadyExists.quantity
          } `,
        });
      }

      const updatedItem = await Cart.update(
        { quantity: itemAlreadyExists.quantity + enteredQuantity },
        { where: { item_id: itemId, cust_no: currentUser,is_offer : null } }
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
  const itemID = req.params.itemId;

  try {
    const itemExistsInCart = await Cart.findOne({
      where: { cust_no: currentUser, item_id: itemID, is_offer:null },
    });

    if (!itemExistsInCart) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item does not exist in user's cart",
      });
    }

    const finalQty = itemExistsInCart.quantity - 1;
    const offerExists = await Offers.findAll({
      where: { is_active: 1, item_x: itemID, is_ecomm : 1 },
    });

    let all_offer_item = []
    let all_offer_qty = []
    if(offerExists){
      offerExists.map( (each_offer) => {
          all_offer_item.push(each_offer.item_y)
          all_offer_qty.push(each_offer.item_x_quantity)
      })
    }  
    all_offer_qty.sort((a,b)=>b-a)
    let quantityWithOccurence = new Map();
    let n = finalQty
    let offerItemDetails
    let yItem = []
    let yItemQtyToBeAdded =[]
    while(n >= Math.min(...all_offer_qty)){
      for(let i = 0; i < all_offer_qty.length; i++){
        const divisor = all_offer_qty[i];
        if(divisor <= n){
          const quotient = Math.floor(n / divisor);
          //const remainder = n % divisor;  
          quantityWithOccurence.set(divisor, quotient)
          n = n % divisor;
          break;
        }
      }
    }

    if(quantityWithOccurence.size !== 0){
      for(let [offerCreationQTYOfX, occurenceOfOffer] of quantityWithOccurence){

        offerExists.map((eachOfferOnX)=>{

          if(eachOfferOnX.item_x_quantity === offerCreationQTYOfX){

            offerItemDetails = eachOfferOnX
            
            switch(offerItemDetails.type_id){
              case 1:
                
                if(yItem.length > 0 && yItem.includes(offerItemDetails.item_y) ){
                      let index = yItem.indexOf(offerItemDetails.item_y)
                      let yItemQty = yItemQtyToBeAdded[index]
                      yItemQty = yItemQty + (occurenceOfOffer * offerItemDetails.item_y_quantity)
                      yItemQtyToBeAdded[index] = yItemQty
                      //itemToBeAdded = offerItemDetails.item_y

                }else{
                  yItem.push(offerItemDetails.item_y)
                 // let yItemQty = Math.floor(quantity/offerItemDetails.item_x_quantity) * offerItemDetails.item_y_quantity
                  let yItemQty  = occurenceOfOffer * offerItemDetails.item_y_quantity
                  yItemQtyToBeAdded.push(yItemQty)
                 // itemToBeAdded = offerItemDetails.item_y
                }
                break;

              case 2:
              /*  let amountOfDiscount = eachOfferOnX.amount_of_discount * occurenceOfOffer 
                amountOfDiscounts.push(amountOfDiscount)
                if(eachOfferOnX.is_percentage === 1){
                  isPercentage.push(true)
                }else{
                  isPercentage.push(false)
                }*/
                break;  
            }
            console.log(offerItemDetails)    
          }     
        })
      }
    }


    let cartOfferId = []
    const userSpecificCart = await Cart.findAll({
      where: { cust_no: currentUser, is_offer: 1},
    });

    if(userSpecificCart){
      cartOfferId = userSpecificCart.map((cart)=>{
          return cart.item_id
      })
    }
    
    let offerItemToBeRemoved = [];
    let removedItemFromCart = null;
    let updateExistingItem = null;
    if (itemExistsInCart.quantity === 1) {
      
      const offerExists = await Offers.findOne({
        where: { is_active: 1, item_x: itemID, item_x_quantity: itemExistsInCart.quantity, is_ecomm : 1 },
      });

      if(offerExists){
        const offerItemExistsInCart = await Cart.findOne({
          where: { cust_no: currentUser, item_id: offerExists.item_y, is_offer: 1 },
        });
        
        if(offerItemExistsInCart){
          offerItemToBeRemoved.push(offerExists.item_y)
          let itemExistsInCart = await Cart.destroy({
            where: { cust_no: currentUser, item_id: offerExists.item_y, is_offer: 1 },
          });
        }

        removedItemFromCart = await Cart.destroy({
          where: { cust_no: currentUser, item_id: itemID, is_offer : null },
        });    
        
      }
      
    }else{
      /**
       * update the quantity of original item
       */
      updateExistingItem = await Cart.update({
        quantity: finalQty,
      },
      { where: {
          cust_no: currentUser, 
          item_id: itemID, 
          is_offer: null 
        }
      });

      /**
       * update the offerItem in cart table
       */

      if(yItem.length>0){
        let ultimateResponse = []
        

        if(cartOfferId.length > 0){
          for(const itemId of cartOfferId){
            if(all_offer_item.includes(itemId)){
              offerItemToBeRemoved.push(itemId)
              let deleteExistingOfferInCart = await Cart.destroy({
                where: {
                  cust_no: currentUser, item_id: itemId, is_offer: 1 
                }
              });
            }
          }
        }
  
        for(const y of yItem){
          const index = yItem.indexOf(y)
          let response
          
          response = await Cart.create({
              cust_no: currentUser,
              item_id: y,
              quantity: yItemQtyToBeAdded[index],
              created_by: 1,
              is_offer: 1,
              offer_item_price: 0,
          });
        }
      }else{

        if(cartOfferId.length > 0){
          for(const itemId of cartOfferId){
            if(all_offer_item.includes(itemId)){
              offerItemToBeRemoved.push(itemId)
              let deleteExistingOfferInCart = await Cart.destroy({
                where: {
                  cust_no: currentUser, item_id: itemId, is_offer: 1 
                }
              });
            }
          }
        }
      }
      
    } 

    return res.status(200).send({
      success: true,
      data: {
        newQuantityOfNormalItem: finalQty,
        offerItemRemoved: offerItemToBeRemoved
      },
      message: "Successfully updated quantity of item and its offer in cart" 
    });

  /*
    let offerItemToBeRemoved = null;
    let Xquantity = null;
    let Yquantity = null;
    if (offerExists) {
      offerItemToBeRemoved = offerExists.item_y;
      Xquantity = offerExists.item_x_quantity;
      Yquantity = offerExists.item_y_quantity;
    }

    let removedItemFromCart = null;
    let removedOfferItemFromCart = null;

    if (itemExists.quantity === 1) {
      removedItemFromCart = await Cart.destroy({
        where: { cust_no: currentUser, item_id: itemID, is_offer : null },
      });

      if (offerItemToBeRemoved) {
        removedOfferItemFromCart = await Cart.destroy({
          where: {
            cust_no: currentUser,
            item_id: offerItemToBeRemoved,
            is_offer: 1,
          },
        });
      }

      return res.status(200).send({
        success: true,
        data: {
          removedItemFromCart,
          offerItemRemoved: offerItemToBeRemoved,
          removedOfferItemFromCart,
        },
        message: "Successfully removed item and its offer from cart",
      });
    }
    let newQuantityOfNormalItem = itemExists.quantity - 1;

    let itemQuantityUpdated = null;
    let isBigger = false;
    let offerItemQuantityUpdated = 0

    if (offerItemToBeRemoved) {
      let newQuantityOfOfferItem = null;
      if (newQuantityOfNormalItem < Xquantity) {
        console.log("in if");
        isBigger = true;
      } else if (newQuantityOfNormalItem % offerExists.item_x_quantity === 0) {
        console.log("in else if");
        newQuantityOfOfferItem =
          (newQuantityOfNormalItem / offerExists.item_x_quantity) *
          offerExists.item_y_quantity;
      } else {
        console.log("in else");
        newQuantityOfOfferItem =
          Math.floor(newQuantityOfNormalItem / offerExists.item_x_quantity) *
          offerExists.item_y_quantity;
      }

      if (isBigger) {
        offerItemQuantityUpdated = await Cart.destroy({
          where: { cust_no: currentUser, item_id: offerItemToBeRemoved,is_offer:1 },
        });
      } else {
        offerItemQuantityUpdated = await Cart.update(
          {
            quantity: newQuantityOfOfferItem,
          },
          {
            where: { cust_no: currentUser, item_id: offerItemToBeRemoved,is_offer : 1 },
          }
        );
      }

      itemQuantityUpdated = await Cart.update(
        {
          quantity: newQuantityOfNormalItem,
        },
        {
          where: { cust_no: currentUser, item_id: itemID,is_offer : null },
        }
      );

      return res.status(200).send({
        success: true,
        data: {
          newQuantityOfNormalItem,
          itemQuantityUpdated,
          newQuantityOfOfferItem,
          offerItemToBeRemoved,
          offerItemQuantityUpdated,
        },
        message: "Successfully updated quantity of item and its offer in cart",
      });
    }

    itemQuantityUpdated = await Cart.update(
      {
        quantity: newQuantityOfNormalItem,
      },
      {
        where: { cust_no: currentUser, item_id: itemID,is_offer : null },
      }
    );

    return res.status(200).send({
      success: true,
      data: {
        newQuantityOfNormalItem,
        itemQuantityUpdated,
      },
      message: "Successfully reduced quantity of item in cart",
    }); */
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occurred while subtracting items from cart, please check data field for more details",
    });
  }
};


const removeItemFromCart = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  //get Item id from params
 // const itemID = req.params.itemId;
  const {itemId} = req.params;

//  const{item_x_quantity} = req.body;
  try {
    const itemExists = await Cart.findOne({
      where: { cust_no: currentUser, item_id: itemId },
    });

    if (!itemExists) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item does not exist in user's cart",
      });
    }
    
    const offerExists = await Offers.findOne({
      where: {
        is_active: 1,
        //[Op.or]: [{ item_id_1: itemID }, { item_id: itemID }],
        item_x:itemId ,
        [Op.or]: [{type_id:1}, {type_id:2}],
        is_ecomm : 1
      }
    });

    let offerItemToBeRemoved = null;
    let offerItemDestroyed = null;

    if (offerExists) {
      if (offerExists.item_x) {
        offerItemToBeRemoved = offerExists.item_y;
      }
    }

    const normalItemDestroyed = await Cart.destroy({
      where: { cust_no: currentUser, item_id: itemId },
    });

    if (offerItemToBeRemoved) {
      offerItemDestroyed = await Cart.destroy({
        where: { cust_no: currentUser, item_id: offerItemToBeRemoved, is_offer : 1 },
      });
    }

    return res.status(200).send({
      success: true,
      data: {
        offerExists: offerExists ? true : false,
        normalItemDestroyed,
        offerItemToBeRemoved,
        offerItemDestroyed,
      },
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while removing items from cart, check data field for more details",
    });
  }
};

const getItemCount = async (req, res, next) => {
  //Get currentUser from JWT
  const currentUser = req.cust_no;

  try {
    const [cartForUser, metadata] =
      await sequelize.query(`select t_cart.item_id, t_cart.quantity,t_cart.id,t_item.name, t_item.image, t_item.description,
      t_batch.MRP,t_batch.sale_price, t_batch.discount,t_lkp_color.color_name, t_lkp_brand.brand_name, t_cart.is_offer,t_cart.is_gift,t_cart.offer_item_price
      from ((((t_cart
      inner join t_item on t_item.id = t_cart.item_id)
      inner join t_batch on t_batch.item_id = t_cart.item_id )
      inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
      inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
      where t_cart.cust_no = "${currentUser}" group by t_cart.id`);

    // const cartForUser = await Cart.findAll({
    //   where: { cust_no: currentUser },
    // });

    if (cartForUser.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no items in cart for current user",
      });
    }

    const promises = cartForUser.map(async (current) => {
      return {
        itemID: current.item_id,
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

    // console.log(cartForUser);
    // console.log(cartForUser.length);
    return res.status(200).send({
      success: true,
      data: {
        //cartForUser,
        itemcount: resolved.length,
      },
      message: "Successfully fetched cart count of the user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching cart count, please check data field for more details",
    });
  }
};

const getCart = async (req, res, next) => {

  // console.log("===========whatsapp testing==============");
  // sendInvoiceToWhatsapp("8910443583", "123456774", "https://ecomm-dev.s3.ap-south-1.amazonaws.com/pdfs/invoices/invoice-307172.pdf");
  //sendOrderStatusToWhatsapp("7980996735", "123456774", "Shipped");
  // sendOrderShippedToWhatsapp("9163540343", "123456", "Shipped", "Tanmoy");
  // sendAdminCancelledOrderStatusToWhatsapp("9163540343", "12345", "no items");

  // sendCouponToUser("Mehul","Hello","1","20","7980996735")
  //sendFirstCouponToUser("Mehul", "7980996735", "FIRSTBUY");

  //Get currentUser from JWT
  const currentUser = req.cust_no;

  console.log(currentUser);

  //Find the cart associated with this customer id

  try {
    const [cartForUser, metadata] = await sequelize.query(`select t_cart.item_id, t_cart.id, t_cart.quantity, t_item.name, t_item.image, t_item.description, t_batch.id as batchId,
    t_batch.MRP, t_batch.sale_price, t_batch.discount, t_batch.mark_selected, t_lkp_color.color_name, t_lkp_brand.brand_name, t_cart.is_offer,t_cart.is_gift, t_cart.offer_item_price
    from ((((t_cart
    inner join t_item on t_item.id = t_cart.item_id)
    inner join t_batch on t_batch.item_id = t_cart.item_id )
    inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
    inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
    where t_cart.cust_no = "${currentUser}" group by t_cart.id`);

    if (cartForUser.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There is no cart for current user",
      });
    }

    console.log(cartForUser);

    /**
     * TODO: check the master table according 1 & 2 type_id
     */
    const promises = cartForUser.map(async (current) => {
      let currentOffer = null;
      if (current.is_offer === 1) {
        currentOffer = await Offers.findOne({
          where: {
            is_active: 1,
            item_x : current.item_id,
            [Op.or]: [
              { type_id: 1 },
              { type_id: 2 },
            ],
            is_ecomm : 1
            
            /*
            [Op.or]: [
              { item_id_1: current.item_id },
              { item_id: current.item_id },
            ],*/
          }
          
        });
      }

      let isEdit = null;
      if (currentOffer) {
        if (currentOffer.amount_of_discount) {
          isEdit = true;
        }
      }

      const oldestBatch = await Batch.findOne({
        where: {
          item_id: current.item_id,
          mark_selected: 1,
        },
      });

      if (!oldestBatch) {
        return res.status(200).send({
          success: true,
          data: [],
          message: "No batch is selected for current item",
        });
      }
      const currentItem = await Inventory.findOne({
        where: {
          batch_id: oldestBatch.id,
          item_id: current.item_id,
          location_id: 4,
          balance_type: 1,
        },
      });

      if (currentItem) {
        const isXItem = await Offers.findOne({
          where : {
            is_active: 1,
            item_x: current.item_id,
          }
        });

        const sale_price =  current.is_offer === 1 ? current.offer_item_price : oldestBatch.sale_price;

        return {
          itemID: current.item_id,
          quantity: current.quantity,
          availableQuantity: currentItem.quantity,
          itemName: current.name,
          description: current.description,
          image: current.image,
          MRP: oldestBatch.MRP,
          salePrice:
            current.is_offer === 1
              ? current.offer_item_price
              : oldestBatch.sale_price,
          isXItem : isXItem ? 
                      sale_price !== 0 ? true : false
                      : false,    
          discount: current.discount,
          cashback: currentItem.cashback ? currentItem.cashback : 0,
          cashback_is_percentage: currentItem.cashback_is_percentage
            ? true
            : false,
          color: current.color_name,
          brand: current.brand_name,
          isGift: current.is_gift === 1 ? true : false,
          isOffer: current.is_offer === 1 ? true : false,
          canEdit: current.is_offer === 1 ? (isEdit ? true : false) : "",
          
        };
      }
    });

    const resolved = await Promise.all(promises);

    console.log("<><><", resolved);

    const resolvedWithoutUndefined = await resolved.filter((current) => {
      return current !== undefined;
    });
    const responseArray = [
      ...new Map(
        resolvedWithoutUndefined.map((item) => [item["itemID"], item])
      ).values(),
    ];
    return res.status(200).send({
      success: true,
      data: resolvedWithoutUndefined,
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
