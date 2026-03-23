# Lipi Shiksha (लिपि शिक्षा)

Lipi Shiksha is a Next.js application designed to streamline the collection of handwritten character data across multiple languages. It bridges the gap between traditional handwriting practice and modern computer vision datasets.

The application allows educators or data collectors to generate structured A4 handwriting practice sheets based on uploaded fonts (representing specific languages). Once these sheets are filled out by individuals and scanned, Lipi Shiksha uses deterministic image processing (via QR codes) to automatically extract, label, and map the handwritten characters to their expected values.

This collected data can subsequently be used to train high-quality OCR (Optical Character Recognition) models, CNNs, and other neural networks for diverse and complex scripts.

## Features

*   **Font Management:** Upload OpenType (.otf) or TrueType (.ttf) fonts and manually define the exact practice character sets, ensuring support for complex languages and ligatures (like Devanagari).
*   **Practice Sheet Generator:** Automatically generate paginated A4 practice sheets with a fixed-size grid. Each grid cell provides a 14pt reference character and a dotted writing area.
*   **QR Code Metadata:** Every generated page includes a unique QR code in the header containing a JSON payload (Template ID, Page Number, Grid Dimensions, and Character Mapping) for deterministic data extraction.
*   **Deterministic CV Extraction:** Upload scanned, filled-out practice sheets. The system uses `jsQR` to read the QR code, instantly knowing the exact layout and mapping of the page without relying on slow or inaccurate GenAI guessing.

## Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, shadcn/ui (Radix UI)
*   **Database:** SQLite (local `data/lipi_shiksha.db`)
*   **Form Handling:** React Hook Form, Zod
*   **State Management:** React Query (`@tanstack/react-query`)
*   **Computer Vision / Utilities:** `jsqr`, `opentype.js`, `next-qrcode`

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/adds08/lipishiksha.git
    cd lipishiksha
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Initialize the SQLite database:
    This will create the necessary tables (`FontConfiguration`, `PracticeTemplate`, `PracticePage`) in the `data/` directory.
    ```bash
    npm run db:init
    ```

4.  Start the development server:
    ```bash
    npm run dev &
    ```

5.  Open [http://localhost:3000](http://localhost:3000) (or the port specified in your console, e.g., 9002) in your browser to see the result.

## Usage Workflow

1.  **Admin Setup (`/admin`):**
    *   Navigate to the Font Management area.
    *   Upload a `.ttf` or `.otf` font file.
    *   Assign a language name or code.
    *   In the "Practice Characters Set" textarea, paste or type the exact string of characters (without spaces) that you want generated on the practice sheets.
    *   Save the configuration.

2.  **Generate Sheets (`/generator`):**
    *   Select the language/font you just configured.
    *   The system will preview paginated A4 sheets.
    *   Click "Print Practice Sheet" and save as a PDF or print directly. Ensure your printer settings are set to A4 with default margins.

3.  **Data Collection & Extraction (`/labeling`):**
    *   Distribute the printed sheets to individuals to write on.
    *   Scan the completed sheets (ensure the QR code in the top right is clear and visible).
    *   Upload the scanned image to the Labeling interface.
    *   The system will automatically read the QR code, retrieve the grid mapping from the database, and deterministically label the image segments.

## Project Structure Highlights

*   `src/app/`: Next.js App Router pages and layouts.
*   `src/components/`: Reusable UI components (shadcn) and feature-specific components (e.g., `practice-sheet-preview.tsx`).
*   `src/lib/`: Core utilities, including database connections (`db.ts`, `init-db.ts`) and font processing (`font-data-service.ts`).
*   `data/`: Default location for the SQLite database file (`lipi_shiksha.db`).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
