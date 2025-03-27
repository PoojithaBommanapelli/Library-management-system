-- Create the database
USE Library_Management;

CREATE TABLE `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `shelf_location` varchar(255) NOT NULL DEFAULT 'Unknown',  
  `genre` varchar(255) NOT NULL,
  `publication_year` int NOT NULL DEFAULT '2025',
  `available_copies` int NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `available` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `issued_books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `student_id` int NOT NULL,
  `issue_date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `issued_books_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `librarians` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `employee_id` varchar(255) NOT NULL,
  `qualification` varchar(255) NOT NULL,
  `experience` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_id_2` (`employee_id`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `employee_id_3` (`employee_id`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `employee_id_4` (`employee_id`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `employee_id_5` (`employee_id`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `employee_id_6` (`employee_id`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `employee_id_7` (`employee_id`),
  UNIQUE KEY `email_7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `sessions` (
  `sid` varchar(36) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `hall_ticket` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `year` int NOT NULL,
  `semester` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hall_ticket` (`hall_ticket`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `hall_ticket_2` (`hall_ticket`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `hall_ticket_3` (`hall_ticket`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `hall_ticket_4` (`hall_ticket`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `hall_ticket_5` (`hall_ticket`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `hall_ticket_6` (`hall_ticket`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `hall_ticket_7` (`hall_ticket`),
  UNIQUE KEY `email_7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `due_date` datetime NOT NULL,
  `return_date` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `borrow_date` datetime DEFAULT NULL,
  `fine_amount` float DEFAULT '0',
  `student_id` int DEFAULT NULL,
  `students_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `student_id` (`student_id`),
  KEY `students_id` (`students_id`),
  CONSTRAINT `transactions_ibfk_110` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `transactions_ibfk_111` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transactions_ibfk_112` FOREIGN KEY (`students_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
