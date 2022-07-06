-- grocernest.t_lkp_wishlist definition

CREATE TABLE `t_lkp_wishlist` (
  `cust_no` varchar(20) NOT NULL,
  `wishlist_id` varchar(255) NOT NULL,
  `wishlist_name` varchar(100) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`wishlist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- grocernest.t_wishlist_items definition

CREATE TABLE `t_wishlist_items` (
  `wishlist_id` varchar(255) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `quantity` bigint(20) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- grocernest.t_lkp_order definition

CREATE TABLE `t_lkp_order` (
  `cust_no` varchar(20) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `status` enum('Accepted','Shipped','Delivered','Cancelled','Returned') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- grocernest.t_order_items definition

CREATE TABLE `t_order_items` (
  `order_id` varchar(255) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `quantity` bigint(20) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ecomm.t_cache definition

CREATE TABLE `t_cache` (
  `user_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`user_details`)),
  `generated_otp` varchar(100) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`generated_otp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--adding available_for_ecomm field in item table

ALTER TABLE ecomm.t_item ADD available_for_ecomm BOOL NULL;

--adding available_for_ecomm field in category table

ALTER TABLE ecomm.t_lkp_category ADD available_for_ecomm BOOL NULL;

--adding available_for_ecomm field in sub category table

ALTER TABLE ecomm.t_lkp_sub_category ADD available_for_ecomm BOOL NULL;

--adding is_gift field in item table
ALTER TABLE ecomm.t_item ADD is_gift BOOL NULL;
