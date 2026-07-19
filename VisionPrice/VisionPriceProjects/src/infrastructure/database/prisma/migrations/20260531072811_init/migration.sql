-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `clientName` VARCHAR(160) NULL,
    `location` VARCHAR(255) NULL,
    `workType` ENUM('FLOOR', 'WALL', 'CEILING', 'COMBINED') NOT NULL,
    `area` DECIMAL(10, 2) NULL,
    `totalBudget` DECIMAL(14, 2) NULL,
    `status` ENUM('MEASURED', 'QUOTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'MEASURED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `projects_ownerId_idx`(`ownerId`),
    INDEX `projects_ownerId_status_idx`(`ownerId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
