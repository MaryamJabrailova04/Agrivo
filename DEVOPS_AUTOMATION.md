# Agrivo DevOps automation

This repository no longer depends on the deleted Harbor VM. Images are rebuilt from source and stored in GitHub Container Registry (GHCR):

- `ghcr.io/maryamjabrailova04/agrivo-frontend:<git-sha>`
- `ghcr.io/maryamjabrailova04/agrivo-backend:<git-sha>`

## Automated flow

1. Pull requests run dependency audit, frontend build, backend database smoke tests, Docker build, Helm render and Terraform validation.
2. A merge to `main` validates the platform and rebuilds both application images from source.
3. Images receive immutable Git SHA tags, SBOM/provenance metadata, a keyless Cosign signature and a blocking Trivy HIGH/CRITICAL scan.
4. Successful images update the dev Helm values automatically.
5. Argo CD watches `main`, prunes drift and self-heals the dev cluster.
6. The workflow waits for the AKS dev rollout when AKS variables are configured.
7. Production promotion accepts only an existing full Git SHA, requires the `prod` Environment approval, updates GitOps and waits for rollout.
8. A failed production rollout is rolled back automatically.
9. A weekly scheduled build recreates current images, even if registry content is accidentally deleted.
10. Dependabot maintains npm, Docker, Terraform and GitHub Actions dependencies.

## One-time GitHub bootstrap

Create GitHub Environments named `dev` and `prod`. Protect `prod` with required reviewers.

Add these Environment secrets to both environments:

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Federated GitHub Actions application/client ID |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `POSTGRES_ADMIN_PASSWORD` | PostgreSQL administrator password |
| `DATABASE_URL` | Complete application database connection URL |
| `JWT_SECRET` | Long random production-grade JWT signing key |

Add these Environment variables:

| Variable | Purpose |
| --- | --- |
| `AZURE_ADMIN_OBJECT_ID` | Key Vault administrator object ID |
| `AKS_RESOURCE_GROUP` | AKS resource group used by rollout verification |
| `AKS_CLUSTER_NAME` | AKS cluster used by rollout verification |
| `AZURE_LOCATION` | Azure region, for example `westeurope` |
| `TFSTATE_RESOURCE_GROUP` | Shared Terraform-state resource group |
| `TFSTATE_STORAGE_ACCOUNT` | Globally unique lowercase storage account name |
| `TFSTATE_CONTAINER` | Terraform-state blob container, normally `tfstate` |
| `SITE_HOSTNAME` | Environment hostname without `https://` |
| `LETSENCRYPT_EMAIL` | Real email used for ACME certificates |

Configure Azure workload identity federation for the repository and each GitHub Environment. No Azure client secret is required.

After the first successful image push, set both GHCR packages to **Public**. Public packages let AKS pull without a long-lived registry password or Kubernetes image-pull secret. If private packages are mandatory, create a read-only GHCR pull secret through External Secrets/Key Vault instead of storing a PAT in Git.

## First deployment

1. Run `Bootstrap Terraform State` once after configuring the `dev` Environment.
2. Run `Terraform Apply` for `dev`.
3. Run `Bootstrap AKS Platform` for `dev`; it installs/upgrades Argo CD, ingress-nginx, cert-manager and kube-prometheus-stack and applies the root app.
4. No manual `kubectl` bootstrap is required. Argo CD runs the Prisma migration hook before the backend rollout.
5. Merge an application change to `main`; CI will create both images and update dev GitOps values.
6. Point the environment DNS record to the ingress controller public IP.
7. Verify dev, then run `Promote and Verify Production` with the successful 40-character Git SHA.
8. Run `Bootstrap AKS Platform` for `prod`; it applies `gitops/argocd/root-app-prod.yaml` and starts the automated production GitOps applications.

## What remains intentionally manual

Cloud account ownership cannot safely be inferred or committed. The Azure subscription, OIDC trust, DNS ownership, GitHub Environment reviewers and initial Argo CD bootstrap are one-time control-plane actions. Every normal release after that bootstrap is automated.

## Recovery after total image loss

Run `CI, Images and Dev GitOps` manually. The workflow rebuilds frontend and backend images from the repository, scans and signs them, pushes immutable SHA tags, and restores the dev release. Production can then be promoted from the same verified SHA.
