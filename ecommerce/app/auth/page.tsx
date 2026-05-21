import { signUpH } from "./signUpAction";
import Input from "../components/input";
import Button from "../components/button";
import FlashMessage from "@/app/components/FlashMessage";

export default function signUpPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const errorMessage = searchParams?.error ? String(searchParams.error) : null;
  const successMessage = searchParams?.success ? String(searchParams.success) : null;

    return (
        <div className="h-full w-full flex flex-col">
            <form action={signUpH} className="flex flex-col gap-2 items-center">
              <FlashMessage type="error" message={errorMessage} />
              <FlashMessage type="success" message={successMessage} />

                <h1>Register Account</h1>
                <Input name="email" type="text" placeholder="Email..."></Input>
                <Input name="password" type="password" placeholder="Password..."></Input>
                <Button type="submit" text="Send"></Button>
            </form>
        </div>
    );
}