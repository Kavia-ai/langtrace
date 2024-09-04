# [Langtrace](https://www.langtrace.ai)

Open Source Observability for LLM applications

## Open Source & Open Telemetry(OTEL) Observability for LLM applications

![Static Badge](https://img.shields.io/badge/License-AGPL--3.0-blue)
[![NPM Typescript SDK](https://img.shields.io/npm/v/%40langtrase%2Ftypescript-sdk?style=flat&logo=npm&label=%40langtrase%2Ftypescript-sdk&color=green&link=https%3A%2F%2Fgithub.com%2FScale3-Labs%2Flangtrace-typescript-sdk)](https://github.com/Scale3-Labs/langtrace-typescript-sdk)
[![PyPI Python SDK](https://img.shields.io/pypi/v/langtrace-python-sdk?style=flat&logo=python&label=langtrace-python-sdk&color=green&link=https%3A%2F%2Fgithub.com%2FScale3-Labs%2Flangtrace-python-sdk)](https://github.com/Scale3-Labs/langtrace-python-sdk)
[![Downloads](https://static.pepy.tech/badge/langtrace-python-sdk/month)](https://pepy.tech/project/langtrace-python-sdk)
[![NPM Trace Attributes](https://img.shields.io/npm/v/%40langtrase%2Ftrace-attributes?style=flat&logo=npm&label=%40langtrase%2Ftrace-attributes&color=green&link=https%3A%2F%2Fgithub.com%2FScale3-Labs%2Flangtrace-trace-attributes)](https://github.com/Scale3-Labs/langtrace-trace-attributes)
[![PyPI Trace Attributes](https://img.shields.io/pypi/v/trace-attributes?style=flat&logo=python&label=trace-attributes&color=green&link=https%3A%2F%2Fgithub.com%2FScale3-Labs%2Flangtrace-trace-attributes)](https://github.com/Scale3-Labs/langtrace-trace-attributes)
![Static Badge](https://img.shields.io/badge/Development_status-Active-green)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/8dNq1c?referralCode=MA2S9H)

---

Langtrace is an open source observability software which lets you capture, debug and analyze traces and metrics from all your applications that leverages LLM APIs, Vector Databases and LLM based Frameworks.

![image](https://github.com/Scale3-Labs/langtrace/assets/105607645/6825158c-39bb-4270-b1f9-446c36c066ee)

## Open Telemetry Support

The traces generated by Langtrace adhere to [Open Telemetry Standards(OTEL)](https://opentelemetry.io/docs/concepts/signals/traces/). We are developing [semantic conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/) for the traces generated by this project. You can checkout the current definitions in [this repository](https://github.com/Scale3-Labs/langtrace-trace-attributes/tree/main/schemas). Note: This is an ongoing development and we encourage you to get involved and welcome your feedback.

---

## SDK Repositories

- [Langtrace Typescript SDK](https://github.com/Scale3-Labs/langtrace-typescript-sdk)
- [Langtrace Python SDK](https://github.com/Scale3-Labs/langtrace-python-sdk)
- [Semantic Span Attributes](https://github.com/Scale3-Labs/langtrace-trace-attributes)

---

## Getting Started

### Langtrace Cloud ☁️

To use the managed SaaS version of Langtrace, follow the steps below:

1. Sign up by going to [this link](https://langtrace.ai).
2. Create a new Project after signing up. Projects are containers for storing traces and metrics generated by your application. If you have only one application, creating 1 project will do.
3. Generate an API key by going inside the project.
4. In your application, install the Langtrace SDK and initialize it with the API key you generated in the step 3.
5. The code for installing and setting up the SDK is shown below:

### If your application is built using typescript/javascript

```typescript
npm i @langtrase/typescript-sdk
```

```typescript
import * as Langtrace from '@langtrase/typescript-sdk' // Must precede any llm module imports
Langtrace.init({ api_key: <your_api_key> })
```

OR

```typescript
import * as Langtrace from '@langtrase/typescript-sdk'; // Must precede any llm module imports
LangTrace.init(); // LANGTRACE_API_KEY as an ENVIRONMENT variable
```

### If your application is built using python

```python
pip install langtrace-python-sdk
```

```python
from langtrace_python_sdk import langtrace
langtrace.init(api_key=<your_api_key>)
```

OR

```python
from langtrace_python_sdk import langtrace
langtrace.init() # LANGTRACE_API_KEY as an ENVIRONMENT variable
```

### Langtrace self hosted

To run the Langtrace locally, you have to run three services:

- Next.js app
- Postgres database
- Clickhouse database

> [!IMPORTANT]
> Checkout our [documentation](https://docs.langtrace.ai/hosting/overview) for various deployment options and configurations.

Requirements:

- Docker
- Docker Compose

#### The .env file

Feel free to modify the `.env` file to suit your needs.

#### Starting the servers

```bash
docker compose up
```

The application will be available at `http://localhost:3000`.

#### Take down the setup

To delete containers and volumes

```bash
docker compose down -v
```

`-v` flag is used to delete volumes

---

## Supported integrations

Langtrace automatically captures traces from the following vendors:

| Vendor       | Type            | Typescript SDK     | Python SDK                      |
| ------------ | --------------- | ------------------ | ------------------------------- |
| OpenAI       | LLM             | :white_check_mark: | :white_check_mark:              |
| Anthropic    | LLM             | :white_check_mark: | :white_check_mark:              |
| Azure OpenAI | LLM             | :white_check_mark: | :white_check_mark:              |
| Cohere       | LLM             | :white_check_mark: | :white_check_mark:              |
| Groq         | LLM             | :white_check_mark: | :white_check_mark:              |
| Perplexity   | LLM             | :white_check_mark: | :white_check_mark:              |
| Gemini       | LLM             | :white_check_mark: | :white_check_mark:              |
| Mistral      | LLM             | :x:                | :white_check_mark:              |
| Langchain    | Framework       | :x:                | :white_check_mark:              |
| LlamaIndex   | Framework       | :white_check_mark: | :white_check_mark:              |
| Langgraph    | Framework       | :x:                | :white_check_mark:              |
| DSPy         | Framework       | :x:                | :white_check_mark:              |
| CrewAI       | Framework       | :x:                | :white_check_mark:              |
| Ollama       | Framework       | :x:                | :white_check_mark:              |
| VertexAI     | Framework       | :white_check_mark: | :white_check_mark:              |
| Vercel AI    | Framework       | :white_check_mark: | :x:                             |
| Pinecone     | Vector Database | :white_check_mark: | :white_check_mark:              |
| ChromaDB     | Vector Database | :white_check_mark: | :white_check_mark:              |
| QDrant       | Vector Database | :white_check_mark: | :white_check_mark:              |
| Weaviate     | Vector Database | :white_check_mark: | :white_check_mark:              |
| PGVector     | Vector Database | :white_check_mark: | :white_check_mark: (SQLAlchemy) |

---

## Langtrace System Architecture

![image](https://github.com/Scale3-Labs/langtrace/assets/105607645/eae180dd-ebf7-4792-b076-23f75d3734a8)

---

## Feature Requests and Issues

- To request for features, head over [here to start a discussion](https://github.com/Scale3-Labs/langtrace/discussions/categories/feature-requests).
- To raise an issue, head over [here and create an issue](https://github.com/Scale3-Labs/langtrace/issues).

---

## Contributions

We welcome contributions to this project. To get started, fork this repository and start developing. To get involved, join our Slack workspace.

---

## Langtrace Star History

## [![Langtrace Star History Chart](https://api.star-history.com/svg?repos=Scale3-Labs/langtrace&type=Timeline)](https://star-history.com/#Scale3-Labs/langtrace&Timeline)

---

## Security

To report security vulnerabilites, email us at <security@scale3labs.com>. You can read more on security [here](https://github.com/Scale3-Labs/langtrace/blob/development/SECURITY.md).

---

## License

- Langtrace application(this repository) is [licensed](https://github.com/Scale3-Labs/langtrace/blob/development/LICENSE) under the AGPL 3.0 License. You can read about this license [here](https://www.gnu.org/licenses/agpl-3.0.en.html).
- Langtrace SDKs are licensed under the Apache 2.0 License. You can read about this license [here](https://www.apache.org/licenses/LICENSE-2.0).

---

## Frequently Asked Questions

**1. Can I self host and run Langtrace in my own cloud?**
Yes, you can absolutely do that. Follow the self hosting setup instructions in our [documentation](https://docs.langtrace.ai/hosting/overview).

**2. What is the pricing for Langtrace cloud?**
Currently, we are not charging anything for Langtrace cloud and we are primarily looking for feedback so we can continue to improve the project. We will inform our users when we decide to monetize it.

**3. What is the tech stack of Langtrace?**
Langtrace uses NextJS for the frontend and APIs. It uses PostgresDB as a metadata store and Clickhouse DB for storing spans, metrics, logs and traces.

**4. Can I contribute to this project?**
Absolutely! We love developers and welcome contributions. Get involved early by joining our [Discord Community](https://discord.langtrace.ai/).

**5. What skillset is required to contribute to this project?**
Programming Languages: Typescript and Python.
Framework knowledge: NextJS.
Database: Postgres and Prisma ORM.
Nice to haves: Opentelemetry instrumentation framework, experience with distributed tracing.
