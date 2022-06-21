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


