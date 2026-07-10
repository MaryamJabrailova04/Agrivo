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

  public_network_access_enabled = true

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "this" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.this.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
