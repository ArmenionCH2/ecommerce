"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signUpH(formData: FormData){

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

    

    const {error} = await supabase.auth.signUp({email, password});

    if(error){
        redirect(`/auth?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/");
}