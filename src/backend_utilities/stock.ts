import * as request  from 'request';

export function getStockPrice(symbol):Promise<any>{
    return new Promise((resolve, reject)=>{
        var encodedSymbol = encodeURIComponent(symbol);
    
        request({
            url: `https://api.iextrading.com/1.0/stock/${encodedSymbol}/quote`,
            json: true
            }, (error, response, body)=> {
            if(error){
                reject('Unable to get data.')
            }else {
                resolve({
                    price: body.latestPrice,
                    change: body.change
                });               
            }
            }
        );
    })
}