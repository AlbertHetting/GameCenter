import { useNavigate } from "react-router";
export default function ButtonReturnToSignup() {

    const navigate = useNavigate(); // initialize navigation hook

  function handleClick() {
    navigate("/profile"); // navigate to /profile
  }

  return (
    <button className="w-44 h-12 bg-white rounded-2xl" onClick={handleClick}>
      <p className="text-black
    text-2xl
    font-bold
    font-['Inter']" >Sign Up</p>
    </button>

  );
}
