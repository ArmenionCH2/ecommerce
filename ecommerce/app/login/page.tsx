import { signInH } from "./signInAction";
import Link from "next/link";
import Input from "../components/input";
import Button from "../components/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-white">
      <div className="rounded-3xl bg-green-900/80 p-8 shadow-xl shadow-black/20 w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-4">Sign In</h1>
        <form action={signInH} className="flex flex-col gap-4">
          <Input name="email" type="email" placeholder="Email" />
          <Input name="password" type="password" placeholder="Password" />
          <Button type="submit" text="Sign In" />
        </form>
        <p className="mt-4 text-sm text-gray-200">
          Need an account? <Link href="/auth" className="text-green-300 underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
