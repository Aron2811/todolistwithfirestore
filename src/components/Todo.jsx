import React, { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { BiCalendar, BiTimeFive, BiListUl, BiCheckbox, BiCheckSquare, BiAddToQueue, BiPlus } from "react-icons/bi"; 
import "react-calendar/dist/Calendar.css"; 
import Calendar from "react-calendar";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase"; 
import { deleteField } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Todo = () => {
    const [username, setUserName] =useState("");
    const [activeTab, setActiveTab] = useState("today");
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date());
    const [value, setValue] = useState(new Date());
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState("");
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [selectedTodoDraft, setSelectedTodoDraft] = useState(null);
    

    useEffect(() => {
  if (auth.currentUser) {
    setUserName(auth.currentUser.displayName || "User");
    cleanUserDoc();
  }
}, [auth.currentUser]);


    

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUserName(user.displayName || "User");
      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setTodos(data.todos || []);
      }
    }
  });

  return () => unsubscribe();
}, []);


const cleanUserDoc = async () => {
  if (!auth.currentUser) return;

  const userDocRef = doc(db, "Users", auth.currentUser.uid);
  await updateDoc(userDocRef, {
    uid: deleteField(), // ✅ THIS REMOVES THE FIELD
  });
};


    const addTodo = () => {
  if(input.trim()) {
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false,
      category: "Personal",
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setInput("");
    setSelectedTodo(newTodo);
    setSelectedTodoDraft({ ...newTodo });

    saveTodosToFirestore(updatedTodos); // <-- sync to firestore
  }
};

    const deleteTask = () => {
  if (!selectedTodo) return;

  // Make a new array WITHOUT the deleted todo
  const updatedList = todos.filter((t) => t.id !== selectedTodo.id);

  // Update React state
  setTodos(updatedList);

  //Save to Firestore
  saveTodosToFirestore(updatedList);
};
 // Save changes function
const saveTaskChanges = () => {
  if (!selectedTodoDraft) return;

  const updatedTodo = { ...selectedTodoDraft };

  // If user didn't pick a due date, remove it
  if (!updatedTodo.dueDate) delete updatedTodo.dueDate;

  // If user didn't pick a category, remove it
  if (!updatedTodo.category) delete updatedTodo.category;

  // Create updated list
  const updatedList = todos.map((t) =>
    t.id === updatedTodo.id ? updatedTodo : t
  );

  // ✅ Update state
  setTodos(updatedList);
  setSelectedTodo(updatedTodo);


+  saveTodosToFirestore(updatedList);
};

    const handleLogout = async() => {
        try {
            await signOut(auth);
            navigate("/");

        } catch (err) {
            console.error("Logout error");
        }
    }

  const saveTodosToFirestore = async (updatedTodos) => {
  if (!auth.currentUser) return;
  
  const userDoc = doc(db, "Users", auth.currentUser.uid); // ✅ EXACT collection name: "Users"

  try {
    const docSnap = await getDoc(userDoc);

    if (!docSnap.exists()) {
      // ✅ If user document doesn't exist, create it first
      await setDoc(userDoc, { todos: updatedTodos }, { merge: true });
    } else {
      // ✅ If it exists, update only the todos field
      await updateDoc(userDoc, { todos: updatedTodos });
    }
  } catch (error) {
    console.error("❌ Firestore update error:", error);
  }
};

const toggleTodoCompletion = (todoId) => {
  const updatedList = todos.map((t) =>
    t.id === todoId ? { ...t, completed: !t.completed } : t
  );
  setTodos(updatedList);
  saveTodosToFirestore(updatedList);
};

    const categoryColors = {
  Personal: "bg-red-200 text-white",
  Work: "bg-blue-200 text-white",
};

const categoryIcons = {
  Personal: <BiCheckbox className="inline-block mr-1" />,
  Work: <BiTimeFive className="inline-block mr-1" />,
};

//upcoming functions

