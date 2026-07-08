variable "project_name" {
  description = "Project name used for AKS naming."
  type        = string
}

variable "environment" {
  description = "Environment name, for example dev or prod."
  type        = string
}

variable "location" {
  description = "Azure region for AKS."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group where AKS will be created."
  type        = string
}

variable "kubernetes_version" {
  description = "AKS Kubernetes version."
  type        = string
}

variable "dns_prefix" {
  description = "DNS prefix for the AKS cluster."
  type        = string
}

variable "aks_subnet_id" {
  description = "Subnet ID used by AKS node pools."
  type        = string
}

variable "node_vm_size" {
  description = "VM size for the default AKS node pool."
  type        = string
}

variable "node_count" {
  description = "Initial number of nodes in the default node pool."
  type        = number
}

variable "min_node_count" {
  description = "Minimum number of nodes for cluster autoscaler."
  type        = number
}

variable "max_node_count" {
  description = "Maximum number of nodes for cluster autoscaler."
  type        = number
}

variable "tags" {
  description = "Common tags applied to AKS resources."
  type        = map(string)
  default     = {}
}
