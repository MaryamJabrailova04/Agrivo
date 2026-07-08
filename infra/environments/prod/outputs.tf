output "resource_group_name" {
  description = "Resource group created for the prod environment."
  value       = module.network.resource_group_name
}

output "virtual_network_name" {
  description = "Virtual network created for the prod environment."
  value       = module.network.virtual_network_name
}

output "aks_subnet_id" {
  description = "AKS subnet ID for the prod environment."
  value       = module.network.aks_subnet_id
}

output "private_endpoint_subnet_id" {
  description = "Private endpoint subnet ID for the prod environment."
  value       = module.network.private_endpoint_subnet_id
}

output "aks_cluster_name" {
  description = "Name of the prod AKS cluster."
  value       = module.aks.cluster_name
}

output "aks_node_resource_group" {
  description = "Node resource group for prod AKS."
  value       = module.aks.node_resource_group
}

output "key_vault_name" {
  description = "Name of the prod Key Vault."
  value       = module.keyvault.key_vault_name
}

output "key_vault_uri" {
  description = "URI of the prod Key Vault."
  value       = module.keyvault.key_vault_uri
}
