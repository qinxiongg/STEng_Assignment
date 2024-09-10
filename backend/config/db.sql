SHOW DATABASES;

DROP DATABASE IF EXISTS nodelogin;

CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
`username` varchar(50) NOT NULL,
`password` varchar(255) NOT NULL,
`email` varchar(100) NOT NULL,
`accountStatus` varchar(30) NOT NULL,
PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELETE FROM `accounts` WHERE `username` = 'test';
INSERT INTO `accounts` (`username`, `password`, `email`, `accountStatus`) VALUES ('test', 'test', 'test@test.com', 'Active');
