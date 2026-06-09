
import *as from  from "node_modules/dat.gui/build/dat.gui.min.js"


export function DrawGui()
{
  const myConfig = 
  {
    message: 'Hello World',
    speed: 0.5,
    displayColor: '#ff0000',
    startSimulation: function() { console.log("Started!"); }
  };

  const gui = new dat.GUI();

  gui.add(myConfig, 'message');                 
  gui.add(myConfig, 'speed', 0, 10).step(0.1);  
  gui.addColor(myConfig, 'displayColor');       
  gui.add(myConfig, 'startSimulation');         
}

