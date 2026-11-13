import Order from '../models/orderModel.js';
import mongoose from 'mongoose';

// Safe query helper to prevent Mongoose CastError on non-ObjectId strings
const findOrderQuery = (orderId) => {
  const numericId = Number(orderId);
  if (!isNaN(numericId) && numericId > 0) {
    return { orderId: numericId };
  }
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    return { _id: orderId };
  }
  return { orderId };
};

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.orderId) {
      orderData.orderId = Date.now();
    }
    const order = await Order.create(orderData);
    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders or all orders
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by orderId
// @route   GET /api/orders/:orderId
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const query = findOrderQuery(orderId);
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const updateFields = {};
    if (status) {
      updateFields.status = status;
      if (String(status).toLowerCase() === 'delivered') {
        updateFields.paymentStatus = 'Paid';
      }
    }
    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
    }

    const query = findOrderQuery(orderId);
    const order = await Order.findOneAndUpdate(query, updateFields, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const query = findOrderQuery(orderId);
    const order = await Order.findOneAndUpdate(
      query,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
