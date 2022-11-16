const db = require("../models");
const Item = db.ItemModel;

const migrateSingleImageToMultipleImages = async (req, res, next) => {
  const items = await Item.findAll({});

  let val = 0;
  if (items.length !== 0) {
    items.map(async (currentItem) => {
      //   if (currentItem.image) {
      //     let current = {
      //       imageName: "Image 1",
      //       url: currentItem.image,
      //       serialNumber: 0,
      //     };
      //     await Item.update(
      //       {
      //         image: JSON.stringify([current]),
      //       },
      //       {
      //         where: { id: currentItem.id },
      //       }
      //     );
      //   }

      if (!currentItem.image || currentItem.image === "") {
        await Item.update(
          {
            image: JSON.stringify([]),
          },
          {
            where: { id: currentItem.id },
          }
        );
      }
    });
  }

  console.log(val);
};

migrateSingleImageToMultipleImages();
