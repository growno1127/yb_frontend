import React, { useState, useEffect } from 'react';
import "../App.css";


function Clock() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date()); // Update time every second
        }, 1000);

        return () => clearInterval(timer); // Cleanup the interval on component unmount
    }, []);

    return (
        <div>
            <p className='yb-date'>{currentTime.toLocaleString()}</p>
        </div>
    );
}

export default Clock;