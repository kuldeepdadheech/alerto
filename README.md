## Project Overview

Alerto is a real-time alerting and analytics platform that provides SDKs and APIs for seamless integration with both backend and frontend applications. Its primary goal is to minimize customer dissatisfaction by reducing application downtime and accelerating root cause analysis.

By processing logs and metrics in real time, Alerto detects anomalies early and triggers actionable alerts, helping engineering teams cut through noisy logs and focus on meaningful signals. This enables developers and SRE teams to respond faster to production issues and make informed decisions with confidence.

## System Architecture

Alerto follows an event-driven, asynchronous architecture designed for high throughput, low latency, and fault isolation.

- Client applications integrate with the platform using SDKs or APIs to send logs and metrics asynchronously.
- The Ingestion Service acts as a stateless entry point, validating incoming data and persisting raw logs before publishing events to Kafka for buffering and durability.
- Kafka decouples ingestion from downstream processing, allowing the system to handle traffic spikes without data loss.
- The Processing Service consumes events from Kafka, performs aggregations and time-window-based analysis, and publishes alert events when conditions are met.
- The Alerting Service evaluates these events against stored alert rules, persists alert history, and triggers notifications through a dedicated Notification Service.
- Notifications are delivered to external channels such as Slack, Email, or SMS to ensure timely awareness of production issues.
## Design Decisions

### Why an asynchronous, Kafka-based pipeline?

Kafka enables an event-driven architecture where logs and metrics are published as events and processed independently by downstream consumers. This allows ingestion to remain fast and non-blocking while Kafka buffers data during traffic spikes or downstream slowdowns.

By decoupling ingestion, processing, and alerting, the system becomes more resilient, scalable, and fault-tolerant, ensuring that alerts are not missed even under high load.

----
### Why separate ingestion, processing, and alerting into independent services?

Separating ingestion, processing, and alerting helps avoid system-wide bottlenecks and improves fault isolation. Each service can scale and fail independently without impacting the entire platform.

For example, even if the ingestion service is temporarily unavailable, teams should still be able to view historical alerts and receive notifications for already-processed events. This separation ensures higher availability, better scalability, and clearer ownership of responsibilities.

---

### Why store alert rules in a database instead of configuration files?

Storing alert rules in a database allows rules to be updated dynamically without redeploying or restarting services. This enables faster iteration, safer changes, and better operational flexibility.

It also allows rule versioning and auditing, which are important for production systems handling critical alerts.

---

### Why use in-memory storage for real-time aggregation?

In-memory storage is used for hot, short-lived data such as sliding windows and counters to enable low-latency alert evaluation. This allows the system to evaluate alerts in near real time without expensive disk reads.

Durable storage is used alongside in-memory processing to retain historical data and ensure correctness in case of failures.

## Alerting Workflow

1. A backend service emits an error log, which is sent to the platform via SDKs or HTTP APIs.
2. The Ingestion Service validates the incoming data, persists raw logs, and publishes events to Kafka for asynchronous processing.
3. The Processing Service consumes events from Kafka, aggregates logs and metrics over defined time windows, and detects potential alert conditions.
4. When an alert condition is met, the Processing Service publishes an alert event to Kafka.
5. The Alerting Service evaluates the alert event against configured alert rules, stores alert history, and triggers the Notification Service.
6. The Notification Service delivers alerts to configured channels such as Slack, Email, or SMS, notifying the relevant teams in near real time.
## Scope & Limitations

### Scope

Alerto is a real-time alerting platform designed to help engineering teams detect issues early and reduce production downtime.

The system focuses on:

- Ingesting **application logs and basic metrics** via SDKs or HTTP APIs
    
- Providing **near real-time alerts** using time-window based rules
    
- Processing events using an **event-driven architecture (Kafka)** for buffering and decoupling
    
- Generating alerts based on configurable thresholds (e.g. error count within a time window)
    
- Persisting **alert history** for visibility and post-incident analysis
    
- Sending notifications through **Slack, Email, or Webhooks**
    
