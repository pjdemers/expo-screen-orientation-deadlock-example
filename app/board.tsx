
import { useState } from 'react'
import { SafeAreaView, Text } from 'react-native'
import * as ScreenOrientation from "expo-screen-orientation";

//
export function Board() {

  //
  const [ orientation, setOrientation ] = useState<ScreenOrientation.Orientation | null>(ScreenOrientation.Orientation.UNKNOWN);

  //
  console.log(`        state orientation: ${orientation}`)

  ScreenOrientation.getOrientationAsync().then((o) => {
    console.log('initial orientation ', o);
    setOrientation(o);
  });

  ScreenOrientation.removeOrientationChangeListeners()
  const addResult = ScreenOrientation.addOrientationChangeListener((event) => {
    console.log('change orientation to: ', event.orientationInfo.orientation); 
    setOrientation(event.orientationInfo.orientation);
  })
  console.log("orientation result: ", addResult)
  
  const isLandscape = (orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || orientation == ScreenOrientation.Orientation.LANDSCAPE_RIGHT)

  console.log(`isLandscape: ${isLandscape}`) 

  if (isLandscape) {
    return (
      <SafeAreaView>
	      <Text style={{fontSize: 24}}>Landscape</Text>
      </SafeAreaView>
    );
   } else {
    return (
      <SafeAreaView>
	       <Text style={{fontSize: 24}}>Portrait</Text>
      </SafeAreaView>
    );
  }
}
