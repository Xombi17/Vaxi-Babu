## 2025-02-21 - [Prevent Error Details Leakage]
**Vulnerability:** The global exception handler was returning raw exception details `str(exc)` in the JSON response under the `error` key even in production.
**Learning:** Returning raw exception messages to the client can leak sensitive system information such as directory paths, database queries, or third-party service details.
**Prevention:** Make sure exception messages sent to clients are sanitized in production environments, using a generic error message unless running in development.
