module.exports = {

    gte: (num1, num2) => {
        num1 = parseFloat(num1);
        num2 = parseFloat(num2);
        return num1 >= num2;
    },

    eq: (num1, num2)=> {
        num1 = parseFloat(num1);
        num2 = parseFloat(num2);
        return num2 === num1;
    },

    substract : (num1, num2)=> {
        if(num1>num2){
            const result = num1-num2;
            //console.log(result+"kajshdihagsjgdfasdfuagsd");
            return result;
        }
    },
  
      
    
}