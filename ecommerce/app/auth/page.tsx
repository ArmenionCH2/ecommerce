import { signUpH } from "./signUpAction";
import Input from "../components/input";
import Button from "../components/button";

export default function signUpPage() {

    return (
        <div className="h-full w-full flex flex-col">
            <form action={signUpH} className="flex flex-col gap-2 items-center">

                <h1>Register Account</h1>
                <Input name="email" type="text" placeholder="Email..."></Input>
                <Input name="password" type="password" placeholder="Password..."></Input>
                <Button type="submit" text="Send"></Button>
            </form>
        </div>
    );
}