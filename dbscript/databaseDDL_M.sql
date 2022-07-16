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


--adding order_total field in t_lkp_order table
ALTER TABLE ecomm.t_lkp_order ADD total BIGINT(40) NULL;


--ecomm.t_coupons definition
CREATE TABLE ecomm.t_coupons (
	id BIGINT(20) auto_increment NOT NULL,
	code varchar(100) NOT NULL,
	amount_of_discount BIGINT(30) NULL,
	is_percentage BOOL NULL,
	cat_id BIGINT(20) NULL,
	sub_cat_id BIGINT(20) NULL,
	item_id BIGINT(20) NULL,
	brand_id BIGINT(20) NULL,
	description varchar(100) NULL,
	min_purchase BIGINT(20) NULL,
	max_purchase BIGINT(20) NULL,
	 `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


--ecomm.t_gift_strategy definition
CREATE TABLE ecomm.t_gift_strategy (
	id BIGINT(20) auto_increment NOT NULL,
	max_purchase BIGINT(20) NULL,
	min_purchase BIGINT(20) NULL,
	no_of_gifts BIGINT(10) NULL,
	`created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;


ALTER TABLE ecomm.t_coupons ADD expiry_date TIMESTAMP NULL;

ALTER TABLE ecomm.t_coupons ADD assigned_user varchar(20) NULL;

ALTER TABLE ecomm.t_coupons ADD `usage` BIGINT(20) NULL;

ALTER TABLE ecomm.t_item ADD is_grocernest BOOL NULL;

-- ecomm.t_offers definition
CREATE TABLE ecomm.t_offers (
	id BIGINT(20) auto_increment NOT NULL,
	`type` varchar(100) NULL,
	item_id_1 BIGINT(20) NULL,
	item_id_2 BIGINT(20) NULL,
	item_id BIGINT(20) NULL,
	amount_of_discount BIGINT(20) NULL,
	is_percentage BOOL NULL,
	 `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  primary key (`id`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

ALTER TABLE ecomm.t_offers ADD item_1_quantity BIGINT(20) NULL;
ALTER TABLE ecomm.t_offers ADD item_2_quantity BIGINT(20) NULL;


ALTER TABLE ecomm.t_customer ADD new_phone_number varchar(20) NULL;
