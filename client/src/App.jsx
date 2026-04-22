import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import Navbar from "./Components/Shared/NavBar";
import Footer from "./Components/Shared/Footer";

import Login from "./Pages/Login";
import ProtectedRoute from "./Components/Shared/ProtectedRoute";

import AdminDashboard from "./Components/Admin/AdminDashboard";
import AdminCategories from "./Components/Admin/AdminCategories";
import AdminUsers from "./Components/Admin/AdminUsers";

import NotFound from "./Pages/NotFound";
import ScrollToTop from "./Components/Shared/ScrollToTop";
import Aboutus from "./Pages/Aboutus";
import AdminGallery from "./Components/Admin/AdminGallery";

import MenuPage from "./Pages/MenuPage";
import AdminSignatureDishes from "./Components/Admin/AdminSignatureDishes";
import AdminMenu from "./Components/Admin/AdminMenu";
import AdminTables from "./Components/Admin/AdminTables";
import AdminReservations from "./Components/Admin/AdminReservation";
import ReservationPage from "./Pages/ReservationPage";
import ScrollToTopButton from "./Components/Shared/ScrollToTopButton";
import DestinationsPage from "./Components/Destination/DestinationsPage";
import DestinationDetails from "./Components/Destination/DestinationDetails";
import PackagesPage from "./Pages/Packages";
import BookingPage from "./Pages/Booking";
import DestinationsAdmin from "./Components/Admin/AdminDestinations";

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

        <Route path="/booking" element={<BookingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/signature-dishes" element={<AdminSignatureDishes />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/tables" element={<AdminTables />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          <Route path="/admin/destinations" element={<DestinationsAdmin />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;