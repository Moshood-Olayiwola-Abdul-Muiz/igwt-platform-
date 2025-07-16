
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let users = [];
let gigs = [];
let orders = [];
let messages = [];
let escrowPayments = [];
let disputes = [];
let subscriptions = [];

// User authentication middleware
const authenticateUser = (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    req.userId = userId;
    next();
};

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User registration
app.post('/api/register', (req, res) => {
    const { username, email, password, userType, skills } = req.body;
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = {
        id: Date.now().toString(),
        username,
        email,
        password, // In production, hash this
        userType, // 'freelancer' or 'client'
        skills: skills ? skills.split(',').map(s => s.trim()) : [],
        rating: 0,
        completedProjects: 0,
        portfolio: [],
        achievements: [],
        pastWork: [],
        subscriptionStatus: 'inactive',
        subscriptionExpiry: null,
        createdAt: new Date().toISOString()
    };
    
    users.push(user);
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
});

// User login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ message: 'Login successful', user: { ...user, password: undefined } });
});

// Get all gigs
app.get('/api/gigs', (req, res) => {
    const { category, minPrice, maxPrice, search } = req.query;
    let filteredGigs = [...gigs];
    
    if (category) {
        filteredGigs = filteredGigs.filter(g => g.category === category);
    }
    
    if (minPrice) {
        filteredGigs = filteredGigs.filter(g => g.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
        filteredGigs = filteredGigs.filter(g => g.price <= parseInt(maxPrice));
    }
    
    if (search) {
        filteredGigs = filteredGigs.filter(g => 
            g.title.toLowerCase().includes(search.toLowerCase()) ||
            g.description.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json(filteredGigs);
});

// Create a gig
app.post('/api/gigs', authenticateUser, (req, res) => {
    const { title, description, category, price, deliveryTime, requirements } = req.body;
    
    const user = users.find(u => u.id === req.userId);
    if (!user || user.subscriptionStatus !== 'active') {
        return res.status(403).json({ error: 'Active subscription required to create gigs' });
    }
    
    const gig = {
        id: Date.now().toString(),
        freelancerId: req.userId,
        freelancerName: user.username,
        title,
        description,
        category,
        price: parseInt(price),
        deliveryTime: parseInt(deliveryTime),
        requirements: requirements || [],
        rating: 0,
        reviews: [],
        orders: 0,
        createdAt: new Date().toISOString()
    };
    
    gigs.push(gig);
    res.status(201).json({ message: 'Gig created successfully', gig });
});

// Get specific gig
app.get('/api/gigs/:id', (req, res) => {
    const gig = gigs.find(g => g.id === req.params.id);
    if (!gig) {
        return res.status(404).json({ error: 'Gig not found' });
    }
    
    const freelancer = users.find(u => u.id === gig.freelancerId);
    res.json({ ...gig, freelancer: { ...freelancer, password: undefined } });
});

// Subscribe to monthly plan
app.post('/api/subscribe', authenticateUser, (req, res) => {
    const user = users.find(u => u.id === req.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const subscription = {
        id: Date.now().toString(),
        userId: req.userId,
        amount: 3, // $3 per month
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
    };
    
    subscriptions.push(subscription);
    user.subscriptionStatus = 'active';
    user.subscriptionExpiry = subscription.expiryDate;
    
    res.status(201).json({ message: 'Subscription activated successfully', subscription });
});

// Place an order with escrow
app.post('/api/orders', authenticateUser, (req, res) => {
    const { gigId, requirements, customInstructions } = req.body;
    
    const gig = gigs.find(g => g.id === gigId);
    if (!gig) {
        return res.status(404).json({ error: 'Gig not found' });
    }
    
    const user = users.find(u => u.id === req.userId);
    if (!user || user.subscriptionStatus !== 'active') {
        return res.status(403).json({ error: 'Active subscription required to place orders' });
    }
    
    const order = {
        id: Date.now().toString(),
        gigId,
        gigTitle: gig.title,
        clientId: req.userId,
        freelancerId: gig.freelancerId,
        price: gig.price,
        requirements,
        customInstructions,
        status: 'pending',
        deliveryDate: new Date(Date.now() + gig.deliveryTime * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
    };
    
    // Create escrow payment
    const escrowPayment = {
        id: Date.now().toString(),
        orderId: order.id,
        amount: gig.price,
        status: 'held',
        createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    escrowPayments.push(escrowPayment);
    gig.orders += 1;
    
    res.status(201).json({ message: 'Order placed successfully with escrow protection', order, escrow: escrowPayment });
});

// Get user orders
app.get('/api/orders', authenticateUser, (req, res) => {
    const userOrders = orders.filter(o => 
        o.clientId === req.userId || o.freelancerId === req.userId
    );
    res.json(userOrders);
});

// Update order status
app.patch('/api/orders/:id', authenticateUser, (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.freelancerId !== req.userId && order.clientId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    order.status = status;
    res.json({ message: 'Order updated successfully', order });
});

// Send message
app.post('/api/messages', authenticateUser, (req, res) => {
    const { orderId, content } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.clientId !== req.userId && order.freelancerId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const message = {
        id: Date.now().toString(),
        orderId,
        senderId: req.userId,
        senderName: users.find(u => u.id === req.userId)?.username || 'Unknown',
        content,
        timestamp: new Date().toISOString()
    };
    
    messages.push(message);
    res.status(201).json({ message: 'Message sent successfully', messageData: message });
});

// Get messages for an order
app.get('/api/orders/:orderId/messages', authenticateUser, (req, res) => {
    const order = orders.find(o => o.id === req.params.orderId);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.clientId !== req.userId && order.freelancerId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const orderMessages = messages.filter(m => m.orderId === req.params.orderId);
    res.json(orderMessages);
});

// Submit review
app.post('/api/reviews', authenticateUser, (req, res) => {
    const { orderId, rating, comment } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    if (!order || order.clientId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized or order not found' });
    }
    
    const gig = gigs.find(g => g.id === order.gigId);
    const review = {
        id: Date.now().toString(),
        orderId,
        clientId: req.userId,
        clientName: users.find(u => u.id === req.userId)?.username || 'Anonymous',
        rating: parseInt(rating),
        comment,
        createdAt: new Date().toISOString()
    };
    
    gig.reviews.push(review);
    
    // Update gig rating
    const totalRating = gig.reviews.reduce((sum, r) => sum + r.rating, 0);
    gig.rating = (totalRating / gig.reviews.length).toFixed(1);
    
    res.status(201).json({ message: 'Review submitted successfully', review });
});

// Update portfolio
app.post('/api/portfolio', authenticateUser, (req, res) => {
    const { type, title, description, imageUrl, projectUrl } = req.body;
    
    const user = users.find(u => u.id === req.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const portfolioItem = {
        id: Date.now().toString(),
        type,
        title,
        description,
        imageUrl,
        projectUrl,
        createdAt: new Date().toISOString()
    };
    
    if (type === 'project') {
        user.portfolio.push(portfolioItem);
    } else if (type === 'achievement') {
        user.achievements.push(portfolioItem);
    } else if (type === 'pastWork') {
        user.pastWork.push(portfolioItem);
    }
    
    res.status(201).json({ message: 'Portfolio updated successfully', item: portfolioItem });
});

// Create dispute
app.post('/api/disputes', authenticateUser, (req, res) => {
    const { orderId, reason, description } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.clientId !== req.userId && order.freelancerId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const dispute = {
        id: Date.now().toString(),
        orderId,
        initiatedBy: req.userId,
        reason,
        description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        adminEmail: 'igwt.help.team@gmail.com'
    };
    
    disputes.push(dispute);
    order.status = 'disputed';
    
    res.status(201).json({ 
        message: 'Dispute created successfully. Both parties must send letters to igwt.help.team@gmail.com', 
        dispute 
    });
});

// Get escrow status
app.get('/api/orders/:orderId/escrow', authenticateUser, (req, res) => {
    const escrow = escrowPayments.find(e => e.orderId === req.params.orderId);
    if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
    }
    
    const order = orders.find(o => o.id === req.params.orderId);
    if (!order || (order.clientId !== req.userId && order.freelancerId !== req.userId)) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(escrow);
});

// Release escrow payment
app.post('/api/escrow/:escrowId/release', authenticateUser, (req, res) => {
    const escrow = escrowPayments.find(e => e.id === req.params.escrowId);
    if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
    }
    
    const order = orders.find(o => o.id === escrow.orderId);
    if (!order || order.clientId !== req.userId) {
        return res.status(403).json({ error: 'Only client can release payment after work completion' });
    }
    
    escrow.status = 'released';
    order.status = 'completed';
    
    // Update freelancer stats
    const freelancer = users.find(u => u.id === order.freelancerId);
    if (freelancer) {
        freelancer.completedProjects += 1;
    }
    
    res.json({ message: 'Payment released to freelancer', escrow });
});

// Get user profile
app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const userGigs = gigs.filter(g => g.freelancerId === user.id);
    res.json({ 
        ...user, 
        password: undefined, 
        gigs: userGigs 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`IGWT Platform server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
});
