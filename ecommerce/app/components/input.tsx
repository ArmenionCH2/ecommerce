interface inputProps{
    name: string;
    value?: string;
    placeholder?: string;
    type: "text" | "email" | "password" | "number";

}

export default function Input({name, value, placeholder, type}: inputProps){

    return(

        <input
        className="border-2 rounded-1xl border-gray-400"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}/>
    );
}