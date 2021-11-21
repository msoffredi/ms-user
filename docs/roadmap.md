# Unordered list of features in the roadmap

-   Add authorization to API endpoints
-   Add exported Postman collection to the repo
-   Convert user ID into PK and validate email address is unique

-   List all users API endpoint pagination
-   Replay of events (or latest events) on new version deploy + archive of latest events (or all events?)
-   Deploy of some sensitive information into AWS Secrets Manager
-   API Gateway endpoint caching (with cache purge on updates)
-   Events for local dev (can use local SAM events + invoke)
-   Document API in an OpenAPI file (Swagger)
-   First time initialization should be triggered automatically over deployment automation (aws lambda invoke?) and not accessible through an API endpoint
