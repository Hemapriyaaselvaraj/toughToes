const PDFDocument = require('pdfkit');
const Order = require('../../models/orderModel');

exports.downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('user_id');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Check if order belongs to the logged-in user
        if (order.user_id._id.toString() !== req.session.userId) {
            return res.status(403).send('Unauthorized');
        }

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
        
        doc.pipe(res);

        // Add company logo/header
        doc.fontSize(20).text('ToughToes', { align: 'center' });
        doc.fontSize(12).text('Premium shoes for every step of your journey', { align: 'center' });
        doc.moveDown();

        // Invoice details
        doc.fontSize(16).text('Tax Invoice', { align: 'center' });
        doc.moveDown();

        // Order information
        doc.fontSize(10)
           .text(`Invoice No: ${order.orderNumber}`)
           .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`)
           .text(`Payment Method: ${order.paymentMethod}`)
           .moveDown();

        // Customer details
        doc.fontSize(12).text('Bill To:');
        doc.fontSize(10)
           .text(order.user_id.firstName + ' ' + order.user_id.lastName)
           .text(order.shipping_address.house_number + ', ' + order.shipping_address.street)
           .text(order.shipping_address.locality)
           .text(order.shipping_address.city + ', ' + order.shipping_address.state)
           .text('PIN: ' + order.shipping_address.pincode)
           .text('Phone: ' + order.shipping_address.phone_number)
           .moveDown();

        // Items table
        const tableTop = doc.y;
        const itemCodeX = 50;
        const descriptionX = 100;
        const quantityX = 350;
        const priceX = 400;
        const amountX = 500;

        // Table headers
        doc.fontSize(10)
           .text('No.', itemCodeX, tableTop)
           .text('Description', descriptionX, tableTop)
           .text('Qty', quantityX, tableTop)
           .text('Price', priceX, tableTop)
           .text('Amount', amountX, tableTop);

        let position = 0;
        order.products.forEach((item, i) => {
            position = tableTop + 20 + (i * 20);
            doc.text((i + 1).toString(), itemCodeX, position)
               .text(item.name, descriptionX, position)
               .text(item.quantity.toString(), quantityX, position)
               .text(item.price.toString(), priceX, position)
               .text((item.price * item.quantity).toString(), amountX, position);
        });

        doc.moveDown();
        position = position + 40;

        // Summary
        doc.text('Subtotal:', 400, position);
        doc.text(order.subtotal.toString(), amountX, position);
        
        position = position + 20;
        doc.text('Shipping:', 400, position);
        doc.text(order.shipping_charge.toString(), amountX, position);
        
        position = position + 20;
        doc.text('Tax:', 400, position);
        doc.text(order.tax.toString(), amountX, position);
        
        position = position + 20;
        doc.fontSize(12)
           .text('Total:', 400, position)
           .text(order.total.toString(), amountX, position);

        // Footer
        doc.fontSize(10)
           .moveDown()
           .moveDown()
           .text('Thank you for shopping with ToughToes!', { align: 'center' })
           .text('For any queries, please contact support@toughtoes.com', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Error generating invoice');
    }
};
