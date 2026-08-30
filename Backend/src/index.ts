import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import listingRoutes from './routes/listings';
import searchRoutes from './routes/search';
import inquiryRoutes from './routes/inquiries';
import adminUsersRoutes from './routes/adminUsers';
import adminProvidersRoutes from './routes/adminProviders';
import adminListingsRoutes from './routes/adminListings';
import advertRoutes from './routes/adverts';
import analyticsRoutes from './routes/analytics';
import dashboardRoutes from './routes/dashboard';
import buyerProfileRoutes from './routes/buyerProfile';
import uploadRoutes from './routes/uploads';
import providerProfileRoutes from './routes/providerProfile';
import { config } from './config';

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/providers', adminProvidersRoutes);
app.use('/api/admin/listings', adminListingsRoutes);
app.use('/api/adverts', advertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/buyer', buyerProfileRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/provider', providerProfileRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📂 Categories: http://localhost:${PORT}/api/categories`);
  console.log(`🏪 Listings: http://localhost:${PORT}/api/listings`);
  console.log(`🔍 Search: http://localhost:${PORT}/api/search`);
  console.log(`💬 Inquiries: http://localhost:${PORT}/api/inquiries`);
  console.log(`👥 Admin Users: http://localhost:${PORT}/api/admin/users`);
  console.log(`🏢 Admin Providers: http://localhost:${PORT}/api/admin/providers`);
  console.log(`📋 Admin Listings: http://localhost:${PORT}/api/admin/listings`);
  console.log(`📢 Adverts: http://localhost:${PORT}/api/adverts`);
  console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

export default app;
