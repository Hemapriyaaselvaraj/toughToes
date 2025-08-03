const User = require('../../models/userModel');
const Order = require('../../models/orderModel');

exports.getWallet = async (req, res) => {
    try {
        // Get user with populated wallet transactions
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            return res.redirect('/user/login');
        }

        // Find orders with returns to show in transactions
        const orders = await Order.find({
            'user_id': user._id,
            'products.status': 'RETURNED'
        }).select('orderNumber products.return_details products.name products.price');

        // Format transactions from return refunds
        const transactions = orders.flatMap(order => {
            return order.products
                .filter(product => product.status === 'RETURNED' && product.return_details)
                .map(product => ({
                    date: product.return_details.approved_at || product.return_details.requested_at,
                    type: 'credit',
                    description: `Refund for return of ${product.name} (Order #${order.orderNumber})`,
                    amount: product.return_details.refundAmount
                }));
        });

        // Sort transactions by date (most recent first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.render('user/wallet', {
            user,
            transactions,
            name: user.firstName + ' ' + user.lastName
        });

    } catch (error) {
        console.error('Error loading wallet:', error);
        res.status(500).send('Error loading wallet information');
    }
};
