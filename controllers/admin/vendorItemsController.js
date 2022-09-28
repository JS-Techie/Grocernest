const db = require("../../models");

const Vendor = db.VendorModel;
const VendorItem = db.VendorItemModel;
const Item = db.ItemModel;

const getAllVendorAndMappedItems = async (req, res, next) => {
  try {
    const vendors = await Vendor.findAll({});

    if (vendors.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no registered vendors",
      });
    }

    const promises = vendors.map(async (currentVendor) => {
      const vendorItems = await VendorItem.findAll({
        where: { vendor_id: currentVendor.id },
      });

      let innerPromises = [];
      let itemDetails = [];
      if (vendorItems.length > 0) {
        innerPromises = vendorItems.map(async (current) => {
          const currentItem = await Item.findOne({
            where: { id: current.item_id },
          });

          return {
            itemId: currentItem ? currentItem.id : "",
            itemName: currentItem ? currentItem.name : "",
            image: currentItem ? currentItem.image : "",
            id: current ? current.id : "",
          };
        });

        itemDetails = await Promise.all(innerPromises);
      }

      return {
        currentVendor,
        itemDetails,
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Found all items mapped to vendor successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getAllItemsMappedToVendorById = async (req, res, next) => {
  const { vendor_id } = req.params;

  try {
    const vendor = await Vendor.findOne({
      where: { id: vendor_id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor does not exist",
      });
    }

    const vendorItems = await VendorItem.findAll({
      where: { vendor_id },
    });

    if (vendorItems.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no items mapped to current vendor",
      });
    }

    const promises = vendorItems.map(async (current) => {
      const currentItem = await Item.findOne({
        where: { id: current.item_id },
      });

      const currentVendor = await Vendor.findOne({
        where: { id: vendor_id },
      });

      return {
        id: current.id,
        currentItem,
        currentVendor,
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Successfully found all items mapped to current vendor",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const createAnItemMappingToVendor = async (req, res, next) => {
  const { vendor_id, items } = req.body;

  try {
    if (!vendor_id) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter the vendor you want to map items to",
      });
    }

    const vendor = await Vendor.findOne({
      where: { id: vendor_id },
    });

    if (!vendor) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor not found",
      });
    }

    items.map(async (current) => {
      const vendorItem = await VendorItem.findOne({
        where: { vendor_id, item_id: current },
      });

      if (!vendorItem) {
        await VendorItem.create({
          vendor_id,
          item_id: current,
          created_by: 1,
        });
      }
    });

    const vendorItems = await VendorItem.findAll({
      where: { vendor_id },
    });

    return res.status(201).send({
      success: true,
      data: vendorItems,
      message: "Mapped Item to vendor successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const editAnItemMappedToVendor = async (req, res, next) => {
  const { id } = req.params;
  const { vendor_id, item_id } = req.params;
  try {
    const vendorItem = await VendorItem.findOne({
      where: { id },
    });

    if (!vendorItem) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor-to-item mapping not found",
      });
    }

    const numberOfRowsUpdated = await VendorItem.update(
      {
        vendor_id,
        item_id,
      },
      {
        where: { id },
      }
    );

    const updatedVendorItem = await VendorItem.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: {
        numberOfRowsUpdated,
        updatedVendorItem,
      },
      message: "Succesfully updated vendor-to-item mapping",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const deleteAnItemMappedToVendor = async (req, res, next) => {
  const { id } = req.params;
  try {
    const vendorItem = await VendorItem.findOne({
      where: { id },
    });

    if (!vendorItem) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested vendor-to-item mapping not found",
      });
    }

    const numberOfRowsUpdated = await VendorItem.destroy({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: {
        deletedMapping: vendorItem,
        numberOfRowsUpdated,
      },
      message: "Successfully removed requested vendor-item mapping",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

module.exports = {
  getAllItemsMappedToVendorById,
  createAnItemMappingToVendor,
  editAnItemMappedToVendor,
  getAllVendorAndMappedItems,
  deleteAnItemMappedToVendor,
};
