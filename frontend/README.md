# 🎉 EventWave – Event Management Platform

EventWave is a comprehensive full-stack event management platform built with the MERN stack. It empowers users to discover, create, and manage events seamlessly while providing organizers with powerful tools to track engagement and attendance.

## ✨ Key Features

### 🎫 Event Management
- **Create & Customize Events** - Rich event creation with detailed descriptions, pricing, and media
- **Dynamic Event Discovery** - Advanced search and filtering by category, location, date, and price
- **Real-time Updates** - Live event status updates and notifications
- **Multi-media Support** - Upload event banners, galleries, and promotional content via Cloudinary

### 👥 User Experience
- **Secure Authentication** - JWT-based login with email verification
- **Role-based Access Control** - Distinct permissions for attendees, organizers, and administrators
- **Personal Dashboard** - Manage created events, bookings, and favorites
- **Social Features** - Save events to favorites and share with friends
- **Responsive Design** - Optimized experience across all devices

### 📊 Analytics & Insights
- **Event Performance Metrics** - Track views, registrations, and attendance
- **Revenue Dashboard** - Monitor ticket sales and payment processing
- **User Engagement Analytics** - Understand audience behavior and preferences

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and context
- **React Router v6** - Client-side routing and navigation
- **Axios** - HTTP client with interceptors
- **Ant Design** - Professional UI component library
- **Redux Toolkit** - State management for complex data flows
- **React Query** - Server state management and caching

### Backend Stack
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with flexible schema
- **Mongoose** - ODM for MongoDB with validation
- **Cloudinary** - Cloud-based image and video management
- **JWT** - Stateless authentication tokens
- **bcrypt** - Password hashing and security
- **Joi** - Data validation and sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account for media uploads

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eventsphere.git
   cd eventsphere
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create environment file
   cp .env.example .env
   # Configure your environment variables
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   npm start
   ```

### Environment Configuration

Create a `.env` file in the server directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/eventsphere
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/eventsphere

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Service (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📁 Project Structure

```
eventsphere/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls and utilities
│   │   ├── store/          # Redux store configuration
│   │   └── utils/          # Helper functions
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── utils/             # Backend utilities
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Events
- `GET /api/events` - Get all events (with filtering)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event (organizer only)
- `PUT /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Delete event (organizer only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/event/:id` - Get event bookings (organizer only)

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🚀 Deployment

### Backend (Railway/Render)
1. Connect your repository to your deployment platform
2. Set environment variables in the platform dashboard
3. Deploy with automatic builds on push

### Frontend (Vercel/Netlify)
1. Build the production version: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Roadmap

- [ ] **Mobile App** - React Native companion app
- [ ] **Payment Integration** - Stripe/PayPal for ticket purchases
- [ ] **Live Streaming** - Integration with streaming platforms
- [ ] **Advanced Analytics** - Detailed event performance insights
- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **Event Templates** - Pre-designed event types and layouts
- [ ] **Calendar Integration** - Sync with Google Calendar, Outlook
- [ ] **Social Media Integration** - Auto-posting and social login

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📧 Email: support@eventsphere.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/eventsphere/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/eventsphere/discussions)

---

<div align="center">
  <p>Built with ❤️ by the EventWave Team</p>
  <p>
    <a href="#-eventsphere--event-management-platform">🔝 Back to top</a>
  </p>
</div>