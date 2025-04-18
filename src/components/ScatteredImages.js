import React from 'react';
import gd from '../assets/gd.png'; 
import graph from '../assets/graph.png';
import vae from '../assets/vae.png';

const ScatteredImages = () => (
    <div className="absolute inset-0 pointer-events-none z-10">
      <img
        src={gd}
        alt=""
        className="absolute object-cover opacity-90 rotate-0 rounded-lg"
        style={{ bottom: '-10%', right: '20%', width: '25%', height: '25%' }}
      />
      <img
        src={graph}
        alt=""
        className="absolute object-contain opacity-80 -rotate-0 rounded-lg"
        style={{ bottom: '0%', left: '5%', width: '200%', height: '200%' }}
      />
      <img
        src={vae}
        alt=""
        className="absolute object-contain opacity-100 rotate-0"
        style={{ bottom: '-30%', left: '15%', width: '25%', height: '25%' }}
      />
    </div>
);

export default ScatteredImages;