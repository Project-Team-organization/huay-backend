# Huay Backend API

A comprehensive lottery management system backend built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Lottery Management**: Support for multiple lottery types (Thai, Lao, Hanoi, etc.)
- **User Management**: Complete user authentication and authorization system
- **Betting System**: Comprehensive betting functionality with various game types
- **Admin Panel**: Full administrative interface for system management
- **Credit System**: User credit management and transactions
- **Promotion System**: Marketing and promotional features
- **Automated Results**: Cron jobs for automatic lottery result processing
- **File Upload**: Image and document upload functionality

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer, Express-fileupload
- **Scheduling**: Node-cron
- **Web Scraping**: Puppeteer, Cheerio
- **Validation**: Joi, Zod
- **Security**: Bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd huay-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔍 Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Security audit
npm run audit
```

## 🐳 Docker

### Build and run with Docker

```bash
# Build image
docker build -t huay-backend .

# Run container
docker run -p 3000:3000 --env-file .env huay-backend
```

### Docker Compose (if available)

```bash
docker-compose up -d
```

## 🚀 CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline using GitHub Actions:

- **Automatic Testing**: Runs on every push and pull request
- **Code Quality**: ESLint and security audits
- **Multi-environment Deployment**: Staging and production
- **Docker Integration**: Automated Docker image building
- **Manual Deployment**: Workflow dispatch for manual deployments

### Pipeline Triggers

- **Push to main/develop**: Full CI/CD pipeline
- **Pull Requests**: Testing and code quality checks
- **Manual**: Workflow dispatch for manual deployments

## 📁 Project Structure

```
huay-backend/
├── config/           # Configuration files
├── controller/       # Route controllers
├── cronjob/         # Scheduled tasks
├── middleware/      # Express middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── service/         # Business logic
├── tests/           # Test files
├── utils/           # Utility functions
├── validators/      # Input validation
└── docs/           # Documentation
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables:

- `PORT`: Server port (default: 3000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `API_KEY`: API authentication key
- `NODE_ENV`: Environment (development/production)

## 📚 API Documentation

### Health Check
```
GET /check
```

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### Lottery Management
```
GET /api/lottery/results
POST /api/lottery/bet
GET /api/lottery/history
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the CI/CD setup guide

## 🔄 Changelog

See the commit history for detailed changes and updates.

---

**Note**: This is a production-ready lottery management system. Please ensure proper security measures and compliance with local regulations before deployment.
