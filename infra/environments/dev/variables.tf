variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "location" {
  description = "Azure region where resources will be created."
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
}

variable "address_space" {
  description = "Virtual network address space."
  type        = list(string)
}

variable "aks_subnet_address_prefixes" {
  description = "Address prefixes for the AKS subnet."
  type        = list(string)
}

variable "private_endpoint_subnet_address_prefixes" {
  description = "Address prefixes for private endpoints."
  type        = list(string)
}

variable "tags" {
  description = "Common tags applied to Azure resources."
  type        = map(string)
  default     = {}
}

variable "kubernetes_version" {
  description = "Optional AKS Kubernetes version. Null uses Azure's current regional default."
  type        = string
  default     = null
  nullable    = true
}

variable "node_vm_size" {
  description = "VM size for AKS nodes."
  type        = string
}

variable "node_count" {
  description = "Initial AKS node count."
  type        = number
}

variable "min_node_count" {
  description = "Minimum AKS node count."
  type        = number
}

variable "max_node_count" {
  description = "Maximum AKS node count."
  type        = number
}


variable "tenant_id" {
  description = "Azure tenant ID."
  type        = string
}

variable "admin_object_id" {
  description = "Object ID of the admin user or group for Key Vault access."
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

variable "postgres_sku_name" {
  description = "PostgreSQL Flexible Server SKU."
  type        = string
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage size in MB."
  type        = number
}


variable "database_url" {
  description = "Application database connection string stored in Key Vault."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret stored in Key Vault."
  type        = string
  sensitive   = true
}
