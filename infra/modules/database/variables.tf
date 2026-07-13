variable "project_name" {
  description = "Project name used for database naming."
  type        = string
}

variable "environment" {
  description = "Environment name, for example dev or prod."
  type        = string
}

variable "location" {
  description = "Azure region for the database."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group where the database will be created."
  type        = string
}

variable "virtual_network_id" {
  description = "Virtual network linked to the PostgreSQL private DNS zone."
  type        = string
}

variable "delegated_subnet_id" {
  description = "Subnet delegated to PostgreSQL Flexible Server."
  type        = string
}

variable "postgres_admin_username" {
  description = "PostgreSQL administrator username."
  type        = string
}

variable "postgres_admin_password" {
  description = "PostgreSQL administrator password."
  type        = string
  sensitive   = true
}

variable "postgres_version" {
  description = "PostgreSQL engine version."
  type        = string
  default     = "16"
}

variable "postgres_sku_name" {
  description = "PostgreSQL Flexible Server SKU."
  type        = string
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage size in MB."
  type        = number
}

variable "database_name" {
  description = "Application database name."
  type        = string
  default     = "agrivo_db"
}

variable "backup_retention_days" {
  description = "Backup retention period in days."
  type        = number
  default     = 7
}

variable "tags" {
  description = "Common tags applied to database resources."
  type        = map(string)
  default     = {}
}
