import { useNavigate } from "react-router";
export default function ButtonReturnToLogin() {

    const navigate = useNavigate(); 

  function handleClick() {
    navigate("/login"); 
  }

  return (
    <button className="w-44 h-12 bg-black rounded-2xl"onClick={handleClick}>
      <p className="text-white
text-2xl
font-bold
font-['Inter']" >Login</p>
    </button>

  );
}