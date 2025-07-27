# sales-crm-system
Enterprise Sales &amp; Marketing CRM with multi-branch support, AI-powered lead allocation, real-time analytics, gamification, and WhatsApp integration. Built with Next.js, Node.js, PostgreSQL, TimescaleDB.
# Sales & Marketing Performance System

Enterprise-grade CRM with AI-powered lead allocation, real-time analytics, and multi-branch support.

## 🚀 Project Overview

**Client**: Dayaparan Fine Acers  
**Developer**: Yazdan Shaikh  
**Timeline**: 20-day sprint (Started: [Today's Date])  
**Stack**: Next.js 14, Node.js 20+, PostgreSQL 15, TimescaleDB, Redis, Docker

## 📋 Core Features

- **Lead Intelligence**: AI-powered scoring and allocation
- **Meeting Scheduler**: Smart calendar with traffic consideration  
- **Sales Pipeline**: Multi-stage deal tracking with SLA
- **Incentive Engine**: Dynamic calculations with gamification
- **WhatsApp Integration**: Business API with automation
- **Real-time Analytics**: Predictive insights and dashboards
- **Mobile PWA**: Offline-first with background sync

## 🏗️ Architecture
├── /frontend          # Next.js 14 App Router
├── /backend          # Node.js + Express/Fastify APIs
├── /database         # PostgreSQL + TimescaleDB schemas
├── /docker          # Docker compose configurations
├── /docs            # API documentation
└── /mobile          # PWA configurations

## 🔧 Development Setup

```bash
# Clone repository
git clone https://github.com/[your-username]/sales-crm-system.git

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run with Docker
docker-compose up -d

# Run migrations
npm run migrate

# Start development
npm run dev


📦 Phase Deliverables
Phase 1 (Days 1-5): Core MVP

 Infrastructure setup
 Google SSO authentication
 Lead management + allocation
 Real-time dashboard
 Basic attendance

Phase 2 (Days 6-10): Revenue Systems

 Meeting scheduler
 Sales pipeline
 Incentive calculator
 WhatsApp messaging
 Mobile PWA

Phase 3 (Days 11-15): Intelligence

 AI lead scoring
 Gamification
 Analytics dashboards
 Document management
 WhatsApp automation

Phase 4 (Days 16-20): Polish & Deploy

 OCR integration
 AI email generation
 Performance optimization
 Security hardening
 Production deployment

🔐 Security

Google SSO only (no passwords)
Row-level security for multi-branch
AES-256 encryption
Complete audit logging

📱 Contact
Developer: Yazdan Shaikh
WhatsApp: +92 307 3455614
GitHub: @YazdanShaikh



