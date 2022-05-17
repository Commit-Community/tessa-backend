# TESSA Backend

## Getting Started

### 1. Configure a GitHub OAuth app

Users log into TESSA with GitHub. Every developer should create their own OAuth
app in GitHub to develop against. To do that, follow these steps.

1. Go to https://github.com/settings/developers.
2. Click the "New OAuth App" button.
3. Enter the following data, then click the "Register application" button.
   - Application name: TESSA Development
   - Homepage URL: `http://localhost:3000/`
   - Application description: TESSA local development.
   - Authorization callback URL:
     `http://localhost:8484/auth/github/oauth/callback`
4. In your local clone of this repo, create a copy of the file `.env.example`
   and name it `.env`.
5. On the `Settings / Developer settings / TESSA Development` page, copy the
   "Client ID" and paste the value after `GITHUB_CLIENT_ID=` in the `.env` file.
6. Then, click the "Generate a new client secret" button, copy the secret, and
   paste it after `GITHUB_CLIENT_SECRET=` in the `.env` file.

### 2. Start the Postgres database

TESSA uses a Postgres database. For convenience, a `docker-compose.yml` file has
been created to run a development database with the preconfigured environment.
To start the database, simply run:

```
docker-compose up
```

### 3. Install dependencies and run the server

TESSA Backend is a Node.js app. To improve compatibility, it should only be run
against the version of Node.js specified in the `.nvmrc` file. If you have
[NVM](https://github.com/nvm-sh/nvm) installed, to use the correct version of
Node, run:

```
nvm use
```

With the right version of node installed, the next step is to install the
dependencies. To do that, run:

```
npm install
```

Finally, run the server with:

```
npm start
```

## Production environment

To set up your local environment with access to AWS and Kubernetes, run:

```
./scripts/setup-env.sh
```

This script will open a web browser and prompt you to log in with your Commit
account, and then will configure an AWS profile and a Kubernetes context.

## Structure

### Kubernetes

The configuration of the application in Kubernetes uses
[https://kustomize.io/](kustomize) and is run by the CI pipeline. The
configuration is in the [`/kubernetes`](./kubernetes/deploy/) directory.
Once the CI pipeline is finished, you can see the pod status on kubernetes in
the `tessa-backend` namespace:

```
kubectl -n tessa-backend get pods
```

### GitHub Actions

This repository has an end-to-end CI/CD pipeline that runs whenever new commits
are pushed to the `main` branch. It includes the following steps.

1. Checkout
2. Unit test
3. Build image
4. Upload Image to ECR
5. Deploy image to cluster

Pull requests also run a workflow which runs unit tests, and checks the code for
lint before permitting PRs to be merged.
