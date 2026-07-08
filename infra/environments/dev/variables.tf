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
  description = "AKS Kubernetes version."
  type        = string
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
