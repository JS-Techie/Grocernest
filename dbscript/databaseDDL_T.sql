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





CREATE TABLE `t_milk_items` (
  `item_id` varchar(255) NOT NULL,
  `brand` varchar(100) NULL,
  `type` varchar(100) NULL,
  `weight` varchar(255) NULL,
  `cost_price` decimal(10,2) NULL,
  `selling_price` decimal(10,2) NULL, 
  `MRP` decimal(10,2) NOT NULL,
  `CGST` decimal(10,2) NULL,
  `SGST` decimal(10,2) NULL,
  `IGST` decimal(10,2) NULL,
  `other_tax` decimal(10,2) NULL,
  `discount` decimal(10,2) NULL,
  `UOM` varchar(50) NULL,
  `image` varchar(255) NULL,

  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE ecomm.t_milk_items ADD item_code varchar(100) NULL;



CREATE TABLE `t_subscription` (
  `id` varchar(255) NOT NULL,
  `cust_no` varchar(100) NULL,
  `name` varchar(100) NULL,
  `type` varchar(100) NULL,
  `status` enum('Paused','Ongoing','Cancelled') NULL,
  `admin_status` enum('Accepted','Declined','Started','Canceled') NULL,
  `start_date` timestamp NULL,
  `end_date` timestamp NULL, 
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `t_subscription_items` (
  `id` bigint(20) NOT NULL,
  `subscription_id` varchar(255) NULL,
  
  `item_id` varchar(255) NULL,
  `quantity` bigint(20) NULL,

  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




CREATE TABLE `t_gateway_transaction` (
  `transaction_id` varchar(255) NOT NULL,
  `cust_no` varchar(100) NULL,
  `status` varchar(100) NULL,

  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



CREATE TABLE `t_shorten_url` (
  `id` varchar(20) NOT NULL,
  
  `original_url` varchar(500) NULL,
  `short_url` varchar(300) NULL,

  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE grocernest_pre_prod.t_customer ADD calling_number varchar(20) NULL;​
