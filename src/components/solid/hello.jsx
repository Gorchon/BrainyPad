import { createSignal } from "solid-js";

export function Hello() {
  const [count, setCount] = createSignal(0);

  setInterval(() => setCount((prev) => prev + 1), 1000);

  return (
    <div className="bg-blue-600">
      <p>Hello from solid: {count()}</p>
    </div>
  );
}