const upcomingTodos = todos
  .filter((t) => t.dueDate && !t.completed) // ✅ Only those with due dates
  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // ✅ Soonest first

  

    const renderContent = () => {
      switch(activeTab) {
        case "today":
          return(
             <div className="h-[85vh] bg-gray-100 rounded-xl shadow-md p-4 sm:p-6 flex flex-col md:flex-row gap-4">
            {/* LEFT: Todo list */}
            <div className="flex-1">
              <div className="flex flex-row gap-2 mb-4">
                <button onClick={addTodo} className="mt-1 hover:cursor-pointer">
                  <BiPlus size={22} className="text-gray-500" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  type="text"
                  placeholder="Add new task"
                  className="flex-1 p-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <ul className="space-y-2">
  {todos.map((todo) => (
    <li
      key={todo.id}
      className={`flex flex-col p-3 rounded-lg bg-slate-100 border border-gray-200 cursor-pointer ${
        selectedTodo?.id === todo.id ? "bg-indigo-200" : ""
      }`}
      onClick={() => {
        setSelectedTodo(todo);
        setSelectedTodoDraft({ ...todo });
      }}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => {
            e.stopPropagation();
            toggleTodoCompletion(todo.id);
             
          }}
          className="mr-2 h-5 w-5 text-blue-200"
        />
        <span
          className={`flex-grow ${
            todo.completed ? "line-through text-gray-500" : "text-gray-800"
          }`}
        >
          {todo.text}
        </span>
      </div>

      {/* Show category & due date only if set */}
      {(todo.category || todo.dueDate) && (
        <div className="mt-1 flex flex-col gap-1 text-sm">
          {todo.category && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                categoryColors[todo.category] || ""
              }`}
            >
              {categoryIcons[todo.category] || null}
              <span className="ml-1">{todo.category}</span>
            </span>
          )}
          {todo.dueDate && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
              📅 {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : ""}
            </span>
          )}
        </div>
      )}
    </li>
  ))}
</ul>
            </div>

            {/* RIGHT: Task details */}
            <div className="w-full md:w-96 bg-gray-50 p-4 rounded-xl shadow-md">
              {selectedTodoDraft ? (
                <>
                  <h2 className="text-xl font-bold mb-4">{selectedTodoDraft.text}</h2>

                  {/* Category */}
                  <div className="mb-4">
                    <label className="font-semibold mb-1 block">Category:</label>
                    <select
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={selectedTodoDraft.category || ""}
                      onChange={(e) =>
                        setSelectedTodoDraft({
                          ...selectedTodoDraft,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                    </select>
                  </div>

                  {/* Due date */}
                  <div className="mb-4">
                    <label className="font-semibold mb-1 block">Due Date:</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={selectedTodoDraft.dueDate || ""}
                      onChange={(e) =>
                        setSelectedTodoDraft({
                          ...selectedTodoDraft,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={deleteTask}
                      className="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 hover:cursor-pointer"
                    >
                      Delete Task
                    </button>
                    <button
                      onClick={saveTaskChanges}
                      className="flex-1 bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors duration-200 hover:cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Choose a todo list to edit</p>
              )}
            </div>
          </div>
        );

        case "upcoming":
  return (
    <div className="min-h-screen bg-gray-100 rounded-xl shadow-md p-4 sm:p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Upcoming Deadlines <br /> Will display priority tag if the deadline is within 5 days</h2>

      {upcomingTodos.length === 0 ? (
        <p className="text-gray-500">No upcoming tasks with deadlines.</p>
      ) : (
        <ul className="space-y-3">
          {upcomingTodos.map((todo) => {
            const dueDate = new Date(todo.dueDate);
            const today = new Date();
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let statusLabel = "";
            let statusColor = "";

            if (diffDays < 0) {
              statusLabel = "Overdue";
              statusColor = "bg-red-700 text-white";
            } else if (diffDays === 0) {
              statusLabel = "Due Today!";
              statusColor = "bg-red-500 text-white";
            } else {
              statusLabel = `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
              statusColor = "bg-green-200 text-green-800";
            }

            return (
              <li
                key={todo.id}
                className="p-3 rounded-lg bg-white border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p
                    className={`font-semibold ${
                      todo.completed ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {todo.text}
                  </p>

                  <div className="text-sm text-gray-600 flex gap-3">
                    <span>📅 Due: {dueDate.toLocaleDateString()}</span>
                    {todo.category && <span>📌 Category: {todo.category}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Priority tag if within 5 days */}
                  {!todo.completed && diffDays <= 5 && diffDays >= 0 && (
                    <span className="px-3 py-1 bg-red-200 text-red-700 rounded-full text-xs font-bold">
                      Priority
                    </span>
                  )}

                  {/* Days left / today / overdue tag */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

        case "calendar":
          return(
             <div className="relative h-[85vh] bg-gray-100 rounded-xl shadow-md p-4 sm:p-6">

      {/* TODAY'S DATE — top-left corner */}
      <div className="absolute top-4 left-6">
        <h2 className="text-xl font-semibold">
          TODAY IS {" "}
          <span className="text-indigo-600 font-bold">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </h2>
      </div>

      {/* Centered calendar */}
      <div className="flex justify-center items-center h-full">
        <div
          className="
            p-4 bg-white rounded-lg shadow-md 
            transform 
            scale-95 sm:scale-100 md:scale-110 lg:scale-150
            custom-calendar
            transition-transform duration-300
          "
        >
          <Calendar
            onChange={setValue}
            value={value}
            className="text-sm sm:text-base pastel-calendar"
            formatShortWeekday={(locale, date) =>
              date.toLocaleDateString(locale, { weekday: "short" })
            }
          />
        </div>
      </div>

      {/* Inline style overrides */}
      <style>
        {`
          .custom-calendar .react-calendar__month-view__weekdays__weekday {
            overflow: visible !important;
            text-overflow: unset !important;
            white-space: nowrap !important;
          }

          .custom-calendar .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none !important;
          }

          /* Change the selected day (highlight) to pastel blue */
          .pastel-calendar .react-calendar__tile--active {
            background-color: #a7c7e7 !important;
            color: #000 !important;
            border-radius: 8px;
          }

          /* Hover effect */
          .pastel-calendar .react-calendar__tile:enabled:hover {
            background-color: #d6e6fa !important;
          }

          /* Today’s outline */
          .pastel-calendar .react-calendar__tile--now {
            background: #eaf3fc !important;
            border: 1px solid #a7c7e7 !important;
            border-radius: 8px;
            font-weight: 600;
          }
        `}
      </style>
    </div>
  );
        default:
          return <p>Select a section</p>
      }
    }




  return (
    <div className="container flex h-screen w-full">

      
       {/* SIDEBAR */}
      <div className="w-72 bg-indigo-300 h-full fixed left-0 top-0 p-6">
        <h2 className="text-xl font-semibold mb-2">Welcome {username}</h2>
        <h2 className="text-xl font-semibold mb-6">
          Tasks
        </h2>

        <ul className="space-y-4">
        <li
  onClick={() => setActiveTab("today")}
  className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer ${
    activeTab === "today" ? "bg-indigo-600 text-white" : "hover: bg-indigo-400"
  }`}
>
  <div className={"flex items-center gap-3"}>
    <BiCheckSquare size={22} />
    <span>Today</span>
  </div>
  <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-sm font-semibold">
    {todos.length}
  </span>
</li>

        <li onClick={() => setActiveTab("upcoming")} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${activeTab === "upcoming" ? "bg-indigo-600 text-white" : "hover: bg-indigo-400"}`}>
          <div className="flex items-center gap-3">
          <BiTimeFive size={22} />
          <span>Upcoming</span>
          </div>
          <span className=" bg-white text-indigo-600 px-2 py-0.5 rounded-full text-sm font-semibold">
          {upcomingTodos.length}
          </span>
        </li>


        <li onClick={() => setActiveTab("calendar")} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${activeTab === "calendar" ? "bg-indigo-600 text-white" : "hover: bg-indigo-400"}`}>
          <BiCalendar size={22} />
          <span>Calendar</span>
          
        </li>

        </ul>

        
        <button onClick={handleLogout} className="border-none bg-blue-400 rounded-sm pl-2 pr-2 mt-5 hover:cursor-pointer p-1">Logout</button>
      </div>
      
      
      
      
      {/* HOMEPAGE */}
      
      <div className="flex-1 ml-72 p-7 text-2xl font-semibold h-full">
        {renderContent()}
        </div>

  
        
    </div>
  )
}

export default Todo
