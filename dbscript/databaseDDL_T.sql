-- grocernest.t_wallet definition
CREATE TABLE `t_wallet` (
  `wallet_id` bigint(20) NOT NULL,
  `cust_no` varchar(20) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`wallet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- grocernest.t_wallet_transaction definition
CREATE TABLE `t_wallet_transaction` (
  `wallet_id` bigint(20) NOT NULL,
  `transaction_id` bigint(20) NOT NULL,
  `transaction_type` char(1) DEFAULT NULL COMMENT 'Possible values are D for Debit, C for Cradit',
  `transaction_amount` decimal(10,2) NOT NULL,
  `transaction_details` varchar(250) DEFAULT NULL,
  `transaction_date_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `t_wallet_transaction_fk` (`wallet_id`),
  CONSTRAINT `t_wallet_transaction_fk` FOREIGN KEY (`wallet_id`) REFERENCES `t_wallet` (`wallet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- grocernest.t_address definition


CREATE TABLE `t_address` (
  `address_id` varchar(255) NOT NULL,
  `cust_no` varchar(20) NOT NULL,
  `address_title` varchar(255) NOT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `PIN_code` bigint(20) NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE ecomm.t_customer ADD referral_code varchar(100) NULL;
ALTER TABLE ecomm.t_customer ADD referred_by varchar(20) NULL;


-- coupon DDL  --

CREATE TABLE `t_coupon` (
  `id` bigint(20) NOT NULL,
  `coupon_code` varchar(30) NOT NULL,
  `coupon_type` varchar(30) NOT NULL,
  `expiry` timestamp NULL DEFAULT NULL,
  `min_purchase` decimal(10,2) NULL,
  `max_purchase` decimal(10,2) NULL,
  `discount_amount` decimal(10,2) NULL,
  `is_percentage` varchar(1) NULL,
  `max_discount_amount` decimal(10,2) NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `t_coupon_applicable_item` (
  `coupon_id` bigint(30) NOT NULL, 
  `applicable_category_id` bigint(20) NULL,
  `applicable_subcategory_id` bigint(20) NULL,
  `applicable_item_id` bigint(20) NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
)