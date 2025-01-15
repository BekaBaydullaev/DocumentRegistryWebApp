CREATE DATABASE DocumentRegistryDB;
USE documentRegistryDB;

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  regNumber NVARCHAR(50) NOT NULL,
  regDate DATE NOT NULL,
  docNumber NVARCHAR(50),
  docDate DATE,
  deliveryType NVARCHAR(50),
  correspondent NVARCHAR(50) NOT NULL,
  subject NVARCHAR(100) NOT NULL,
  description NVARCHAR(1000),
  dueDate DATE,
  isAccessible BOOLEAN DEFAULT 0,
  isUnderControl BOOLEAN DEFAULT 0,
  fileName NVARCHAR(255)
  filePath NVARCHAR(500)
);
