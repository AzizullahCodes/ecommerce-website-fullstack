import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
      unique: true,
    },
    userId: {
      type: String, // email or user id
      required: true,
    },
    bucket: {
      type: Array, // items array with products
      default: [],
    },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
    },
    customerName: String,
    phone: String,
    address: String,
    city: String,
    contactEmail: String,
    paymentMethod: {
      type: String,
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      default: 'Unpaid',
    },
    status: {
      type: String,
      default: 'Pending',
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    otherDetails: {
      type: String,
      default: '',
    },
    orderDate: {
      type: String,
    },
    orderTime: {
      type: String,
    },
    estimatedDelivery: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