- Ensuring **partial availability**, so core features like alert history remain accessible even if ingestion is temporarily unavailable
    

---

### Limitations

The current version of Alerto intentionally limits scope to remain lightweight and focused. The following features are **out of scope**:

- Advanced log search and querying capabilities
    
- Distributed tracing or request-level correlation
    
- Machine learning or anomaly-based alerting
    
- Automatic root cause analysis
    
- Auto-instrumentation of applications without SDKs
    
- UI dashboards for metrics or log visualization
    

---

### Design Constraints

- Alert evaluation is **rule-based** to ensure predictability and low latency
    
- Kafka is used to handle **buffering, ordering, and durability**, avoiding ingestion backpressure
    
- Raw logs and processed data are stored separately to optimize for **high write throughput**
    
- The platform is API-first and optimized for **backend system observability**, not frontend analytics
    

---

### Future Enhancements

Potential future improvements include:

- ML-based anomaly detection
    
- Alert deduplication and suppression
    
- Metrics and alert visualization dashboards
    
- Distributed tracing support
    
- Role-based access control (RBAC) and multi-tenancy

### Repositories Overview

alert-time/
├── README.md                # System overview & architecture
├── docs/                    # HLD, LLD, diagrams
├── docker-compose.yml       # Local development setup
├── scripts/                 # Utility & setup scripts
└── services/
    ├── ingestion-service/
    ├── processing-service/
    ├── alerting-service/
    ├── notification-service/
    └── auth-gateway/         # Optional (future)

## Services Breakdown

---

### 1️⃣ Ingestion Service

**Responsibility**

- Acts as the entry point for logs and metrics
    
- Exposes HTTP APIs and SDK endpoints
    
- Performs validation, normalization, and enrichment
    
- Stores raw logs for debugging and audit purposes
    
- Publishes events to Kafka for downstream processing
    

**Key Characteristics**

- Write-heavy, low-latency service
    
- Stateless API with durable storage
    
- Designed to handle spikes in traffic
    

**Tech Stack**

- Node.js + Express
    
- Kafka Producer
    
- NoSQL database (raw logs)
    
- API Key–based authentication
    

---

### 2️⃣ Processing Service

**Responsibility**

- Consumes raw log and metric events from Kafka
    
- Aggregates events over time windows
    
- Evaluates alert conditions
    
- Publishes alert events when rules are triggered
    

**Key Characteristics**

- CPU-bound processing
    
- Time-window based aggregation
    
- Decoupled from ingestion to avoid backpressure
    

**Tech Stack**

- Node.js
    
- Kafka Consumer & Producer
    
- In-memory aggregation + durable storage
    
- SQL / Time-series DB for alert history
    

---

### 3️⃣ Alerting Service

**Responsibility**

- Consumes alert events
    
- Applies alert rules and deduplication
    
- Maintains alert lifecycle (triggered, resolved)
    
- Stores alert history
    

**Key Characteristics**

- Strong consistency for alert state
    
- Low-latency decision-making
    

**Tech Stack**

- Node.js
    
- Kafka Consumer
    
- SQL / Time-series database
    

---

### 4️⃣ Notification Service

**Responsibility**

- Sends alerts to external systems
    
- Handles retries and failures
    
- Supports multiple notification channels
    

**Supported Channels**

- Slack
    
- Email
    
- Webhooks (future SMS support)
    

**Tech Stack**

- Node.js
    
- Message Queue / Kafka
    
- External provider integrations
    

---

### 5️⃣ API Gateway / Auth Service (Future)

**Responsibility**

- Centralized authentication & rate limiting
    
- API key and role-based access control
    
- Traffic routing to internal services
    

---

## 🔄 Communication Pattern

- Services communicate **asynchronously via Kafka**
    
- No direct synchronous dependency between core services
    
- Ensures resilience, scalability, and fault isolation
    

---

## 🧪 Local Development Strategy

- `docker-compose` used to spin up:
    
    - Kafka
        
    - Databases
        
    - All services
        
- Each service can also be run independently for development


