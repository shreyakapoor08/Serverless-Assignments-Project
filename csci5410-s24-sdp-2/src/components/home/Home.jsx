import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {useNavigate } from 'react-router-dom';
import { FaHotel, FaUserFriends, FaComments, FaCloud, FaEnvelope } from "react-icons/fa";
import { Link } from 'react-router-dom';



const Home = () => {
  const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // // If user is not logged in --> Redirect to /login
    // useEffect(() => {
    //     if (!user) {
    //         navigate("/login");
    //     }
    // }, [user, navigate]);

    // Component is mounted
    useEffect(()=>{
        console.log("Dashboard Component")
    },[])
  return (
    <div className="bg-gradient-to-b from-blue-200 to-blue-400 min-h-screen flex flex-col justify-center items-center">
      <div className="max-w-4xl px-4 py-8 bg-white shadow-lg rounded-lg">
        <section className="text-center">
          <FaHotel className="text-6xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">
            Welcome to DALVacationHome
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Explore our luxury rooms and recreational facilities designed just for you.
          </p>
          <div className="flex justify-center space-x-4 mb-8">
          <Link
              to="/listing"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition duration-300"
            >
              Book Now
            </Link>
            <Link to="/chatbot">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded-lg shadow-md transition duration-300">
              Concerns?
            </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
              <FaUserFriends className="text-4xl text-blue-600 mb-2 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">New Visitors</h2>
              <p className="text-gray-700">
                Check availability, tariffs, and use our virtual assistant for navigation.
              </p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
              <FaComments className="text-4xl text-blue-600 mb-2 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Already Booked With Us?</h2>
              <p className="text-gray-700">
                Check Booking Details, Talk to the agents for any issues and Modify your booking. 
              </p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
              <FaCloud className="text-4xl text-blue-600 mb-2 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Cloud Infrastructure</h2>
              <p className="text-gray-700">
                Built with serverless architecture and deployed across multiple clouds.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-700">
              Experience seamless communication with our messaging system.
            </p>
            <FaEnvelope className="text-4xl text-blue-600 mt-4 mx-auto" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
