# BeOne E-commerce Test Project

A full-stack e-commerce application built with Next.js, featuring user authentication, product management, shopping cart functionality, and admin capabilities.

> ℹ️ **Testing Admin Features**: To test admin features, register with the email `admin@mail.com` which is configured to automatically get admin privileges.

## Key Features

- 🔐 User Authentication (Register, Login, Logout)
- 🛒 Shopping Cart Management
- 📦 Product Catalog
- 💳 Transaction Processing
- 👤 User Profile Management
- 🔑 Admin Dashboard
- 🔄 Bridge API Integration

## Setup Requirements

- Node.js 18.x+
- npm or yarn
- MongoDB (local/Atlas)

## Quick Start

1. **Clone Repository**

```bash
git clone <repository-url>
cd test-beone
```

2. **Install Dependencies**

```bash
npm install
# or
yarn install
```

3. **Environment Setup**
   > ⚠️ **Important**: Create `.env` file with these required variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/beone-ecommerce
JWT_SECRET=your-jwt-secret-key-here
```

4. **Run Development Server**

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to view the application.

## Project Structure

```plaintext
src/
├── actions.ts          # Server actions
├── middleware.ts       # Auth middleware
├── types.ts           # Type definitions
├── app/               # App Router pages
├── components/        # React components
├── db/               # Database logic
├── helpers/          # Utility helpers
└── lib/             # Core utilities
```

## API Routes

### Public Endpoints

- `GET /api/products` - Product listing
- `POST /api/bridge/login` - Authentication
- `POST /api/bridge/register` - User registration

### Protected Endpoints

- `/api/user/*` - User operations
- `/api/admin/*` - Admin operations

## Authentication

- Register: `/register`
- Login: `/login`
- JWT-based authentication
- Protected routes via middleware

## Deployment

Deploy on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Configure environment
4. Deploy

For more details, refer to [Next.js deployment docs](https://nextjs.org/docs/deployment).

## License

MIT
