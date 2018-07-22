import * as request  from 'request';
import * as apiKey from './apiKey'; 

export function getExchangeRate(fromCurrency, toCurrency):Promise<any>{
    return new Promise((resolve, reject)=>{
        request({
            url: `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${apiKey.exchangeRate_API_Key}`,
            json: true
            }, (error, response, body)=> {
            if(error){
                reject('Unable to get data.')
            }else {
                resolve(body['Realtime Currency Exchange Rate']['5. Exchange Rate']);               
            }
        });
    })
}
