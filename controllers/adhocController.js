const { sequelize } = require("../models");
const { Op } = require("sequelize");
const db = require("../models");

const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");

const Customer = db.CustomerModel;
const Wallet = db.WalletModel;
const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Batch = db.BatchModel;
const Item = db.ItemModel;

const addWalletBalance = async (req, res, next) => {
  const { order_id } = req.body;
  try {
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      return res.status(404).send({
        success: false,
        data: [],
        message:
          "The order does not exist and hence wallet balance could not be added",
      });
    }

    const customer = await Customer.findOne({
      where: { cust_no: order.cust_no },
    });

    const itemWalletExists = await Wallet.findOne({
      where: {
        cust_no: order.cust_no,
        item_specific_balance: {
          [Op.not]: null,
        },
      },
    });

    if (itemWalletExists) {
      return res.status(200).send({
        success: true,
        data: itemWalletExists,
        message: "Butter wallet exists for current user",
      });
    }

    const [firstOrderWithButter, metadata] =
      await sequelize.query(`select t_order.order_id,t_order_items.quantity,t_batch.sale_price
        from ((t_order 
        inner join t_order_items on t_order_items.order_id = t_order.order_id)
        inner join t_batch on t_batch.item_id = t_order_items.item_id)
        where t_batch.mark_selected = 1 and t_order_items.item_id = ${72533} and t_order.order_id <> ${order_id} and t_order.cust_no = '${
        customer.cust_no
      }' order by t_order.created_at`);

    console.log(firstOrderWithButter);

    //Amul Butter 500gm - 72533

    if (firstOrderWithButter.length === 0) {
      const currentOrderItems = await OrderItems.findAll({
        where: { order_id: order.order_id },
      });

      let walletBalanceToBeAdded = null;

      currentOrderItems.map(async (currentItem) => {
        if (currentItem.item_id === 72533) {
          const selectedBatch = await Batch.findOne({
            where: { item_id: currentItem.item_id, mark_selected: 1 },
          });

          if (selectedBatch) {
            walletBalanceToBeAdded =
              0.5 * (currentItem.quantity * selectedBatch.sale_price);
          }

          console.log(
            "Wallet Balance to be added ======>",
            walletBalanceToBeAdded
          );

          const update = await Wallet.update(
            {
              item_specific_balance: walletBalanceToBeAdded,
            },
            {
              where: { cust_no: customer.cust_no },
            }
          );
        }
      });

      const updatedWallet = await Wallet.findOne({
        where: { cust_no: customer.cust_no },
      });

      return res.status(200).send({
        success: true,
        data: updatedWallet,
        message: "Successfully added Amul butter balance to customer wallet",
      });
    }

    return res.status(200).send({
      success: true,
      data: [],
      message: "Amul Balance not added as you have ordered it before",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const checkBatchNo = async (req, res, next) => {
  const { id, batch_no } = req.body;
  try {
    if (id === "" || batch_no === "") {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter all required details",
      });
    }
    const currentItem = await Item.findOne({
      where: { id },
    });

    if (!currentItem) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item does not exist",
      });
    }

    const batches = await Batch.findAll({
      where: { item_id: id },
    });

    if (batches.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no batches for this item",
      });
    }

    let existing = false;
    batches.map((current) => {
      if (current.batch_no === batch_no) {
        existing = true;
      }
    });

    if (existing) {
      return res.status(400).send({
        success: false,
        data: [],
        message: `Batch number ${batch_no} already exists, please enter a new batch number`,
      });
    }

    return res.status(200).send({
      success: true,
      data: [],
      message: "This is not a duplicate batch number",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const migrateCustomers = async (req, res, next) => {
  // tanmoy

  console.log(req.body.start);
  console.log(req.body.end);

  // tanmoy

  try {
    // const file = xlsx.readFile("Customers.xlsx");
    // const worksheet = file.Sheets["Sheet1"];

    const jsonArray = [
      {
        "SlNo": 1,
        "Customer": "Subhra Pandey",
        "MobileNo": 8336812021,
        "FIELD4": ""
      },
      {
        "SlNo": 2,
        "Customer": " Tanu Mondal ",
        "MobileNo": 9330179018,
        "FIELD4": ""
      },
      {
        "SlNo": 3,
        "Customer": "Nandan Banerjee ",
        "MobileNo": 8697916642,
        "FIELD4": ""
      },
      {
        "SlNo": 4,
        "Customer": "Salome Paruy ",
        "MobileNo": 9830633443,
        "FIELD4": ""
      },
      {
        "SlNo": 5,
        "Customer": "A Mukherjee ",
        "MobileNo": 9955994825,
        "FIELD4": ""
      },
      {
        "SlNo": 6,
        "Customer": "A S Biswas ",
        "MobileNo": 9748648867,
        "FIELD4": ""
      },
      {
        "SlNo": 7,
        "Customer": "A Smidha ",
        "MobileNo": 9831096998,
        "FIELD4": ""
      },
      {
        "SlNo": 8,
        "Customer": "A S Paul ",
        "MobileNo": 7980826520,
        "FIELD4": ""
      },
      {
        "SlNo": 9,
        "Customer": "A K DAS ",
        "MobileNo": 9433498359,
        "FIELD4": ""
      },
      {
        "SlNo": 10,
        "Customer": "A K Patro ",
        "MobileNo": 9732386879,
        "FIELD4": ""
      },
      {
        "SlNo": 11,
        "Customer": "A K Anand ",
        "MobileNo": 7980223946,
        "FIELD4": ""
      },
      {
        "SlNo": 12,
        "Customer": "AYUSH KUMAR  ",
        "MobileNo": 7489822665,
        "FIELD4": ""
      },
      {
        "SlNo": 13,
        "Customer": "Abhijeet Chatterjee ",
        "MobileNo": 8369159863,
        "FIELD4": ""
      },
      {
        "SlNo": 14,
        "Customer": "ABHIJIT  ",
        "MobileNo": 9830440980,
        "FIELD4": ""
      },
      {
        "SlNo": 15,
        "Customer": "Abhinas ",
        "MobileNo": 8910954454,
        "FIELD4": ""
      },
      {
        "SlNo": 16,
        "Customer": "Abhirup Chatterjee ",
        "MobileNo": 9836745708,
        "FIELD4": ""
      },
      {
        "SlNo": 17,
        "Customer": "Abhisekh ",
        "MobileNo": 9330307446,
        "FIELD4": ""
      },
      {
        "SlNo": 18,
        "Customer": "ADI  ",
        "MobileNo": 6291492140,
        "FIELD4": ""
      },
      {
        "SlNo": 19,
        "Customer": "Ajay Giri ",
        "MobileNo": 9051228015,
        "FIELD4": ""
      },
      {
        "SlNo": 20,
        "Customer": "Akash ",
        "MobileNo": 6290057672,
        "FIELD4": ""
      },
      {
        "SlNo": 21,
        "Customer": "Akash Das ",
        "MobileNo": 8697958369,
        "FIELD4": ""
      },
      {
        "SlNo": 22,
        "Customer": "AKASH DEEP SAHA ",
        "MobileNo": 7003829492,
        "FIELD4": ""
      },
      {
        "SlNo": 23,
        "Customer": "Akash Dhara ",
        "MobileNo": 8240942221,
        "FIELD4": ""
      },
      {
        "SlNo": 24,
        "Customer": "ALOK HALDER ",
        "MobileNo": 8334027548,
        "FIELD4": ""
      },
      {
        "SlNo": 26,
        "Customer": "Alok Jha ",
        "MobileNo": 9883009990,
        "FIELD4": ""
      },
      {
        "SlNo": 27,
        "Customer": "Amit Chakrabarti ",
        "MobileNo": 8296315238,
        "FIELD4": ""
      },
      {
        "SlNo": 28,
        "Customer": "Amit Mal ",
        "MobileNo": 7003910458,
        "FIELD4": ""
      },
      {
        "SlNo": 29,
        "Customer": "Amitava Biswas ",
        "MobileNo": 9230844728,
        "FIELD4": ""
      },
      {
        "SlNo": 30,
        "Customer": "Anand ",
        "MobileNo": 8617362332,
        "FIELD4": ""
      },
      {
        "SlNo": 31,
        "Customer": "Anima Khatoon ",
        "MobileNo": 9331920918,
        "FIELD4": ""
      },
      {
        "SlNo": 32,
        "Customer": "ANIMITA NASKAR ",
        "MobileNo": 9836720168,
        "FIELD4": ""
      },
      {
        "SlNo": 33,
        "Customer": "Anindita Biswas ",
        "MobileNo": 6290597006,
        "FIELD4": ""
      },
      {
        "SlNo": 34,
        "Customer": "Anindo Kusan Naskar ",
        "MobileNo": 9163680024,
        "FIELD4": ""
      },
      {
        "SlNo": 35,
        "Customer": "Anion ",
        "MobileNo": 9339536695,
        "FIELD4": ""
      },
      {
        "SlNo": 36,
        "Customer": "Anup Dua  ",
        "MobileNo": 7003884597,
        "FIELD4": ""
      },
      {
        "SlNo": 37,
        "Customer": "ANUPAM  ",
        "MobileNo": 6290060697,
        "FIELD4": ""
      },
      {
        "SlNo": 38,
        "Customer": "Aparesh Chatterjee ",
        "MobileNo": 6289034759,
        "FIELD4": ""
      },
      {
        "SlNo": 39,
        "Customer": "APARNA CHAKRABORTY ",
        "MobileNo": 9831811583,
        "FIELD4": ""
      },
      {
        "SlNo": 40,
        "Customer": "APARNA KUNDU  ",
        "MobileNo": 9903107447,
        "FIELD4": ""
      },
      {
        "SlNo": 41,
        "Customer": "APOLLO PHARMACY ",
        "MobileNo": 8585022009,
        "FIELD4": ""
      },
      {
        "SlNo": 43,
        "Customer": "Somnath Bhowmik ",
        "MobileNo": 9830672716,
        "FIELD4": ""
      },
      {
        "SlNo": 44,
        "Customer": "APURBA PAUL ",
        "MobileNo": 8001732159,
        "FIELD4": ""
      },
      {
        "SlNo": 45,
        "Customer": "ARBIND DUBEY ",
        "MobileNo": 9874244210,
        "FIELD4": ""
      },
      {
        "SlNo": 46,
        "Customer": "Archina Kumari  ",
        "MobileNo": 9088199590,
        "FIELD4": ""
      },
      {
        "SlNo": 47,
        "Customer": "Archita Guha ",
        "MobileNo": 8910013723,
        "FIELD4": ""
      },
      {
        "SlNo": 48,
        "Customer": "Arindam Naru ",
        "MobileNo": 6289534595,
        "FIELD4": ""
      },
      {
        "SlNo": 50,
        "Customer": "Arjun Naskar  ",
        "MobileNo": 9804265413,
        "FIELD4": ""
      },
      {
        "SlNo": 51,
        "Customer": "Arthur Fernandez ",
        "MobileNo": 6290475424,
        "FIELD4": ""
      },
      {
        "SlNo": 52,
        "Customer": "ASHIM MAKHAL ",
        "MobileNo": 9433265071,
        "FIELD4": ""
      },
      {
        "SlNo": 53,
        "Customer": "Ashit Naskar  ",
        "MobileNo": 9903158198,
        "FIELD4": ""
      },
      {
        "SlNo": 54,
        "Customer": "Ashmita Das ",
        "MobileNo": 7005837944,
        "FIELD4": ""
      },
      {
        "SlNo": 55,
        "Customer": "Ashoke Mandal ",
        "MobileNo": 9231660646,
        "FIELD4": ""
      },
      {
        "SlNo": 56,
        "Customer": "Asoke Maity ",
        "MobileNo": 9830682093,
        "FIELD4": ""
      },
      {
        "SlNo": 57,
        "Customer": "Abhijit Bar ",
        "MobileNo": 9681212670,
        "FIELD4": ""
      },
      {
        "SlNo": 58,
        "Customer": "Avijit Karmakar ",
        "MobileNo": 9064876312,
        "FIELD4": ""
      },
      {
        "SlNo": 59,
        "Customer": "Avishek Das ",
        "MobileNo": 7605890730,
        "FIELD4": ""
      },
      {
        "SlNo": 60,
        "Customer": "Biswajit RUDHA  ",
        "MobileNo": 7439338408,
        "FIELD4": ""
      },
      {
        "SlNo": 61,
        "Customer": "B Chatterjee ",
        "MobileNo": 8777251368,
        "FIELD4": ""
      },
      {
        "SlNo": 62,
        "Customer": "BABLU BAR ",
        "MobileNo": 9830108554,
        "FIELD4": ""
      },
      {
        "SlNo": 63,
        "Customer": "BABLU CHOWDHURY ",
        "MobileNo": 8420547975,
        "FIELD4": ""
      },
      {
        "SlNo": 64,
        "Customer": "BABLU MUKHERJEE ",
        "MobileNo": 9836569351,
        "FIELD4": ""
      },
      {
        "SlNo": 65,
        "Customer": "BABU SAHA  ",
        "MobileNo": 9239424007,
        "FIELD4": ""
      },
      {
        "SlNo": 66,
        "Customer": "Tumpa Mondal ",
        "MobileNo": 6296423974,
        "FIELD4": ""
      },
      {
        "SlNo": 67,
        "Customer": "Bandana Mukherjee ",
        "MobileNo": 7003531557,
        "FIELD4": ""
      },
      {
        "SlNo": 68,
        "Customer": "Subhas Jana ",
        "MobileNo": 9679517037,
        "FIELD4": ""
      },
      {
        "SlNo": 69,
        "Customer": "BAPI  ",
        "MobileNo": 9163074277,
        "FIELD4": ""
      },
      {
        "SlNo": 70,
        "Customer": "BAPI ",
        "MobileNo": 9674625265,
        "FIELD4": ""
      },
      {
        "SlNo": 71,
        "Customer": "BAPI HALDER  ",
        "MobileNo": 9748615101,
        "FIELD4": ""
      },
      {
        "SlNo": 72,
        "Customer": "Bappa Halder ",
        "MobileNo": 8100234618,
        "FIELD4": ""
      },
      {
        "SlNo": 73,
        "Customer": "Barnali Mondal ",
        "MobileNo": 9051933175,
        "FIELD4": ""
      },
      {
        "SlNo": 74,
        "Customer": "Barnali Sardar ",
        "MobileNo": 9051998062,
        "FIELD4": ""
      },
      {
        "SlNo": 75,
        "Customer": "Basanti Barman ",
        "MobileNo": 6289193855,
        "FIELD4": ""
      },
      {
        "SlNo": 76,
        "Customer": "BASU SEN ",
        "MobileNo": 9331875363,
        "FIELD4": ""
      },
      {
        "SlNo": 77,
        "Customer": "TINA MAJUMDER ",
        "MobileNo": 8697101842,
        "FIELD4": ""
      },
      {
        "SlNo": 78,
        "Customer": "Aindrilla Sarkar ",
        "MobileNo": 6289999697,
        "FIELD4": ""
      },
      {
        "SlNo": 79,
        "Customer": "Ajay Kumar ",
        "MobileNo": 9088611627,
        "FIELD4": ""
      },
      {
        "SlNo": 81,
        "Customer": "Alok Rozario ",
        "MobileNo": 9007361991,
        "FIELD4": ""
      },
      {
        "SlNo": 82,
        "Customer": "Amar Gomes ",
        "MobileNo": 8001050875,
        "FIELD4": ""
      },
      {
        "SlNo": 84,
        "Customer": "Amit Chakraborty ",
        "MobileNo": 9733827667,
        "FIELD4": ""
      },
      {
        "SlNo": 85,
        "Customer": "Anthony Rozario ",
        "MobileNo": 8981328757,
        "FIELD4": ""
      },
      {
        "SlNo": 86,
        "Customer": "Arun Maity ",
        "MobileNo": 9933967636,
        "FIELD4": ""
      },
      {
        "SlNo": 87,
        "Customer": "Arunava Chakraborty ",
        "MobileNo": 9903977830,
        "FIELD4": ""
      },
      {
        "SlNo": 88,
        "Customer": "Asha Chacko ",
        "MobileNo": 8100652011,
        "FIELD4": ""
      },
      {
        "SlNo": 89,
        "Customer": "Asha Majhi ",
        "MobileNo": 9875339402,
        "FIELD4": ""
      },
      {
        "SlNo": 90,
        "Customer": "Asutosh Panja ",
        "MobileNo": 8981756941,
        "FIELD4": ""
      },
      {
        "SlNo": 91,
        "Customer": "Babita Das ",
        "MobileNo": 7686037594,
        "FIELD4": ""
      },
      {
        "SlNo": 92,
        "Customer": "Banasree Das ",
        "MobileNo": 9674325621,
        "FIELD4": ""
      },
      {
        "SlNo": 93,
        "Customer": "Bappa Das ",
        "MobileNo": 6289263896,
        "FIELD4": ""
      },
      {
        "SlNo": 94,
        "Customer": "Bhaskar Manna ",
        "MobileNo": 8336886469,
        "FIELD4": ""
      },
      {
        "SlNo": 95,
        "Customer": "BIMAL BISWAS ",
        "MobileNo": 6290566430,
        "FIELD4": ""
      },
      {
        "SlNo": 96,
        "Customer": "Binu Biswas ",
        "MobileNo": 9830478823,
        "FIELD4": ""
      },
      {
        "SlNo": 97,
        "Customer": "Biswajit Gomes ",
        "MobileNo": 7044147573,
        "FIELD4": ""
      },
      {
        "SlNo": 98,
        "Customer": "Chitra Gomes ",
        "MobileNo": 9831532395,
        "FIELD4": ""
      },
      {
        "SlNo": 99,
        "Customer": "DILIP KR PAUL  ",
        "MobileNo": 9874954280,
        "FIELD4": ""
      },
      {
        "SlNo": 100,
        "Customer": "Dipanwita Makhal ",
        "MobileNo": 9830575767,
        "FIELD4": ""
      },
      {
        "SlNo": 101,
        "Customer": "Josephine M Makhal ",
        "MobileNo": 9830987041,
        "FIELD4": ""
      },
      {
        "SlNo": 103,
        "Customer": "Joy Barui ",
        "MobileNo": 7439834047,
        "FIELD4": ""
      },
      {
        "SlNo": 104,
        "Customer": "Juliana Pasker ",
        "MobileNo": 8013694156,
        "FIELD4": ""
      },
      {
        "SlNo": 105,
        "Customer": "Kakoli Majumder(Nath) ",
        "MobileNo": 9123819802,
        "FIELD4": ""
      },
      {
        "SlNo": 106,
        "Customer": "Kartick Chandra Das  ",
        "MobileNo": 9874551174,
        "FIELD4": ""
      },
      {
        "SlNo": 107,
        "Customer": "Khokan Das ",
        "MobileNo": 9674519285,
        "FIELD4": ""
      },
      {
        "SlNo": 108,
        "Customer": "Laksmi Sardar ",
        "MobileNo": 9748665909,
        "FIELD4": ""
      },
      {
        "SlNo": 109,
        "Customer": "Lata Gomes ",
        "MobileNo": 9903333807,
        "FIELD4": ""
      },
      {
        "SlNo": 110,
        "Customer": "Lipika Bodhok ",
        "MobileNo": 9836346355,
        "FIELD4": ""
      },
      {
        "SlNo": 111,
        "Customer": "M Rozario ",
        "MobileNo": 7980066501,
        "FIELD4": ""
      },
      {
        "SlNo": 112,
        "Customer": "Madhuparna Das ",
        "MobileNo": 9830368465,
        "FIELD4": ""
      },
      {
        "SlNo": 113,
        "Customer": "Meeta Shaw ",
        "MobileNo": 9831366476,
        "FIELD4": ""
      },
      {
        "SlNo": 114,
        "Customer": "Moumita Das ",
        "MobileNo": 8101973578,
        "FIELD4": ""
      },
      {
        "SlNo": 115,
        "Customer": "Moumita Dhara ",
        "MobileNo": 7980341898,
        "FIELD4": ""
      },
      {
        "SlNo": 116,
        "Customer": "Moumita Pakhira ",
        "MobileNo": 9804052331,
        "FIELD4": ""
      },
      {
        "SlNo": 117,
        "Customer": "Muralidhari Das ",
        "MobileNo": 9903267956,
        "FIELD4": ""
      },
      {
        "SlNo": 118,
        "Customer": " ",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 119,
        "Customer": "N C Mishra ",
        "MobileNo": 9836191616,
        "FIELD4": ""
      },
      {
        "SlNo": 120,
        "Customer": "Nelson Gomes ",
        "MobileNo": 8017141572,
        "FIELD4": ""
      },
      {
        "SlNo": 122,
        "Customer": "Nisha Gomes ",
        "MobileNo": 9932903242,
        "FIELD4": ""
      },
      {
        "SlNo": 123,
        "Customer": "Nomita Biswas ",
        "MobileNo": 9073019200,
        "FIELD4": ""
      },
      {
        "SlNo": 124,
        "Customer": "Nomita Patra ",
        "MobileNo": 6291372432,
        "FIELD4": ""
      },
      {
        "SlNo": 125,
        "Customer": "Priya Banerjee ",
        "MobileNo": 9088240778,
        "FIELD4": ""
      },
      {
        "SlNo": 126,
        "Customer": "Priyanka Rojario ",
        "MobileNo": 8617790615,
        "FIELD4": ""
      },
      {
        "SlNo": 128,
        "Customer": "Priyanka Rojario (Rocky) ",
        "MobileNo": 9123015301,
        "FIELD4": ""
      },
      {
        "SlNo": 129,
        "Customer": "Purabi Das ",
        "MobileNo": 9830388602,
        "FIELD4": ""
      },
      {
        "SlNo": 130,
        "Customer": "Ratna Kar Paul ",
        "MobileNo": 9836613658,
        "FIELD4": ""
      },
      {
        "SlNo": 131,
        "Customer": "Riya Das ",
        "MobileNo": 7596841108,
        "FIELD4": ""
      },
      {
        "SlNo": 133,
        "Customer": "Robin Martin ",
        "MobileNo": 9831216920,
        "FIELD4": ""
      },
      {
        "SlNo": 134,
        "Customer": "Sandra Gomes ",
        "MobileNo": 9007805146,
        "FIELD4": ""
      },
      {
        "SlNo": 135,
        "Customer": "Santanu Sardar  ",
        "MobileNo": 6291393857,
        "FIELD4": ""
      },
      {
        "SlNo": 136,
        "Customer": "Santi Rodridgez ",
        "MobileNo": 9163773758,
        "FIELD4": ""
      },
      {
        "SlNo": 137,
        "Customer": "Santosh DeCosta ",
        "MobileNo": 9830642322,
        "FIELD4": ""
      },
      {
        "SlNo": 138,
        "Customer": "Santu Mukharjee ",
        "MobileNo": 9079067072,
        "FIELD4": ""
      },
      {
        "SlNo": 141,
        "Customer": "Sarmistha Naidu ",
        "MobileNo": 8902551398,
        "FIELD4": ""
      },
      {
        "SlNo": 142,
        "Customer": "Shamoli D Costa ",
        "MobileNo": 9903387236,
        "FIELD4": ""
      },
      {
        "SlNo": 143,
        "Customer": "Shubhankar Ghosh ",
        "MobileNo": 8617228960,
        "FIELD4": ""
      },
      {
        "SlNo": 144,
        "Customer": "Shyam Sahoo ",
        "MobileNo": 7604043334,
        "FIELD4": ""
      },
      {
        "SlNo": 146,
        "Customer": "Sima Sarkar ",
        "MobileNo": 9123973515,
        "FIELD4": ""
      },
      {
        "SlNo": 147,
        "Customer": "Sneha Mondal ",
        "MobileNo": 9830475971,
        "FIELD4": ""
      },
      {
        "SlNo": 148,
        "Customer": "Sourav Dutta ",
        "MobileNo": 9062063110,
        "FIELD4": ""
      },
      {
        "SlNo": 149,
        "Customer": "Sourav Dutta ",
        "MobileNo": 9804660688,
        "FIELD4": ""
      },
      {
        "SlNo": 150,
        "Customer": "Suhash Bepari ",
        "MobileNo": 9903010350,
        "FIELD4": ""
      },
      {
        "SlNo": 151,
        "Customer": "Sukla Barman ",
        "MobileNo": 9433308478,
        "FIELD4": ""
      },
      {
        "SlNo": 152,
        "Customer": "Swagata Maity ",
        "MobileNo": 9051725262,
        "FIELD4": ""
      },
      {
        "SlNo": 153,
        "Customer": "Swapna Roy ",
        "MobileNo": 9903221241,
        "FIELD4": ""
      },
      {
        "SlNo": 154,
        "Customer": "Tapasi Chakraborty ",
        "MobileNo": 9831191745,
        "FIELD4": ""
      },
      {
        "SlNo": 155,
        "Customer": "Tapasi Mondal ",
        "MobileNo": 7278747409,
        "FIELD4": ""
      },
      {
        "SlNo": 156,
        "Customer": "Uttam Mondal ",
        "MobileNo": 9830378911,
        "FIELD4": ""
      },
      {
        "SlNo": 157,
        "Customer": "Bhaswati Kumar ",
        "MobileNo": 7278746349,
        "FIELD4": ""
      },
      {
        "SlNo": 158,
        "Customer": "",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 159,
        "Customer": "BIBEKANDA BHATTARJEE",
        "MobileNo": 9830844307,
        "FIELD4": ""
      },
      {
        "SlNo": 160,
        "Customer": "BIDASH BANERJEE ",
        "MobileNo": 852389512,
        "FIELD4": "(incomplete Number)"
      },
      {
        "SlNo": 161,
        "Customer": "Bikash Ram ",
        "MobileNo": 8617763443,
        "FIELD4": ""
      },
      {
        "SlNo": 162,
        "Customer": "BINOD SHAW ",
        "MobileNo": 8585887722,
        "FIELD4": ""
      },
      {
        "SlNo": 163,
        "Customer": "Biplab Chakraborty ",
        "MobileNo": 9836126455,
        "FIELD4": ""
      },
      {
        "SlNo": 164,
        "Customer": "Biplab Majumdar ",
        "MobileNo": 9748184257,
        "FIELD4": ""
      },
      {
        "SlNo": 165,
        "Customer": "Rocky Francis ",
        "MobileNo": 7003693120,
        "FIELD4": ""
      },
      {
        "SlNo": 166,
        "Customer": "BISWAJIT  ",
        "MobileNo": 7003157990,
        "FIELD4": ""
      },
      {
        "SlNo": 167,
        "Customer": "Biswajit ",
        "MobileNo": 9836508731,
        "FIELD4": ""
      },
      {
        "SlNo": 168,
        "Customer": "Biswajit Chaterjee ",
        "MobileNo": 9903165856,
        "FIELD4": ""
      },
      {
        "SlNo": 169,
        "Customer": "Biswajit Mondal ",
        "MobileNo": 9874829347,
        "FIELD4": ""
      },
      {
        "SlNo": 170,
        "Customer": "BITTU  ",
        "MobileNo": 7003631375,
        "FIELD4": ""
      },
      {
        "SlNo": 171,
        "Customer": "Bittu ",
        "MobileNo": 8310984692,
        "FIELD4": ""
      },
      {
        "SlNo": 172,
        "Customer": "BPG R Biswas ",
        "MobileNo": 9883601351,
        "FIELD4": ""
      },
      {
        "SlNo": 173,
        "Customer": "Bre  Reynolds ",
        "MobileNo": 8910507456,
        "FIELD4": ""
      },
      {
        "SlNo": 174,
        "Customer": "Brihaspoti  ",
        "MobileNo": 7797177217,
        "FIELD4": ""
      },
      {
        "SlNo": 175,
        "Customer": "Brisnupada Majumdar  ",
        "MobileNo": 9836547186,
        "FIELD4": ""
      },
      {
        "SlNo": 176,
        "Customer": "CHANCHAL DAS  ",
        "MobileNo": 9123332439,
        "FIELD4": ""
      },
      {
        "SlNo": 177,
        "Customer": "CHANDA DAS  ",
        "MobileNo": 8582902875,
        "FIELD4": ""
      },
      {
        "SlNo": 178,
        "Customer": "Chandan Kr Doloi ",
        "MobileNo": 9432150297,
        "FIELD4": ""
      },
      {
        "SlNo": 179,
        "Customer": "CHANDAN KR. DOLOI ",
        "MobileNo": 8697483999,
        "FIELD4": ""
      },
      {
        "SlNo": 180,
        "Customer": "CHANDANA DEY  ",
        "MobileNo": 8910977707,
        "FIELD4": ""
      },
      {
        "SlNo": 181,
        "Customer": "Chandana Mondal  ",
        "MobileNo": 8100620897,
        "FIELD4": ""
      },
      {
        "SlNo": 182,
        "Customer": "CHITRARANJAN DAS  ",
        "MobileNo": 9163491047,
        "FIELD4": ""
      },
      {
        "SlNo": 183,
        "Customer": "D Das ",
        "MobileNo": 9433942123,
        "FIELD4": ""
      },
      {
        "SlNo": 184,
        "Customer": "D. ADHIKARY  ",
        "MobileNo": 8902696341,
        "FIELD4": ""
      },
      {
        "SlNo": 185,
        "Customer": "D. MONDAL  ",
        "MobileNo": 903470868,
        "FIELD4": "(incomplete Number)"
      },
      {
        "SlNo": 186,
        "Customer": "D.roy ",
        "MobileNo": 9038791010,
        "FIELD4": ""
      },
      {
        "SlNo": 187,
        "Customer": "Debabrata Mondal ",
        "MobileNo": 8697158275,
        "FIELD4": ""
      },
      {
        "SlNo": 188,
        "Customer": "Debaroti Choudhuri ",
        "MobileNo": 7278319099,
        "FIELD4": ""
      },
      {
        "SlNo": 189,
        "Customer": "Debashree ",
        "MobileNo": 7406355478,
        "FIELD4": ""
      },
      {
        "SlNo": 190,
        "Customer": "Debasish Rong ",
        "MobileNo": 9038571914,
        "FIELD4": ""
      },
      {
        "SlNo": 191,
        "Customer": "DEBDANI MALIK  ",
        "MobileNo": 6290816081,
        "FIELD4": ""
      },
      {
        "SlNo": 192,
        "Customer": "Debhashis Bera ",
        "MobileNo": 9932606308,
        "FIELD4": ""
      },
      {
        "SlNo": 193,
        "Customer": "",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 195,
        "Customer": "",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 196,
        "Customer": "DILIP KUMAR  ",
        "MobileNo": 9830915599,
        "FIELD4": ""
      },
      {
        "SlNo": 197,
        "Customer": "DILIP SAHA ",
        "MobileNo": 9163145878,
        "FIELD4": ""
      },
      {
        "SlNo": 198,
        "Customer": "Din Dayal  ",
        "MobileNo": 9163766334,
        "FIELD4": ""
      },
      {
        "SlNo": 199,
        "Customer": "DIPALI ",
        "MobileNo": 9163653246,
        "FIELD4": ""
      },
      {
        "SlNo": 200,
        "Customer": "Dipali Mandal ",
        "MobileNo": 9836264760,
        "FIELD4": ""
      },
      {
        "SlNo": 201,
        "Customer": "Dipankar Mondal ",
        "MobileNo": 9239291888,
        "FIELD4": ""
      },
      {
        "SlNo": 202,
        "Customer": "Dipendu Narayan Choudhury ",
        "MobileNo": 8257771165,
        "FIELD4": ""
      },
      {
        "SlNo": 203,
        "Customer": "DIPIKLA ROY  ",
        "MobileNo": 9883222188,
        "FIELD4": ""
      },
      {
        "SlNo": 204,
        "Customer": "Dipshikha Mondal ",
        "MobileNo": 7439187771,
        "FIELD4": ""
      },
      {
        "SlNo": 205,
        "Customer": "Domset Samol ",
        "MobileNo": 8240252439,
        "FIELD4": ""
      },
      {
        "SlNo": 206,
        "Customer": "DEBOBROTO CHOUDHURY  ",
        "MobileNo": 9874136087,
        "FIELD4": ""
      },
      {
        "SlNo": 207,
        "Customer": "P.K MAITY  ",
        "MobileNo": 9330172012,
        "FIELD4": ""
      },
      {
        "SlNo": 208,
        "Customer": "BK Ghosh ",
        "MobileNo": 7024611333,
        "FIELD4": ""
      },
      {
        "SlNo": 209,
        "Customer": "Shayan Ghosh Dastidar",
        "MobileNo": 9482900905,
        "FIELD4": ""
      },
      {
        "SlNo": 210,
        "Customer": "DRINI GHOSH  ",
        "MobileNo": 8240198414,
        "FIELD4": ""
      },
      {
        "SlNo": 211,
        "Customer": "Amitava Sen ",
        "MobileNo": 9674863046,
        "FIELD4": ""
      },
      {
        "SlNo": 213,
        "Customer": "Arundhuti Mishra ",
        "MobileNo": 8910912778,
        "FIELD4": ""
      },
      {
        "SlNo": 214,
        "Customer": "Chayanika Das Gupta ",
        "MobileNo": 9830121355,
        "FIELD4": ""
      },
      {
        "SlNo": 215,
        "Customer": "Justin Liebenhals ",
        "MobileNo": 9874244465,
        "FIELD4": ""
      },
      {
        "SlNo": 216,
        "Customer": "Shukla Burman ",
        "MobileNo": 7439974770,
        "FIELD4": ""
      },
      {
        "SlNo": 217,
        "Customer": "Soumitra Dutta ",
        "MobileNo": 9874470174,
        "FIELD4": ""
      },
      {
        "SlNo": 218,
        "Customer": "Srijanee Moitra ",
        "MobileNo": 7259211119,
        "FIELD4": ""
      },
      {
        "SlNo": 219,
        "Customer": "Srijit ",
        "MobileNo": 8297410286,
        "FIELD4": ""
      },
      {
        "SlNo": 220,
        "Customer": "Duben  ",
        "MobileNo": 9433795024,
        "FIELD4": ""
      },
      {
        "SlNo": 221,
        "Customer": "Dulal Chaterjee ",
        "MobileNo": 7980673933,
        "FIELD4": ""
      },
      {
        "SlNo": 222,
        "Customer": "Dibakar Mondal ",
        "MobileNo": 9681710630,
        "FIELD4": ""
      },
      {
        "SlNo": 224,
        "Customer": "S M Banerjee ",
        "MobileNo": 9893547959,
        "FIELD4": ""
      },
      {
        "SlNo": 225,
        "Customer": "Ekaparna De Sarkar ",
        "MobileNo": 9874010170,
        "FIELD4": ""
      },
      {
        "SlNo": 226,
        "Customer": "Ritu Gupta ",
        "MobileNo": 6291108846,
        "FIELD4": ""
      },
      {
        "SlNo": 227,
        "Customer": "Rupam Das ",
        "MobileNo": 9830977646,
        "FIELD4": ""
      },
      {
        "SlNo": 228,
        "Customer": "Barnali Sen ",
        "MobileNo": 9674483062,
        "FIELD4": ""
      },
      {
        "SlNo": 229,
        "Customer": "Prosenjit Baxi ",
        "MobileNo": 9830360555,
        "FIELD4": ""
      },
      {
        "SlNo": 230,
        "Customer": "Sunita Rani Mullick ",
        "MobileNo": 7003617228,
        "FIELD4": ""
      },
      {
        "SlNo": 231,
        "Customer": "Tanushree ",
        "MobileNo": 9836287552,
        "FIELD4": ""
      },
      {
        "SlNo": 233,
        "Customer": "ADESH Srivastav ",
        "MobileNo": 7447070487,
        "FIELD4": ""
      },
      {
        "SlNo": 234,
        "Customer": "Amit Roy ",
        "MobileNo": 9674900102,
        "FIELD4": ""
      },
      {
        "SlNo": 236,
        "Customer": "Bhavesh Agarwal ",
        "MobileNo": 9831069258,
        "FIELD4": ""
      },
      {
        "SlNo": 237,
        "Customer": "D K Sarkar ",
        "MobileNo": 9434539350,
        "FIELD4": ""
      },
      {
        "SlNo": 239,
        "Customer": "Debashis Purokayashta ",
        "MobileNo": 9431645439,
        "FIELD4": ""
      },
      {
        "SlNo": 240,
        "Customer": "Deboyjit ",
        "MobileNo": 7666981086,
        "FIELD4": ""
      },
      {
        "SlNo": 242,
        "Customer": "Dhara Meghani ",
        "MobileNo": 9874131010,
        "FIELD4": ""
      },
      {
        "SlNo": 243,
        "Customer": "Dipali Bose ",
        "MobileNo": 9088354651,
        "FIELD4": ""
      },
      {
        "SlNo": 245,
        "Customer": "Gitanjali Shaw ",
        "MobileNo": 7988612220,
        "FIELD4": ""
      },
      {
        "SlNo": 248,
        "Customer": "Gopa Guha ",
        "MobileNo": 9836486942,
        "FIELD4": ""
      },
      {
        "SlNo": 249,
        "Customer": "Jyotirmoy Chowdhury ",
        "MobileNo": 8017598310,
        "FIELD4": ""
      },
      {
        "SlNo": 250,
        "Customer": "K C Niyogi ",
        "MobileNo": 9433795962,
        "FIELD4": ""
      },
      {
        "SlNo": 251,
        "Customer": "Kakuli Dutta ",
        "MobileNo": 8486080856,
        "FIELD4": ""
      },
      {
        "SlNo": 252,
        "Customer": "Krishna Ghosh ",
        "MobileNo": 9830944107,
        "FIELD4": ""
      },
      {
        "SlNo": 253,
        "Customer": "M K Ghosh ",
        "MobileNo": 9674259783,
        "FIELD4": ""
      },
      {
        "SlNo": 255,
        "Customer": "Mandira Nath ",
        "MobileNo": 8902446065,
        "FIELD4": ""
      },
      {
        "SlNo": 257,
        "Customer": "Moutusi Chatterjee ",
        "MobileNo": 8013879174,
        "FIELD4": ""
      },
      {
        "SlNo": 258,
        "Customer": "N K Chackraborty ",
        "MobileNo": 9831056796,
        "FIELD4": ""
      },
      {
        "SlNo": 259,
        "Customer": "Nilam ",
        "MobileNo": 8961873879,
        "FIELD4": ""
      },
      {
        "SlNo": 260,
        "Customer": "Priya Dutta ",
        "MobileNo": 9774333260,
        "FIELD4": ""
      },
      {
        "SlNo": 261,
        "Customer": "Rajat Sen ",
        "MobileNo": 9830183062,
        "FIELD4": ""
      },
      {
        "SlNo": 262,
        "Customer": "Rishi Gorai ",
        "MobileNo": 9831222740,
        "FIELD4": ""
      },
      {
        "SlNo": 263,
        "Customer": "Samar Pattanayak ",
        "MobileNo": 8910651981,
        "FIELD4": ""
      },
      {
        "SlNo": 266,
        "Customer": "Sumedha Basu ",
        "MobileNo": 9631188859,
        "FIELD4": ""
      },
      {
        "SlNo": 267,
        "Customer": "Abhijit Chakraborty ",
        "MobileNo": 9432955380,
        "FIELD4": ""
      },
      {
        "SlNo": 269,
        "Customer": "Rita Mazumder ",
        "MobileNo": 9433852457,
        "FIELD4": ""
      },
      {
        "SlNo": 270,
        "Customer": "A Choudhury ",
        "MobileNo": 8017516174,
        "FIELD4": ""
      },
      {
        "SlNo": 271,
        "Customer": "A N Karali ",
        "MobileNo": 9163411949,
        "FIELD4": ""
      },
      {
        "SlNo": 273,
        "Customer": "Aditee Jha ",
        "MobileNo": 9830162092,
        "FIELD4": ""
      },
      {
        "SlNo": 276,
        "Customer": "Alok Dutta ",
        "MobileNo": 9735043748,
        "FIELD4": ""
      },
      {
        "SlNo": 277,
        "Customer": "Ambarish Sanyal ",
        "MobileNo": 9871654727,
        "FIELD4": ""
      },
      {
        "SlNo": 278,
        "Customer": "Amit Dutta ",
        "MobileNo": 7384428117,
        "FIELD4": ""
      },
      {
        "SlNo": 279,
        "Customer": "ANITA BAJAJ ",
        "MobileNo": 7980650133,
        "FIELD4": ""
      },
      {
        "SlNo": 280,
        "Customer": "Annesha Dutta ",
        "MobileNo": 7338491974,
        "FIELD4": ""
      },
      {
        "SlNo": 281,
        "Customer": "Archana Singh ",
        "MobileNo": 7903757305,
        "FIELD4": ""
      },
      {
        "SlNo": 282,
        "Customer": "Arnab Basu ",
        "MobileNo": 9051930093,
        "FIELD4": ""
      },
      {
        "SlNo": 283,
        "Customer": "Arnab Majumdar ",
        "MobileNo": 7044112813,
        "FIELD4": ""
      },
      {
        "SlNo": 284,
        "Customer": "Arpita Chowdhury Dutta ",
        "MobileNo": 9641619787,
        "FIELD4": ""
      },
      {
        "SlNo": 285,
        "Customer": "Aruna Sarkar ",
        "MobileNo": 9674114781,
        "FIELD4": ""
      },
      {
        "SlNo": 286,
        "Customer": "Banani Dutta ",
        "MobileNo": 9073243535,
        "FIELD4": ""
      },
      {
        "SlNo": 287,
        "Customer": "Claudia Gonsalves ",
        "MobileNo": 9831201306,
        "FIELD4": ""
      },
      {
        "SlNo": 289,
        "Customer": "GL Hissaria ",
        "MobileNo": 9339853002,
        "FIELD4": ""
      },
      {
        "SlNo": 290,
        "Customer": "Indraneel Dutta ",
        "MobileNo": 7278537888,
        "FIELD4": ""
      },
      {
        "SlNo": 291,
        "Customer": "Ipshita Mondal ",
        "MobileNo": 9679798507,
        "FIELD4": ""
      },
      {
        "SlNo": 292,
        "Customer": "Jay Kishan Bajaj ",
        "MobileNo": 8229944400,
        "FIELD4": ""
      },
      {
        "SlNo": 293,
        "Customer": "Jay Kumar ",
        "MobileNo": 7907183647,
        "FIELD4": ""
      },
      {
        "SlNo": 294,
        "Customer": "Jayeeta Chatterjee  ",
        "MobileNo": 9073775659,
        "FIELD4": ""
      },
      {
        "SlNo": 296,
        "Customer": "Jayita Chakraborty ",
        "MobileNo": 9867304776,
        "FIELD4": ""
      },
      {
        "SlNo": 297,
        "Customer": "Kanaklata ",
        "MobileNo": 9110099675,
        "FIELD4": ""
      },
      {
        "SlNo": 298,
        "Customer": "Kanakmoy Sarkar ",
        "MobileNo": 8001900561,
        "FIELD4": ""
      },
      {
        "SlNo": 299,
        "Customer": "Kaushik ",
        "MobileNo": 8334032714,
        "FIELD4": ""
      },
      {
        "SlNo": 300,
        "Customer": "Leena Vasundhara ",
        "MobileNo": 9007126810,
        "FIELD4": ""
      },
      {
        "SlNo": 301,
        "Customer": "Lipika Chatterjee ",
        "MobileNo": 9051495421,
        "FIELD4": ""
      },
      {
        "SlNo": 302,
        "Customer": "Mandira Saha ",
        "MobileNo": 9832886094,
        "FIELD4": ""
      },
      {
        "SlNo": 303,
        "Customer": "Manoj Kumar Das ",
        "MobileNo": 9631659540,
        "FIELD4": ""
      },
      {
        "SlNo": 304,
        "Customer": "Moitreyee Roy ",
        "MobileNo": 9874678211,
        "FIELD4": ""
      },
      {
        "SlNo": 305,
        "Customer": "NABIN Hissaria ",
        "MobileNo": 7278663587,
        "FIELD4": ""
      },
      {
        "SlNo": 306,
        "Customer": "P Chakraborty  ",
        "MobileNo": 8900167176,
        "FIELD4": ""
      },
      {
        "SlNo": 308,
        "Customer": "Pabitra Sarkar ",
        "MobileNo": 9824451012,
        "FIELD4": ""
      },
      {
        "SlNo": 309,
        "Customer": "Pika Ghosal ",
        "MobileNo": 9434743712,
        "FIELD4": ""
      },
      {
        "SlNo": 310,
        "Customer": "Rajiv Rao ",
        "MobileNo": 8902198129,
        "FIELD4": ""
      },
      {
        "SlNo": 311,
        "Customer": "Ranju Choudhry ",
        "MobileNo": 9962450563,
        "FIELD4": ""
      },
      {
        "SlNo": 315,
        "Customer": "Rina Bhowmick ",
        "MobileNo": 9874429969,
        "FIELD4": ""
      },
      {
        "SlNo": 316,
        "Customer": "S Samadder ",
        "MobileNo": 9771431439,
        "FIELD4": ""
      },
      {
        "SlNo": 318,
        "Customer": "Samrat Dasgupta ",
        "MobileNo": 9051574108,
        "FIELD4": ""
      },
      {
        "SlNo": 319,
        "Customer": "Sarmista Accharya ",
        "MobileNo": 9432328591,
        "FIELD4": ""
      },
      {
        "SlNo": 320,
        "Customer": "Simran Choudhury ",
        "MobileNo": 9507554915,
        "FIELD4": ""
      },
      {
        "SlNo": 321,
        "Customer": "Soma Boral ",
        "MobileNo": 9231502314,
        "FIELD4": ""
      },
      {
        "SlNo": 322,
        "Customer": "Sonia Sharma ",
        "MobileNo": 9830826922,
        "FIELD4": ""
      },
      {
        "SlNo": 324,
        "Customer": "Subhashish Bastia ",
        "MobileNo": 9831072191,
        "FIELD4": ""
      },
      {
        "SlNo": 326,
        "Customer": "Subhasish Dey ",
        "MobileNo": 8981071741,
        "FIELD4": ""
      },
      {
        "SlNo": 328,
        "Customer": "Sumana Saha ",
        "MobileNo": 8617264250,
        "FIELD4": ""
      },
      {
        "SlNo": 329,
        "Customer": "Sundar Mahesh ",
        "MobileNo": 8017173210,
        "FIELD4": ""
      },
      {
        "SlNo": 330,
        "Customer": "Tumpa Mukherjee ",
        "MobileNo": 9831167097,
        "FIELD4": ""
      },
      {
        "SlNo": 331,
        "Customer": "BijoyDey ",
        "MobileNo": 9547622727,
        "FIELD4": ""
      },
      {
        "SlNo": 332,
        "Customer": "Viswanathan ",
        "MobileNo": 9830638059,
        "FIELD4": ""
      },
      {
        "SlNo": 333,
        "Customer": "Tanmoy Mallik ",
        "MobileNo": 7980969844,
        "FIELD4": ""
      },
      {
        "SlNo": 334,
        "Customer": "G C  Saha  ",
        "MobileNo": 9836684627,
        "FIELD4": ""
      },
      {
        "SlNo": 335,
        "Customer": "G Sidhanta ",
        "MobileNo": 9674782131,
        "FIELD4": ""
      },
      {
        "SlNo": 336,
        "Customer": "Ganesh Gupta ",
        "MobileNo": 9903345601,
        "FIELD4": ""
      },
      {
        "SlNo": 337,
        "Customer": "Gitanjali  ",
        "MobileNo": 7988612220,
        "FIELD4": ""
      },
      {
        "SlNo": 338,
        "Customer": "GOPAL Mondal ",
        "MobileNo": 8335894805,
        "FIELD4": ""
      },
      {
        "SlNo": 339,
        "Customer": "GOUR CHANDRA GIRI ",
        "MobileNo": 9836555875,
        "FIELD4": ""
      },
      {
        "SlNo": 340,
        "Customer": "Gracin ",
        "MobileNo": 7479413706,
        "FIELD4": ""
      },
      {
        "SlNo": 341,
        "Customer": "GRACY ",
        "MobileNo": 7471413706,
        "FIELD4": ""
      },
      {
        "SlNo": 342,
        "Customer": "H Ganguly ",
        "MobileNo": 8777850863,
        "FIELD4": ""
      },
      {
        "SlNo": 343,
        "Customer": "H ROY",
        "MobileNo": 9830887925,
        "FIELD4": ""
      },
      {
        "SlNo": 344,
        "Customer": "Harekrishna  ",
        "MobileNo": 9903149437,
        "FIELD4": ""
      },
      {
        "SlNo": 345,
        "Customer": "Puja Chakrabarty ",
        "MobileNo": 8240632371,
        "FIELD4": ""
      },
      {
        "SlNo": 346,
        "Customer": "Samsher Laskar ",
        "MobileNo": 9831599718,
        "FIELD4": ""
      },
      {
        "SlNo": 347,
        "Customer": "HIMANSHU ",
        "MobileNo": 9748495714,
        "FIELD4": ""
      },
      {
        "SlNo": 348,
        "Customer": "Honda Madhumita Debnath ",
        "MobileNo": 7044134412,
        "FIELD4": ""
      },
      {
        "SlNo": 349,
        "Customer": "Hotel Dhaba ",
        "MobileNo": 9874559745,
        "FIELD4": ""
      },
      {
        "SlNo": 350,
        "Customer": "Hridoy ",
        "MobileNo": 8276832825,
        "FIELD4": ""
      },
      {
        "SlNo": 351,
        "Customer": "Indrajit Mukherjee ",
        "MobileNo": 842088020,
        "FIELD4": ""
      },
      {
        "SlNo": 352,
        "Customer": "Indrajit ",
        "MobileNo": 9073976514,
        "FIELD4": ""
      },
      {
        "SlNo": 353,
        "Customer": "IRTA SINGH ",
        "MobileNo": 8287020488,
        "FIELD4": ""
      },
      {
        "SlNo": 354,
        "Customer": "J CHOUDHURY  ",
        "MobileNo": 9237582052,
        "FIELD4": ""
      },
      {
        "SlNo": 355,
        "Customer": "J CHOUDHURY  ",
        "MobileNo": 9937457580,
        "FIELD4": ""
      },
      {
        "SlNo": 356,
        "Customer": "J Gomes ",
        "MobileNo": 9836143938,
        "FIELD4": ""
      },
      {
        "SlNo": 357,
        "Customer": "Jaya Biswas",
        "MobileNo": 9051968101,
        "FIELD4": ""
      },
      {
        "SlNo": 358,
        "Customer": "JAYANTA DASGUPTA  ",
        "MobileNo": 8777247687,
        "FIELD4": ""
      },
      {
        "SlNo": 359,
        "Customer": "Jayanta Guho Roy ",
        "MobileNo": 8371881543,
        "FIELD4": ""
      },
      {
        "SlNo": 360,
        "Customer": "Jhumki Roy ",
        "MobileNo": 9831252544,
        "FIELD4": ""
      },
      {
        "SlNo": 361,
        "Customer": "Jolly mondal ",
        "MobileNo": 9007309007,
        "FIELD4": ""
      },
      {
        "SlNo": 362,
        "Customer": "Jonti Singh ",
        "MobileNo": 7044755891,
        "FIELD4": ""
      },
      {
        "SlNo": 363,
        "Customer": "Joy Rojario ",
        "MobileNo": 8697227827,
        "FIELD4": ""
      },
      {
        "SlNo": 364,
        "Customer": "Joyanta Ganguly ",
        "MobileNo": 9836477407,
        "FIELD4": ""
      },
      {
        "SlNo": 365,
        "Customer": "Juhi Sarkar ",
        "MobileNo": 9051295453,
        "FIELD4": ""
      },
      {
        "SlNo": 366,
        "Customer": "Juhi Singh ",
        "MobileNo": 9836382376,
        "FIELD4": ""
      },
      {
        "SlNo": 367,
        "Customer": "Jutika Jana ",
        "MobileNo": 7890095907,
        "FIELD4": ""
      },
      {
        "SlNo": 368,
        "Customer": "Jyota Mondal ",
        "MobileNo": 6290348618,
        "FIELD4": ""
      },
      {
        "SlNo": 369,
        "Customer": "K Mondal ",
        "MobileNo": 9830614803,
        "FIELD4": ""
      },
      {
        "SlNo": 370,
        "Customer": "K GHOSH ",
        "MobileNo": 9830087561,
        "FIELD4": ""
      },
      {
        "SlNo": 371,
        "Customer": "K K Sur",
        "MobileNo": 9339455738,
        "FIELD4": ""
      },
      {
        "SlNo": 372,
        "Customer": "K Mondal ",
        "MobileNo": 9830468751,
        "FIELD4": ""
      },
      {
        "SlNo": 373,
        "Customer": "Kailash Jha ",
        "MobileNo": 7003702322,
        "FIELD4": ""
      },
      {
        "SlNo": 374,
        "Customer": "KAJAL PAL ",
        "MobileNo": 9038981505,
        "FIELD4": ""
      },
      {
        "SlNo": 375,
        "Customer": "KAKALI JANA  ",
        "MobileNo": 9830536520,
        "FIELD4": ""
      },
      {
        "SlNo": 376,
        "Customer": "KALAYN CHAROBORTY  ",
        "MobileNo": 9903878599,
        "FIELD4": ""
      },
      {
        "SlNo": 378,
        "Customer": "Kali Singh ",
        "MobileNo": 9903168386,
        "FIELD4": ""
      },
      {
        "SlNo": 379,
        "Customer": "KALLOL KISHU  ",
        "MobileNo": 8582959443,
        "FIELD4": ""
      },
      {
        "SlNo": 380,
        "Customer": "kaloni ",
        "MobileNo": 9999640922,
        "FIELD4": ""
      },
      {
        "SlNo": 381,
        "Customer": "kalu sk ",
        "MobileNo": 9831328382,
        "FIELD4": ""
      },
      {
        "SlNo": 382,
        "Customer": "KAMAL SINHA  ",
        "MobileNo": 8240084046,
        "FIELD4": ""
      },
      {
        "SlNo": 383,
        "Customer": "KANIKA  ",
        "MobileNo": 8902568737,
        "FIELD4": ""
      },
      {
        "SlNo": 384,
        "Customer": "KAUSIK CHAKROBORTY  ",
        "MobileNo": 8240322399,
        "FIELD4": ""
      },
      {
        "SlNo": 385,
        "Customer": "  Apurba Gupta ",
        "MobileNo": 9830232013,
        "FIELD4": ""
      },
      {
        "SlNo": 386,
        "Customer": "Bipasha Patra ",
        "MobileNo": 9230267166,
        "FIELD4": ""
      },
      {
        "SlNo": 387,
        "Customer": "Disha Ghatak ",
        "MobileNo": 7980075887,
        "FIELD4": ""
      },
      {
        "SlNo": 388,
        "Customer": " Goutam Mondal ",
        "MobileNo": 8617262017,
        "FIELD4": ""
      },
      {
        "SlNo": 389,
        "Customer": "Isha Diaz ",
        "MobileNo": 8585808031,
        "FIELD4": ""
      },
      {
        "SlNo": 390,
        "Customer": "Manika Hait ",
        "MobileNo": 6291848659,
        "FIELD4": ""
      },
      {
        "SlNo": 391,
        "Customer": "Moumita Nag Chouwdhuri ",
        "MobileNo": 8777573295,
        "FIELD4": ""
      },
      {
        "SlNo": 392,
        "Customer": "Puja Rong ",
        "MobileNo": 8697431729,
        "FIELD4": ""
      },
      {
        "SlNo": 393,
        "Customer": "Ria Pal Das",
        "MobileNo": 8777640221,
        "FIELD4": ""
      },
      {
        "SlNo": 394,
        "Customer": "Sangeeta Biswas ",
        "MobileNo": 8777483757,
        "FIELD4": ""
      },
      {
        "SlNo": 395,
        "Customer": "Soumadip Mondal ",
        "MobileNo": 7278477243,
        "FIELD4": ""
      },
      {
        "SlNo": 396,
        "Customer": "Sukanya Mitra ",
        "MobileNo": 9073049412,
        "FIELD4": ""
      },
      {
        "SlNo": 397,
        "Customer": "Tiyasha Dhara ",
        "MobileNo": 9674608571,
        "FIELD4": ""
      },
      {
        "SlNo": 398,
        "Customer": "A Mondal ",
        "MobileNo": 9123855758,
        "FIELD4": ""
      },
      {
        "SlNo": 399,
        "Customer": "A Dasgupta ",
        "MobileNo": 9007056977,
        "FIELD4": ""
      },
      {
        "SlNo": 400,
        "Customer": "Abhi ",
        "MobileNo": 7439060234,
        "FIELD4": ""
      },
      {
        "SlNo": 401,
        "Customer": "Abhijit Dhara ",
        "MobileNo": 9732045816,
        "FIELD4": ""
      },
      {
        "SlNo": 402,
        "Customer": "Abhisek Gupta ",
        "MobileNo": 8582884770,
        "FIELD4": ""
      },
      {
        "SlNo": 403,
        "Customer": "Abhishek Bhattacharya ",
        "MobileNo": 9163524650,
        "FIELD4": ""
      },
      {
        "SlNo": 404,
        "Customer": "Adhikari Brothers ",
        "MobileNo": 9903277100,
        "FIELD4": ""
      },
      {
        "SlNo": 405,
        "Customer": "Aditya ",
        "MobileNo": 9123369267,
        "FIELD4": ""
      },
      {
        "SlNo": 406,
        "Customer": "Akash Tesra ",
        "MobileNo": 9874012807,
        "FIELD4": ""
      },
      {
        "SlNo": 407,
        "Customer": "Alice Wincent ",
        "MobileNo": 9933846929,
        "FIELD4": ""
      },
      {
        "SlNo": 409,
        "Customer": "Ambika Malviya ",
        "MobileNo": 8017798745,
        "FIELD4": ""
      },
      {
        "SlNo": 411,
        "Customer": "Amrita Makhal ",
        "MobileNo": 9123952177,
        "FIELD4": ""
      },
      {
        "SlNo": 412,
        "Customer": "Anjali Lakra ",
        "MobileNo": 9051541230,
        "FIELD4": ""
      },
      {
        "SlNo": 413,
        "Customer": "Ankita Mondol ",
        "MobileNo": 8420435143,
        "FIELD4": ""
      },
      {
        "SlNo": 414,
        "Customer": "Anshuman Das ",
        "MobileNo": 8584994545,
        "FIELD4": ""
      },
      {
        "SlNo": 415,
        "Customer": "Anuradha Chowdhury ",
        "MobileNo": 9330831189,
        "FIELD4": ""
      },
      {
        "SlNo": 416,
        "Customer": "Anuradha Naskar  ",
        "MobileNo": 9038156926,
        "FIELD4": ""
      },
      {
        "SlNo": 417,
        "Customer": "Anusri Das ",
        "MobileNo": 8420139058,
        "FIELD4": ""
      },
      {
        "SlNo": 418,
        "Customer": "Aparna Dey ",
        "MobileNo": 8583838017,
        "FIELD4": ""
      },
      {
        "SlNo": 419,
        "Customer": "Aparna Sarkar ",
        "MobileNo": 9432190628,
        "FIELD4": ""
      },
      {
        "SlNo": 421,
        "Customer": "Apu Biswas ",
        "MobileNo": 7003884548,
        "FIELD4": ""
      },
      {
        "SlNo": 422,
        "Customer": "Arka Mukherjee ",
        "MobileNo": 8017102924,
        "FIELD4": ""
      },
      {
        "SlNo": 423,
        "Customer": "Atanu Pramanik ",
        "MobileNo": 6291505905,
        "FIELD4": ""
      },
      {
        "SlNo": 424,
        "Customer": "Babita Agarwal ",
        "MobileNo": 9123326259,
        "FIELD4": ""
      },
      {
        "SlNo": 425,
        "Customer": "Basanti Sen ",
        "MobileNo": 8276839670,
        "FIELD4": ""
      },
      {
        "SlNo": 426,
        "Customer": "Bhaskar Dey ",
        "MobileNo": 9433440299,
        "FIELD4": ""
      },
      {
        "SlNo": 427,
        "Customer": "Bhumi karmakar  ",
        "MobileNo": 6289821429,
        "FIELD4": ""
      },
      {
        "SlNo": 428,
        "Customer": "Binny Singh",
        "MobileNo": 7003813535,
        "FIELD4": ""
      },
      {
        "SlNo": 429,
        "Customer": "Bipasa Chakraborty ",
        "MobileNo": 9674080854,
        "FIELD4": ""
      },
      {
        "SlNo": 430,
        "Customer": "Biswajit Dey ",
        "MobileNo": 9330890313,
        "FIELD4": ""
      },
      {
        "SlNo": 431,
        "Customer": "Bitu Naskar ",
        "MobileNo": 9681882604,
        "FIELD4": ""
      },
      {
        "SlNo": 432,
        "Customer": "Chaitali Andrews ",
        "MobileNo": 9836126094,
        "FIELD4": ""
      },
      {
        "SlNo": 433,
        "Customer": "Chumki Gomes ",
        "MobileNo": 8017556978,
        "FIELD4": ""
      },
      {
        "SlNo": 434,
        "Customer": "Clement Lakra ",
        "MobileNo": 7009814031,
        "FIELD4": ""
      },
      {
        "SlNo": 435,
        "Customer": "D K Sanyal ",
        "MobileNo": 9435720129,
        "FIELD4": ""
      },
      {
        "SlNo": 436,
        "Customer": "D Samanta ",
        "MobileNo": 9874137578,
        "FIELD4": ""
      },
      {
        "SlNo": 437,
        "Customer": "Debaroti Bhattachrjee ",
        "MobileNo": 9674944605,
        "FIELD4": ""
      },
      {
        "SlNo": 438,
        "Customer": "Deepak Rong ",
        "MobileNo": 9831041217,
        "FIELD4": ""
      },
      {
        "SlNo": 439,
        "Customer": "Dibyendu ",
        "MobileNo": 7980186742,
        "FIELD4": ""
      },
      {
        "SlNo": 441,
        "Customer": "Dipak Sardar ",
        "MobileNo": 9073815610,
        "FIELD4": ""
      },
      {
        "SlNo": 442,
        "Customer": "",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 443,
        "Customer": "Dulal Banerjee ",
        "MobileNo": 9433355398,
        "FIELD4": ""
      },
      {
        "SlNo": 444,
        "Customer": "Firoz Khan ",
        "MobileNo": 9474339566,
        "FIELD4": ""
      },
      {
        "SlNo": 446,
        "Customer": "Gargi Biswas ",
        "MobileNo": 8918642318,
        "FIELD4": ""
      },
      {
        "SlNo": 447,
        "Customer": "Gourav ",
        "MobileNo": 9903485413,
        "FIELD4": ""
      },
      {
        "SlNo": 448,
        "Customer": "Haradhan Rong ",
        "MobileNo": 8334024907,
        "FIELD4": ""
      },
      {
        "SlNo": 449,
        "Customer": "Hari Adhikary ",
        "MobileNo": 9830179713,
        "FIELD4": ""
      },
      {
        "SlNo": 450,
        "Customer": "Indira Ghorui ",
        "MobileNo": 6290687293,
        "FIELD4": ""
      },
      {
        "SlNo": 451,
        "Customer": "Janet gomes ",
        "MobileNo": 9874148673,
        "FIELD4": ""
      },
      {
        "SlNo": 453,
        "Customer": "Jayanta Dey ",
        "MobileNo": 9830817311,
        "FIELD4": ""
      },
      {
        "SlNo": 454,
        "Customer": "Jyoti Balmiki ",
        "MobileNo": 9163768998,
        "FIELD4": ""
      },
      {
        "SlNo": 455,
        "Customer": "Kaji Samsul ",
        "MobileNo": 6289827996,
        "FIELD4": ""
      },
      {
        "SlNo": 456,
        "Customer": "Kanai Lal Dey ",
        "MobileNo": 9903593970,
        "FIELD4": ""
      },
      {
        "SlNo": 457,
        "Customer": "Kathakali Roy ",
        "MobileNo": 9007991484,
        "FIELD4": ""
      },
      {
        "SlNo": 458,
        "Customer": "Kency Karmakar ",
        "MobileNo": 9088550823,
        "FIELD4": ""
      },
      {
        "SlNo": 459,
        "Customer": "Leena Tewari ",
        "MobileNo": 8981538345,
        "FIELD4": ""
      },
      {
        "SlNo": 460,
        "Customer": "Lois decuz ",
        "MobileNo": 9007367393,
        "FIELD4": ""
      },
      {
        "SlNo": 461,
        "Customer": "Md Rezanul Haque ",
        "MobileNo": 9732433733,
        "FIELD4": ""
      },
      {
        "SlNo": 462,
        "Customer": "Madhavi Callesteo ",
        "MobileNo": 7278845392,
        "FIELD4": ""
      },
      {
        "SlNo": 463,
        "Customer": "Manoj Mallick ",
        "MobileNo": 8583802548,
        "FIELD4": ""
      },
      {
        "SlNo": 464,
        "Customer": "Maseha  ",
        "MobileNo": 9890075663,
        "FIELD4": ""
      },
      {
        "SlNo": 465,
        "Customer": "Mithun ",
        "MobileNo": 8017574833,
        "FIELD4": ""
      },
      {
        "SlNo": 466,
        "Customer": "Monika Beker ",
        "MobileNo": 9331331768,
        "FIELD4": ""
      },
      {
        "SlNo": 467,
        "Customer": "Moumita Biswas ",
        "MobileNo": 7278444764,
        "FIELD4": ""
      },
      {
        "SlNo": 469,
        "Customer": "Moumita Halder ",
        "MobileNo": 9831945909,
        "FIELD4": ""
      },
      {
        "SlNo": 470,
        "Customer": "Moumita Saha ",
        "MobileNo": 9330065200,
        "FIELD4": ""
      },
      {
        "SlNo": 471,
        "Customer": "Mousumi Hazra ",
        "MobileNo": 7890204530,
        "FIELD4": ""
      },
      {
        "SlNo": 472,
        "Customer": "Namita Shil ",
        "MobileNo": 9748614275,
        "FIELD4": ""
      },
      {
        "SlNo": 473,
        "Customer": "Nandita Dey ",
        "MobileNo": 7980806392,
        "FIELD4": ""
      },
      {
        "SlNo": 474,
        "Customer": "Nayan Mukherjee ",
        "MobileNo": 9674408865,
        "FIELD4": ""
      },
      {
        "SlNo": 475,
        "Customer": "Neelam Kumari ",
        "MobileNo": 8777822060,
        "FIELD4": ""
      },
      {
        "SlNo": 476,
        "Customer": "Nupur Chandra Karan ",
        "MobileNo": 8017134170,
        "FIELD4": ""
      },
      {
        "SlNo": 477,
        "Customer": "Papiya Azmi ",
        "MobileNo": 7980114510,
        "FIELD4": ""
      },
      {
        "SlNo": 478,
        "Customer": "Pasqulina Sarkar ",
        "MobileNo": 9038590467,
        "FIELD4": ""
      },
      {
        "SlNo": 480,
        "Customer": "Peter Gomes ",
        "MobileNo": 8961265549,
        "FIELD4": ""
      },
      {
        "SlNo": 482,
        "Customer": "Piyali Dhali ",
        "MobileNo": 9748239307,
        "FIELD4": ""
      },
      {
        "SlNo": 484,
        "Customer": "Prabha Roy ",
        "MobileNo": 9903609994,
        "FIELD4": ""
      },
      {
        "SlNo": 486,
        "Customer": "Prabhudhan Mondal ",
        "MobileNo": 8240933939,
        "FIELD4": ""
      },
      {
        "SlNo": 487,
        "Customer": "Pranab Mondal ",
        "MobileNo": 9883705058,
        "FIELD4": ""
      },
      {
        "SlNo": 491,
        "Customer": "Priya Rozario ",
        "MobileNo": 7003525730,
        "FIELD4": ""
      },
      {
        "SlNo": 492,
        "Customer": "Priyanka Naskar ",
        "MobileNo": 9051265536,
        "FIELD4": ""
      },
      {
        "SlNo": 493,
        "Customer": "Puja Das ",
        "MobileNo": 7278675861,
        "FIELD4": ""
      },
      {
        "SlNo": 494,
        "Customer": "Pulak patra ",
        "MobileNo": 8777065878,
        "FIELD4": ""
      },
      {
        "SlNo": 497,
        "Customer": "Purabi Banerjee ",
        "MobileNo": 9051810471,
        "FIELD4": ""
      },
      {
        "SlNo": 498,
        "Customer": "Purnima Samanta ",
        "MobileNo": 6290231016,
        "FIELD4": ""
      },
      {
        "SlNo": 499,
        "Customer": "Radha Menon ",
        "MobileNo": 8910655592,
        "FIELD4": ""
      },
      {
        "SlNo": 500,
        "Customer": "Raja Sarder ",
        "MobileNo": 8335839605,
        "FIELD4": ""
      },
      {
        "SlNo": 501,
        "Customer": "Rajib Makhal ",
        "MobileNo": 9038904011,
        "FIELD4": ""
      },
      {
        "SlNo": 502,
        "Customer": "Rakhi Arong ",
        "MobileNo": 9748730236,
        "FIELD4": ""
      },
      {
        "SlNo": 503,
        "Customer": "Rakhi Das ",
        "MobileNo": 9674763288,
        "FIELD4": ""
      },
      {
        "SlNo": 504,
        "Customer": "Rama Dhara ",
        "MobileNo": 9831795268,
        "FIELD4": ""
      },
      {
        "SlNo": 506,
        "Customer": "Ratna Adak ",
        "MobileNo": 9748300498,
        "FIELD4": ""
      },
      {
        "SlNo": 507,
        "Customer": "Rebecca Adak ",
        "MobileNo": 9674989538,
        "FIELD4": ""
      },
      {
        "SlNo": 508,
        "Customer": "Rinki Makhal ",
        "MobileNo": 6290412482,
        "FIELD4": ""
      },
      {
        "SlNo": 510,
        "Customer": "Rita Mondal ",
        "MobileNo": 7003397219,
        "FIELD4": ""
      },
      {
        "SlNo": 511,
        "Customer": "Rohan Dutta ",
        "MobileNo": 7044429051,
        "FIELD4": ""
      },
      {
        "SlNo": 512,
        "Customer": "S Halder ",
        "MobileNo": 9932958283,
        "FIELD4": ""
      },
      {
        "SlNo": 513,
        "Customer": "Sadhona Baker ",
        "MobileNo": 8961139256,
        "FIELD4": ""
      },
      {
        "SlNo": 514,
        "Customer": "Sambhu ",
        "MobileNo": 9123715330,
        "FIELD4": ""
      },
      {
        "SlNo": 516,
        "Customer": "Sanchita Bag ",
        "MobileNo": 9330185857,
        "FIELD4": ""
      },
      {
        "SlNo": 517,
        "Customer": "Sandhya Pal ",
        "MobileNo": 7596885310,
        "FIELD4": ""
      },
      {
        "SlNo": 518,
        "Customer": "Saswata Mondal ",
        "MobileNo": 8777478510,
        "FIELD4": ""
      },
      {
        "SlNo": 519,
        "Customer": "Sayan Chakraborty ",
        "MobileNo": 9874688927,
        "FIELD4": ""
      },
      {
        "SlNo": 521,
        "Customer": "Seema Nandi ",
        "MobileNo": 9051025060,
        "FIELD4": ""
      },
      {
        "SlNo": 522,
        "Customer": "Sharmila Halder ",
        "MobileNo": 9432426370,
        "FIELD4": ""
      },
      {
        "SlNo": 523,
        "Customer": "Sharmila Mondal ",
        "MobileNo": 8013884935,
        "FIELD4": ""
      },
      {
        "SlNo": 524,
        "Customer": "Shefali Biswas ",
        "MobileNo": 9123715446,
        "FIELD4": ""
      },
      {
        "SlNo": 525,
        "Customer": "Shibani Gomes ",
        "MobileNo": 9073429247,
        "FIELD4": ""
      },
      {
        "SlNo": 527,
        "Customer": "Shipra Bar ",
        "MobileNo": 8697202596,
        "FIELD4": ""
      },
      {
        "SlNo": 529,
        "Customer": "Shukti Shubhra Pandey ",
        "MobileNo": 9830489047,
        "FIELD4": ""
      },
      {
        "SlNo": 530,
        "Customer": "Shyamoli Paul ",
        "MobileNo": 7278763023,
        "FIELD4": ""
      },
      {
        "SlNo": 531,
        "Customer": "Sikha Singh ",
        "MobileNo": 9831814601,
        "FIELD4": ""
      },
      {
        "SlNo": 532,
        "Customer": "Smriti Mondal ",
        "MobileNo": 7003809400,
        "FIELD4": ""
      },
      {
        "SlNo": 533,
        "Customer": "Soma Chakraborty ",
        "MobileNo": 8240947580,
        "FIELD4": ""
      },
      {
        "SlNo": 534,
        "Customer": "Somenath Halder ",
        "MobileNo": 9382246534,
        "FIELD4": ""
      },
      {
        "SlNo": 535,
        "Customer": "Sonali Kisku ",
        "MobileNo": 9830514041,
        "FIELD4": ""
      },
      {
        "SlNo": 536,
        "Customer": "Sonali Mallick ",
        "MobileNo": 9804906705,
        "FIELD4": ""
      },
      {
        "SlNo": 537,
        "Customer": "Sraboni Mondal ",
        "MobileNo": 8697524529,
        "FIELD4": ""
      },
      {
        "SlNo": 539,
        "Customer": "Subham Agarwal ",
        "MobileNo": 9113152865,
        "FIELD4": ""
      },
      {
        "SlNo": 540,
        "Customer": "Subhra Adhikari ",
        "MobileNo": 8910988054,
        "FIELD4": ""
      },
      {
        "SlNo": 541,
        "Customer": "Subroto Saha ",
        "MobileNo": 6289266383,
        "FIELD4": ""
      },
      {
        "SlNo": 542,
        "Customer": "Suchorita Roy ",
        "MobileNo": 8961843163,
        "FIELD4": ""
      },
      {
        "SlNo": 544,
        "Customer": "Sukanya Mitra ",
        "MobileNo": 8777036640,
        "FIELD4": ""
      },
      {
        "SlNo": 545,
        "Customer": "Sukla Panda ",
        "MobileNo": 9748411643,
        "FIELD4": ""
      },
      {
        "SlNo": 546,
        "Customer": "Suman Singh ",
        "MobileNo": 9831356853,
        "FIELD4": ""
      },
      {
        "SlNo": 547,
        "Customer": "Sunita Dolui ",
        "MobileNo": 8017579519,
        "FIELD4": ""
      },
      {
        "SlNo": 548,
        "Customer": "Susim Das ",
        "MobileNo": 8967738462,
        "FIELD4": ""
      },
      {
        "SlNo": 549,
        "Customer": "Sutapa Gomes ",
        "MobileNo": 8334816005,
        "FIELD4": ""
      },
      {
        "SlNo": 550,
        "Customer": "Suvojit ",
        "MobileNo": 6289848507,
        "FIELD4": ""
      },
      {
        "SlNo": 551,
        "Customer": "Swapna Koli ",
        "MobileNo": 9674058709,
        "FIELD4": ""
      },
      {
        "SlNo": 552,
        "Customer": "Tania Saha ",
        "MobileNo": 9836422249,
        "FIELD4": ""
      },
      {
        "SlNo": 553,
        "Customer": "Tapan Ishwar ",
        "MobileNo": 8013256268,
        "FIELD4": ""
      },
      {
        "SlNo": 554,
        "Customer": " Tina Sardar ",
        "MobileNo": 8420826364,
        "FIELD4": ""
      },
      {
        "SlNo": 555,
        "Customer": "Vinod Bose ",
        "MobileNo": 9903191882,
        "FIELD4": ""
      },
      {
        "SlNo": 556,
        "Customer": "A Subhodip Saha ",
        "MobileNo": 9836956294,
        "FIELD4": ""
      },
      {
        "SlNo": 557,
        "Customer": "Khishan Chatri  ",
        "MobileNo": 8100418952,
        "FIELD4": ""
      },
      {
        "SlNo": 558,
        "Customer": "Kiran ",
        "MobileNo": 9051248136,
        "FIELD4": ""
      },
      {
        "SlNo": 559,
        "Customer": "Kiran  ",
        "MobileNo": 9123033600,
        "FIELD4": ""
      },
      {
        "SlNo": 561,
        "Customer": "Koustav ",
        "MobileNo": 7980011673,
        "FIELD4": ""
      },
      {
        "SlNo": 562,
        "Customer": "Krihnendu Ghosh ",
        "MobileNo": 7003960199,
        "FIELD4": ""
      },
      {
        "SlNo": 563,
        "Customer": "Krishnendu Mukherjee ",
        "MobileNo": 9804815865,
        "FIELD4": ""
      },
      {
        "SlNo": 564,
        "Customer": "Krisna Roy ",
        "MobileNo": 9830986593,
        "FIELD4": ""
      },
      {
        "SlNo": 565,
        "Customer": "Sampad Sar ",
        "MobileNo": 9006715243,
        "FIELD4": ""
      },
      {
        "SlNo": 566,
        "Customer": "A Banerjee ",
        "MobileNo": 9477419512,
        "FIELD4": ""
      },
      {
        "SlNo": 567,
        "Customer": "Kumar Prasant Yadav ",
        "MobileNo": 9560526295,
        "FIELD4": ""
      },
      {
        "SlNo": 568,
        "Customer": "l Gallyo  ",
        "MobileNo": 8017406697,
        "FIELD4": ""
      },
      {
        "SlNo": 569,
        "Customer": "L Dutta ",
        "MobileNo": 9051064264,
        "FIELD4": ""
      },
      {
        "SlNo": 570,
        "Customer": "Laboni Adhikari ",
        "MobileNo": 6291405725,
        "FIELD4": ""
      },
      {
        "SlNo": 571,
        "Customer": "Laboni Naskar ",
        "MobileNo": 9804101490,
        "FIELD4": ""
      },
      {
        "SlNo": 572,
        "Customer": "Sneha ",
        "MobileNo": 7003212031,
        "FIELD4": ""
      },
      {
        "SlNo": 573,
        "Customer": "Lalu Shahoo",
        "MobileNo": 7002248349,
        "FIELD4": ""
      },
      {
        "SlNo": 574,
        "Customer": "Laxman Bar ",
        "MobileNo": 8100087814,
        "FIELD4": ""
      },
      {
        "SlNo": 575,
        "Customer": "Laxmi Mondal ",
        "MobileNo": 8961143043,
        "FIELD4": ""
      },
      {
        "SlNo": 576,
        "Customer": "LAXMI NARAYAN ",
        "MobileNo": 9510973423,
        "FIELD4": ""
      },
      {
        "SlNo": 577,
        "Customer": "Liza ",
        "MobileNo": 9330588239,
        "FIELD4": ""
      },
      {
        "SlNo": 578,
        "Customer": "Tanmoy Ghosh ",
        "MobileNo": 8017253490,
        "FIELD4": ""
      },
      {
        "SlNo": 579,
        "Customer": "M Chakroborty ",
        "MobileNo": 9231447758,
        "FIELD4": ""
      },
      {
        "SlNo": 580,
        "Customer": "M CHATTERJEE",
        "MobileNo": 9830649500,
        "FIELD4": ""
      },
      {
        "SlNo": 581,
        "Customer": "M CHOUDHURY ",
        "MobileNo": 9477179144,
        "FIELD4": ""
      },
      {
        "SlNo": 582,
        "Customer": "M K ROY  ",
        "MobileNo": 9432075540,
        "FIELD4": ""
      },
      {
        "SlNo": 583,
        "Customer": "M Pramanik ",
        "MobileNo": 8414827376,
        "FIELD4": ""
      },
      {
        "SlNo": 584,
        "Customer": "Madhabi Mondal",
        "MobileNo": 8420605387,
        "FIELD4": ""
      },
      {
        "SlNo": 585,
        "Customer": "MADHAV SARKAR ",
        "MobileNo": 9051284098,
        "FIELD4": ""
      },
      {
        "SlNo": 586,
        "Customer": "MADHUMITA  ",
        "MobileNo": 8240501521,
        "FIELD4": ""
      },
      {
        "SlNo": 587,
        "Customer": "Madhumita Patra ",
        "MobileNo": 9748686638,
        "FIELD4": ""
      },
      {
        "SlNo": 588,
        "Customer": "Madhumita pyne ",
        "MobileNo": 7003515495,
        "FIELD4": ""
      },
      {
        "SlNo": 589,
        "Customer": "Madhuri liari ",
        "MobileNo": 9163444540,
        "FIELD4": ""
      },
      {
        "SlNo": 590,
        "Customer": "Maitri Das  ",
        "MobileNo": 7980239379,
        "FIELD4": ""
      },
      {
        "SlNo": 591,
        "Customer": "Mala Sarkar ",
        "MobileNo": 9477174644,
        "FIELD4": ""
      },
      {
        "SlNo": 592,
        "Customer": "Malay Shikari ",
        "MobileNo": 8420980639,
        "FIELD4": ""
      },
      {
        "SlNo": 593,
        "Customer": "MANANI BHATACHARJEE ",
        "MobileNo": 7980726834,
        "FIELD4": ""
      },
      {
        "SlNo": 594,
        "Customer": "Manarajan Barman ",
        "MobileNo": 7063660757,
        "FIELD4": ""
      },
      {
        "SlNo": 595,
        "Customer": "Mandira Biswas ",
        "MobileNo": 9830388038,
        "FIELD4": ""
      },
      {
        "SlNo": 596,
        "Customer": "Mangal Mahato ",
        "MobileNo": 9883455340,
        "FIELD4": ""
      },
      {
        "SlNo": 597,
        "Customer": "Manika ",
        "MobileNo": 9837639760,
        "FIELD4": ""
      },
      {
        "SlNo": 598,
        "Customer": "MANISH  ",
        "MobileNo": 9339233798,
        "FIELD4": ""
      },
      {
        "SlNo": 600,
        "Customer": "K Chakraborty ",
        "MobileNo": 9433163684,
        "FIELD4": ""
      },
      {
        "SlNo": 601,
        "Customer": "Marlyn ",
        "MobileNo": 7889017794,
        "FIELD4": ""
      },
      {
        "SlNo": 602,
        "Customer": "Maryline ",
        "MobileNo": 9674280413,
        "FIELD4": ""
      },
      {
        "SlNo": 603,
        "Customer": "Mathew ",
        "MobileNo": 8274870292,
        "FIELD4": ""
      },
      {
        "SlNo": 604,
        "Customer": "Md KABIR MOLLA ",
        "MobileNo": 9143565129,
        "FIELD4": ""
      },
      {
        "SlNo": 605,
        "Customer": "Shyamol Gomes ",
        "MobileNo": 9874839974,
        "FIELD4": ""
      },
      {
        "SlNo": 606,
        "Customer": "Megha Adhikari ",
        "MobileNo": 8240415790,
        "FIELD4": ""
      },
      {
        "SlNo": 607,
        "Customer": "Megha Adhikary ",
        "MobileNo": 8910200339,
        "FIELD4": ""
      },
      {
        "SlNo": 608,
        "Customer": "Merry ",
        "MobileNo": 7003116993,
        "FIELD4": ""
      },
      {
        "SlNo": 609,
        "Customer": "MILAN  ",
        "MobileNo": 7074151611,
        "FIELD4": ""
      },
      {
        "SlNo": 610,
        "Customer": "MINAL ROY  ",
        "MobileNo": 9434081451,
        "FIELD4": ""
      },
      {
        "SlNo": 611,
        "Customer": "MISSES GOMES ",
        "MobileNo": 8240549270,
        "FIELD4": ""
      },
      {
        "SlNo": 612,
        "Customer": "Mitali Bachar ",
        "MobileNo": 9903610054,
        "FIELD4": ""
      },
      {
        "SlNo": 613,
        "Customer": "Mitali Pramnik ",
        "MobileNo": 9007786435,
        "FIELD4": ""
      },
      {
        "SlNo": 614,
        "Customer": "MITHU ",
        "MobileNo": 8617286118,
        "FIELD4": ""
      },
      {
        "SlNo": 615,
        "Customer": "Mithu Rang ",
        "MobileNo": 6290195257,
        "FIELD4": ""
      },
      {
        "SlNo": 616,
        "Customer": "Mohit Sharma ",
        "MobileNo": 6290615207,
        "FIELD4": ""
      },
      {
        "SlNo": 617,
        "Customer": "MOITREYEE DAS  ",
        "MobileNo": 9433215025,
        "FIELD4": ""
      },
      {
        "SlNo": 618,
        "Customer": "Monalisa Charkaborty ",
        "MobileNo": 9836898170,
        "FIELD4": ""
      },
      {
        "SlNo": 619,
        "Customer": "Moni Sarkar ",
        "MobileNo": 9874060209,
        "FIELD4": ""
      },
      {
        "SlNo": 620,
        "Customer": "Moumita Ghosh ",
        "MobileNo": 8335060064,
        "FIELD4": ""
      },
      {
        "SlNo": 621,
        "Customer": "MOUMITA ",
        "MobileNo": 7595869806,
        "FIELD4": ""
      },
      {
        "SlNo": 622,
        "Customer": "Mousumi Saha ",
        "MobileNo": 8697055956,
        "FIELD4": ""
      },
      {
        "SlNo": 623,
        "Customer": "Archana ",
        "MobileNo": 7890021535,
        "FIELD4": ""
      },
      {
        "SlNo": 624,
        "Customer": "Ashim Mondal ",
        "MobileNo": 9830228772,
        "FIELD4": ""
      },
      {
        "SlNo": 626,
        "Customer": "B Ganguly ",
        "MobileNo": 9903492988,
        "FIELD4": ""
      },
      {
        "SlNo": 627,
        "Customer": "B K Roy ",
        "MobileNo": 7595966560,
        "FIELD4": ""
      },
      {
        "SlNo": 628,
        "Customer": "Bobby ",
        "MobileNo": 9330589950,
        "FIELD4": ""
      },
      {
        "SlNo": 629,
        "Customer": "Boby Mondal Rani Roy ",
        "MobileNo": 8013191237,
        "FIELD4": ""
      },
      {
        "SlNo": 630,
        "Customer": "Christopa Ronty Biswas ",
        "MobileNo": 7980177467,
        "FIELD4": ""
      },
      {
        "SlNo": 632,
        "Customer": "Debolina mondal ",
        "MobileNo": 9647223697,
        "FIELD4": ""
      },
      {
        "SlNo": 633,
        "Customer": "Deepshikha Bose ",
        "MobileNo": 7439308682,
        "FIELD4": ""
      },
      {
        "SlNo": 635,
        "Customer": "Elina Mondal ",
        "MobileNo": 7439682873,
        "FIELD4": ""
      },
      {
        "SlNo": 636,
        "Customer": "Ipsita Sikdar ",
        "MobileNo": 9007285858,
        "FIELD4": ""
      },
      {
        "SlNo": 637,
        "Customer": "Jaya Karmakar ",
        "MobileNo": 7890170023,
        "FIELD4": ""
      },
      {
        "SlNo": 638,
        "Customer": "Junella Druart ",
        "MobileNo": 8777638938,
        "FIELD4": ""
      },
      {
        "SlNo": 639,
        "Customer": "Lili Chakraborty ",
        "MobileNo": 9073084411,
        "FIELD4": ""
      },
      {
        "SlNo": 640,
        "Customer": "Manoj Rai ",
        "MobileNo": 9007218314,
        "FIELD4": ""
      },
      {
        "SlNo": 641,
        "Customer": "Misti Ghorai ",
        "MobileNo": 6290421747,
        "FIELD4": ""
      },
      {
        "SlNo": 642,
        "Customer": "Mita Saha ",
        "MobileNo": 9874725970,
        "FIELD4": ""
      },
      {
        "SlNo": 643,
        "Customer": "Neela Santiago ",
        "MobileNo": 9007361873,
        "FIELD4": ""
      },
      {
        "SlNo": 644,
        "Customer": "Pamela Gomes ",
        "MobileNo": 8377949148,
        "FIELD4": ""
      },
      {
        "SlNo": 645,
        "Customer": "Paramita Roy Majumdar ",
        "MobileNo": 8232949157,
        "FIELD4": ""
      },
      {
        "SlNo": 646,
        "Customer": "Rajnikant Gaikawad ",
        "MobileNo": 9748152866,
        "FIELD4": ""
      },
      {
        "SlNo": 647,
        "Customer": "Rakhi Saha ",
        "MobileNo": 9123082869,
        "FIELD4": ""
      },
      {
        "SlNo": 648,
        "Customer": "Rani Roy ",
        "MobileNo": 7003123034,
        "FIELD4": ""
      },
      {
        "SlNo": 649,
        "Customer": "Rasmi Khatun ",
        "MobileNo": 9903050291,
        "FIELD4": ""
      },
      {
        "SlNo": 650,
        "Customer": "Rina Gomes ",
        "MobileNo": 8981776021,
        "FIELD4": ""
      },
      {
        "SlNo": 651,
        "Customer": "Sahina Khatun ",
        "MobileNo": 6289470210,
        "FIELD4": ""
      },
      {
        "SlNo": 652,
        "Customer": "Sanchita Singh ",
        "MobileNo": 7890546460,
        "FIELD4": ""
      },
      {
        "SlNo": 653,
        "Customer": "Santosh Mallick ",
        "MobileNo": 9036915113,
        "FIELD4": ""
      },
      {
        "SlNo": 654,
        "Customer": "Satabdi Dey ",
        "MobileNo": 8777871835,
        "FIELD4": ""
      },
      {
        "SlNo": 655,
        "Customer": "Sekh Chanchal Ali ",
        "MobileNo": 9007860956,
        "FIELD4": ""
      },
      {
        "SlNo": 656,
        "Customer": "Shalini Banik ",
        "MobileNo": 9804667601,
        "FIELD4": ""
      },
      {
        "SlNo": 657,
        "Customer": "Sister Shyla ",
        "MobileNo": 9163154612,
        "FIELD4": ""
      },
      {
        "SlNo": 658,
        "Customer": "Smriti Rekha  ",
        "MobileNo": 8240831761,
        "FIELD4": ""
      },
      {
        "SlNo": 659,
        "Customer": "Soumyajit Purkait ",
        "MobileNo": 9800784321,
        "FIELD4": ""
      },
      {
        "SlNo": 660,
        "Customer": "Sudipa Ganguly ",
        "MobileNo": 9674453869,
        "FIELD4": ""
      },
      {
        "SlNo": 661,
        "Customer": "Sunita Rajak ",
        "MobileNo": 8017257002,
        "FIELD4": ""
      },
      {
        "SlNo": 662,
        "Customer": "Susmita Paik ",
        "MobileNo": 9330646486,
        "FIELD4": ""
      },
      {
        "SlNo": 663,
        "Customer": "Swapna Sardar ",
        "MobileNo": 9836634161,
        "FIELD4": ""
      },
      {
        "SlNo": 664,
        "Customer": "Mukul chatterjee ",
        "MobileNo": 9642945662,
        "FIELD4": ""
      },
      {
        "SlNo": 665,
        "Customer": "N NANDI ",
        "MobileNo": 9609994212,
        "FIELD4": ""
      },
      {
        "SlNo": 666,
        "Customer": "N.K DAS  ",
        "MobileNo": 9933170983,
        "FIELD4": ""
      },
      {
        "SlNo": 668,
        "Customer": "Neha Dasgupta  ",
        "MobileNo": 9007056877,
        "FIELD4": ""
      },
      {
        "SlNo": 669,
        "Customer": "Niha Sapui ",
        "MobileNo": 7980926281,
        "FIELD4": ""
      },
      {
        "SlNo": 670,
        "Customer": "Nikhat ",
        "MobileNo": 8617790841,
        "FIELD4": ""
      },
      {
        "SlNo": 671,
        "Customer": "NILANJAN DUTtA ",
        "MobileNo": 9434491997,
        "FIELD4": ""
      },
      {
        "SlNo": 672,
        "Customer": "NILIMA ROY  ",
        "MobileNo": 6290359364,
        "FIELD4": ""
      },
      {
        "SlNo": 673,
        "Customer": "NILIMA ROY ",
        "MobileNo": 96747990072,
        "FIELD4": "11 digit "
      },
      {
        "SlNo": 674,
        "Customer": "NILKANTA BERA  ",
        "MobileNo": 6289162249,
        "FIELD4": ""
      },
      {
        "SlNo": 675,
        "Customer": "NOEL  ",
        "MobileNo": 8336021997,
        "FIELD4": ""
      },
      {
        "SlNo": 676,
        "Customer": "Noel Decosta ",
        "MobileNo": 9804761939,
        "FIELD4": ""
      },
      {
        "SlNo": 677,
        "Customer": "Abhishek Bag ",
        "MobileNo": 9748434995,
        "FIELD4": ""
      },
      {
        "SlNo": 678,
        "Customer": "Amrita Barui ",
        "MobileNo": 9073796996,
        "FIELD4": ""
      },
      {
        "SlNo": 679,
        "Customer": "Anisur R Khan ",
        "MobileNo": 8420217178,
        "FIELD4": ""
      },
      {
        "SlNo": 680,
        "Customer": "Anthony Robbie ",
        "MobileNo": 8597709599,
        "FIELD4": ""
      },
      {
        "SlNo": 681,
        "Customer": "Aryan  ",
        "MobileNo": 7044646335,
        "FIELD4": ""
      },
      {
        "SlNo": 682,
        "Customer": "Avik Mondal ",
        "MobileNo": 7278405829,
        "FIELD4": ""
      },
      {
        "SlNo": 683,
        "Customer": "Barnali Mondal ",
        "MobileNo": 8910493226,
        "FIELD4": ""
      },
      {
        "SlNo": 684,
        "Customer": "Binoy Das ",
        "MobileNo": 8537804123,
        "FIELD4": ""
      },
      {
        "SlNo": 685,
        "Customer": "Chandana Das  ",
        "MobileNo": 6291157389,
        "FIELD4": ""
      },
      {
        "SlNo": 686,
        "Customer": "Dalia Ghorui ",
        "MobileNo": 9038242404,
        "FIELD4": ""
      },
      {
        "SlNo": 687,
        "Customer": "Debika Gayen ",
        "MobileNo": 9062787726,
        "FIELD4": ""
      },
      {
        "SlNo": 688,
        "Customer": "Dilip Kumar Koyal ",
        "MobileNo": 9836286096,
        "FIELD4": ""
      },
      {
        "SlNo": 690,
        "Customer": "Dilip Sarkar ",
        "MobileNo": 9632370556,
        "FIELD4": ""
      },
      {
        "SlNo": 691,
        "Customer": "Edwin Sagar Reay ",
        "MobileNo": 8459586388,
        "FIELD4": ""
      },
      {
        "SlNo": 692,
        "Customer": "Fish Sanjay Sarder ",
        "MobileNo": 7278213839,
        "FIELD4": ""
      },
      {
        "SlNo": 693,
        "Customer": "Jhilik Sardar ",
        "MobileNo": 8017398688,
        "FIELD4": ""
      },
      {
        "SlNo": 694,
        "Customer": "Karuna Mondal ",
        "MobileNo": 9674618495,
        "FIELD4": ""
      },
      {
        "SlNo": 695,
        "Customer": "Kaushik Mondal ",
        "MobileNo": 8240761434,
        "FIELD4": ""
      },
      {
        "SlNo": 696,
        "Customer": "Laboni Bhuinya ",
        "MobileNo": 7980025091,
        "FIELD4": ""
      },
      {
        "SlNo": 697,
        "Customer": "Madhusree Bar ",
        "MobileNo": 8777068533,
        "FIELD4": ""
      },
      {
        "SlNo": 698,
        "Customer": "Monotosh Chakroborty ",
        "MobileNo": 9830921772,
        "FIELD4": ""
      },
      {
        "SlNo": 700,
        "Customer": "Neha Pramanik ",
        "MobileNo": 7278885077,
        "FIELD4": ""
      },
      {
        "SlNo": 701,
        "Customer": "Nikita Sau ",
        "MobileNo": 9038787840,
        "FIELD4": ""
      },
      {
        "SlNo": 702,
        "Customer": "Niva Patra ",
        "MobileNo": 9073734008,
        "FIELD4": ""
      },
      {
        "SlNo": 703,
        "Customer": "Paiya Singh ",
        "MobileNo": 8777292552,
        "FIELD4": ""
      },
      {
        "SlNo": 704,
        "Customer": "Pampa Shaw ",
        "MobileNo": 8240180377,
        "FIELD4": ""
      },
      {
        "SlNo": 705,
        "Customer": "",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 706,
        "Customer": "PannaLal Mondol ",
        "MobileNo": 8697062237,
        "FIELD4": ""
      },
      {
        "SlNo": 707,
        "Customer": "Piyali Chakraborty ",
        "MobileNo": 7001902140,
        "FIELD4": ""
      },
      {
        "SlNo": 708,
        "Customer": "Prabash Bag ",
        "MobileNo": 8017925692,
        "FIELD4": ""
      },
      {
        "SlNo": 709,
        "Customer": "Prakriti Chakraborty ",
        "MobileNo": 6289440889,
        "FIELD4": ""
      },
      {
        "SlNo": 710,
        "Customer": "Preeti Bar ",
        "MobileNo": 9330554742,
        "FIELD4": ""
      },
      {
        "SlNo": 711,
        "Customer": "Puja Sardar ",
        "MobileNo": 7278206778,
        "FIELD4": ""
      },
      {
        "SlNo": 712,
        "Customer": "Rabindra Mishra ",
        "MobileNo": 9831875361,
        "FIELD4": ""
      },
      {
        "SlNo": 713,
        "Customer": "Rupali Bor ",
        "MobileNo": 9163532594,
        "FIELD4": ""
      },
      {
        "SlNo": 714,
        "Customer": "Rupali Mallick ",
        "MobileNo": 6291191275,
        "FIELD4": ""
      },
      {
        "SlNo": 715,
        "Customer": "Sadhana Karali ",
        "MobileNo": 8017064520,
        "FIELD4": ""
      },
      {
        "SlNo": 717,
        "Customer": "Sadhana Mondal ",
        "MobileNo": 9163122711,
        "FIELD4": ""
      },
      {
        "SlNo": 718,
        "Customer": "Saumitra Moldal ",
        "MobileNo": 9830767501,
        "FIELD4": ""
      },
      {
        "SlNo": 719,
        "Customer": "Shyamoli Chatterjee ",
        "MobileNo": 9748985417,
        "FIELD4": ""
      },
      {
        "SlNo": 720,
        "Customer": "Soniya Gomes ",
        "MobileNo": 9051043479,
        "FIELD4": ""
      },
      {
        "SlNo": 721,
        "Customer": "Soumira Gayen ",
        "MobileNo": 9836278824,
        "FIELD4": ""
      },
      {
        "SlNo": 722,
        "Customer": "Subhankar Bor ",
        "MobileNo": 9831884455,
        "FIELD4": ""
      },
      {
        "SlNo": 723,
        "Customer": "Subhankar Sardar ",
        "MobileNo": 9088652017,
        "FIELD4": ""
      },
      {
        "SlNo": 724,
        "Customer": "Subhra Pramanik  ",
        "MobileNo": 8777439578,
        "FIELD4": ""
      },
      {
        "SlNo": 725,
        "Customer": "Suparna Malik ",
        "MobileNo": 9874439025,
        "FIELD4": ""
      },
      {
        "SlNo": 726,
        "Customer": "Surojit Mondol ",
        "MobileNo": 8296762885,
        "FIELD4": ""
      },
      {
        "SlNo": 727,
        "Customer": "Sutapa Malik ",
        "MobileNo": 6291743847,
        "FIELD4": ""
      },
      {
        "SlNo": 728,
        "Customer": "Sutrina Patra ",
        "MobileNo": 6289396216,
        "FIELD4": ""
      },
      {
        "SlNo": 729,
        "Customer": "Swapan Jana ",
        "MobileNo": 9674608515,
        "FIELD4": ""
      },
      {
        "SlNo": 730,
        "Customer": "Tagari Gayen ",
        "MobileNo": 9330537909,
        "FIELD4": ""
      },
      {
        "SlNo": 731,
        "Customer": "Tanaya Malik ",
        "MobileNo": 8420950566,
        "FIELD4": ""
      },
      {
        "SlNo": 732,
        "Customer": "Tonusri Sardar ",
        "MobileNo": 9007868603,
        "FIELD4": ""
      },
      {
        "SlNo": 733,
        "Customer": "Tusi Roy ",
        "MobileNo": 8240172067,
        "FIELD4": ""
      },
      {
        "SlNo": 734,
        "Customer": "Uma Chhetri ",
        "MobileNo": 8910863129,
        "FIELD4": ""
      },
      {
        "SlNo": 735,
        "Customer": "Debyendu Makhal ",
        "MobileNo": 9804733107,
        "FIELD4": ""
      },
      {
        "SlNo": 736,
        "Customer": "Oyindrila ",
        "MobileNo": 9831262513,
        "FIELD4": ""
      },
      {
        "SlNo": 737,
        "Customer": "Oyindrila Jana ",
        "MobileNo": 9051880505,
        "FIELD4": ""
      },
      {
        "SlNo": 738,
        "Customer": "P KOYAL ",
        "MobileNo": 8240093342,
        "FIELD4": ""
      },
      {
        "SlNo": 739,
        "Customer": "P Naskar  ",
        "MobileNo": 8240325189,
        "FIELD4": ""
      },
      {
        "SlNo": 740,
        "Customer": " p.jana ",
        "MobileNo": 950384771,
        "FIELD4": "Incomplete number"
      },
      {
        "SlNo": 741,
        "Customer": "P K Bera",
        "MobileNo": 9439850874,
        "FIELD4": ""
      },
      {
        "SlNo": 742,
        "Customer": "P K ROY  ",
        "MobileNo": 9955997935,
        "FIELD4": ""
      },
      {
        "SlNo": 743,
        "Customer": "P  S Marik ",
        "MobileNo": 9614036624,
        "FIELD4": ""
      },
      {
        "SlNo": 744,
        "Customer": "PADAN RONG  ",
        "MobileNo": 8622836223,
        "FIELD4": ""
      },
      {
        "SlNo": 745,
        "Customer": "Palash Mandal  ",
        "MobileNo": 9051880486,
        "FIELD4": ""
      },
      {
        "SlNo": 746,
        "Customer": "Pampa Sardar ",
        "MobileNo": 6289894064,
        "FIELD4": ""
      },
      {
        "SlNo": 747,
        "Customer": "PARESH MONDAL  ",
        "MobileNo": 8420813876,
        "FIELD4": ""
      },
      {
        "SlNo": 748,
        "Customer": "Parimal Majumder ",
        "MobileNo": 9231515859,
        "FIELD4": ""
      },
      {
        "SlNo": 749,
        "Customer": "Sosi ",
        "MobileNo": 9874700286,
        "FIELD4": ""
      },
      {
        "SlNo": 750,
        "Customer": "Chumki ",
        "MobileNo": 6290788757,
        "FIELD4": ""
      },
      {
        "SlNo": 751,
        "Customer": "Sangeeta ",
        "MobileNo": 9830577470,
        "FIELD4": ""
      },
      {
        "SlNo": 752,
        "Customer": "Chandrani Bose ",
        "MobileNo": 9051259344,
        "FIELD4": ""
      },
      {
        "SlNo": 753,
        "Customer": "Indrajit Barik ",
        "MobileNo": 9874810402,
        "FIELD4": ""
      },
      {
        "SlNo": 754,
        "Customer": "Kailash Tawar ",
        "MobileNo": 7278505093,
        "FIELD4": ""
      },
      {
        "SlNo": 755,
        "Customer": "Purabi Roy ",
        "MobileNo": 6290136621,
        "FIELD4": ""
      },
      {
        "SlNo": 756,
        "Customer": "Nivedita Mondal ",
        "MobileNo": 7686891258,
        "FIELD4": ""
      },
      {
        "SlNo": 758,
        "Customer": "Nivedita Pradhan ",
        "MobileNo": 8100969394,
        "FIELD4": ""
      },
      {
        "SlNo": 759,
        "Customer": "Rumpa Seal ",
        "MobileNo": 7686986138,
        "FIELD4": ""
      },
      {
        "SlNo": 760,
        "Customer": "Sharmila Lakra ",
        "MobileNo": 9088731495,
        "FIELD4": ""
      },
      {
        "SlNo": 761,
        "Customer": "PARTHA ROY  ",
        "MobileNo": 9073760957,
        "FIELD4": ""
      },
      {
        "SlNo": 762,
        "Customer": "Partho Mitra ",
        "MobileNo": 8013339117,
        "FIELD4": ""
      },
      {
        "SlNo": 763,
        "Customer": "Payel Sadhukhan ",
        "MobileNo": 9836916640,
        "FIELD4": ""
      },
      {
        "SlNo": 764,
        "Customer": "Sangita  Mukherjee  ",
        "MobileNo": 9875469853,
        "FIELD4": ""
      },
      {
        "SlNo": 765,
        "Customer": "Anjali Sen ",
        "MobileNo": 9831373382,
        "FIELD4": ""
      },
      {
        "SlNo": 766,
        "Customer": "Ankhi Sau ",
        "MobileNo": 6290449216,
        "FIELD4": ""
      },
      {
        "SlNo": 767,
        "Customer": "Ashim Saha ",
        "MobileNo": 9433128716,
        "FIELD4": ""
      },
      {
        "SlNo": 769,
        "Customer": "Ashma ",
        "MobileNo": 9331097876,
        "FIELD4": ""
      },
      {
        "SlNo": 770,
        "Customer": "Bina Hemrarm ",
        "MobileNo": 9748709956,
        "FIELD4": ""
      },
      {
        "SlNo": 771,
        "Customer": "Chandranath Chatterjee ",
        "MobileNo": 9432118754,
        "FIELD4": ""
      },
      {
        "SlNo": 772,
        "Customer": "DEBASISH PAHARI ",
        "MobileNo": 9831025366,
        "FIELD4": ""
      },
      {
        "SlNo": 774,
        "Customer": "Faatima ",
        "MobileNo": 8240195584,
        "FIELD4": ""
      },
      {
        "SlNo": 775,
        "Customer": "Ivan Sanyal ",
        "MobileNo": 8017732388,
        "FIELD4": ""
      },
      {
        "SlNo": 776,
        "Customer": "Mousumi Banerjee ",
        "MobileNo": 9433208377,
        "FIELD4": ""
      },
      {
        "SlNo": 777,
        "Customer": "Mousumi Chatterjee ",
        "MobileNo": 7044240896,
        "FIELD4": ""
      },
      {
        "SlNo": 778,
        "Customer": "N N Bhowmik ",
        "MobileNo": 9875376274,
        "FIELD4": ""
      },
      {
        "SlNo": 779,
        "Customer": "Nikhil Chandran ",
        "MobileNo": 7980641562,
        "FIELD4": ""
      },
      {
        "SlNo": 780,
        "Customer": "Pracheta Mukherjee ",
        "MobileNo": 9830751339,
        "FIELD4": ""
      },
      {
        "SlNo": 781,
        "Customer": "R S Chakrabarti ",
        "MobileNo": 9434846737,
        "FIELD4": ""
      },
      {
        "SlNo": 782,
        "Customer": "Riki Sinha ",
        "MobileNo": 8902368908,
        "FIELD4": ""
      },
      {
        "SlNo": 783,
        "Customer": "Rini Ghosh ",
        "MobileNo": 8240198214,
        "FIELD4": ""
      },
      {
        "SlNo": 785,
        "Customer": "Rita Bose ",
        "MobileNo": 8294045147,
        "FIELD4": ""
      },
      {
        "SlNo": 786,
        "Customer": "Saheli Kapat ",
        "MobileNo": 9051147286,
        "FIELD4": ""
      },
      {
        "SlNo": 787,
        "Customer": "Sonali ",
        "MobileNo": 9883470456,
        "FIELD4": ""
      },
      {
        "SlNo": 788,
        "Customer": "Sukunar Basu ",
        "MobileNo": 8697442275,
        "FIELD4": ""
      },
      {
        "SlNo": 789,
        "Customer": "Sumana Purakayastha ",
        "MobileNo": 9062477380,
        "FIELD4": ""
      },
      {
        "SlNo": 790,
        "Customer": "Sunil Chatterjee ",
        "MobileNo": 9836927512,
        "FIELD4": ""
      },
      {
        "SlNo": 791,
        "Customer": "Ankita Roy ",
        "MobileNo": 8981081230,
        "FIELD4": ""
      },
      {
        "SlNo": 792,
        "Customer": "Himadri sarkar ",
        "MobileNo": 9830262950,
        "FIELD4": ""
      },
      {
        "SlNo": 793,
        "Customer": "Kalicharan Sinha ",
        "MobileNo": 9874333506,
        "FIELD4": ""
      },
      {
        "SlNo": 794,
        "Customer": "Kismat Begum ",
        "MobileNo": 9836363521,
        "FIELD4": ""
      },
      {
        "SlNo": 795,
        "Customer": "",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 797,
        "Customer": "R N Mallick ",
        "MobileNo": 9903903686,
        "FIELD4": ""
      },
      {
        "SlNo": 798,
        "Customer": "Rajiv Bhattacharjee ",
        "MobileNo": 9434210425,
        "FIELD4": ""
      },
      {
        "SlNo": 799,
        "Customer": "",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 800,
        "Customer": "Rituparna Ganguly ",
        "MobileNo": 9836611811,
        "FIELD4": ""
      },
      {
        "SlNo": 801,
        "Customer": "Shalini Yadab ",
        "MobileNo": 9958562594,
        "FIELD4": ""
      },
      {
        "SlNo": 802,
        "Customer": "Snighdadeb Mallick ",
        "MobileNo": 6290054596,
        "FIELD4": ""
      },
      {
        "SlNo": 804,
        "Customer": "Sunny MItra ",
        "MobileNo": 8017449045,
        "FIELD4": ""
      },
      {
        "SlNo": 805,
        "Customer": "Supti Ganguly ",
        "MobileNo": 9874095234,
        "FIELD4": ""
      },
      {
        "SlNo": 806,
        "Customer": "Susmita Bera ",
        "MobileNo": 7980472745,
        "FIELD4": ""
      },
      {
        "SlNo": 807,
        "Customer": "Swapan Chatterjee ",
        "MobileNo": 8334098105,
        "FIELD4": ""
      },
      {
        "SlNo": 808,
        "Customer": "Indrani Paul ",
        "MobileNo": 9432496448,
        "FIELD4": ""
      },
      {
        "SlNo": 809,
        "Customer": "Ishwar Chandra ",
        "MobileNo": 8961818669,
        "FIELD4": ""
      },
      {
        "SlNo": 810,
        "Customer": "Joyeeta Kar Partha Guha ",
        "MobileNo": 9836457125,
        "FIELD4": ""
      },
      {
        "SlNo": 811,
        "Customer": "Partho Maity ",
        "MobileNo": 8420663266,
        "FIELD4": ""
      },
      {
        "SlNo": 812,
        "Customer": "Tapoban Ray ",
        "MobileNo": 9339745124,
        "FIELD4": ""
      },
      {
        "SlNo": 813,
        "Customer": "Amita Dutta ",
        "MobileNo": 8337035566,
        "FIELD4": ""
      },
      {
        "SlNo": 814,
        "Customer": "Bhuban Das",
        "MobileNo": 8961771021,
        "FIELD4": ""
      },
      {
        "SlNo": 815,
        "Customer": "Debjani Roy ",
        "MobileNo": 9748155371,
        "FIELD4": ""
      },
      {
        "SlNo": 816,
        "Customer": "Gayatri Karmakar ",
        "MobileNo": 9831899633,
        "FIELD4": ""
      },
      {
        "SlNo": 818,
        "Customer": "Jyoti Ganguly ",
        "MobileNo": 9330234409,
        "FIELD4": ""
      },
      {
        "SlNo": 819,
        "Customer": "Kakali Banerjee ",
        "MobileNo": 9836850582,
        "FIELD4": ""
      },
      {
        "SlNo": 820,
        "Customer": "Mahashweta Midya ",
        "MobileNo": 7679229120,
        "FIELD4": ""
      },
      {
        "SlNo": 822,
        "Customer": "Poulami Banerjee ",
        "MobileNo": 8981884415,
        "FIELD4": ""
      },
      {
        "SlNo": 823,
        "Customer": "Pushpanjali Sinha ",
        "MobileNo": 9830620975,
        "FIELD4": ""
      },
      {
        "SlNo": 824,
        "Customer": "Sourashish Banerjee ",
        "MobileNo": 9875445602,
        "FIELD4": ""
      },
      {
        "SlNo": 825,
        "Customer": "Suprava Mathur ",
        "MobileNo": 9073808045,
        "FIELD4": ""
      },
      {
        "SlNo": 826,
        "Customer": "Suvendu Barik ",
        "MobileNo": 7278150891,
        "FIELD4": ""
      },
      {
        "SlNo": 827,
        "Customer": "PINTU KUMAR  ",
        "MobileNo": 9874636378,
        "FIELD4": ""
      },
      {
        "SlNo": 828,
        "Customer": "PITAM  ",
        "MobileNo": 9038712148,
        "FIELD4": ""
      },
      {
        "SlNo": 829,
        "Customer": "PIU BHANDARI ",
        "MobileNo": 7003574637,
        "FIELD4": ""
      },
      {
        "SlNo": 830,
        "Customer": "Piyali Adhikari ",
        "MobileNo": 8617704145,
        "FIELD4": ""
      },
      {
        "SlNo": 831,
        "Customer": "PIYALI BANERJEE  ",
        "MobileNo": 9803207004,
        "FIELD4": ""
      },
      {
        "SlNo": 832,
        "Customer": "PRABAL KISKE ",
        "MobileNo": 97487727063,
        "FIELD4": "11 digit"
      },
      {
        "SlNo": 833,
        "Customer": "Prabhas ",
        "MobileNo": 8017925292,
        "FIELD4": ""
      },
      {
        "SlNo": 834,
        "Customer": "Prabir Manna ",
        "MobileNo": 6289253557,
        "FIELD4": ""
      },
      {
        "SlNo": 835,
        "Customer": "Pradipta Dutta ",
        "MobileNo": 9732212441,
        "FIELD4": ""
      },
      {
        "SlNo": 836,
        "Customer": "PRADIPTO RAY ",
        "MobileNo": 9051575623,
        "FIELD4": ""
      },
      {
        "SlNo": 837,
        "Customer": "Pralayjit Seal ",
        "MobileNo": 9123364730,
        "FIELD4": ""
      },
      {
        "SlNo": 838,
        "Customer": "Prano Gato Mondal ",
        "MobileNo": 9054557738,
        "FIELD4": ""
      },
      {
        "SlNo": 839,
        "Customer": "PRASANTA MANNA  ",
        "MobileNo": 9330827906,
        "FIELD4": ""
      },
      {
        "SlNo": 840,
        "Customer": "PRASANTA ROY  ",
        "MobileNo": 8240986770,
        "FIELD4": ""
      },
      {
        "SlNo": 841,
        "Customer": "PRASENJIT ",
        "MobileNo": 9038835206,
        "FIELD4": ""
      },
      {
        "SlNo": 842,
        "Customer": "Prasun Ray ",
        "MobileNo": 9733035062,
        "FIELD4": ""
      },
      {
        "SlNo": 843,
        "Customer": "PRATEEK HISSARIA  ",
        "MobileNo": 6350611366,
        "FIELD4": ""
      },
      {
        "SlNo": 844,
        "Customer": "Prbal kiskeu ",
        "MobileNo": 9748772706,
        "FIELD4": ""
      },
      {
        "SlNo": 845,
        "Customer": "Prince Sourav Das ",
        "MobileNo": 9804850352,
        "FIELD4": ""
      },
      {
        "SlNo": 846,
        "Customer": "Prity ",
        "MobileNo": 9007811861,
        "FIELD4": ""
      },
      {
        "SlNo": 847,
        "Customer": "Priyanka bisai ",
        "MobileNo": 8617779602,
        "FIELD4": ""
      },
      {
        "SlNo": 848,
        "Customer": "Priyojit Das ",
        "MobileNo": 9555495531,
        "FIELD4": ""
      },
      {
        "SlNo": 849,
        "Customer": "Priyotosh Sardar ",
        "MobileNo": 8100256851,
        "FIELD4": ""
      },
      {
        "SlNo": 850,
        "Customer": "Dipanwita Kar ",
        "MobileNo": 8583000523,
        "FIELD4": ""
      },
      {
        "SlNo": 851,
        "Customer": "PUSHPA GOMES  ",
        "MobileNo": 7439094043,
        "FIELD4": ""
      },
      {
        "SlNo": 852,
        "Customer": "Pushpita Nath ",
        "MobileNo": 9830940088,
        "FIELD4": ""
      },
      {
        "SlNo": 853,
        "Customer": "Putul Banerjee ",
        "MobileNo": 9088560650,
        "FIELD4": ""
      },
      {
        "SlNo": 854,
        "Customer": " Mitra Nath ",
        "MobileNo": 9331932955,
        "FIELD4": ""
      },
      {
        "SlNo": 855,
        "Customer": "Papri Biswas ",
        "MobileNo": 9163309975,
        "FIELD4": ""
      },
      {
        "SlNo": 856,
        "Customer": "Prafulla Chatterjee ",
        "MobileNo": 9432020446,
        "FIELD4": ""
      },
      {
        "SlNo": 857,
        "Customer": "Sudisha Sarkar ",
        "MobileNo": 6291143972,
        "FIELD4": ""
      },
      {
        "SlNo": 858,
        "Customer": "Suman Debnath ",
        "MobileNo": 9819142276,
        "FIELD4": ""
      },
      {
        "SlNo": 860,
        "Customer": "Sunny Chatterjee ",
        "MobileNo": 9830027293,
        "FIELD4": ""
      },
      {
        "SlNo": 861,
        "Customer": "Yubraj Sharma  ",
        "MobileNo": 9828964116,
        "FIELD4": ""
      },
      {
        "SlNo": 862,
        "Customer": "R P SIKDAR  ",
        "MobileNo": 8777857132,
        "FIELD4": ""
      },
      {
        "SlNo": 863,
        "Customer": "R K BHATTARCHARYA ",
        "MobileNo": 8017232407,
        "FIELD4": ""
      },
      {
        "SlNo": 864,
        "Customer": "R Podder ",
        "MobileNo": 9163845590,
        "FIELD4": ""
      },
      {
        "SlNo": 865,
        "Customer": "Rabinda Mondal ",
        "MobileNo": 9007553453,
        "FIELD4": ""
      },
      {
        "SlNo": 866,
        "Customer": "Radha Shaw ",
        "MobileNo": 9163619779,
        "FIELD4": ""
      },
      {
        "SlNo": 867,
        "Customer": "RAGHUNATH BHANDARI ",
        "MobileNo": 6290160394,
        "FIELD4": ""
      },
      {
        "SlNo": 868,
        "Customer": "Rahul ",
        "MobileNo": 9330131922,
        "FIELD4": ""
      },
      {
        "SlNo": 869,
        "Customer": "Rahul Pathak ",
        "MobileNo": 7979063597,
        "FIELD4": ""
      },
      {
        "SlNo": 870,
        "Customer": "Raj Kr Dolui ",
        "MobileNo": 9830273074,
        "FIELD4": ""
      },
      {
        "SlNo": 871,
        "Customer": "Raja Karmakar ",
        "MobileNo": 9748338511,
        "FIELD4": ""
      },
      {
        "SlNo": 872,
        "Customer": "Rajib Mitra  ",
        "MobileNo": 9831784133,
        "FIELD4": ""
      },
      {
        "SlNo": 873,
        "Customer": "Rajib Mondal ",
        "MobileNo": 8116488176,
        "FIELD4": ""
      },
      {
        "SlNo": 874,
        "Customer": "Rajib Sarkar ",
        "MobileNo": 8670902132,
        "FIELD4": ""
      },
      {
        "SlNo": 875,
        "Customer": "RAJKUMAR PODDAR ",
        "MobileNo": 9433960786,
        "FIELD4": ""
      },
      {
        "SlNo": 876,
        "Customer": "RAJKUMAR ROY ",
        "MobileNo": 7439112698,
        "FIELD4": ""
      },
      {
        "SlNo": 877,
        "Customer": "Raju Dolui ",
        "MobileNo": 6291119576,
        "FIELD4": ""
      },
      {
        "SlNo": 879,
        "Customer": "Raju Martin ",
        "MobileNo": 9748966475,
        "FIELD4": ""
      },
      {
        "SlNo": 880,
        "Customer": "Raju Oraw ",
        "MobileNo": 9830919333,
        "FIELD4": ""
      },
      {
        "SlNo": 881,
        "Customer": "Raju Sarkar ",
        "MobileNo": 8420326932,
        "FIELD4": ""
      },
      {
        "SlNo": 882,
        "Customer": "RAKESH ",
        "MobileNo": 8240146587,
        "FIELD4": ""
      },
      {
        "SlNo": 883,
        "Customer": "Rakesh Jha ",
        "MobileNo": 8697656533,
        "FIELD4": ""
      },
      {
        "SlNo": 884,
        "Customer": "RAM PRASAD BISWAS ",
        "MobileNo": 9831761585,
        "FIELD4": ""
      },
      {
        "SlNo": 885,
        "Customer": "Raman ",
        "MobileNo": 8910861598,
        "FIELD4": ""
      },
      {
        "SlNo": 886,
        "Customer": "Rmchandra Das  ",
        "MobileNo": 7719151079,
        "FIELD4": ""
      },
      {
        "SlNo": 887,
        "Customer": "Ramesh ",
        "MobileNo": 9748350768,
        "FIELD4": ""
      },
      {
        "SlNo": 888,
        "Customer": "RAMESH ",
        "MobileNo": 9831950961,
        "FIELD4": ""
      },
      {
        "SlNo": 889,
        "Customer": "RANA SAHA ",
        "MobileNo": 9836927744,
        "FIELD4": ""
      },
      {
        "SlNo": 890,
        "Customer": "Ranisha Singh ",
        "MobileNo": 9674476538,
        "FIELD4": ""
      },
      {
        "SlNo": 891,
        "Customer": "RANJAN BARMAN ",
        "MobileNo": 6297726225,
        "FIELD4": ""
      },
      {
        "SlNo": 892,
        "Customer": "RANJANA DUTTA  ",
        "MobileNo": 8697261755,
        "FIELD4": ""
      },
      {
        "SlNo": 893,
        "Customer": "Ranjit Shaw",
        "MobileNo": 9903649561,
        "FIELD4": ""
      },
      {
        "SlNo": 894,
        "Customer": "Ratna ",
        "MobileNo": 9748300798,
        "FIELD4": ""
      },
      {
        "SlNo": 895,
        "Customer": "Ratna Sen ",
        "MobileNo": 9434990069,
        "FIELD4": ""
      },
      {
        "SlNo": 896,
        "Customer": "REJAUL ",
        "MobileNo": 9749494826,
        "FIELD4": ""
      },
      {
        "SlNo": 897,
        "Customer": "Rekha Gomes ",
        "MobileNo": 9831936914,
        "FIELD4": ""
      },
      {
        "SlNo": 898,
        "Customer": "Rekha Shaw ",
        "MobileNo": 9831599672,
        "FIELD4": ""
      },
      {
        "SlNo": 900,
        "Customer": "Rahul Sardar ",
        "MobileNo": 7595952220,
        "FIELD4": ""
      },
      {
        "SlNo": 901,
        "Customer": "Anthony Gomes ",
        "MobileNo": 9836346553,
        "FIELD4": ""
      },
      {
        "SlNo": 903,
        "Customer": "Rajesh Shaw ",
        "MobileNo": 6289806473,
        "FIELD4": ""
      },
      {
        "SlNo": 904,
        "Customer": "Kanaklata Mondal ",
        "MobileNo": 9051557738,
        "FIELD4": ""
      },
      {
        "SlNo": 905,
        "Customer": "Rajesh Shaw ",
        "MobileNo": 9432715485,
        "FIELD4": ""
      },
      {
        "SlNo": 906,
        "Customer": "Shibhashis Mandal ",
        "MobileNo": 6291693816,
        "FIELD4": ""
      },
      {
        "SlNo": 907,
        "Customer": "Subrata Nandita Ishwar ",
        "MobileNo": 9038941310,
        "FIELD4": ""
      },
      {
        "SlNo": 908,
        "Customer": "SWAPAN JANA  ",
        "MobileNo": 7980355004,
        "FIELD4": ""
      },
      {
        "SlNo": 909,
        "Customer": "Tumpa Bhattacharjee ",
        "MobileNo": 9874525422,
        "FIELD4": ""
      },
      {
        "SlNo": 910,
        "Customer": "Rinku Singha ",
        "MobileNo": 9804211806,
        "FIELD4": ""
      },
      {
        "SlNo": 911,
        "Customer": "Shyamol Mondal ",
        "MobileNo": 8961790053,
        "FIELD4": ""
      },
      {
        "SlNo": 912,
        "Customer": "Utpal Gomes ",
        "MobileNo": 9007480463,
        "FIELD4": ""
      },
      {
        "SlNo": 913,
        "Customer": "Reverent Somnath Barori ",
        "MobileNo": 8017660980,
        "FIELD4": ""
      },
      {
        "SlNo": 914,
        "Customer": "Richa Bose ",
        "MobileNo": 8240862521,
        "FIELD4": ""
      },
      {
        "SlNo": 915,
        "Customer": "RIKA DUTTA ",
        "MobileNo": 9051579248,
        "FIELD4": ""
      },
      {
        "SlNo": 916,
        "Customer": "Rimi Chakrabarti ",
        "MobileNo": 9804620634,
        "FIELD4": ""
      },
      {
        "SlNo": 917,
        "Customer": "RIMPI MALLICK  ",
        "MobileNo": 8981183500,
        "FIELD4": ""
      },
      {
        "SlNo": 918,
        "Customer": "RINA BISWAS ",
        "MobileNo": 9674454603,
        "FIELD4": ""
      },
      {
        "SlNo": 919,
        "Customer": "RINKI SARKAR  ",
        "MobileNo": 8017914531,
        "FIELD4": ""
      },
      {
        "SlNo": 920,
        "Customer": "Rita ",
        "MobileNo": 8420884052,
        "FIELD4": ""
      },
      {
        "SlNo": 921,
        "Customer": "Rita Kumari ",
        "MobileNo": 9903149881,
        "FIELD4": ""
      },
      {
        "SlNo": 922,
        "Customer": "Ritesh ",
        "MobileNo": 9974652406,
        "FIELD4": ""
      },
      {
        "SlNo": 923,
        "Customer": "Ritesh Warma ",
        "MobileNo": 9840116431,
        "FIELD4": ""
      },
      {
        "SlNo": 924,
        "Customer": "Robin Mondal ",
        "MobileNo": 9831190322,
        "FIELD4": ""
      },
      {
        "SlNo": 925,
        "Customer": "Rohit ",
        "MobileNo": 9748972630,
        "FIELD4": ""
      },
      {
        "SlNo": 926,
        "Customer": "Rohit Patwari ",
        "MobileNo": 6290564081,
        "FIELD4": ""
      },
      {
        "SlNo": 927,
        "Customer": "Rohit Ray ",
        "MobileNo": 7003936452,
        "FIELD4": ""
      },
      {
        "SlNo": 928,
        "Customer": "ROTHIN  ",
        "MobileNo": 7980898398,
        "FIELD4": ""
      },
      {
        "SlNo": 930,
        "Customer": "Rumpa Pattanayak ",
        "MobileNo": 8272942226,
        "FIELD4": ""
      },
      {
        "SlNo": 931,
        "Customer": "Rupali Sinha ",
        "MobileNo": 7003623186,
        "FIELD4": ""
      },
      {
        "SlNo": 932,
        "Customer": "S SEN  ",
        "MobileNo": 9883323143,
        "FIELD4": ""
      },
      {
        "SlNo": 933,
        "Customer": "S MAJUMDER ",
        "MobileNo": 98307568511,
        "FIELD4": "11 digit"
      },
      {
        "SlNo": 934,
        "Customer": "S Barman ",
        "MobileNo": 8884822677,
        "FIELD4": ""
      },
      {
        "SlNo": 935,
        "Customer": "S Basu ",
        "MobileNo": 9830160202,
        "FIELD4": ""
      },
      {
        "SlNo": 936,
        "Customer": "S C Das ",
        "MobileNo": 9123345014,
        "FIELD4": ""
      },
      {
        "SlNo": 937,
        "Customer": "S Pradhan ",
        "MobileNo": 9051066968,
        "FIELD4": ""
      },
      {
        "SlNo": 938,
        "Customer": "S  Chakrabarti ",
        "MobileNo": 9330742937,
        "FIELD4": ""
      },
      {
        "SlNo": 939,
        "Customer": "S Banerjee ",
        "MobileNo": 7003903665,
        "FIELD4": ""
      },
      {
        "SlNo": 940,
        "Customer": "S Dey ",
        "MobileNo": 8336080492,
        "FIELD4": ""
      },
      {
        "SlNo": 941,
        "Customer": "S K Dutta ",
        "MobileNo": 8145447364,
        "FIELD4": ""
      },
      {
        "SlNo": 942,
        "Customer": "S K Mahanti ",
        "MobileNo": 9874407931,
        "FIELD4": ""
      },
      {
        "SlNo": 943,
        "Customer": "S K Sardar ",
        "MobileNo": 9733778566,
        "FIELD4": ""
      },
      {
        "SlNo": 944,
        "Customer": "S Maytro ",
        "MobileNo": 9831192218,
        "FIELD4": ""
      },
      {
        "SlNo": 946,
        "Customer": "S Rozario ",
        "MobileNo": 9830928130,
        "FIELD4": ""
      },
      {
        "SlNo": 947,
        "Customer": "SADHANA SINGH  ",
        "MobileNo": 7003580190,
        "FIELD4": ""
      },
      {
        "SlNo": 948,
        "Customer": "Salini Chowdhuri ",
        "MobileNo": 6291369928,
        "FIELD4": ""
      },
      {
        "SlNo": 949,
        "Customer": "Ranjit Manna ",
        "MobileNo": 7278683804,
        "FIELD4": ""
      },
      {
        "SlNo": 950,
        "Customer": "Samapika Makhal ",
        "MobileNo": 8910645201,
        "FIELD4": ""
      },
      {
        "SlNo": 951,
        "Customer": "SAMIM DOFTURI  ",
        "MobileNo": 8232013155,
        "FIELD4": ""
      },
      {
        "SlNo": 952,
        "Customer": "SAMIR KR BID  ",
        "MobileNo": 9431915002,
        "FIELD4": ""
      },
      {
        "SlNo": 953,
        "Customer": "Sampa Halder ",
        "MobileNo": 9804809878,
        "FIELD4": ""
      },
      {
        "SlNo": 954,
        "Customer": "Samrat Mukherjee ",
        "MobileNo": 9123975937,
        "FIELD4": ""
      },
      {
        "SlNo": 955,
        "Customer": "Sanchita Dey ",
        "MobileNo": 9641006318,
        "FIELD4": ""
      },
      {
        "SlNo": 956,
        "Customer": "Sandip MAJUMDER  ",
        "MobileNo": 7439139794,
        "FIELD4": ""
      },
      {
        "SlNo": 958,
        "Customer": "SANHITA DAS ",
        "MobileNo": 7044532491,
        "FIELD4": ""
      },
      {
        "SlNo": 959,
        "Customer": "Sanjay Bhowmick ",
        "MobileNo": 8910745725,
        "FIELD4": ""
      },
      {
        "SlNo": 960,
        "Customer": "Sanjay Lakra ",
        "MobileNo": 9432210954,
        "FIELD4": ""
      },
      {
        "SlNo": 961,
        "Customer": "Sanjay mondal ",
        "MobileNo": 8436438838,
        "FIELD4": ""
      },
      {
        "SlNo": 962,
        "Customer": "Sanjay Singh ",
        "MobileNo": 983623288,
        "FIELD4": ""
      },
      {
        "SlNo": 963,
        "Customer": "Sanjit Shaw ",
        "MobileNo": 9903619561,
        "FIELD4": ""
      },
      {
        "SlNo": 964,
        "Customer": "Sanjoy Poddar ",
        "MobileNo": 6290661983,
        "FIELD4": ""
      },
      {
        "SlNo": 965,
        "Customer": "SANKAR DEY  ",
        "MobileNo": 9434112615,
        "FIELD4": ""
      },
      {
        "SlNo": 966,
        "Customer": "Sankhadip Sikder ",
        "MobileNo": 9830168332,
        "FIELD4": ""
      },
      {
        "SlNo": 968,
        "Customer": "Sanoj Kumar Sharma ",
        "MobileNo": 9831510032,
        "FIELD4": ""
      },
      {
        "SlNo": 969,
        "Customer": "Sashoti Sarkar  ",
        "MobileNo": 9831570090,
        "FIELD4": ""
      },
      {
        "SlNo": 971,
        "Customer": "Satadal Panja  ",
        "MobileNo": 7365943595,
        "FIELD4": ""
      },
      {
        "SlNo": 972,
        "Customer": "Sathi Makhal ",
        "MobileNo": 9007612336,
        "FIELD4": ""
      },
      {
        "SlNo": 973,
        "Customer": "Satish ",
        "MobileNo": 9289490505,
        "FIELD4": ""
      },
      {
        "SlNo": 974,
        "Customer": "Satyaji Esra ",
        "MobileNo": 9673307527,
        "FIELD4": ""
      },
      {
        "SlNo": 975,
        "Customer": "Sayantani Bhattarcharya ",
        "MobileNo": 8583916121,
        "FIELD4": ""
      },
      {
        "SlNo": 977,
        "Customer": "Banashree Bhattacharjee ",
        "MobileNo": 7003651575,
        "FIELD4": ""
      },
      {
        "SlNo": 978,
        "Customer": "Banasree Bhattacharya ",
        "MobileNo": 9239537660,
        "FIELD4": ""
      },
      {
        "SlNo": 979,
        "Customer": "Chandna Ghosh ",
        "MobileNo": 6290528946,
        "FIELD4": ""
      },
      {
        "SlNo": 981,
        "Customer": "Debjani Roy ",
        "MobileNo": 9433662150,
        "FIELD4": ""
      },
      {
        "SlNo": 982,
        "Customer": "Dipsikha Basu ",
        "MobileNo": 8100360717,
        "FIELD4": ""
      },
      {
        "SlNo": 984,
        "Customer": "Dipu Das  ",
        "MobileNo": 8240251481,
        "FIELD4": ""
      },
      {
        "SlNo": 985,
        "Customer": "Gitasri Ghorui ",
        "MobileNo": 9477366454,
        "FIELD4": ""
      },
      {
        "SlNo": 986,
        "Customer": "Goutam Chakroborty ",
        "MobileNo": 8617242058,
        "FIELD4": ""
      },
      {
        "SlNo": 988,
        "Customer": "Mamon Palmol ",
        "MobileNo": 7364965594,
        "FIELD4": ""
      },
      {
        "SlNo": 989,
        "Customer": "Paban Kumar Chandra ",
        "MobileNo": 9433850459,
        "FIELD4": ""
      },
      {
        "SlNo": 991,
        "Customer": "Namita Karmakar ",
        "MobileNo": 9051115053,
        "FIELD4": ""
      },
      {
        "SlNo": 993,
        "Customer": "Paromita Paul ",
        "MobileNo": 7980430458,
        "FIELD4": ""
      },
      {
        "SlNo": 994,
        "Customer": "Pradip Doley ",
        "MobileNo": 9874035387,
        "FIELD4": ""
      },
      {
        "SlNo": 995,
        "Customer": "Pradipan Dey ",
        "MobileNo": 8240593662,
        "FIELD4": ""
      },
      {
        "SlNo": 996,
        "Customer": "Priyanka Dey Sarkar ",
        "MobileNo": 8961747934,
        "FIELD4": ""
      },
      {
        "SlNo": 997,
        "Customer": "Rahul Rozario ",
        "MobileNo": 9874229855,
        "FIELD4": ""
      },
      {
        "SlNo": 998,
        "Customer": "Shankadeep Sikdar ",
        "MobileNo": 7003447102,
        "FIELD4": ""
      },
      {
        "SlNo": 1000,
        "Customer": "Sirshendu Samanta ",
        "MobileNo": 8910245424,
        "FIELD4": ""
      },
      {
        "SlNo": 1002,
        "Customer": "Soma Biswas ",
        "MobileNo": 9153857532,
        "FIELD4": ""
      },
      {
        "SlNo": 1003,
        "Customer": "Soumita Das ",
        "MobileNo": 9123909608,
        "FIELD4": ""
      },
      {
        "SlNo": 1004,
        "Customer": "Srinu ",
        "MobileNo": 6291912591,
        "FIELD4": ""
      },
      {
        "SlNo": 1005,
        "Customer": "Subrata Saha ",
        "MobileNo": 9007395552,
        "FIELD4": ""
      },
      {
        "SlNo": 1006,
        "Customer": "Swapna Chakroborty ",
        "MobileNo": 9903285033,
        "FIELD4": ""
      },
      {
        "SlNo": 1008,
        "Customer": "Tapas Sinha ",
        "MobileNo": 9831009824,
        "FIELD4": ""
      },
      {
        "SlNo": 1009,
        "Customer": "SD PRASAD  ",
        "MobileNo": 8789686300,
        "FIELD4": ""
      },
      {
        "SlNo": 1010,
        "Customer": "Shabkat Ali Khan ",
        "MobileNo": 8609204831,
        "FIELD4": ""
      },
      {
        "SlNo": 1011,
        "Customer": "Shakuntala Singh ",
        "MobileNo": 9836986239,
        "FIELD4": ""
      },
      {
        "SlNo": 1012,
        "Customer": "Shalini Chowdhury ",
        "MobileNo": 9051950727,
        "FIELD4": ""
      },
      {
        "SlNo": 1013,
        "Customer": "Shamol Bag ",
        "MobileNo": 7439221043,
        "FIELD4": ""
      },
      {
        "SlNo": 1014,
        "Customer": "Shilpa ",
        "MobileNo": 7439329091,
        "FIELD4": ""
      },
      {
        "SlNo": 1015,
        "Customer": "Shiva Mondal ",
        "MobileNo": 7980219431,
        "FIELD4": ""
      },
      {
        "SlNo": 1016,
        "Customer": "Shiva Rao ",
        "MobileNo": 7980135848,
        "FIELD4": ""
      },
      {
        "SlNo": 1017,
        "Customer": "Shreya Paul ",
        "MobileNo": 9330434062,
        "FIELD4": ""
      },
      {
        "SlNo": 1018,
        "Customer": "Shriparna Shani ",
        "MobileNo": 6291983720,
        "FIELD4": ""
      },
      {
        "SlNo": 1019,
        "Customer": "SHUBHOJIT PAHARI ",
        "MobileNo": 8910946732,
        "FIELD4": ""
      },
      {
        "SlNo": 1020,
        "Customer": "SILA BISWAS ",
        "MobileNo": 8017242209,
        "FIELD4": ""
      },
      {
        "SlNo": 1021,
        "Customer": "Simi Singh ",
        "MobileNo": 7391099085,
        "FIELD4": ""
      },
      {
        "SlNo": 1022,
        "Customer": "SK Asram",
        "MobileNo": 7439037516,
        "FIELD4": ""
      },
      {
        "SlNo": 1023,
        "Customer": "Sk Sharukh ",
        "MobileNo": 9163350804,
        "FIELD4": ""
      },
      {
        "SlNo": 1024,
        "Customer": "Sk. Soma ",
        "MobileNo": 9123639154,
        "FIELD4": ""
      },
      {
        "SlNo": 1025,
        "Customer": "Rahul sardar ",
        "MobileNo": 7003060775,
        "FIELD4": ""
      },
      {
        "SlNo": 1026,
        "Customer": "Soma ",
        "MobileNo": 8376891551,
        "FIELD4": ""
      },
      {
        "SlNo": 1027,
        "Customer": "Soma Banerjee ",
        "MobileNo": 6289432381,
        "FIELD4": ""
      },
      {
        "SlNo": 1028,
        "Customer": "Soma Bhandari ",
        "MobileNo": 8100010796,
        "FIELD4": ""
      },
      {
        "SlNo": 1029,
        "Customer": "Soma Biswas ",
        "MobileNo": 8910770596,
        "FIELD4": ""
      },
      {
        "SlNo": 1030,
        "Customer": "Sombhunath Patra ",
        "MobileNo": 7278883556,
        "FIELD4": ""
      },
      {
        "SlNo": 1031,
        "Customer": "SOMNATH  ",
        "MobileNo": 8777763433,
        "FIELD4": ""
      },
      {
        "SlNo": 1032,
        "Customer": "Sonali Pal ",
        "MobileNo": 7364097005,
        "FIELD4": ""
      },
      {
        "SlNo": 1033,
        "Customer": "Soniya ",
        "MobileNo": 8697118732,
        "FIELD4": ""
      },
      {
        "SlNo": 1034,
        "Customer": "SOUGATA NASKAR ",
        "MobileNo": 9123743132,
        "FIELD4": ""
      },
      {
        "SlNo": 1035,
        "Customer": "Soumadip Dey ",
        "MobileNo": 9062692895,
        "FIELD4": ""
      },
      {
        "SlNo": 1036,
        "Customer": "Soumayajit ",
        "MobileNo": 7439455998,
        "FIELD4": ""
      },
      {
        "SlNo": 1037,
        "Customer": "Soumen Ghosh ",
        "MobileNo": 7797832565,
        "FIELD4": ""
      },
      {
        "SlNo": 1038,
        "Customer": "Soumen Sur ",
        "MobileNo": 9433237063,
        "FIELD4": ""
      },
      {
        "SlNo": 1039,
        "Customer": "Soumi Ghosh ",
        "MobileNo": 6291468505,
        "FIELD4": ""
      },
      {
        "SlNo": 1041,
        "Customer": "Soumya Dev ",
        "MobileNo": 8582946584,
        "FIELD4": ""
      },
      {
        "SlNo": 1042,
        "Customer": "Sourab Sengupta ",
        "MobileNo": 9830688188,
        "FIELD4": ""
      },
      {
        "SlNo": 1043,
        "Customer": "Sourav Roy Chowdhuri ",
        "MobileNo": 8336996796,
        "FIELD4": ""
      },
      {
        "SlNo": 1044,
        "Customer": "Souvik Mondal ",
        "MobileNo": 7980758259,
        "FIELD4": ""
      },
      {
        "SlNo": 1045,
        "Customer": "SP Hanna ",
        "MobileNo": 9477288584,
        "FIELD4": ""
      },
      {
        "SlNo": 1046,
        "Customer": "SREEJA IYER ",
        "MobileNo": 7044299281,
        "FIELD4": ""
      },
      {
        "SlNo": 1047,
        "Customer": "SRIJIT BHATTACHARYA ",
        "MobileNo": 8373918329,
        "FIELD4": ""
      },
      {
        "SlNo": 1048,
        "Customer": "Srinath Makhal ",
        "MobileNo": 8276838738,
        "FIELD4": ""
      },
      {
        "SlNo": 1049,
        "Customer": "sristi ",
        "MobileNo": 9836392196,
        "FIELD4": ""
      },
      {
        "SlNo": 1050,
        "Customer": "SUBHAL DAS  ",
        "MobileNo": 9563253945,
        "FIELD4": ""
      },
      {
        "SlNo": 1051,
        "Customer": "Subham Raj ",
        "MobileNo": 7980126741,
        "FIELD4": ""
      },
      {
        "SlNo": 1052,
        "Customer": "Subhendu Biswas ",
        "MobileNo": 9883087880,
        "FIELD4": ""
      },
      {
        "SlNo": 1053,
        "Customer": "SUBIR  ",
        "MobileNo": 9903329899,
        "FIELD4": ""
      },
      {
        "SlNo": 1054,
        "Customer": "SUBIR SAHA  ",
        "MobileNo": 8777060871,
        "FIELD4": ""
      },
      {
        "SlNo": 1056,
        "Customer": "Subrata Chakraborty ",
        "MobileNo": 9830464115,
        "FIELD4": ""
      },
      {
        "SlNo": 1057,
        "Customer": "Subrata Dey ",
        "MobileNo": 9561341087,
        "FIELD4": ""
      },
      {
        "SlNo": 1058,
        "Customer": "SUCHITRA SEN  ",
        "MobileNo": 6363436282,
        "FIELD4": ""
      },
      {
        "SlNo": 1059,
        "Customer": "SUDIPTO  ",
        "MobileNo": 9831928930,
        "FIELD4": ""
      },
      {
        "SlNo": 1060,
        "Customer": "Sudipto Mondal ",
        "MobileNo": 9674040000,
        "FIELD4": ""
      },
      {
        "SlNo": 1061,
        "Customer": "SUFAL HALDER ",
        "MobileNo": 9477942206,
        "FIELD4": ""
      },
      {
        "SlNo": 1062,
        "Customer": "SUJATA ",
        "MobileNo": 8777231252,
        "FIELD4": ""
      },
      {
        "SlNo": 1063,
        "Customer": "",
        "MobileNo": null,
        "FIELD4": ""
      },
      {
        "SlNo": 1064,
        "Customer": "Sukumar Haji ",
        "MobileNo": 9874335873,
        "FIELD4": ""
      },
      {
        "SlNo": 1065,
        "Customer": "Suman ",
        "MobileNo": 8777242519,
        "FIELD4": ""
      },
      {
        "SlNo": 1066,
        "Customer": "Suman Dey ",
        "MobileNo": 9830856829,
        "FIELD4": ""
      },
      {
        "SlNo": 1067,
        "Customer": "Suman Mondal ",
        "MobileNo": 6289296010,
        "FIELD4": ""
      },
      {
        "SlNo": 1068,
        "Customer": "SUMANA ROY CHOWDHURY ",
        "MobileNo": 7595025051,
        "FIELD4": ""
      },
      {
        "SlNo": 1069,
        "Customer": "SUMONI MURMU ",
        "MobileNo": 9875302890,
        "FIELD4": ""
      },
      {
        "SlNo": 1070,
        "Customer": "Sunita ",
        "MobileNo": 9875516175,
        "FIELD4": ""
      },
      {
        "SlNo": 1071,
        "Customer": "Sunita Mondal ",
        "MobileNo": 7980549776,
        "FIELD4": ""
      },
      {
        "SlNo": 1072,
        "Customer": "Suparna ",
        "MobileNo": 7602360859,
        "FIELD4": ""
      },
      {
        "SlNo": 1073,
        "Customer": "Supriya Das ",
        "MobileNo": 9903721483,
        "FIELD4": ""
      },
      {
        "SlNo": 1074,
        "Customer": "SUPRIYO  ",
        "MobileNo": 6295863661,
        "FIELD4": ""
      },
      {
        "SlNo": 1075,
        "Customer": "Surajit Chakroborty ",
        "MobileNo": 8910921275,
        "FIELD4": ""
      },
      {
        "SlNo": 1076,
        "Customer": "SURJO SEN ",
        "MobileNo": 9935010011,
        "FIELD4": ""
      },
      {
        "SlNo": 1077,
        "Customer": "Surojit Das ",
        "MobileNo": 8918763066,
        "FIELD4": ""
      },
      {
        "SlNo": 1078,
        "Customer": "Surojit Mondal ",
        "MobileNo": 9051333339,
        "FIELD4": ""
      },
      {
        "SlNo": 1079,
        "Customer": "SUROJIT MULLICK ",
        "MobileNo": 8420519023,
        "FIELD4": ""
      },
      {
        "SlNo": 1080,
        "Customer": "Susmita Naskar ",
        "MobileNo": 9831991716,
        "FIELD4": ""
      },
      {
        "SlNo": 1081,
        "Customer": "Susoma khila ",
        "MobileNo": 7605826236,
        "FIELD4": ""
      },
      {
        "SlNo": 1082,
        "Customer": "Swagata Bose ",
        "MobileNo": 8011759487,
        "FIELD4": ""
      },
      {
        "SlNo": 1083,
        "Customer": "SWAPNA MUKHERJEE ",
        "MobileNo": 9903943409,
        "FIELD4": ""
      },
      {
        "SlNo": 1084,
        "Customer": "Swapna Upadhyay ",
        "MobileNo": 6290705869,
        "FIELD4": ""
      },
      {
        "SlNo": 1085,
        "Customer": "Swati Naskar ",
        "MobileNo": 6289092048,
        "FIELD4": ""
      },
      {
        "SlNo": 1086,
        "Customer": "Syad ",
        "MobileNo": 9123714026,
        "FIELD4": ""
      },
      {
        "SlNo": 1087,
        "Customer": "T Das ",
        "MobileNo": 9647601888,
        "FIELD4": ""
      },
      {
        "SlNo": 1088,
        "Customer": "Tania Caston ",
        "MobileNo": 9674261866,
        "FIELD4": ""
      },
      {
        "SlNo": 1089,
        "Customer": "Tanima Laha ",
        "MobileNo": 9007962242,
        "FIELD4": ""
      },
      {
        "SlNo": 1090,
        "Customer": "Taniya Barik ",
        "MobileNo": 6289362690,
        "FIELD4": ""
      },
      {
        "SlNo": 1091,
        "Customer": "TANMAY NATH ",
        "MobileNo": 9903206070,
        "FIELD4": ""
      },
      {
        "SlNo": 1092,
        "Customer": "Tanu Mondal ",
        "MobileNo": 7718194622,
        "FIELD4": ""
      },
      {
        "SlNo": 1093,
        "Customer": "Tapan Bera ",
        "MobileNo": 9748759707,
        "FIELD4": ""
      },
      {
        "SlNo": 1094,
        "Customer": " TAPAN MITRA ",
        "MobileNo": 9433434660,
        "FIELD4": ""
      },
      {
        "SlNo": 1095,
        "Customer": "Tapas ",
        "MobileNo": 8961645166,
        "FIELD4": ""
      },
      {
        "SlNo": 1096,
        "Customer": "Tapas Banerjee ",
        "MobileNo": 9830683086,
        "FIELD4": ""
      },
      {
        "SlNo": 1097,
        "Customer": "Tapas Mazumder ",
        "MobileNo": 9831041371,
        "FIELD4": ""
      },
      {
        "SlNo": 1098,
        "Customer": "Tapash Nandy ",
        "MobileNo": 8777596969,
        "FIELD4": ""
      },
      {
        "SlNo": 1099,
        "Customer": "TAPATI HALDER ",
        "MobileNo": 9051241029,
        "FIELD4": ""
      },
      {
        "SlNo": 1100,
        "Customer": "TAPPAS MONDAL  ",
        "MobileNo": 908849083,
        "FIELD4": ""
      },
      {
        "SlNo": 1101,
        "Customer": "Jayanta Sarder ",
        "MobileNo": 9073806258,
        "FIELD4": ""
      },
      {
        "SlNo": 1102,
        "Customer": "Tina  ",
        "MobileNo": 9051642531,
        "FIELD4": ""
      },
      {
        "SlNo": 1103,
        "Customer": "Tinku Mondal ",
        "MobileNo": 7685015878,
        "FIELD4": ""
      },
      {
        "SlNo": 1104,
        "Customer": "Mithun Bag ",
        "MobileNo": 9477646692,
        "FIELD4": ""
      },
      {
        "SlNo": 1105,
        "Customer": "Abhisekh Das ",
        "MobileNo": 8981868250,
        "FIELD4": ""
      },
      {
        "SlNo": 1106,
        "Customer": "Aditi Pramanik ",
        "MobileNo": 6290748701,
        "FIELD4": ""
      },
      {
        "SlNo": 1107,
        "Customer": "Ahana Roy ",
        "MobileNo": 9073708498,
        "FIELD4": ""
      },
      {
        "SlNo": 1108,
        "Customer": "Akash Mukherjee ",
        "MobileNo": 8910533880,
        "FIELD4": ""
      },
      {
        "SlNo": 1109,
        "Customer": "Ananya Mukherjee ",
        "MobileNo": 8777656184,
        "FIELD4": ""
      },
      {
        "SlNo": 1110,
        "Customer": "Anindita Mukerjee ",
        "MobileNo": 7003228923,
        "FIELD4": ""
      },
      {
        "SlNo": 1111,
        "Customer": "Anthony Gomes ",
        "MobileNo": 9831983707,
        "FIELD4": ""
      },
      {
        "SlNo": 1112,
        "Customer": "Arijit Barua ",
        "MobileNo": 8777017390,
        "FIELD4": ""
      },
      {
        "SlNo": 1113,
        "Customer": "Atanu Halder ",
        "MobileNo": 9051729817,
        "FIELD4": ""
      },
      {
        "SlNo": 1114,
        "Customer": "Bhaskar Mukherjee  ",
        "MobileNo": 9432941852,
        "FIELD4": ""
      },
      {
        "SlNo": 1115,
        "Customer": "Bijay Tirki ",
        "MobileNo": 9163766660,
        "FIELD4": ""
      },
      {
        "SlNo": 1116,
        "Customer": "Bikash Shah ",
        "MobileNo": 8910289474,
        "FIELD4": ""
      },
      {
        "SlNo": 1117,
        "Customer": "Chaitali Das ",
        "MobileNo": 8981301290,
        "FIELD4": ""
      },
      {
        "SlNo": 1118,
        "Customer": "Debasmita Rang ",
        "MobileNo": 8583087320,
        "FIELD4": ""
      },
      {
        "SlNo": 1119,
        "Customer": "Debojyoti Chakraborty ",
        "MobileNo": 9831356146,
        "FIELD4": ""
      },
      {
        "SlNo": 1120,
        "Customer": "Debraj Nandan ",
        "MobileNo": 6294834559,
        "FIELD4": ""
      },
      {
        "SlNo": 1121,
        "Customer": "Dinesh ",
        "MobileNo": 9600232322,
        "FIELD4": ""
      },
      {
        "SlNo": 1122,
        "Customer": "Diprova Biswas ",
        "MobileNo": 9674732648,
        "FIELD4": ""
      },
      {
        "SlNo": 1123,
        "Customer": "Ganesh Patra ",
        "MobileNo": 8017710950,
        "FIELD4": ""
      },
      {
        "SlNo": 1124,
        "Customer": "Juhi Sen ",
        "MobileNo": 8240575911,
        "FIELD4": ""
      },
      {
        "SlNo": 1125,
        "Customer": "Juli Mondal ",
        "MobileNo": 8777754943,
        "FIELD4": ""
      },
      {
        "SlNo": 1126,
        "Customer": "Kaberi Mullick ",
        "MobileNo": 9073249979,
        "FIELD4": ""
      },
      {
        "SlNo": 1127,
        "Customer": "Kakali Dey ",
        "MobileNo": 9433269720,
        "FIELD4": ""
      },
      {
        "SlNo": 1128,
        "Customer": "Kalyan  ",
        "MobileNo": 9538167774,
        "FIELD4": ""
      },
      {
        "SlNo": 1129,
        "Customer": "Keya Chakraborty ",
        "MobileNo": 9875394800,
        "FIELD4": ""
      },
      {
        "SlNo": 1131,
        "Customer": "Madhumita Pyne ",
        "MobileNo": 9836143029,
        "FIELD4": ""
      },
      {
        "SlNo": 1132,
        "Customer": "Malovika Biswas ",
        "MobileNo": 9748540729,
        "FIELD4": ""
      },
      {
        "SlNo": 1133,
        "Customer": "Manisha Sen  ",
        "MobileNo": 9073277005,
        "FIELD4": ""
      },
      {
        "SlNo": 1134,
        "Customer": "Manisha Shaw ",
        "MobileNo": 8240800556,
        "FIELD4": ""
      },
      {
        "SlNo": 1135,
        "Customer": "Matrix Suvangi Mondal ",
        "MobileNo": 7278405741,
        "FIELD4": ""
      },
      {
        "SlNo": 1137,
        "Customer": "Misirai Bha acharjee ",
        "MobileNo": 6289445891,
        "FIELD4": ""
      },
      {
        "SlNo": 1138,
        "Customer": "Mithun Chakroborty ",
        "MobileNo": 9903272590,
        "FIELD4": ""
      },
      {
        "SlNo": 1139,
        "Customer": "Mitu Dutta ",
        "MobileNo": 9433320968,
        "FIELD4": ""
      },
      {
        "SlNo": 1140,
        "Customer": "Mou Basu ",
        "MobileNo": 9933442036,
        "FIELD4": ""
      },
      {
        "SlNo": 1141,
        "Customer": "Nibedita Sinha Roy ",
        "MobileNo": 9038935968,
        "FIELD4": ""
      },
      {
        "SlNo": 1142,
        "Customer": "Nil Kamal Singha  ",
        "MobileNo": 6291671645,
        "FIELD4": ""
      },
      {
        "SlNo": 1143,
        "Customer": "Nivedita Chakraborty ",
        "MobileNo": 8777719804,
        "FIELD4": ""
      },
      {
        "SlNo": 1144,
        "Customer": "P Roy ",
        "MobileNo": 9007214348,
        "FIELD4": ""
      },
      {
        "SlNo": 1145,
        "Customer": "P Dhan ",
        "MobileNo": 6290449809,
        "FIELD4": ""
      },
      {
        "SlNo": 1146,
        "Customer": "Parthojit Mondal ",
        "MobileNo": 9433231849,
        "FIELD4": ""
      },
      {
        "SlNo": 1147,
        "Customer": "Piyali Halder ",
        "MobileNo": 9073384188,
        "FIELD4": ""
      },
      {
        "SlNo": 1148,
        "Customer": "Piyali Mitra ",
        "MobileNo": 9830491574,
        "FIELD4": ""
      },
      {
        "SlNo": 1149,
        "Customer": "Poushali Ghosh ",
        "MobileNo": 9681649736,
        "FIELD4": ""
      },
      {
        "SlNo": 1150,
        "Customer": "Puja Das ",
        "MobileNo": 8100076469,
        "FIELD4": ""
      },
      {
        "SlNo": 1151,
        "Customer": "Puspita Malakar ",
        "MobileNo": 9007070687,
        "FIELD4": ""
      },
      {
        "SlNo": 1152,
        "Customer": "Rakhi Mondal ",
        "MobileNo": 9007058263,
        "FIELD4": ""
      },
      {
        "SlNo": 1153,
        "Customer": "Ranita Sarkar ",
        "MobileNo": 8017177517,
        "FIELD4": ""
      },
      {
        "SlNo": 1154,
        "Customer": "Rupa Mondal ",
        "MobileNo": 9903496049,
        "FIELD4": ""
      },
      {
        "SlNo": 1155,
        "Customer": "S Roy ",
        "MobileNo": 8910878404,
        "FIELD4": ""
      },
      {
        "SlNo": 1156,
        "Customer": "Sanghamitra Das ",
        "MobileNo": 9433777464,
        "FIELD4": ""
      },
      {
        "SlNo": 1157,
        "Customer": "Sangita Murmu ",
        "MobileNo": 8697477603,
        "FIELD4": ""
      },
      {
        "SlNo": 1158,
        "Customer": "Santa Paul ",
        "MobileNo": 8001882524,
        "FIELD4": ""
      },
      {
        "SlNo": 1159,
        "Customer": "Seema Basu ",
        "MobileNo": 9831974771,
        "FIELD4": ""
      },
      {
        "SlNo": 1160,
        "Customer": "SIKANTA GOSWAMI ",
        "MobileNo": 9051876883,
        "FIELD4": ""
      },
      {
        "SlNo": 1161,
        "Customer": "Sima Banik ",
        "MobileNo": 8617285418,
        "FIELD4": ""
      },
      {
        "SlNo": 1162,
        "Customer": "S K Maity ",
        "MobileNo": 7044760880,
        "FIELD4": ""
      },
      {
        "SlNo": 1163,
        "Customer": "Snighda Dutta ",
        "MobileNo": 7278511763,
        "FIELD4": ""
      },
      {
        "SlNo": 1164,
        "Customer": "Sonali Naskar ",
        "MobileNo": 9331060698,
        "FIELD4": ""
      },
      {
        "SlNo": 1165,
        "Customer": "Srijita Makhal ",
        "MobileNo": 9330267790,
        "FIELD4": ""
      },
      {
        "SlNo": 1166,
        "Customer": "Uttam Sarkar ",
        "MobileNo": 9831942011,
        "FIELD4": ""
      },
      {
        "SlNo": 1167,
        "Customer": "Subhankar Mitra ",
        "MobileNo": 9804674421,
        "FIELD4": ""
      },
      {
        "SlNo": 1168,
        "Customer": "Sudeshna Chakraborty ",
        "MobileNo": 6291656937,
        "FIELD4": ""
      },
      {
        "SlNo": 1169,
        "Customer": "Sunil Kumar Singh ",
        "MobileNo": 7278083606,
        "FIELD4": ""
      },
      {
        "SlNo": 1171,
        "Customer": "Susan Francis ",
        "MobileNo": 9748622145,
        "FIELD4": ""
      },
      {
        "SlNo": 1172,
        "Customer": "Sushma Lama ",
        "MobileNo": 8697108413,
        "FIELD4": ""
      },
      {
        "SlNo": 1173,
        "Customer": "Sushmita Rozario ",
        "MobileNo": 6291331482,
        "FIELD4": ""
      },
      {
        "SlNo": 1174,
        "Customer": "Sutrina Chakraborty ",
        "MobileNo": 8777424458,
        "FIELD4": ""
      },
      {
        "SlNo": 1175,
        "Customer": "Tanushree Roy ",
        "MobileNo": 8017891990,
        "FIELD4": ""
      },
      {
        "SlNo": 1176,
        "Customer": "Tapati Makhal ",
        "MobileNo": 9674872614,
        "FIELD4": ""
      },
      {
        "SlNo": 1177,
        "Customer": "Tirthadeb Banerjee ",
        "MobileNo": 9007386937,
        "FIELD4": ""
      },
      {
        "SlNo": 1178,
        "Customer": "Priyanka Maity ",
        "MobileNo": 7003262844,
        "FIELD4": ""
      },
      {
        "SlNo": 1179,
        "Customer": "Trilochan Samanta  ",
        "MobileNo": 7384205461,
        "FIELD4": ""
      },
      {
        "SlNo": 1180,
        "Customer": "Abishek Biswas ",
        "MobileNo": 9002040043,
        "FIELD4": ""
      },
      {
        "SlNo": 1181,
        "Customer": "Ajit Kumar Jha ",
        "MobileNo": 9831200643,
        "FIELD4": ""
      },
      {
        "SlNo": 1183,
        "Customer": "Ashish Dey  ",
        "MobileNo": 8617321452,
        "FIELD4": ""
      },
      {
        "SlNo": 1185,
        "Customer": "Bibhash Kr Bha archarj ",
        "MobileNo": 9433222825,
        "FIELD4": ""
      },
      {
        "SlNo": 1186,
        "Customer": "Debbani Mitra ",
        "MobileNo": 8240135329,
        "FIELD4": ""
      },
      {
        "SlNo": 1187,
        "Customer": "Gautam Cha erjee ",
        "MobileNo": 9073106284,
        "FIELD4": ""
      },
      {
        "SlNo": 1189,
        "Customer": "Indira Roy ",
        "MobileNo": 9874344955,
        "FIELD4": ""
      },
      {
        "SlNo": 1191,
        "Customer": "Jasin Tdu ",
        "MobileNo": 8697883660,
        "FIELD4": ""
      },
      {
        "SlNo": 1192,
        "Customer": "Jishnu Bhattacharjee ",
        "MobileNo": 9330001200,
        "FIELD4": ""
      },
      {
        "SlNo": 1193,
        "Customer": "Kaushik Dey ",
        "MobileNo": 9903310344,
        "FIELD4": ""
      },
      {
        "SlNo": 1194,
        "Customer": "Kuheli Chakraborty ",
        "MobileNo": 8335888110,
        "FIELD4": ""
      },
      {
        "SlNo": 1195,
        "Customer": "Likhita Gorla ",
        "MobileNo": 9674772792,
        "FIELD4": ""
      },
      {
        "SlNo": 1197,
        "Customer": "Mamata Talwar ",
        "MobileNo": 9831998132,
        "FIELD4": ""
      },
      {
        "SlNo": 1198,
        "Customer": "Mrs. Sharma ",
        "MobileNo": 9830882477,
        "FIELD4": ""
      },
      {
        "SlNo": 1199,
        "Customer": "Nilay Chatterjee ",
        "MobileNo": 9830717030,
        "FIELD4": ""
      },
      {
        "SlNo": 1202,
        "Customer": "Pinaki Bose ",
        "MobileNo": 7980042512,
        "FIELD4": ""
      },
      {
        "SlNo": 1203,
        "Customer": "Rekha Chowdhury ",
        "MobileNo": 9123602744,
        "FIELD4": ""
      },
      {
        "SlNo": 1204,
        "Customer": "Rupak Chakroborty ",
        "MobileNo": 8107991978,
        "FIELD4": ""
      },
      {
        "SlNo": 1205,
        "Customer": "S K Dasgupta ",
        "MobileNo": 8910920978,
        "FIELD4": ""
      },
      {
        "SlNo": 1208,
        "Customer": "Santo Kr Cha erjee ",
        "MobileNo": 8240209508,
        "FIELD4": ""
      },
      {
        "SlNo": 1209,
        "Customer": "Shibaji Roy ",
        "MobileNo": 9830083142,
        "FIELD4": ""
      },
      {
        "SlNo": 1213,
        "Customer": "Shikha Chakraborty ",
        "MobileNo": 6289433542,
        "FIELD4": ""
      },
      {
        "SlNo": 1214,
        "Customer": "Somesh Roy ",
        "MobileNo": 9038322607,
        "FIELD4": ""
      },
      {
        "SlNo": 1215,
        "Customer": "Sonali Das ",
        "MobileNo": 7980441185,
        "FIELD4": ""
      },
      {
        "SlNo": 1216,
        "Customer": "Suman Biswas ",
        "MobileNo": 7687936708,
        "FIELD4": ""
      },
      {
        "SlNo": 1217,
        "Customer": "Sweta Mishra ",
        "MobileNo": 9721440595,
        "FIELD4": ""
      },
      {
        "SlNo": 1219,
        "Customer": "Tanmoy Sarkar ",
        "MobileNo": 9778583986,
        "FIELD4": ""
      },
      {
        "SlNo": 1220,
        "Customer": "Tuhin Biswas ",
        "MobileNo": 9748752130,
        "FIELD4": ""
      },
      {
        "SlNo": 1221,
        "Customer": "Tusar bera ",
        "MobileNo": 7439564758,
        "FIELD4": ""
      },
      {
        "SlNo": 1222,
        "Customer": "Rintu Das ",
        "MobileNo": 8777658127,
        "FIELD4": ""
      },
      {
        "SlNo": 1223,
        "Customer": "UJJAL  ",
        "MobileNo": 8820765244,
        "FIELD4": ""
      },
      {
        "SlNo": 1225,
        "Customer": "Ujjal Adhikary ",
        "MobileNo": 9804515542,
        "FIELD4": ""
      },
      {
        "SlNo": 1226,
        "Customer": "UJJAL NANDI  ",
        "MobileNo": 9433602306,
        "FIELD4": ""
      },
      {
        "SlNo": 1227,
        "Customer": "Unknown 1",
        "MobileNo": 7003098094,
        "FIELD4": ""
      },
      {
        "SlNo": 1228,
        "Customer": "Unknown 2",
        "MobileNo": 7003545680,
        "FIELD4": ""
      },
      {
        "SlNo": 1229,
        "Customer": "Unknown 3",
        "MobileNo": 7439178474,
        "FIELD4": ""
      },
      {
        "SlNo": 1230,
        "Customer": "Unknown 4",
        "MobileNo": 8700955669,
        "FIELD4": ""
      },
      {
        "SlNo": 1231,
        "Customer": "Unknown 5",
        "MobileNo": 9062507763,
        "FIELD4": ""
      },
      {
        "SlNo": 1232,
        "Customer": "Unknown 6",
        "MobileNo": 9830730708,
        "FIELD4": ""
      },
      {
        "SlNo": 1233,
        "Customer": "Unknown 7",
        "MobileNo": 9933660250,
        "FIELD4": ""
      },
      {
        "SlNo": 1234,
        "Customer": "Unkown 8",
        "MobileNo": 7263894104,
        "FIELD4": ""
      },
      {
        "SlNo": 1236,
        "Customer": "Uttam Sarkar ",
        "MobileNo": 7003281255,
        "FIELD4": ""
      },
      {
        "SlNo": 1237,
        "Customer": "VARUN SARKAR ",
        "MobileNo": 8100596062,
        "FIELD4": ""
      },
      {
        "SlNo": 1238,
        "Customer": "Veinket ",
        "MobileNo": 8309734724,
        "FIELD4": ""
      },
      {
        "SlNo": 1239,
        "Customer": "Venket Ray  ",
        "MobileNo": 9836586789,
        "FIELD4": ""
      },
      {
        "SlNo": 1240,
        "Customer": "Venna Srivastav ",
        "MobileNo": 9830972646,
        "FIELD4": ""
      },
      {
        "SlNo": 1241,
        "Customer": "Vicky ",
        "MobileNo": 9836896333,
        "FIELD4": ""
      },
      {
        "SlNo": 1242,
        "Customer": "Vinod Rajak ",
        "MobileNo": 8910464540,
        "FIELD4": ""
      },
      {
        "SlNo": 1243,
        "Customer": "Vinoy Jha ",
        "MobileNo": 8017377184,
        "FIELD4": ""
      },
      {
        "SlNo": 1244,
        "Customer": "Vishal ",
        "MobileNo": 798066076,
        "FIELD4": "Incomplete number"
      },
      {
        "SlNo": 1245,
        "Customer": "VIVEK GANGULY ",
        "MobileNo": 9931780382,
        "FIELD4": ""
      },
      {
        "SlNo": 1246,
        "Customer": "Wholesale Thuder & Co ",
        "MobileNo": 9004379317,
        "FIELD4": ""
      },
      {
        "SlNo": 1248,
        "Customer": "M Nath ",
        "MobileNo": 8585083826,
        "FIELD4": ""
      },
      {
        "SlNo": 1249,
        "Customer": "Padmini Gomes ",
        "MobileNo": 9804945709,
        "FIELD4": ""
      },
      {
        "SlNo": 1250,
        "Customer": "Shantanu Dasgupta ",
        "MobileNo": 8372933443,
        "FIELD4": ""
      },
      {
        "SlNo": 1251,
        "Customer": "Sumanta Bhaya ",
        "MobileNo": 9474775200,
        "FIELD4": ""
      },
      {
        "SlNo": 1253,
        "Customer": "Indrajit Mukherjee ",
        "MobileNo": 8420888020,
        "FIELD4": ""
      },
      {
        "SlNo": 1255,
        "Customer": "S N Baxi ",
        "MobileNo": 8697755090,
        "FIELD4": ""
      },
      {
        "SlNo": 1256,
        "Customer": "Sahiti Adhikary ",
        "MobileNo": 8210144076,
        "FIELD4": ""
      },
      {
        "SlNo": 1257,
        "Customer": "Somenath Baksi ",
        "MobileNo": 8334075618,
        "FIELD4": ""
      },
      {
        "SlNo": 1258,
        "Customer": "Zita Maria ",
        "MobileNo": 8723942066,
        "FIELD4": ""
      }
     ]

    let salt = bcrypt.genSaltSync(10);

    let encryptedPassword = bcrypt.hashSync("grocernest", salt);

    const customerArrayWithoutCheck = jsonArray
      .slice(req.body.start, req.body.end)
      .map((current) => {
        if (current.Customer && current.MobileNo) {
          return {
            id: Math.floor(Math.random() * 10000000 + 1),

            cust_no: uniqid(),

            contact_no: current.MobileNo ? current.MobileNo.toString() : null,

            cust_name: current.Customer,
          };
        }
      });

    console.log(customerArrayWithoutCheck);

    customerArrayWithoutCheck.map(async (current) => {
      if (current) {
        const currentUser = await Customer.findOne({
          where: { contact_no: current.contact_no },
        });

        if (!currentUser) {
          await Customer.create({
            id: current.id,

            cust_no: current.cust_no,

            active_ind: "Y",

            cust_name: current.cust_name,

            email: null,

            contact_no: current.contact_no,

            calling_number: current.contact_no,

            password: encryptedPassword,

            created_by: 1,

            registered_for_ecomm: 1,
          });

          await Wallet.create({
            wallet_id: uniqid(),

            cust_no: current.cust_no,

            balance: 0,

            created_by: 2,
          });
        }
      }
    });
    return res.status(200).send({
      success: true,
      data: "pratik da zindabad",
      message: "good job mehul",
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: err.message,
      message: "wallet error",
    });
  }
};

module.exports = { addWalletBalance, checkBatchNo, migrateCustomers };
