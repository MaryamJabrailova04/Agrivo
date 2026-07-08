output "resource_group_name" {
  description = "Resource group created for the dev environment."
  value       = module.network.resource_group_name
}

output "virtual_network_name" {
  description = "Virtual network created for the dev environment."
  value       = module.network.virtual_network_name
}

output "aks_subnet_id" {
  description = "AKS subnet ID for the dev environment."
  value       = module.network.aks_subnet_id
}

output "private_endpoint_subnet_id" {
  description = "Private endpoint subnet ID for the dev environment."
  value       = module.network.private_endpoint_subnet_id
}
