-- Initial database
DROP DATABASE IF EXISTS nodelogin;

CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
`username` varchar(50) NOT NULL,
`password` varchar(255) NOT NULL,
`email` varchar(100) NOT NULL,
`accountStatus` varchar(30) NOT NULL Default 'Active',
PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELETE FROM `accounts` WHERE `username` = 'test';
INSERT INTO `accounts` (`username`, `password`, `email`) VALUES ('test', 'test', 'test@test.com');

CREATE TABLE IF NOT EXISTS `user_group` (
`usergroup` varchar(50) NOT NULL,
`username` varchar(50) DEFAULT '',
PRIMARY KEY (usergroup, username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXIST `Application` (
    `App_Acronym` varchar(50) NOT NULL,
    `App_Rnumber` int NOT NULL,
    `App_startDate` int NOT NULL,
    `App_endDate` int NOT NULL,
    `App_Description` varchar(250),
    `App_permit_Create` varchar(50) Default 'PL',
    `App_permit_Open` varchar(50),
    `App_permit_toDoList` varchar(50),
    `App_permit_Doing` varchar(50),
    `App_permit_Done` varchar(50),
    PRIMARY Key (`App_Acronym`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;