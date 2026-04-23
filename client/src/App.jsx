import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import Navbar from "./Components/Shared/NavBar";
import Footer from "./Components/Shared/Footer";

import Login from "./Pages/Login";
import ProtectedRoute from "./Components/Shared/ProtectedRoute";

import AdminDashboard from "./Components/Admin/AdminDashboard";
import AdminUsers from "./Components/Admin/AdminUsers";

import NotFound from "./Pages/NotFound";
import ScrollToTop from "./Components/Shared/ScrollToTop";

import ScrollToTopButton from "./Components/Shared/ScrollToTopButton";
import DestinationsPage from "./Components/Destination/DestinationsPage";
import DestinationDetails from "./Components/Destination/DestinationDetails";
import BookingPage from "./Pages/Booking";
import DestinationsAdmin from "./Components/Admin/AdminDestinations";
import PackagesPage from "./Components/Package/Packages";
import PackagesDetails from "./Components/Package/Packagedetails";
import PackagesAdmin from "./Components/Admin/Packagesadmin";
import BookingsAdmin from "./Components/Admin/Bookingsadmin";
import ContactPage from "./Pages/ContactPage";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ScrollToTopButton />
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/destinations/:id" element={<DestinationDetails />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:id" element={<PackagesDetails />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />      
          <Route path="/admin/destinations" element={<DestinationsAdmin />} />
          <Route path="/admin/packages" element={<PackagesAdmin />} />
          <Route path="/admin/bookings" element={<BookingsAdmin />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;