# Introduction

This is a proof-of-concept for an e-commerce platform driven by events: Inventory module listens for a specific event that every order placement publishes. This starts a chain of events from updating(and locking) inventory stocks to the completion of the order.

To make it easy to play with this demo, I have made this into an Express.js app with 3 endpoints:

1. `/api/products`– Add products to the inventory.
2. `/api/products/:sku/quantity`– Update the quantity of a product in the inventory.
3. `/api/orders`– Place an order.

`curl` commands for each endpoint are provided below to run in terminal.

I also implemented basic input validation for the endpoints using the [Zod](https://zod.dev) library.

# Project structure

```
└── 📁src
    └── 📁core
        └── event-bus.ts
        └── file-storage.ts
        └── logger.ts
    └── 📁errors
        └── bad-request.ts
    └── 📁middlewares
        └── custom-error-handler.ts
        └── validate-request-data.ts
    └── 📁modules
        └── 📁inventory
            └── inventory.controller.ts
            └── inventory.listener.ts
            └── inventory.route.ts
            └── inventory.schema.ts
            └── inventory.service.ts
            └── inventory.types.ts
        └── 📁order
            └── order.controller.ts
            └── order.listener.ts
            └── order.route.ts
            └── order.schema.ts
            └── order.service.ts
            └── order.types.ts
    └── 📁utils
        └── normalize-error.ts
    └── events.ts
    └── index.ts
└── 📁tests
    └── 📁integration
        └── 📁order
            └── place-order.test.ts
```

# Getting started

1. Install Node.js `v22`
2. Run `npm install`
3. Copy `.env.example` to a new file called `.env`
4. Run `npm start`.

The server will start at `http://localhost:3000`

# Features

Run the `curl` commands below and verify their results in the `data` folder, as well as logs displayed in the terminal where the server is running.

## Add a product

First, let's add a product to the inventory. In a separate terminal, run the `curl` command below:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD123",
    "name": "Example Product",
    "description": "This is a sample product description",
    "price": 19.99,
    "quantity": 2
  }'
```

You can verify the result by checking the `inventory.json` file in the `data` folder.

## Update product quantity

Let's update the quantity of the product with the `curl` command below:

```bash
curl -X PATCH http://localhost:3000/api/products/PROD123/quantity \
  -H "Content-Type: application/json" \
  -d '{
    "change": -5
  }'
```

Again, verify the result in `data/inventory.json` file.

## Place an order

Now, let's place an order. Run the `curl` below:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust123",
    "items": [
      {
        "sku": "PROD123",
        "quantity": 2
      }
    ],
    "paymentMethod": "VISA",
    "paymentAmount": 99.99
  }'
```

Verify the result in the `data/orders.json` file.

# Testing

To run the integration test, run:

```bash
npm test
```

Verify in the `data/test` folder.

# Development

Start the local development server with auto-restart on file changes:

```bash
npm run dev
```

Server runs at http://localhost:3000.

# Build

To build the project:

```bash
npm run build
```

# Principles

- Always keep cognitive load low for everyone
- Always explore the platform APIs(Node.js or Web) for a task before introducing third-party dependencies.
- Minimal esoteric TypeScript syntax
- Folder structure as flat as possible
- Minimal and intentional configuration in toolings over copy-pasting from blog posts or ChatGPT.
- And know when to defer to academic authority as seen in the `tsconfig.json` config

# Disclosure of Generative AI usage

This might get me disqualified, but I want to be honest: I began by copy & paste the entire text of the take home test PDF file into Gemini 2.0 Pro (preview). Then I made heavy changes to it to what it is now guided by the principles, taste, opinion, and limited past experience and knowledge. GenAI also helped me with Typescript syntax. I do not use AI agent in IDE, such as Cursor. My use of GenAI was limited to asking piecemeal questions on their website.
