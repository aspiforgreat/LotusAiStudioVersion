# 🪷 Lotus Habit Visualizer

An elegant, highly interactive, and visually stunning habit tracking system. It models your habits as petals of an organic, glowing geometric lotus flower, using sacred geometry and concentric shell divisions to represent personal progress over customizable lifespans.

```
                  _ .----. _
               .-_'-''--''-'-.
             .' /   \    /   \ '.
            /  |     |  |     |  \
           |   |      \ /      |   |
          |    |   .-' . '-.   |    |
          |    |  /   / \   \  |    |
          |===|==|===|===|===|==|===|  <-- Interactive Horizon Arcs
          |    |  \   \ /   /  |    |
          |    |   '-. _ .-'   |    |
           |   |      / \      |   |
            \  |     |  |     |  /
             '. \   /    \   / .'
               '-_.-''--''-._-'
                  '--------'
```

---

## 🎨 Visual Identity & Concept

The **Lotus Habit Visualizer** transforms traditional habit tracking checklists into a living piece of generative art. Instead of cold, mechanical calendar grids, your daily devotion to positive behaviors directly blooms, expands, and alters the radiance of a central sacred geometric lotus.

- **The Lotus Petals**: Each key habit is mapped to one of the glowing radial petals of the flower.
- **The Living HUD Focus**: In the center of the lotus rests an interactive circle displays active stats when hovering over individual petals.

---

## 🕒 Longitudinal Radial Views

You can shift your cosmic perspective across three distinct visual resolutions:

### 1. 📅 Month View

- **Focus**: Day-to-day discipline.
- **Structure**: Individual dates are plotted as nested micro-segments along each active petal, rendering a granular overview of monthly persistence.

### 2. 🗓️ Year View

- **Focus**: Weekly patterns.
- **Structure**: Habit entries are compiled into 52 weekly segments per petal, tracking regular progression throughout the calendar year.

### 3. ⏳ Lifespan View (Concentric Month Rings)

- **Focus**: The grand tapestry of consistent habits across decades.
- **Structure**: Divides the active length of each petal into dynamic concentric month segments. If you track habits over a **20-year horizon**, each petal is sliced into **240 precise concentric rings** growing outward from the core of the flower.
- **Horizon Slider**: Scale your visual timeline anywhere from **2 years up to 50 years** (600 separate thin concentric month rings) with immediate real-time rendering.
- **Inner Circle Clearance**: Concentric rings start precisely outside the central HUD label container parameter (`innerRadius`), preventing layout overlaps.
- **Adaptive Leaf Coloring**: Petals are lit up with color strictly up to the *last logged month* of active entry. Any remainder of the petal fades into the background, providing a tangible sense of growth.

---

## ⚡ Tech Stack & Architecture

- **Runtime**: Node.js & Vite with a custom **Express Dev Server** (`server.ts`).
- **Framework**: **React 19** with fully static-typed **TypeScript** interfaces for safe development.
- **Animation Engine**: **Motion (React)** for rich physical elastic transitions, micro-interactions, hover animations, and scale/glow states.
- **Styling**: **Tailwind CSS** with native dark & light ambient configurations.

---

## 🛠️ Getting Started

To run the Lotus Habit Visualizer locally, follow these steps:

### 1. Install Dependencies

```bash
npm install
```

### 2. Launch the Development Server

```bash
npm run dev
```

The server will start up and run on [http://localhost:3000](http://localhost:3000).

### 3. Build & Produce Static Assets

```bash
npm run build
```

---

## 📐 Habit Radial Formula reference

Each petal is mathematically plotted as a cubic bezier curveload of coordinates, calculated dynamically using:
$$\text{Angle} = \left(\frac{i}{\text{Total Habits}}\right) \times 2\pi$$
The concentric circles are drawn using SVG `<circle>` and `<path>` components wrapped inside `<clipPath>` tags corresponding to the parent petal boundaries. This ensures that the circular rings seamlessly turn into natural curving arcs perfectly conforming to each individual habit's petal shape.
