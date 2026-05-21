import Button from "./components/button";
import Input from "./components/input";

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-green-700 gap-2">
      <h1>Home</h1>
      <Input name="test" type="text" placeholder="Enter..."></Input>
      <Button text="Click in Here"></Button>
    </div>
  );
}
