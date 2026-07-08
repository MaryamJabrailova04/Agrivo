variable "project_name" {
  description = "Project name used for Key Vault naming."
  type        = string
}

variable "environment" {
  description = "Environment name, for example dev or prod."
  type        = string
}

variable "location" {
  description = "Azure region for Key Vault."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group where Key Vault will be created."
  type        = string
}

variable "tenant_id" {
  description = "Azure tenant ID."
  type        = string
}

variable "admin_object_id" {
  description = "Object ID of the admin user or group that can manage Key Vault secrets."
  type        = string
}

variable "soft_delete_retention_days" {
  description = "Number of days to retain deleted Key Vault objects."
  type        = number
  default     = 7
}

variable "tags" {
  description = "Common tags applied to Key Vault resources."
  type        = map(string)
  default     = {}
}
