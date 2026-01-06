# E-Commerce Application with MongoDB

## Features
- User authentication
- Product catalog
- Shopping cart
- Order management with CRUD operations
- MongoDB integration
- Cash on delivery option

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open http://localhost:3000

## Deploy to Render

1. Push code to GitHub repository
2. Connect GitHub repo to Render
3. Set environment variables in Render dashboard:
   - `MONGODB_URI`: mongodb+srv://atharv:Atharv11@2004@cluster0.yl8klai.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
4. Deploy with build command: `npm install`
5. Start command: `npm start`

## API Endpoints
- POST /api/login - User login
- GET /api/orders - Get all orders
- POST /api/orders - Create new order
- DELETE /api/orders/:id - Delete order