const randomAlphanumericStringGenerator = (stringLength) =>{

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

    const randomStringArray = Array.from (
        {length: stringLength},
        ()=> characters[Math.floor(Math.random()*characters.length)]
    )

    const randomString = randomStringArray.join("");
    return randomString

}

module.exports ={randomAlphanumericStringGenerator}