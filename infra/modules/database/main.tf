resource "azurerm_private_dns_zone" "this" {
  name                = "${var.project_name}-${var.environment}.private.postgres.database.azure.com"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "this" {
  name                  = "${var.project_name}-${var.environment}-postgres-link"
  private_dns_zone_name = azurerm_private_dns_zone.this.name
  virtual_network_id    = var.virtual_network_id
  resource_group_name   = var.resource_group_name
  registration_enabled  = false
  tags                  = var.tags
}

resource "azurerm_postgresql_flexible_server" "this" {
  name                = "psql-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location

  version = var.postgres_version

  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password

  sku_name   = var.postgres_sku_name
  storage_mb = var.postgres_storage_mb

  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.environment == "prod" ? true : false

  delegated_subnet_id           = var.delegated_subnet_id
  private_dns_zone_id           = azurerm_private_dns_zone.this.id
  public_network_access_enabled = false

  depends_on = [azurerm_private_dns_zone_virtual_network_link.this]

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "this" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.this.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
