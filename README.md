# NovaStore — Web Development Capstone

A responsive client-side e-commerce product catalog built with semantic HTML5, CSS Grid/Flexbox, and asynchronous JavaScript. Product data is fetched as JSON from the public Fake Store API.

## Features

- Live product catalog fetched from `https://fakestoreapi.com/products`
- Category filters, instant search, price range, and sorting
- Rating filter and product detail dialog
- Add to bag, remove items, change quantities, and subtotal calculation
- Cart and light/dark theme persist using `localStorage`
- Responsive layout, accessible labels, keyboard-friendly controls, and lazy-loaded product images
- Loading, empty, and API error states

> This is a front-end learning demo. Fake Store API does not provide real inventory or checkout. The in-stock filter is a placeholder and the checkout button does not process payments.

## Project structure

```text
web-dev-capstone/
├── index.html
├── style.css
├── app.js
└── README.md
```

## Run locally

1. Extract the ZIP.
2. Open this folder in VS Code.
3. Install the **Live Server** extension if needed.
4. Right-click `index.html` → **Open with Live Server**.
5. Keep an internet connection active so the browser can call the product API.

You can also use any static HTTP server. No API key or build step is required.

## Deploy to GitHub Pages

1. Create a public GitHub repository named `novastore-capstone`.
2. Upload the four project files to the repository root (not the ZIP file).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then click **Save**.
6. Wait for GitHub Pages to publish. Your URL will look like:
   `https://YOUR-USERNAME.github.io/novastore-capstone/`

Replace `YOUR-USERNAME` with your GitHub username. The actual URL appears in Settings → Pages after deployment.

## API

- Fake Store API: https://fakestoreapi.com/products
- API documentation: https://fakestoreapi.com/docs

The API is a public demo service. For a production store, use a maintained backend, validated product/inventory data, authentication, secure checkout, and a payment provider.

## Concepts demonstrated

- Semantic HTML and accessible UI
- CSS variables, Grid, Flexbox, responsive media queries
- `fetch`, `async/await`, JSON, and `try/catch`
- DOM creation, event listeners, and event-driven rendering
- `filter`, `sort`, `map`, and `reduce`
- `localStorage` persistence
- UI state management and reusable render functions
