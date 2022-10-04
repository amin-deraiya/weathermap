import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { fetchWeather } from './api/weather';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Marker } from '@react-google-maps/api';
import './App.css';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: 20,
  lng: 77,
};

const App = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState({});
  const [position, setPosition] = useState({ lat: 20, lng: 77 });

  const search = async (e) => {
    e.preventDefault();
    const data = await fetchWeather(query);
    setWeather(data);
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '<YOUR GOOGLE MAP API KEY>',
  });

  useEffect(() => {
    console.log('useEffect', query);

    const fetchWeatherDataOfDraggedLocation = async () => {
      const wdata = await fetchWeather(query);
      setWeather(wdata);
    };
    fetchWeatherDataOfDraggedLocation();
  }, [query]);

  const onMarkerDragEnd = async (coord) => {
    const { latLng } = coord;
    const lat = latLng.lat();
    const lng = latLng.lng();
    setPosition({ lat, lng });

    await axios
      .get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      )
      .then((data) => {
        setQuery(data?.data?.city ? data?.data?.city : data?.data?.principalSubdivision);
      })
      .catch((err) => console.log('errr ====>', err));
  };

  return (
    <div className='main-container'>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
        <div
          style={{
            width: '50%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <form onSubmit={search} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <input
              type='text'
              style={{ width: '50%' }}
              placeholder='Search...'
              value={query}
              className='search'
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type='submit' hidden>
              Search
            </button>
          </form>

          {weather.main && (
            <div className='city' style={{ width: '50%' }}>
              <h2 className='city-name'>
                <span>{weather.name}</span>
                <sup>{weather.sys.country}</sup>
              </h2>
              <div className='city-temp'>
                {Math.round(weather.main.temp)}
                <sup>&deg;C</sup>
              </div>
              <div className='info'>
                <img
                  className='city-icon'
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                />
                <p>{weather.weather[0].description}</p>
              </div>
            </div>
          )}
        </div>
        <div style={{ width: '50%' }}>
          {isLoaded ? (
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
              <Marker
                position={position}
                draggable={true}
                onDragEnd={(coord) => {
                  console.log(coord, 'dragggg');
                  onMarkerDragEnd(coord);
                }}
              />
            </GoogleMap>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
