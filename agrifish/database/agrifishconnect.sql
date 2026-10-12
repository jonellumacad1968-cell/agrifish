-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 11, 2025 at 09:07 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `agrifishconnect`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `customer_name` varchar(255) DEFAULT 'Guest Customer',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'in-stock',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `seller_id`, `name`, `quantity`, `price`, `image`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 0, 'Bangus (Milkfish)', 25.00, 180.00, 'img/bangus.jpg', NULL, 'in-stock', '2025-10-10 16:28:19', '2025-10-10 17:00:51'),
(2, 0, 'Bisugo (Threadfin Bream)', 15.00, 220.00, 'img/bisugo.jpg', NULL, 'in-stock', '2025-10-10 16:28:19', '2025-10-10 16:28:19'),
(3, 0, 'Sapsap (Slipmouth)', 5.00, 200.00, 'img/sapsap.png', NULL, 'in-stock', '2025-10-10 16:28:19', '2025-10-11 05:36:13'),
(4, 0, 'Tilapia', 30.00, 120.00, 'img/tilapia.jpg', NULL, 'in-stock', '2025-10-10 16:28:19', '2025-10-10 16:28:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `middlename` varchar(50) DEFAULT NULL,
  `contact` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','seller','admin') DEFAULT 'customer',
  `id_document_path` varchar(255) DEFAULT NULL,
  `status` enum('active','pending','suspended') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `middlename`, `contact`, `email`, `address`, `username`, `password`, `role`, `id_document_path`, `status`, `created_at`, `updated_at`) VALUES
(3, 'John', 'Doe', '', '09123456789', 'john@test.com', '123 Test Street', 'johndoe123', '$2y$10$dqEo0jKW.2W.i6CeKg2U5Og5YbhAKwOmLEHCJ1kV0wBxNcB.6XX7i', 'customer', NULL, 'active', '2025-10-11 04:22:52', '2025-10-11 04:22:52'),
(4, 'Joehara', 'Rodriguez', 'La', '0912334562', 'joeharar@yahoo.com', 'address 123', 'Joy', '$2y$10$z4WNn.vRX4L6Hzxkxpns1OH5JOUVaMV3vkz7LwIvOpL0SrzadT872', 'customer', NULL, 'active', '2025-10-11 04:33:10', '2025-10-11 04:33:10'),
(5, 'Emma', 'Stone', '', '09123456789', 'emma@gmail.com', 'sample address', 'emma', '$2y$10$CS835dWlBp9ry55Y2i86Wee.0vfYc8//TvPITNBRd4iL3kG9kfJVG', 'seller', 'uploads/seller_ids/68ea0053f33ca_1760165971.jpg', 'active', '2025-10-11 06:59:32', '2025-10-11 07:01:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
