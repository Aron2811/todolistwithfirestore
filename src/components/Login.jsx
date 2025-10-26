

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import googleLogin from  '../assets/Google.jpg'
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Login = () => {
  
  
  
   const [isLoginMode, setisLoginMode] = useState(true);
   const navigate = useNavigate();
   
   
   const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/todo"); 
  };

  const signInWithGoogle = async () => {
  try {
    // Sign in with Google
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save user in Firestore
    await setDoc(
      doc(db, "Users", user.uid), // collection "Users", doc ID = uid
      {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(), // use Firestore server timestamp
      },
      { merge: true }
    );

    console.log("✅ User saved in Firestore:", user.displayName);
    navigate("/todo");
  } catch (error) {
    console.error("❌ Google Sign-in Error:", error.code, error.message);
  }
};


   return (
    <div className='w-[430px] bg-white p-8 rounded-2xl shadow-lg'>
      <h2 className="text-center text-red-600 font-bold">ONLY FOR PC <br /> Not responsive on Mobile, I made this only for PC not for mobile<br /> ONLY GOOGLE LOGIN WORKS FOR NOW CLICK THE GOOGLE ICON TO SIGN IN. DO NOT GO TO SIGN UP </h2>
      {/* Header title */}
      <div className='flex justify-center mb-4'>
        <h2 className='text-3xl font-semibold text-center'>{isLoginMode ? "Login" : "Sign up"}</h2>
      </div>

    {/* Tab Controls */}
    <div className='relative flex h-12 mb-6 border border-gray-300 rounded-full overflow-hidden'>
        <button onClick={() => setisLoginMode(true)} className={`w-1/2 text-lg font-medium transition-all z-10 ${isLoginMode ? "text-white" : "text-black"}`}>
            Login
            </button>
        
        <button onClick={() => setisLoginMode(false)} className={`w-1/2 text-lg font-medium transition-all z-10 ${!isLoginMode ? "text-white" : "text-black"}`}>
            Sign up
            </button>
        <div className={`absolute top-0 h-full w-1/2 rounded-full bg-gradient-to-r from-blue-700 via-cyan-600 to-cyan-300 ${isLoginMode ? "left-0" : "left-1/2"}`}>
        </div>
    
    </div>

    {/* Form Section */}
        
        <form className='space-y-4' onSubmit={handleSubmit}>
            {!isLoginMode && (
                <input type='text' placeholder='Name' required className='w-full p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400'></input>
            )}

            {/* Shared input field */}
            <input type="email" placeholder='Email' required className='w-full p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400' />
            <input type="password" placeholder='Password' required className='w-full p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400' />

            {/* Signup field */}
            {!isLoginMode && (
                <input type='password' placeholder='Confirm Password' required className='w-full p-3 border-b-2 border-gray-300 outline-none focus:border-cyan-500 placeholder-gray-400'></input>
            )}

            {/* Forget password for login */}

            {isLoginMode && (
                <div className='text-right'><p className='text-cyan-600 hover:underline'>Forget password</p></div>
            )}

            {/* Shared button */}
            <button className='w-full p-3 bg-gradient-to-r from-blue-700 via-cyan-600 to-cyan-300 text-white rounded-full text-lg font-medium hover:opacity-90 transition '>
                {isLoginMode ? "Login" : "SignUp"}
            </button>

            {/* Switch Link */}
            <p className='text-center text-gray-600'>{isLoginMode ? "Don't have an account" : "Already have an account"} <a className='text-cyan-600 hover:underline' href="#" onClick={(e) => setisLoginMode(false)}>{isLoginMode ? "Sigup now" : "Login"}</a></p>
        </form>

        <div className="text-center">
            <p>Or Login with Google</p>
            <img onClick={signInWithGoogle} src={googleLogin} alt="Google logo" className="w-10 h-10 mx-auto hover:cursor-pointer" />
        </div>
    </div>
    
  )
  
}

export default Login
