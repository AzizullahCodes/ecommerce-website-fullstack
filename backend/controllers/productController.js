import Product from '../models/productModel.js';
import mongoose from 'mongoose';

// Helper to find by _id or productId
const findProductQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { productId: id }] };
  }
  return { productId: id };
};

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID or productId
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne(findProductQuery(req.params.id));
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const {
      productId,
      productName,
      name,
      productImage,
      image,
      productDescription,
      desc,
      productPrice,
      price,
      category,
      quantity,
      stock,
    } = req.body;

    const product = await Product.create({
      productId: productId || Date.now().toString(),
      productName: productName || name,
      productImage: productImage || image || '',
      productDescription: productDescription || desc || '',
      productPrice: Number(productPrice || price || 0),
      category: category || 'General',
      quantity: quantity || 1,
      stock: stock || 10,
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const query = findProductQuery(req.params.id);
    const updateData = { ...req.body };

    if (updateData.productPrice) {
      updateData.productPrice = Number(updateData.productPrice);
    }

    const product = await Product.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const query = findProductQuery(req.params.id);
    const product = await Product.findOneAndDelete(query);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed initial products
// @route   POST /api/products/seed
export const seedProducts = async (req, res) => {
  try {
    const productsToSeed = req.body.products || [];
    if (!productsToSeed.length) {
      return res.status(400).json({ success: false, message: 'No products provided to seed' });
    }

    for (const item of productsToSeed) {
      await Product.findOneAndUpdate(
        { productId: item.productId },
        { ...item, productPrice: Number(item.productPrice) },
        { upsert: true, new: true }
      );
    }

    const all = await Product.find();
    res.status(200).json({ success: true, message: 'Products seeded successfully', data: all });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
