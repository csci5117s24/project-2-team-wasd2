
export function keepTwoDecimal(num) {  
    var result = Math.round(num * 100) / 100;  
    return result;  
};