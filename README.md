# Soul Food

**Soul Food** is a fair delivery platform designed for Toronto. It connects restaurants directly with customers, eliminating the 30% commission fees charged by major delivery apps.

## Features

-   **Zero Commissions**: Restaurants keep 100% of their revenue.
-   **Direct Ordering**: Customers order directly from their favorite local spots.
-   **Fair Pay**: Delivery fees go 100% to the drivers.
-   **Modern UI**: A clean, responsive interface built with React and Tailwind CSS.

## Tech Stack

-   **Frontend**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React

## Getting Started

### Prerequisites

-   Node.js (v18 or v20 LTS recommended)
-   npm

### Installation

1.  Clone the repository (or navigate to the directory).
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Troubleshooting

### "binding-DkT" Error (Windows)

If you encounter an error related to `esbuild` or `binding-DkT` when running `npm run dev`:

1.  **Update Node.js**: Ensure you are using a stable LTS version of Node.js (e.g., v20.x).
2.  **Rebuild esbuild**:
    ```bash
    npm rebuild esbuild
    ```
3.  **Reinstall dependencies**:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```
