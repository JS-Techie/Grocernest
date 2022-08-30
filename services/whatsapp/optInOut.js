var axios = require('axios');
var qs = require('qs');

const optIn = async (mobile_number) => {

    var data = qs.stringify({
        'user': mobile_number.toString()
    });
    var config = {
        method: 'post',
        url: 'https://api.gupshup.io/sm/api/v1/app/opt/in/Grocernest',
        headers: {
            'apikey': 'hm7797tb46hrtrgcsqksvxs69yj9zza4',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    const response = await axios(config)
    console.log(response.status);
    return response.status;
}

const optOut = async (mobile_number) => {
    var data = qs.stringify({
        'user': mobile_number.toString()
    });
    var config = {
        method: 'post',
        url: 'https://api.gupshup.io/sm/api/v1/app/opt/out/Grocernest',
        headers: {
            'apikey': 'hm7797tb46hrtrgcsqksvxs69yj9zza4',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    const response = await axios(config)
    console.log(response.status);
    return response.status;
}

module.exports = {
    optIn,
    optOut
};
