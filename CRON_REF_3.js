// POS CASHBACK

const { Op } = require("sequelize");
const cron = require("node-cron");
const uniqid = require("uniqid");
const { sequelize } = require("./models");
const db = require("./models");

const Customers = db.CustomerModel;
const Order = db.OrderModel;
const Invoice = db.InvoiceModel;
const invoice_item_dtls = db.InvoiceItemDtlsModel;
const inventory = db.InventoryModel;
const Wallet = db.WalletModel;
const Wallet_Transaction = db.WalletTransactionModel;
const WalletService = require("./services/walletService");

const { sendCronReport } = require("./services/whatsapp/whatsappMessages");

const pos_refferal_job = async () => {
  // schedule time 11pm every day
  cron.schedule("0 23 * * *", async () => {
    console.log("Running scheduled CRON-JOB.....");

    // cashback task
    // await pos_cashback_job();
    await pos_cashback_job_new();
  });
};

// THIS FUNCTION IS NOT WORKING ANYMORE
const pos_cashback_job = async () => {
  console.log("POS CASHBACK CRONJOB STARTED..");
  let c = 0;

  try {
    let walletService = new WalletService();

    const [invoices, metadata] = await sequelize.query(
      `select * from t_invoice ti where 
      ti.return_flag ="N" and 
      payment_conf_ind = "Y" and 
      cashback_processed is null and
      cashback_amount is not null and
      cashback_amount > 0;`
    );

    // search invoices for today's date
    // const invoices = await Invoice.findAll({
    //   where: {
    //     return_flag: "N",
    //     payment_conf_ind: "Y",
    //     cashback_processed: null,
    //     created_at: {
    //       // [Op.startsWith]: "2022-10-26",
    //       [Op.startsWith]: new Date().toISOString().slice(0, 10),
    //     },
    //   },
    // });

    // console.log("INVOICE====", invoices.length)

    // map the invoices
    await invoices.map(async (current_invoice) => {
      if (current_invoice.cashback_processed != "1") {
        const invoice_items = await invoice_item_dtls.findAll({
          where: {
            invoice_id: current_invoice.id,
          },
        });

        // items per invoice
        invoice_items.map(async (current_item) => {
          // console.log(item.item_id)
          const inventory_item = await inventory.findOne({
            where: {
              item_id: current_item.item_id,
              batch_id: current_item.batch_id,
              balance_type: 1,
            },
          });

          // console.log(typeof inventory_item.cashback);
          if (inventory_item.cashback) {
            // c += 1
            // console.log("-", inventory_item.cashback)
            // console.log("SALE_PRICE", current_item.sale_price);
            // console.log("CASHBACK IS P", inventory_item.cashback_is_percentage);
            // console.log("HAS CASHBACK", inventory_item.cashback);
            let cashback_amt = 0;
            if (inventory_item.cashback_is_percentage == 1) {
              cashback_amt = (
                (current_item.sale_price / 100) *
                inventory_item.cashback
              ).toFixed(2);
            } else {
              cashback_amt = inventory_item.cashback;
            }

            let this_invoice = await Invoice.findOne({
              where: { id: current_invoice.id },
            });
            console.log("cashback=>", cashback_amt);

            // insert into wallet
            // fetch customer

            let cust = await Customers.findOne({
              where: {
                id: current_invoice.cust_id,
              },
            });
            // console.log("current_invoice---", cust);
            if (cust.password)
              await walletService.creditAmount(
                cashback_amt,
                cust.cust_no,
                "Cashback added for Store Purchase INV/PREFIX/" +
                  current_invoice.id
              );

            await Invoice.update(
              {
                cashback_processed: "1",
                cashback_amount: parseFloat(cashback_amt),
              },
              {
                where: {
                  id: current_invoice.id,
                },
              }
            );
          }
        });
      }
    });
    sendCronReport("cron_ref_3_S");
    // console.log("C==>>", c);
  } catch (err) {
    console.log("CASHBACK POS CRON JOB ERROR=> ", err);
    sendCronReport("cron_ref_3_F");
  }
};

//ONLY FOR POS,
const pos_cashback_job_new = async () => {
  console.log("POS CASHBACK CRONJOB STARTED..");
  let c = 0;

  try {
    let walletService = new WalletService();

    const [invoices, metadata] = await sequelize.query(
      `select * from t_invoice ti where 
      ti.return_flag ="N" and 
      payment_conf_ind = "Y" and 
      cashback_processed is null and
      cashback_amount is not null and
      cashback_amount > 0;`
    );

    // map the invoices
    await invoices.map(async (current_invoice) => {
      if (current_invoice.cashback_processed != "1") {
        // items per invoice

        if (current_invoice.cashback_amount) {
          let cashback_amt = 0;

          cashback_amt = current_invoice.cashback_amount;

          // insert into wallet
          // fetch customer

          let cust = await Customers.findOne({
            where: {
              id: current_invoice.cust_id,
            },
          });
          // console.log("current_invoice---", cust);
          if (cust.password)
            await walletService.creditAmount(
              cashback_amt,
              cust.cust_no,
              "Cashback added for Store Purchase INV/PREFIX/" +
                current_invoice.id
            );

          await Invoice.update(
            {
              cashback_processed: "1",
              cashback_amount: parseFloat(cashback_amt),
            },
            {
              where: {
                id: current_invoice.id,
              },
            }
          );
        }
      }
    });
    sendCronReport("SUCCESS");
    // console.log("C==>>", c);
  } catch (err) {
    console.log("CASHBACK POS CRON JOB ERROR=> ", err);
    sendCronReport("FAILED");
  }
};

// cashback_job();
// job();

module.exports = pos_refferal_job;

// pos_cashback_job();
// pos_cashback_job_new();
