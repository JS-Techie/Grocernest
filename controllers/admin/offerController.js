const { Op } = require("sequelize");
const db = require("../../models");

// const services = require("../../services");
// const offerService = services.offerService;

const { isTypePresent, validationForExistingOffer, validationForYItem,
   validationForDiscount, typeIdDetails, buyXGetAnyYCreation } = require("../../services/offerService")

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
      const itemx = await Item.findOne({
        where: { id: current.item_x },
      });
      const itemy = await Item.findOne({
        where: { id: current.item_y },
      });

      /*  const item = await Item.findOne({
          where: { id: current.item_id },
        });*/

      const type = await typeIdDetails(current.type_id)
       
      return {
        offerID: current.id,
        offerType: current.type_id,
        offerName: (type!==null)?type.offer_type:null,
        itemX: current.item_x ? current.item_x : "",
        firstItem: itemx ? itemx.name : "",
        quantityOfItemX: current.item_x_quantity ? current.item_x_quantity : "",
        itemY: current.item_y ? current.item_y : "",
        secondItem: itemy ? itemy.name : "",
        quantityOfItemY: current.item_y_quantity ? current.item_y_quantity : "",
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

    const itemX = await Item.findOne({
      where: { id: current.item_x },
    });
    const itemY = await Item.findOne({
      where: { id: current.item_y },
    });
    /* const item = await Item.findOne({
       where: { id: current.item_id },
     });
 */

    const type = await typeIdDetails(current.type_id)
    return res.status(200).send({
      success: true,
      data: {
        offerID: current.id,
        offerType: current.type_id,
        offerName: (type!==null)?type.offer_type:null,
        itemX: current.item_x ? current.item_x : "",
        firstItem: itemX ? itemX.name : "",
        quantityOfItemX: current.item_x_quantity ? current.item_x_quantity : "",
        itemY: current.item_y ? current.item_y : "",
        secondItem: itemY ? itemY.name : "",
        quantityOfItemY: current.item_y_quantity ? current.item_y_quantity : "",
        //  itemID: current.item_id ? current.item_id : "",
        //  itemName: item ? item.name : "",
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
    item_y,
    item_x_quantity,
    item_y_quantity,
    item_z,
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

    let existingOffer = null;
    let existingYItem = null;
    let existingDiscount = null;
    let ult_value = [];

    switch (type_id) {
      case 1:

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
      default:
        return res.status(400).send({
          success: false,
          data: [],
          message: "Please provide a valid type_id"
        })
      // console.log("incorrect type_id")
    }

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

    console.log("before offer query");
    const newOffer = await Offers.create({
      type_id,
      item_x,
      item_y,
      item_x_quantity,
      item_y_quantity,
      item_z,
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
    item_y,
    item_x_quantity,
    item_y_quantity,
    amount_of_discount,
    is_percentage,
    start_date,
    start_time,
    end_date,
    end_time,
    is_pos,
    is_ecomm,
    is_time,
  } = req.body;

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

    let offer = null;
    if (item_x) {
      offer = await Offers.findOne({
        where: {
          item_x,
          [Op.or]: [{ type_id: 1 }, { type_id: 2 }],
          [Op.not]: [{ id: offerID }],
        },
      });
    }

    if (offer) {
      return res.status(400).send({
        success: false,
        data: offer,
        message: "Offer already exists for this item",
      });
    }

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

    if (!type_id) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter the type of offer",
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
        // item_id,
        amount_of_discount,
        is_percentage: is_percentage === true ? 1 : null,
        start_date,
        start_time,
        end_date,
        end_time,
        is_pos,
        is_ecomm,
        is_time,
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
        },
        newOffer: {
          offerID: updatedOffer.id,
          offerType: updatedOffer.type,
          itemX: updatedOffer.item_id_1 ? updatedOffer.item_id_1 : "",
          quantityOfItemX: updatedOffer.item_1_quantity
            ? updatedOffer.item_1_quantity
            : "",
          itemY: updatedOffer.item_id_2 ? updatedOffer.item_id_2 : "",
          quantityOfItemY: updatedOffer.item_2_quantity
            ? updatedOffer.item_2_quantity
            : "",
          itemID: updatedOffer.item_id ? updatedOffer.item_id : "",
          amountOfDiscount: updatedOffer.amount_of_discount
            ? updatedOffer.amount_of_discount
            : "",
          isPercentage: updatedOffer.is_percentage
            ? updatedOffer.is_percentage === 1
              ? true
              : false
            : "",
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
        },
        numberOfOffersUpdated: update,
      },
      message: "Offer updated successfully",
    });
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
