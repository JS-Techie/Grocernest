const { Op } = require("sequelize");
const db = require("../../models");

// const services = require("../../services");
// const offerService = services.offerService;

const { isTypePresent, validationForExistingOffer, validationForYItem,
   validationForDiscount, typeIdDetails, buyXGetAnyYCreation, itemCombinationValidation, offerItemValidationType4,
   xSpecificYItemValidationType3, offerItemDuplicacyCheckType3, validationForExistingOfferUpdate, validationForYItemUpdate, validationForDiscountUpdate,
   xSpecificYItemValidationType3Update } = require("../../services/offerService")

const lkp_offers = db.lkpOffersModel;
const Offers = db.OffersModel;
const Item = db.ItemModel;
const Customer = db.CustomerModel;

// const { sendOfferToUser } = require("../../services/whatsapp/whatsappMessages");

const getAllOffers = async (req, res, next) => {
  //Get current user from JWT

  try {
    //Get all offers
    const offers = await Offers.findAll();

    if (offers.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no offers right now",
      });
    }

    const promises = offers.map(async (current) => {

      let itemX = null
      let itemY = null
      let itemZ = null
      if(current.item_x ){
        itemX = await Item.findOne({
          where: { id: current.item_x },
        });
      }
      if(current.item_y){
        itemY = await Item.findOne({
          where: { id: current.item_y },
        });
      } 
      if(current.item_z){
        itemZ = await Item.findOne({
          where: { id: current.item_z },
        });
      }

      /*  const item = await Item.findOne({
          where: { id: current.item_id },
        });*/

      const type = await typeIdDetails(current.type_id)
       
      return {
        offerID: current.id,
        offerType: current.type_id,
        offerName: (type!==null)?type.offer_type:null,
        itemX: current.item_x ? current.item_x : "",
        xItemName: itemX ? itemX.name : "",
        quantityOfItemX: current.item_x_quantity ? current.item_x_quantity : "",
        itemY: current.item_y ? current.item_y : "",
        yItemName: itemY ? itemY.name : "",
        quantityOfItemY: current.item_y_quantity ? current.item_y_quantity : "",
        itemZ: current.item_z ? current.item_z : "",
        zItemName: itemZ ? itemZ.name : "",
        quantityOfItemZ: current.item_z_quantity ? current.item_z_quantity : "",
        //  itemID: current.item_id ? current.item_id : "",
        // itemName: item ? item.name : "",
        amountOfDiscount: current.amount_of_discount
          ? current.amount_of_discount
          : "",
        isPercentage: current.is_percentage ? true : false,
        isActive: current.is_active ? true : false,
        startDate: current.start_date,
        startTime: current.start_time,
        endDate: current.end_date,
        endTime: current.end_time,
        isEcomm: current.is_ecomm
          ? current.is_ecomm === 1
            ? true
            : false
          : "",
        isPos: current.is_pos ? (current.is_pos === 1 ? true : false) : "",
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Found all offers",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const getOfferById = async (req, res, next) => {
  //Get current user from JWT

  //get offer id from params
  const offerID = req.params.id;
  console.log("offerId from param " + offerID)
  try {
    const current = await Offers.findOne({
      where: { id: offerID },
    });

    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested offer not found",
      });
    }

    let itemX = null
    let itemY = null
    let itemZ = null
    if(current.item_x ){
      itemX = await Item.findOne({
        where: { id: current.item_x },
      });
    }
    if(current.item_y){
      itemY = await Item.findOne({
        where: { id: current.item_y },
      });
    } 
    if(current.item_z){
      itemZ = await Item.findOne({
        where: { id: current.item_z },
      });
    }
    /* const item = await Item.findOne({
       where: { id: current.item_id },
     });
 */
    console.log("Offer_type_id: "+current.type_id)
    const type = await typeIdDetails(current.type_id)
    if(type){
        console.log("Offer_type_details: "+type.id)
        console.log("Offer_type_details: "+type.offer_type)
      
    }else{
      console.log("Hello World")
    }
   
    
    return res.status(200).send({
      success: true,
      data: {
        offerID: current.id,
        offerType: current.type_id,
        offerName: (type!==null)?type.offer_type:null,
        itemX: current.item_x ? current.item_x : "",
        xItemName: itemX ? itemX.name : "",
        quantityOfItemX: current.item_x_quantity ? current.item_x_quantity : "",
        itemY: current.item_y ? current.item_y : "",
        yItemName: itemY ? itemY.name : "",
        quantityOfItemY: current.item_y_quantity ? current.item_y_quantity : "",
        //  itemID: current.item_id ? current.item_id : "",
        //  itemName: item ? item.name : "",
        itemZ: current.item_z ? current.item_z : "",
        zItemName: itemZ ? itemZ.name : "",
        quantityOfItemZ: current.item_z_quantity ? current.item_z_quantity : "",
        amountOfDiscount: current.amount_of_discount
          ? current.amount_of_discount
          : "",
        isPercentage: current.is_percentage ? true : false,
        isActive: current.is_active ? true : false,
        startDate: current.start_date,
        startTime: current.start_time,
        endDate: current.end_date,
        endTime: current.end_time,
        isEcomm: current.is_ecomm
          ? current.is_ecomm === 1
            ? true
            : false
          : "",
        isPos: current.is_pos ? (current.is_pos === 1 ? true : false) : "",
        isTime: current.is_time ? (current.is_time === 1 ? true : false) : "",
      },
      message: "Requested offer found",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const createOffer = async (req, res, next) => {
  //Get current user from JWT

  const {
    type_id,
    item_x,
    item_x_quantity,
    item_y,
    item_y_quantity,
    item_z,
    item_z_quantity,
    amount_of_discount,
    is_percentage,
    start_date,
    end_date,
    start_time,
    end_time,
    is_pos,
    is_ecomm,
    is_time
  } = req.body;

  try {

    if (!type_id) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter the type of offer",
      });
    }
    if (type_id) {
      const validateType = isTypePresent(type_id)
      if (!validateType) {
        return res.status(400).send({
          success: false,
          data: [],
          message: "Provide a appropriate type_id"
        })
      }
    }

    let validItem = null;
    let existingOffer = null;
    let existingYItem = null;
    let existingDiscount = null;
    let ult_value = [];
    let itemCombValidation = null;
    let offerItemOfType4 = null;

    switch (type_id) {
      case 1:
        /*
        validItem = await isItemExists(item_x, item_y)
        if(validItem !== true){
          return res.status(400).send({
            success: false,
            data: validItem,
            messsage: "Above item is not a existing item"
          })
        }*/
        existingOffer = await validationForExistingOffer(item_x, item_x_quantity)
        console.log("existingOffer" + existingOffer);
        // const abc = existingOffer.map(async(obj)=>{
        //   console.log(obj)
        // })
        if (existingOffer) {
          return res.status(400).send({
            success: false,
            data: [],
            message: "Offer already exists on this item with mentioned quantity"
          })
        }
        if (!existingOffer) {
          existingYItem = await validationForYItem(item_x, item_y)
          console.log("existingYItem" + existingYItem)
          if (existingYItem) {
            return res.status(400).send({
              success: false,
              data: [],
              message: "Can't choose this item as offer-item"
            })
          }
        }
        break;
      case 2:
        existingOffer = await validationForExistingOffer(item_x, item_x_quantity)
        if (existingOffer) {
         return res.status(400).send({
           success: false,
           data: [],
           message: "Offer already exists on this item with mentioned quantity"
         })
        }
        if(!existingOffer){
          existingDiscount = await validationForDiscount(item_x, amount_of_discount, is_percentage)
          if(existingDiscount){
            return res.status(400).send({
              success: false,
              data:[],
              message: "Please change the amount of discount"
            })
          }
        }
        break;
      case 3:
        console.log(req.body)
        console.log("within block 3")
          const offerItemDuplicacy = await offerItemDuplicacyCheckType3(req.body)
          if(offerItemDuplicacy){
            return res.status(400).send({
              success: false,
              data: offerItemDuplicacy,
              message:"Duplicate item present in offer item list, please optimize"
            })
          }
          const offerItemValidation = await xSpecificYItemValidationType3(req.body)
          console.log("value "+offerItemValidation)
          if(offerItemValidation){
            return res.status(400).send({
              success: false,
              data: offerItemValidation,
              message:"offer item previously present, please change the offer item"
            })
          }
          console.log("offerItemValidation "+ offerItemValidation)
          const offerBulk = await buyXGetAnyYCreation(req.body)
          if(offerBulk){
            return res.status(201).send({
              success: true,
              data: offerBulk,
              message: "New offer successfully created"
            })
          }else{
            return res.status(400).send({
              success: false,
              data: [],
              message: "Offer failed to create"
            })
          }
      case 4:
        itemCombValidation = await itemCombinationValidation(item_x, item_y)
        if(itemCombValidation){
          return res.status(400).send({
            success: false,
            data: [],
            message: "item combination present, please change any of choosen item"
          })
        }else{
          offerItemOfType4 = await offerItemValidationType4(item_z, type_id)
          if(offerItemOfType4 === true){
            return res.status(400).send({
              success: false,
              data: [],
              message: "please change the offer item"
            })
          }
        }
        if(!item_x_quantity || !item_y_quantity || !item_z_quantity){
          return res.status(400).send({
            success: false,
            data:[],
            message:"choose a valid quantity for require items"
          })
        }
        break;
      case 5:
        itemCombValidation = await itemCombinationValidation(item_x, item_y)
        if(itemCombValidation){
          return res.status(400).send({
            success: false,
            data: [],
            message: "item combination present, please change any of choosen item"
          })
        }
        if(!item_x_quantity || !item_y_quantity){
          return res.status(400).send({
            success: false,
            data:[],
            message:"choose a valid quantity for require items"
          })
        }
        if(!amount_of_discount){
          return res.status(400).send({
            success: false,
            data: [],
            message: "please enter a discount amount"
          })
        }
        break;
      default:
        return res.status(400).send({
          success: false,
          data: [],
          message: "Please provide a valid type_id"
        })
      // console.log("incorrect type_id")
    }

    if (is_time &&(!start_date || !start_time || !end_date || !end_time)) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter correct details for time based offers",
      });
    }

    if (!is_pos && !is_ecomm) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please specify if this offer is for ecomm ",
      });
    }

    console.log("before offer query");
    const newOffer = await Offers.create({
      type_id,
      item_x,
      item_y,
      item_x_quantity,
      item_y_quantity,
      item_z,
      item_z_quantity,
      amount_of_discount,
      is_percentage:
        is_percentage !== null ? (is_percentage === true ? 1 : null) : null,
      created_by: 1,
      is_active: 1,
      start_date,
      end_date,
      start_time,
      end_time,
      is_pos,
      is_ecomm,
      is_time
    });

    console.log("after offer query");

    // const allCustomers = await Customer.findAll({})

    // allCustomers.map((currentCustomer)=>{
    //   sendOfferToUser(currentCustomer.cust_name.split(" ")[0], newOffer.item_id_1,)
    // })

    return res.status(201).send({
      success: true,
      data: newOffer,
      message: "New offer successfully created",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const updateOffer = async (req, res, next) => {
  //Get current user from JWT

  const offerID = req.params.id;

  const {
    type_id,
    item_x,
    item_x_quantity,
    item_y,
    item_y_quantity,
    item_z,
    item_z_quantity,
    amount_of_discount,
    is_percentage,
    is_time,
    start_date,
    end_date,
    start_time,
    end_time,
    is_pos,
    is_ecomm,
  } = req.body;
  
  try {
    if (!type_id) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter the type of offer",
      });
    }
    const validateType = isTypePresent(type_id)
      if (!validateType) {
        return res.status(400).send({
          success: false,
          data: [],
          message: "Provide a appropriate type_id"
        })
      }
    const current = await Offers.findOne({
      where: { id: offerID },
    });
    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested offer not found",
      });
    }

    let existingOffer = null;
    let existingYItem = null;
    let existingDiscount = null;

    if (type_id) {
      switch(type_id){
        case 1:
          existingOffer = await validationForExistingOfferUpdate(item_x, item_x_quantity, offerID)
          if (existingOffer) {
            return res.status(400).send({
              success: false,
              data: [],
              message: "Offer already exists on this item with mentioned quantity"
            })
          }
        /* if (!existingOffer) {
            existingYItem = await validationForYItemUpdate(item_x, item_y, offerID)
            console.log("existingYItem" + existingYItem)
            if (existingYItem) {
              return res.status(400).send({
                success: false,
                data: [],
                message: "Can't choose this item as offer-item"
              })
            }
          }*/
          break;
        case 2:
          existingOffer = await validationForExistingOfferUpdate(item_x, item_x_quantity, offerID)
          if (existingOffer) {
            return res.status(400).send({
              success: false,
              data: [],
              message: "Offer already exists on this item with mentioned quantity"
            })
          }
          if(!existingOffer){
            existingDiscount = await validationForDiscountUpdate(item_x, amount_of_discount, is_percentage, offerID)
            if(existingDiscount){
              return res.status(400).send({
                success: false,
                data:[],
                message: "Please modify your discount"
              })
            }
          }
          break;
        case 3:
         /* const offerItemDuplicacy = await offerItemDuplicacyCheckType3(req.body)
          if(offerItemDuplicacy){
            return res.status(400).send({
              success: false,
              data: offerItemDuplicacy,
              message:"Duplicate item present in offer item list, please optimize"
            })
          }
          const offerItemValidation = await xSpecificYItemValidationType3Update(req.body, offerID)
          console.log("value "+offerItemValidation)
          if(offerItemValidation){
            return res.status(400).send({
              success: false,
              data: offerItemValidation,
              message:"offer item previously present, please change the offer item"
            })
          }
          console.log("offerItemValidation "+ offerItemValidation)
          const offerBulk = await buyXGetAnyYUpdate(req.body, offerID)
          if(offerBulk){
            return res.status(201).send({
              success: true,
              data: offerBulk,
              message: "New offer successfully created"
            })
          }else{
            return res.status(400).send({
              success: false,
              data: [],
              message: "Offer failed to create"
            })
          }*/
          break;
        case 4:
          break;
        case 5:
          break;    

      }
      /*offer = await Offers.findOne({
        where: {
          item_x,
          [Op.or]: [{type_id: 1}, {type_id: 2}, {type_id: 3}, {type_id: 4}, {type_id: 5}],
          [Op.not]: [{id: offerID}],
        },
      });
    }

    if (offer) {
      return res.status(400).send({
        success: false,
        data: offer,
        message: "Offer already exists for this item",
      });
    }*/

    if (is_time && (!start_date || !start_time || !end_date || !end_time)) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter correct details for time based offers",
      });
    }
    if (!is_pos && !is_ecomm) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please specify if this offer is for POS or ecomm or both",
      });
    }

    let testing = null;
    switch (type_id) {
      case 1:
        break;
      case 2:
        const existingOffer = await Offers.findOne({
          where: {
            item_x,
            amount_of_discount,
            is_percentage,
            [Op.not]: [{ id: offerID }]
          }
        })
        if (existingOffer) {
          testing = true
        }
        break;
      default:
        console.log("abcd")
    }

    if (testing) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Discount can't be same for same item"
      })
    }

    const update = await Offers.update(
      {
        type_id,
        item_x,
        item_y,
        item_x_quantity,
        item_y_quantity,
        item_z,
        item_z_quantity,
        amount_of_discount,
        is_percentage:
        is_percentage !== null ? (is_percentage === true ? 1 : null) : null,
        created_by: 1,
        is_active: 1,
        start_date,
        end_date,
        start_time,
        end_time,
        is_pos,
        is_ecomm,
        is_time
      },
      {
        where: { id: offerID },
      }
    );

    const updatedOffer = await Offers.findOne({
      where: { id: offerID },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldOffer: {
          offerID: current.id,
          typeID: current.type_id,
          typeName: validateType ? validateType.offer_type : null,
          itemX: current.item_x ? current.item_x : null,
          itemXQuantity: current.item_x_quantity
            ? current.item_x_quantity
            : null,
          itemY: current.item_y ? current.item_y : null,
          itemYQuantity: current.item_y_quantity
            ? current.item_y_quantity
            : null,
          amountOfDiscount: current.amount_of_discount
            ? current.amount_of_discount
            : null,
          isPercentage: current.is_percentage
            ? current.is_percentage === 1
              ? true
              : false
            : null,
          isActive: current.is_active ? true : false,
          startDate: current.start_date,
          startTime: current.start_time,
          endDate: current.end_date,
          endTime: current.end_time,
          isEcomm: current.is_ecomm
            ? current.is_ecomm === 1
              ? true
              : false
            : null,
          isPos: current.is_pos ? (current.is_pos === 1 ? true : false) : null,
        },
        newOffer: {
          offerID: updatedOffer.id,
          typeID: updatedOffer.type,
          typeName: validateType ? validateType.offer_type : null,
          itemX: updatedOffer.item_x ? updatedOffer.item_x : null,
          itemXQuantity: updatedOffer.item_x_quantity
            ? updatedOffer.item_x_quantity
            : null,
          itemY: updatedOffer.item_y ? updatedOffer.item_y : null,
          itemYQuantity: updatedOffer.item_y_quantity
            ? updatedOffer.item_y_quantity
            : null,
         // itemID: updatedOffer.item_id ? updatedOffer.item_id : "",
          amountOfDiscount: updatedOffer.amount_of_discount
            ? updatedOffer.amount_of_discount
            : null,
          isPercentage: updatedOffer.is_percentage
            ? updatedOffer.is_percentage === 1
              ? true
              : false
            : null,
          isActive: updatedOffer.is_active ? true : false,
          startDate: updatedOffer.start_date,
          startTime: updatedOffer.start_time,
          endDate: updatedOffer.end_date,
          endTime: updatedOffer.end_time,
          isEcomm: updatedOffer.is_ecomm
            ? updatedOffer.is_ecomm === 1
              ? true
              : false
            : null,
          isPos: updatedOffer.is_pos ? (updatedOffer.is_pos === 1 ? true : false) : null,
        },
        numberOfOffersUpdated: update,
      },
      message: "Offer updated successfully",
    });
  }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

