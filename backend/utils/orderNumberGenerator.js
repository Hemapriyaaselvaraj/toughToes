const Order = require('../models/orderModel');

async function generateOrderNumber() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);  // Get last 2 digits of year
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const date = today.getDate().toString().padStart(2, '0');
    
    // Get the count of orders for today to generate sequential number
    const basePrefix = `TT${year}${month}${date}`;
    
    // Find the last order with this prefix
    const lastOrder = await Order.findOne({
        order_number: new RegExp(`^${basePrefix}`)
    }, { order_number: 1 })
    .sort({ order_number: -1 });

    let sequentialNumber = 1;
    if (lastOrder) {
        // Extract the sequential number from the last order and increment it
        const lastNumber = parseInt(lastOrder.order_number.slice(-4));
        sequentialNumber = lastNumber + 1;
    }

    // Format: TT + YY + MM + DD + 4-digit sequential number
    // Example: TT2508030001
    return `${basePrefix}${sequentialNumber.toString().padStart(4, '0')}`;
}

module.exports = { generateOrderNumber };
