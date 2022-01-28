import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Fib = () => {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');

  const fetchValues = async () => {
    const values = await axios.get('api/values/current');
    setValues(values.data);
  };

  const fetchIndexes = async () => {
    const seenIndexes = await axios.get('api/values/all');
    setSeenIndexes(seenIndexes.data);
  };

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  const renderIndexes = () => {
    if (seenIndexes.length) {
      return seenIndexes.map(({ number }) => number).join(', ');
    }
  };

  const renderValues = () => {
    const entries = [];

    for (let key in values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {values[key]}
        </div>
      );
    }
    console.log(entries);
    return entries;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/values', { index });
    setIndex('');
  };

  return (
    <div>
      <h3>Hello Fib</h3>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input value={index} onChange={(e) => setIndex(e.target.value)}></input>
        <button>Submit</button>
      </form>
      <h3>Indexes I have seen: {renderIndexes()}</h3>
      <h3>Calculated values: {renderValues()}</h3>
    </div>
  );
};

export default Fib;
