output "postgres_server_name" {
  description = "Name of the PostgreSQL Flexible Server."
  value       = azurerm_postgresql_flexible_server.this.name
}

output "postgres_server_fqdn" {
  description = "FQDN of the PostgreSQL Flexible Server."
  value       = azurerm_postgresql_flexible_server.this.fqdn
}

output "database_name" {
  description = "Name of the application database."
  value       = azurerm_postgresql_flexible_server_database.this.name
}

output "private_dns_zone_id" {
  description = "ID of the PostgreSQL private DNS zone."
  value       = azurerm_private_dns_zone.this.id
}
