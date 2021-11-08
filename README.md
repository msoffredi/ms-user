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

Configure your local DynamoDB access by copying the file `env.json.sample` into a new file named `env.json` and edit the file to make the DynamoDB URI match your local Docker network accessible IP address. In my Mac laptop that was `http://192.168.0.151:8000` and the port has to stay at `8000` (unless you have a conflict which will require more work to get it adjusted).

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
