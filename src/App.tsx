import Cursor from "./cursor";
import { ThreeCanvas } from "./torus-ascii";

const App = () => {
  return (
    <main className="cursor-none">
      <Cursor />
      <section className="bg-black h-svh">
        <ThreeCanvas />
      </section>
    </main>
  );
};

export default App;
