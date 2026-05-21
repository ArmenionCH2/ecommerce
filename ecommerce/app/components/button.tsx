interface buttonProps{
        text?: string;
        type?: "submit" | "button" | "reset";
        onClick?: ()=> void;
    }

export default function Button({text, type, onClick}: buttonProps){

    return(

        <button
        className="rounded-3xl border-2 bg-green-700 p-2 w-50"
        type={type}
        onClick={onClick}
        >
        {text}
        </button>
    );
}