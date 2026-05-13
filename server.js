const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory захиалгын хадгалах
let orders = [
  { id: 1, customerName: 'Ямаа', product: 'Цай', quantity: 2, price: 15000, status: 'pending' },
  { id: 2, customerName: 'Цогоо', product: 'Сүүлийн хөл', quantity: 1, price: 25000, status: 'completed' }
];

let nextId = 3;

// ===== API ENDPOINTS =====

// 1. Бүх захиалгыг авах
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// 2. Нэг захиалгыг ID-аар авах
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Захиалга олдсонгүй'
    });
  }
  
  res.json({
    success: true,
    data: order
  });
});

// 3. Шинэ захиалга үүсгэх
app.post('/api/orders', (req, res) => {
  const { customerName, product, quantity, price } = req.body;
  
  // Өгөгдлийг шалгах
  if (!customerName || !product || !quantity || !price) {
    return res.status(400).json({
      success: false,
      message: 'Бүх талбар шаардлагатай байна'
    });
  }
  
  const newOrder = {
    id: nextId++,
    customerName,
    product,
    quantity: parseInt(quantity),
    price: parseFloat(price),
    status: 'pending',
    createdAt: new Date()
  };
  
  orders.push(newOrder);
  
  res.status(201).json({
    success: true,
    message: 'Захиалга амжилттай үүсгэгдлээ',
    data: newOrder
  });
});

// 4. Захиалгыг бүрэн шинэчлэх
app.put('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Захиалга олдсонгүй'
    });
  }
  
  const { customerName, product, quantity, price, status } = req.body;
  
  if (customerName) order.customerName = customerName;
  if (product) order.product = product;
  if (quantity) order.quantity = parseInt(quantity);
  if (price) order.price = parseFloat(price);
  if (status) order.status = status;
  order.updatedAt = new Date();
  
  res.json({
    success: true,
    message: 'Захиалга амжилттай шинэчлэгдлээ',
    data: order
  });
});

// 5. Захиалгыг устгах
app.delete('/api/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Захиалга олдсонгүй'
    });
  }
  
  const deletedOrder = orders.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Захиалга амжилттай устгагдлээ',
    data: deletedOrder[0]
  });
});

// 6. Захиалгын статусыг өөрчлөх
app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Захиалга олдсонгүй'
    });
  }
  
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Статус зөвхөн ${validStatuses.join(', ')} байж болно`
    });
  }
  
  order.status = status;
  order.updatedAt = new Date();
  
  res.json({
    success: true,
    message: 'Статус амжилттай өөрчлөгдлөө',
    data: order
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'API идэвхтэй',
    timestamp: new Date()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Серверийн алдаа',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Server эхлүүлэх
app.listen(PORT, () => {
  console.log(`🚀 Order API сервер ${PORT} дээр ажиллаж байна`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});
