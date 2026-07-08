variable "project_name" {
  description = "Project name used for Azure resource naming."
  type        = string
}

variable "environment" {
  description = "Environment name, for example dev or prod."
  type        = string
}

variable "location" {
  description = "Azure region for the network resources."
  type        = string
}

variable "address_space" {
  description = "Address space for the virtual network."
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
  description = "Common tags applied to network resources."
  type        = map(string)
  default     = {}
}
