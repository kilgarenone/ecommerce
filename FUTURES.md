# Roadmap

1. Instead of `EventEmitter` for handling events, explore PostgreSQL's `listen`/`notify`. If not feasible, explore Redis. If not feasible, Kafka..
2. Instead of file storage, explore PostgreSQL.
3. Enable tracing in the logs for debugging and end-to-end visibility of a order's journey chronologically. Explore Node.js's [async context tracking](https://nodejs.org/api/async_context.html) for this before 3rd-party solutions.
4. Explore Redis for locking inventory mechanism.
5. Simulate concurrent order placements on a particular product, and handle error gracefully for everyone.
6. Create more integration tests that mimic user journeys. De-emphasize unit tests that are decontextualized.
7. Make the JSDoc comments more thorough to generate a living API documentation hosted on a website.
8. Create a error recovery system. What if an event was dropped? How do we recover it and resume the order placement? I read Kafka offers this out-of-box, but tbh, I got no professional experience in this area.
9. Create alert system and monitoring dashboard.
