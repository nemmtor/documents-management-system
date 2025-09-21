# Document Management System
A comprehensive implementation of modern software architecture patterns showcasing enterprise-grade design and development practices.

## 🎯 What It Does
A document management system for legal contract attachments with sophisticated business rules:

1. Documents can only be updated if they're less than 1 year old
2. Contracts require all attachments to be viewed by customers before signing
3. Updating document content marks it as "unseen" across all related contracts

## 🏗️ Architecture Approach
This project demonstrates real-world application of enterprise patterns:

*Domain-Driven Design* - Rich domain models with business logic properly encapsulated

*CQRS* - Clean separation of command and query responsibilities

*Event-Driven Architecture* - Loose coupling through asynchronous messaging via RabbitMQ

*Modular Monolith* - Production-ready structure with microservices extraction capability

*London School Testing* - Comprehensive test coverage with strategic mocking

## ▶️ Running on local
```bash
pnpm install
docker compose up -d
pnpm start
```
