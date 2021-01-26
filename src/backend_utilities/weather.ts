import * as request  from 'request';
import * as apiKey from './apiKey'; 

function getLocation(location):Promise<any> {
    return new Promise((resolve, reject)=>{
        var encodedLocation = encodeURIComponent(location);
    
        request({
            url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}`,
            json: true
            }, (error, response, body)=> {
            if(error){
                reject('Unable to connect to Google servers.')
            }else if(body.status === 'ZERO_RESULTS'){
                reject('Unable to find that address.')
            }else if (body.status === 'OK'){
                resolve({
                    address: body.results[0].formatted_address,
                    latitude: body.results[0].geometry.location.lat,
                    longitude: body.results[0].geometry.location.lng
                });               
            }
            }
        );
    })
};


function getWeather(lat, lng):Promise<any> {
    return new Promise((resolve , reject) => {
        request({
            url:`https://api.darksky.net/forecast/${apiKey.weather_API_Key}/${lat},${lng}`,
            json: true
        },(error, response, body)=>{
            if(!error && response.statusCode === 200){
                resolve({
                    temperature: body.currently.temperature,
                    summary: body.currently.summary
                });
            } else {
                reject('Unable to fetch weather');
            }
        })
    })
};


export function weather (location){
    var geoLocation = location;
    return new Promise((resolve, reject) =>{
        getLocation(geoLocation)
                .then((response) =>{
                        var lat = response.latitude;
                        var lng = response.longitude;
            
                        return getWeather(lat, lng)
                })
                .then((response) =>{
                    resolve(response.temperature);
                })
                .catch((errorMessage) =>{
                    reject(errorMessage);
                })
    })
}

