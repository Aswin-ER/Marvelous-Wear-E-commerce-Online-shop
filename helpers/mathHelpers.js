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

    //  isReturnedWithin7Days(date) {
    //     // Convert the date string to a JavaScript Date object
    //     const orderedDate = new Date(date);
      
    //     // Calculate the current date
    //     const currentDate = new Date();
      
    //     // Calculate the difference in milliseconds between the current date and ordered date
    //     const differenceInMilliseconds = currentDate - orderedDate;
      
    //     // Convert the difference to days
    //     const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
      
    //     // Check if the order is delivered and within 7 days
    //     return differenceInDays <= 7;
    //   },
      
    
}