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
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

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
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- grocernest.t_lkp_order definition
CREATE TABLE `t_lkp_order` (
  `cust_no` varchar(20) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `status` enum(
    'Accepted',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Returned'
  ) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

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
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- ecomm.t_cache definition
CREATE TABLE `t_cache` (
  `user_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`user_details`)),
  `generated_otp` varchar(100) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`generated_otp`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

--adding available_for_ecomm field in item table
ALTER TABLE
  ecomm.t_item
ADD
  available_for_ecomm BOOL NULL;

--adding available_for_ecomm field in category table
ALTER TABLE
  ecomm.t_lkp_category
ADD
  available_for_ecomm BOOL NULL;

--adding available_for_ecomm field in sub category table
ALTER TABLE
  ecomm.t_lkp_sub_category
ADD
  available_for_ecomm BOOL NULL;

--adding is_gift field in item table
ALTER TABLE
  ecomm.t_item
ADD
  is_gift BOOL NULL;

--adding order_total field in t_lkp_order table
ALTER TABLE
  ecomm.t_lkp_order
ADD
  total BIGINT(40) NULL;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

ALTER TABLE
  ecomm.t_coupons
ADD
  expiry_date TIMESTAMP NULL;

ALTER TABLE
  ecomm.t_coupons
ADD
  assigned_user varchar(20) NULL;

ALTER TABLE
  ecomm.t_coupons
ADD
  `usage` BIGINT(20) NULL;

ALTER TABLE
  ecomm.t_item
ADD
  is_grocernest BOOL NULL;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

ALTER TABLE
  ecomm.t_offers
ADD
  item_1_quantity BIGINT(20) NULL;

ALTER TABLE
  ecomm.t_offers
ADD
  item_2_quantity BIGINT(20) NULL;

ALTER TABLE
  ecomm.t_customer
ADD
  new_phone_number varchar(20) NULL;

ALTER TABLE
  ecomm.t_cart
ADD
  is_offer BOOL NULL;

ALTER TABLE
  ecomm.t_cart
ADD
  offer_item_price DECIMAL(10, 2) NULL;

CREATE TABLE ecomm.t_offer_cache (
  id BIGINT(20) auto_increment NOT NULL,
  item_id BIGINT(20) NULL,
  quantity BIGINT(20) NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  primary key (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

ALTER TABLE
  ecomm.t_offer_cache
ADD
  cust_no varchar(20) NULL;

ALTER TABLE
  ecomm.t_coupons
ADD
  `type` varchar(100) NULL;

ALTER TABLE
  ecomm.t_order_items
ADD
  is_gift BOOL NULL;

ALTER TABLE
  ecomm.t_order_items
ADD
  is_offer BOOL NULL;

ALTER TABLE
  ecomm.t_order_items
ADD
  offer_price DECIMAL(10, 2) NULL;

ALTER TABLE
  ecomm.t_customer
ADD
  image varchar(255) NULL;

CREATE TABLE ecomm.t_milk_delivery (
  delivery_boy varchar(100) NULL,
  subscription_id varchar(255) NULL,
  cust_no varchar(20) NULL,
  id BIGINT(20) auto_increment NOT NULL,
  address_id varchar(255) NULL,
  status ENUM("Pending", "Delivered", "Accepted") NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  primary key (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE ecomm.t_task (
  id BIGINT(20) auto_increment NULL,
  user_id BIGINT(20) NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  no_of_days BIGINT(20) NULL,
  status ENUM("Pending", "In Progress", "Done") NULL,
  description varchar(255) NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  CONSTRAINT t_task_PK PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

ALTER TABLE
  ecomm.t_leave
ADD
  half_day BOOL NULL;

ALTER TABLE
  ecomm.t_leave
ADD
  leave_id BIGINT(20) NULL;

ALTER TABLE
  ecomm.t_leave
MODIFY
  COLUMN no_of_days DECIMAL(10, 2) NOT NULL;

ALTER TABLE
  ecomm.t_leave
MODIFY
  COLUMN leave_type ENUM(
    "Annual/Casual",
    "Maternity",
    "Paternity",
    "Sick"
  ) DEFAULT NULL NULL;

ALTER TABLE
  ecomm.t_task
MODIFY
  COLUMN status enum('Pending', 'In Progress', 'Hold', 'Done') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;

CREATE TABLE grocernest_pre_prod.t_attendance (
  id BIGINT(20) auto_increment NOT NULL,
  user_id bigint(20) NOT NULL,
  login_time DATETIME NULL,
  logout_time DATETIME NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  CONSTRAINT NewTable_PK PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

CREATE TABLE grocernest_pre_prod.t_feedback (
  id BIGINT(20) auto_increment NOT NULL,
  cust_no varchar(20) NOT NULL,
  stars bigint(10) NULL,
  description varchar(5000) NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  CONSTRAINT t_feedback_PK PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- grocernest_pre_prod.t_vendor_item definition

CREATE TABLE `t_vendor_item` (
  `vendor_id` varchar(100) DEFAULT NULL,
  `item_id` bigint(20) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;