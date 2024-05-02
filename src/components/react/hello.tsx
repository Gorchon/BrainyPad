import { useEffect, useState } from "react";

export function Hello() {
  const [state, setState] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setState((prev) => prev + 1);
    }, 1000);
  }, []);

  return <div className="bg-red-500">Hello From react: {state}</div>;
}
