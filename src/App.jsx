
import './App.css'
import Login from './components/Login'
import Todo from './components/Todo'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {db} from './config/firebase'
import { useEffect, useState } from 'react';
import {collection, getDocs} from 'firebase/firestore';


function App() {
  
const [users, setUsers] = useState([]);

const usersCollectionRef = collection(db, "Users");






  return (
    <div className='grid w-[100%] h-screen place-items-center bg-blue-100'>
    {/*Mount*/}
      <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/todo" element={<Todo />} />
       
      </Routes>
    </Router>
    </div>
  )
}

export default App
 