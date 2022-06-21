-- grocernest.t_lkp_wishlist definition

CREATE TABLE `t_lkp_wishlist` (
  `cust_no` varchar(20) NOT NULL,
  `wishlist_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `wishlist_name` varchar(100) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`wishlist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

