output "resource_group_name" {
  description = "Name of the network resource group."
  value       = azurerm_resource_group.this.name
}

output "resource_group_location" {
  description = "Azure region of the resource group."
  value       = azurerm_resource_group.this.location
}

output "virtual_network_id" {
  description = "ID of the virtual network."
  value       = azurerm_virtual_network.this.id
}

output "virtual_network_name" {
  description = "Name of the virtual network."
  value       = azurerm_virtual_network.this.name
}

output "aks_subnet_id" {
  description = "ID of the AKS subnet."
  value       = azurerm_subnet.aks.id
}

output "private_endpoint_subnet_id" {
  description = "Deprecated alias for the PostgreSQL delegated subnet."
  value       = azurerm_subnet.database.id
}

output "database_subnet_id" {
  description = "ID of the subnet delegated to PostgreSQL Flexible Server."
  value       = azurerm_subnet.database.id
}
