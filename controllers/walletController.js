
const getAllTransactionsOfUser = async (req,res,next) => {

    //use the user id to look up the transaction table.
    //Find all the transactions and send it
}

const getBalanceOfUser = async (req,res,next) => {
    //use the user id to look up the wallet balance table.
    //Find the balance and send it
}

module.exports = {
    getAllTransactionsOfUser,
    getBalanceOfUser
}