/**problem in deleteOffer*/
const deleteOffer = async (req, res, next) => {
  //Get current user from JWT

  //get offer id from params
  const offerID = req.params.id;
  try {
    const current = await Offers.findOne({
      where: { id: offerID },
    });

    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested offer not found",
      });
    }

    const deletedOffer = await Offers.update(
      {
        is_active: null,
      },
      { where: { id: offerID } }
    );

    return res.status(200).send({
      success: true,
      data: {
        deletedOffer: {
          offerID: current.id,
          offerType: current.type,
          itemX: current.item_x ? current.item_x : "",
          quantityOfItemX: current.item_x_quantity
            ? current.item_x_quantity
            : "",
          itemY: current.item_y ? current.item_y : "",
          quantityOfItemY: current.item_y_quantity
            ? current.item_y_quantity
            : "",
          // itemID: current.item_id ? current.item_id : "",
          amountOfDiscount: current.amount_of_discount
            ? current.amount_of_discount
            : "",
          isPercentage: current.is_percentage
            ? current.is_percentage === 1
              ? true
              : false
            : "",
          isActive: current.is_active ? true : false,
        },
        numberOfOffersDeleted: deletedOffer,
      },
      message: "Offer deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const activateOffer = async (req, res, next) => {
  //Get current user from JWT

  const offerID = req.params.id;

  try {
    const currentOffer = await Offers.findOne({
      where: { id: offerID },
    });

    if (!currentOffer) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested offer does not exist",
      });
    }

    const activatedOffer = await Offers.update(
      {
        is_active: 1,
      },
      {
        where: { id: offerID },
      }
    );

    return res.status(200).send({
      success: true,
      data: activatedOffer,
      message: "Offer activated successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while activating offer, please check data field for more details",
    });
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  activateOffer,
}
