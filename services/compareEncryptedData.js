const bcrypt = require('bcrypt')

const compareEncryptedData = async (inputPassword, dbPassword) => {
    const compareResult = await bcrypt.compare(inputPassword, dbPassword)

    return (
        compareResult
    )
}

module.exports = compareEncryptedData