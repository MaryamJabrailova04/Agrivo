resource "azurerm_key_vault" "this" {
  # Key Vault names are globally unique and deleted vaults remain reserved by
  # Azure soft-delete. Include a stable region hash so a region migration can
  # create the replacement immediately without a purge or quota change.
  name                = "kv-${var.project_name}-${var.environment}-${substr(md5(var.location), 0, 6)}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = var.tenant_id

  sku_name = "standard"

  soft_delete_retention_days = var.soft_delete_retention_days
  purge_protection_enabled   = true

  enable_rbac_authorization = false

  public_network_access_enabled = true

  tags = var.tags
}

resource "azurerm_key_vault_access_policy" "admin" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = var.tenant_id
  object_id    = var.admin_object_id

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete",
    "Recover",
    "Backup",
    "Restore",
    "Purge"
  ]
}

resource "azurerm_key_vault_access_policy" "reader" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = var.tenant_id
  object_id    = var.reader_object_id

  secret_permissions = ["Get", "List"]
}

resource "azurerm_key_vault_secret" "this" {
  for_each = var.secrets

  name         = each.key
  value        = each.value
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [
    azurerm_key_vault_access_policy.admin
  ]

  tags = var.tags
}
resource "azurerm_key_vault" "this" {
  name                = "kv-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = var.tenant_id

  sku_name = "standard"

  soft_delete_retention_days = var.soft_delete_retention_days
  purge_protection_enabled   = true

  enable_rbac_authorization = false

  public_network_access_enabled = true

  tags = var.tags
}

resource "azurerm_key_vault_access_policy" "admin" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = var.tenant_id
  object_id    = var.admin_object_id

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete",
    "Recover",
    "Backup",
    "Restore",
    "Purge"
  ]
}

resource "azurerm_key_vault_access_policy" "reader" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = var.tenant_id
  object_id    = var.reader_object_id

  secret_permissions = ["Get", "List"]
}

resource "azurerm_key_vault_secret" "this" {
  for_each = var.secrets

  name         = each.key
  value        = each.value
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [
    azurerm_key_vault_access_policy.admin
  ]

  tags = var.tags
}
