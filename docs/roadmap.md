# Unordered list of features in the roadmap

-   Data changing events should be all published to the event-bus (writes and deleted).

-   Replay of events (or latest events) on new version deploy + archive of latest events (or all events?)
-   Deploy of some sensitive information into AWS Secrets Manager
-   List all users API endpoint pagination
-   Support for other event-bus services (Kinesis, Kafka, nats-streaming)
-   Support for other authorization services (Auth0)
-   API Gateway endpoint caching (with cache purge on updates)
-   Events for local dev (can use local SAM events + invoke)
-   Document API in an OpenAPI file (Swagger)
-   User id should be unique (validate)
