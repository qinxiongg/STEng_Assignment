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

CREATE TABLE IF NOT EXISTS `Application` (
    `App_Acronym` varchar(50),
    `App_Description` TEXT,
    `App_Rnumber` int NOT NULL,
    `App_startDate` int NOT NULL,
    `App_endDate` int NOT NULL,
    `App_permit_Create` varchar(50),
    `App_permit_Open` varchar(50),
    `App_permit_toDoList` varchar(50),
    `App_permit_Doing` varchar(50),
    `App_permit_Done` varchar(50),
    PRIMARY Key (`App_Acronym`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `Plan` (
    `Plan_MVP_name` varchar(255),
    `Plan_app_Acronym` varchar(50) NOT NULL,
    `Plan_startDate` int NOT NULL,
    `Plan_endDate` int NOT NULL,
    `Plan_color` varchar(7) NOT NULL
    FOREIGN KEY (`Plan_app_Acronym`) REFERENCES 
    Application(`App_Acronym`) ON DELETE CASCADE,
    PRIMARY KEY (`Plan_MVP_name`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `Task` (
    `Task_id` varchar(100),
    `Task_plan` varchar(255) DEFAULT NULL,
    `Task_app_Acronym` varchar(50) NOT NULL,
    `Task_name` varchar(255) NOT NULL,
    `Task_description` TEXT,
    `Task_notes` MEDIUMTEXT,
    `Task_state` varchar(10) NOT NULL,
    `Task_creator` varchar(50) NOT NULL,
    `Task_owner` varchar(50) NOT NULL,
    FOREIGN KEY (`Task_plan`) REFERENCES 
    Plan(`Plan_MVP_name`) ON DELETE
    SET NULL,
    FOREIGN KEY (`Task_app_Acronym`) REFERENCES
    Application(`App_Acronym`) ON DELETE CASCADE,
    PRIMARY KEY (`Task_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;