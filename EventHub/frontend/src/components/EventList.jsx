import React, { useEffect, useState } from 'react';

const EventList = () => {

  const [events, setEvents] = useState([]);

  useEffect(() => {

    fetch('/api/events')

      .then(res => res.json())

      .then(data => setEvents(data));

  }, []);

  return (

    <div>

      <h2>Events</h2>

      {events.map(event => (

        <div key={event._id}>

          <h3>{event.title}</h3>

          <p>{event.description}</p>

          <p>{event.date}</p>

        </div>

      ))}

    </div>

  );

};

export default EventList;