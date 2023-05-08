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
    }
}