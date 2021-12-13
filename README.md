# User Serverless Microservice with AWS, NodeJS, TypeScript

This is an opensource microservice done in TypeScript and using AWS SAM. This application is a full authorization solution that leverages AWS API Gateway, Lambda Functions, and DynamoDB for a full serverless solution that will charge you only for what you use.

The solution includes a SAM template that will import an existing Cognito User Pool for authentication purposes for the API and all endpoints will be behind this auth service except for `/healthcheck`.

The application is 100% conigured to spin up locally for development purposes (using Docker), and also implements a code-base DynamoDB mock module for testing purposes so you don't need a local DB to run the tests.

## AWS Services integrated

There are multiple AWS Services integrated into this project, and some indirect ones too. Here's a full list:

**Directly integrated services**

-   AWS Lambda
-   Amazon API Gateway
-   Amazon DynamoDB
-   Amazon CloudWatch

**PoC-related directly integrated services**

-   Amazon Cognito
-   Amazon EventBridge

**Indirectly integrated services**

-   AWS IAM
-   AWS CloudFormation
-   Amazon S3

### Local (dev)

For local running version of the solution (Amazon Cognito and Amazon Eventbridge won't have a local version) you will need:

-   [NodeJS](https://nodejs.dev/download/) (14.x)
-   [Docker](https://docs.docker.com/get-docker/) (needed by both SAM and a local DynamoDB)
-   [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) + [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) to be able to start a local API

### Dev (cloud)

For a full development instance of the entire solution in AWS (in the cloud) you will need:

-   A [GitHub](https://github.com/) account for your repository
-   An [AWS](https://aws.amazon.com/) account

## Testing the service locally

The service can be tested locally to some degree although for development purposes we suggest using TDD strategies instead of local real testing since it's slow (since SAM emulates some of the services using a slow docker-based solution).

### Preparing your service for a local start

In order for the service to start locally t

Configure your local DynamoDB access by copying the file `env.json.sample` into a new file named `env.json` and edit the file to make the DynamoDB URI match your local Docker network accessible IP address. In my Mac laptop that was `http://192.168.0.x:8000` and the port has to stay at `8000` (unless you have a conflict which will require more work to get it adjusted).

**Note: Be sure you double check this every time you restart your computer and/or your internet get restarted since the IP address may change with every retart.**

Remove any existing `.aws-sam` directory in the project root (and any content inside). This directory is ignored but gets created when you try to build the project for an AWS deploy. Trying to run the project locally with an existing directory (and content) may end up in conflicts and/or problems in the future if you are testing changes since AWS will try to run the local copy out of the build and not out of your source code.

You will need [Overmind](https://github.com/DarthSim/overmind) for an easy launch (recommended). But we will include instructions without Overmind if you want to avoid it. Overmind simplifies having 3 services up and running and updating code when changes happen without having to restart anything.

Make sure you run at least once `npm install` to install all the dependencies before moving forward.

### Starting the service locally

If you have Overmind, please use the following command:

```bash
$ overmind start
```

And that's pretty much it!

Now, if you don't have Overmind, to do the same you will have to open 3 terminals and run the following commands on each of them:

Terminal 1 (local DynamoDB instance):

```bash
$ docker-compose up
```

Terminal 2 (Typescript compiler + update)

```bash
$ npm run watch
```

Terminal 3 (SAM service local start)

```bash
$ sam local start-api --skip-pull-image --env-vars=env.json 2>&1 | tr "\r" "\n"
```

Whether you are using Overmind or not, you should be able to validate things are up and running locally by checking the logs on all 3 terminals, and after that by accessing the URL: `http://127.0.0.1:3000/healthcheck` (Postman or similar recommended but this URL should work on your browser too).

Note: the DynamoDB local instance may take a few minutes to start for the first time. It will create a directory that is ignored in the project but where it will save the data so the next time it can start much faster.

### Running code-based project tests

You can execute project tests by running:

```bash
$ npm run test
```

By default `jest` is configured to run tests silently (hiding `console.log` and `console.error`). If you want to enable `console` output add the environment variable `DEBUG` with any value before runnning the tests. In Mac you can do:

```bash
$ DEBUG=1 npm run test
```

If you want to run specific tests, you can use the usual Jest filter parameter. For example:

```bash
$ npm run test --filter healcheck.test
```

And if you want to run tests with coverage you can do:

```bash
$ npm run test:coverage
```

Which will create a new directory on your project named `coverage` where all the information will be saved including an html-indexed full report.

### Testing endpoints

To test local endpoints you can use Postman or any other API request utility like curl. However, you will be responsible for generating a valid JWT authentication token and add it to each request as an `Authentication` header (JWT standard Bearer Authentication header). To make your life easier, the project ships with a full Postman collection which includes authentication resolved for you. Please read more about it in the project's Postman [folder](https://github.com/msoffredi/ms-auth/tree/main/__tests__/postman).

### Stopping the service locally

To stop the service(es) all you need to do is press `Ctrl + C` on your Overmind terminal, or if you are in the 3 terminals setup, you need to do the same on each terminal (`Ctrl + C` on each of them).

## Deployment

### Accessing local DynamoDB for development purposes

When you are developing locally, and working with a local instance (SAM/Docker), you are most likely using a local DynamoDB too, which runs in a Docker container too and stores the data in a `/docker` folder (ignored in the repo). This helps by persisting the DB data locally so you don't always start with an empty DB.

Sometimes you need to access the DB data to validate development efforts and for that purpose we recommend using [dynamodb-admin](https://www.npmjs.com/package/dynamodb-admin) which creates a nice web-based interface you can open in any browser with full access to the data inside.

### Deploying to AWS Dev Account from local

Warning: local deployment to AWS is discouraged in favor of our CI/CD configuration. This is meant for CI/CD development and/or testing purposes and required an AWS account with almost admin privileges.

By dev here we mean deploying into an actual AWS account used for development purposes. In order to do that you basically need to build your project and deploy it by using the SAM CLI.

Before trying the next command make sure you have your AWS CLI installed and configured properly with a user with enough permissions to performe the deploy:

```bash
$ sam build
```

To deploy from local you will need:

-   **A valid email address**: this is the super admin user email address the system will use to create the first user in your deployed Cognito User Pool to you have an initial access to the authorization system. This email address will be used also by the deployment script to create an initial user, role, and permissions for the user to have full access to the authorization service API.

And then deploy using the SAM CLI too:

```bash
$ sam deploy --guided
```

You are going to be prompted into answering a series of questions which will simplify the deployment command for you. Here's an example:

```
Looking for config file [samconfig.toml] :  Not found

Setting default arguments for 'sam deploy'
=========================================
Stack Name [sam-app]: ms-user
AWS Region [us-east-1]:
Parameter SuperAdminEmail []: <Enter a real email address here>
#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
Confirm changes before deploy [y/N]:
#SAM needs permission to be able to create roles to connect to the resources in your template
Allow SAM CLI IAM role creation [Y/n]:
Save arguments to configuration file [Y/n]:
SAM configuration file [samconfig.toml]:
SAM configuration environment [default]:
```

This command above should create all the necessary resources including CloudFormation stack and S3 deployment bucket. **Some of these resources will be created with unique randomly generated names and will persist even after a full cleanup (see cleanup command below)**.

By the default, if you followed the answers above, CloudFormation will save your answers and remember them for the next run in a file `samconfig.toml`. This file is ignored by default and won't be pushed into the GitHub repo (**and it shouldn't!**).

### Deploying to AWS using the GitHub CI/CD

A normal deployment to AWS using the project's CI/CD configuration will happen if you create and promote changes through a new branch (typically out of `main` branch), and create a Pull Request (PR) to merge your branch changes into `main`.

When the PR is ready to be merged into `main` and you trigger the action GitHub will run the project's GitHub actions including a full deploy to AWS.

For the above deployment to be successful, you need more configuration to be in place in your GitHub repository. That will include having the required secrets configured as stated in the next sub-section.

#### Adding secrets to your GitHub repository

In order for the AWS deployment GitHub action to work you need to add some secrets to your GitHub repository. These are the secrets and what to include in them:

-   `AWS_REGION` = Your prefered region, e.g. us-east-1
-   `AWS_ACCESS_KEY_ID` = A valid AWS account user access key (must have enough privileges to deploy the stack)
-   `AWS_SECRET_ACCESS_KEY` = A matching secret access key for the same user above
-   `SUPER_ADMIN_EMAIL` = The email address of the super admin added as first user to the user pool
-   `DEPLOY_S3_BUCKET` = An S3 bucket name to use for deployment purposes (this must be unique in the entire AWS)

I recommend you take note of all of these configurations in a personal document or similar because you won't have access to these values in the future. The ones you want to be careful about are `AWS_ACCESS_KEY_ID` & `AWS_DECRET_ACCESS_KEY` (for these please follow AWS best practices in handling them and saving them for later. I save them in AWS Secret Manager).

### Removing everything from AWS at once

If at any point you want to actually remove the entire solution from AWS, you can run this command in your command line (with AWS CLI):

```
$ aws cloudformation delete-stack --stack-name ms-user
```

This will ask AWS Cloudformation to use the template.yml and your current account deployment to select and remove all related configurations and services. Be advice this may take a few mins to complete even if you see the command finishing right away.

### AWS associated costs

This project stack can stay mostly within the AWS free tier, therefore, not produce any fix recurrent costs associated to the infrastructure deployed.

However, traffic obviously will consume from a different separate cost centers and eventually may produce some costs for you under your AWS account.

Anyways, from a development point ov view we are not currently incurring in any costs associated to this project and we have it permanently deployed in AWS.
