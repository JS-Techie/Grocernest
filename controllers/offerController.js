const { Op } = require("sequelize");
const { max } = require("sequelize/lib/model");
const { sequelize } = require("../models");
const db = require("../models");

const Offers = db.OffersModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Cart = db.CartModel;
const OffersCache = db.OffersCacheModel;


const { cartCreation } = require("../services/offerService")

const offerForItem = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;
  let { itemID, quantity } = req.body;

  console.log("the item ID of this shit is:",itemID)

  try {
    const cart = await Cart.findOne({
      where: { cust_no: currentUser, item_id: itemID, is_offer:null},
    });
    if(cart) {
      quantity = cart.quantity + quantity;
    }
    const offer = await Offers.findAll({
      where: {
        is_active: 1,
        item_x: itemID,
      },
    });
    if (!offer) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No offers exist for this item",
      });
    }
    //add item check
   // let itemToBeAdded = null;
   // let quantityToBeAdded = null;
    //let discount = null;
    //let isPercentage = null;
    //let response = null;
    //let newSalePrice = null;

    /**
     * TODO: collect the occurence applicable offer's quantities
     */
    let all_offer_item = []
    let all_offer_qty = []
    offer.map((each_offer)=>{
      all_offer_item.push(each_offer.item_y)
      all_offer_qty.push(each_offer.item_x_quantity)
    })
    /**
     * TODO: sorting the array in descending order
     */
    all_offer_qty.sort((a,b)=>b-a)

    let quantityWithOccurence = new Map();
    let n = quantity
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
    
    for (let [key, value] of quantityWithOccurence) {
      console.log(key, value);
    }
    
    let offerItemDetails
    let allYItemDetails = []
    let yItem = []
    let yItemQtyToBeAdded =[]
    let amountOfDiscounts =[]
    let isPercentage =[]
    let itemToBeAdded
    if(quantityWithOccurence.size !== 0){

      for(let [offerCreationQTYOfX, occurenceOfOffer] of quantityWithOccurence){

        offer.map((eachOfferOnX)=>{

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

    let ultimateResponse = []
    let cartOfferId = []

    const userSpecificCart = await Cart.findAll({
      where: { cust_no: currentUser, is_offer: 1},
    });

    if(userSpecificCart){
      cartOfferId = userSpecificCart.map((cart)=>{
          return cart.item_id
      })
    }

    if(yItem.length>0){
      if(cartOfferId.length > 0){
        for(const itemId of cartOfferId){
          if(all_offer_item.includes(itemId)){
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
        
          
       // }
        ultimateResponse.push(response)
      }
    }
    return res.status(201).send({
      success: true,
      data: ultimateResponse,
      message: yItem.length > 0 ? "Offer successfully applied and items added to cart" : "Not offer applicable" 
    });

/*    let cartResult
    let cartPresentOfferItems = []
    let allOfferItemInCart = await Cart.findAll({
      where: { cust_no: currentUser, is_offer: 1 }
    });
    if(allOfferItemInCart){
      allOfferItemInCart.map((eachCart)=>{
        if(eachCart.item_id){
          cartPresentOfferItems.push(eachCart.item_id)
        }
      })

    }

    if(allOfferItemInCart && cartPresentOfferItems){
      let count =0
      yItemQtyToBeAdded.map( async (yItem)=> {
       if( cartPresentOfferItems.includes(yItem) ){
        count++
        cartResult = await cartUpdate(currentUser, yItem, yItemQtyToBeAdded)
        return;
       }
      })
      if(count>0){
        cartResult = await cartUpdate(currentUser, yItem, yItemQtyToBeAdded)
      }
    }else{
       cartResult = await cartCreation(currentUser, yItem, yItemQtyToBeAdded)
     }
     return res.status(201).send({
      success: true,
      data: cartResult,
      message: "Offer successfully applied and items added to cart",
    });
*/
  /*  if (offerItemInCart) {
      response = await Cart.update(
        {
          quantity: quantityToBeAdded,
        },
        {
          where: {
            cust_no: currentUser,
            item_id: itemToBeAdded,
            is_offer: 1,
          },
        }
      );
    } else {
      response = await Cart.create({
        cust_no: currentUser,
        item_id: itemToBeAdded,
        quantity: quantityToBeAdded,
        created_by: 1,
        is_offer: 1,
        offer_item_price: 0,
      });
    }

      return res.status(201).send({
        success: true,
        data: response,
        message: "Offer successfully applied and items added to cart",
      });
    }

    let oldestBatch = await Batch.findOne({
      where: { item_id: itemID, mark_selected: 1 },
    });

    if (!oldestBatch) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No batch is selected for current item",
      });
    }

    discount = offer.amount_of_discount;
    isPercentage = offer.is_percentage;

    if (isPercentage) {
      newSalePrice =
        oldestBatch.MRP - (discount / 100) * oldestBatch.MRP;
    } else {
      newSalePrice = oldestBatch.MRP - discount;
    }

    offerItemInCart = await Cart.findOne({
      where: { cust_no: currentUser, item_id: itemID, is_offer: 1 },
    });

    if (offerItemInCart) {
      response = await Cart.update(
        {
          quantity,
        },
        {
          where: { cust_no: currentUser, item_id: itemID, is_offer: 1 },
        }
      );
    } else {
      response = await Cart.create({
        cust_no: currentUser,
        item_id: itemID,
        quantity,
        created_by: 1,
        is_offer: 1,
        offer_item_price: newSalePrice,
      });
    }

    return res.status(201).send({
      success: true,
      data: response,
      message: "Offer successfully applied and items added to cart",
    });*/
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while applying offer items, please check data field for more details",
    });
  }
};

const offerForItemBuyNow = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  //Get item id and quantity from request body
  const { itemID, quantity } = req.body;

  if (!itemID || !quantity) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "Please enter all required details",
    });
  }

  try {
    
    const offer = await Offers.findAll({
      where: {
        is_active: 1,
        item_x: itemID,
        is_ecomm: 1,
      },
    });

    const currentItem = await Item.findOne({
      where: { id: itemID },
    });

    const oldestBatch = await Batch.findOne({
      where: { item_id: itemID, mark_selected: 1 },
    });

    if (!oldestBatch) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No batch is selected for current item",
      });
    }

    if (!offer) {
      return res.status(200).send({
        success: true,
        data: {
          itemName: currentItem.name,
          itemID,
          quantity,
          total: oldestBatch.sale_price * quantity,
        },
        message: "No offers exist for this item",
      });
    }

    /**
     * TODO: offer exits block started below
     */
    let newSalePrice = null;
    let offerItemID = null;

    /**
     * TODO: collecting each_offer occurence on item 
     */

    let all_offer_qty = []
    offer.map((each_offer)=>{
      all_offer_qty.push(each_offer.item_x_quantity)
    })
    all_offer_qty.sort((a,b)=>b-a)

    let quantityWithOccurence = new Map();
    let n = quantity
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
    /**
     * TODO: collecting all offer items with their quantities
     */
    let yItem = []
    let yItemQtyToBeAdded = []
    let yItemResponse 
    let saveAllOfferItemInCache
    if(quantityWithOccurence.size !== 0){

      for(let [offerCreationQTYOfX, occurenceOfOffer] of quantityWithOccurence){

        offer.map((eachOfferOnX)=>{

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

     if(yItem.length >0){

      yItemResponse = await Promise.all(yItem.map(async(y, index)=>{

        const Yitem = await Item.findOne({
          where: {id: y},
        });
        if (Yitem) {
          return {
            itemName : Yitem.name,
            quantity : yItemQtyToBeAdded[index] 
          }
        }
      }));

        saveAllOfferItemInCache = await Promise.all(yItem.map(async(y, index) => {
        return OffersCache.create({
          cust_no: currentUser,
          item_id: y,
          quantity: yItemQtyToBeAdded[index] ,
          created_by: 1,
        });

      }))



     }
     
    /*if(yItem.length > 0){
      let response
      for(const y of yItem){
        const index = yItem.indexOf(y)
        const Yitem = await Item.findOne({
          where: { id: y },
        });
        if(Yitem){
           response = {
            itemName: Yitem.name,
            quantity: yItemQtyToBeAdded[index] 
          }
        }
        yItemResponse.push(response)
      }
    }*/


   /*   */

    
      return res.status(200).send({
        success: true,
        data: {
          normalItem: {
            itemName: currentItem.name,
            quantity,
          },
          offerItem:
            yItemResponse === null
              ? "Not enough items to avail offer"
              : yItemResponse,
          //total: oldestBatch.sale_price * quantity,
          total: oldestBatch.MRP * quantity,
          DBresponse: saveAllOfferItemInCache,
        },
        message: (yItem.length>0) ? "Offer successfully applied for current item" : "Not enough items to avail offer",
      });
    

    
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while applying offer items, please check data field for more details",
    });
  }
};
module.exports = {
  offerForItem,
  offerForItemBuyNow,
};
