import React, { Component } from "react";
import { StatusBar, View, Text, ScrollView } from "react-native";
import SplashScreen from "react-native-smart-splash-screen";
// import { Provider } from "react-redux";
// import store from "../../redux/store";
// import { AppNavigator } from "../../routing";
import json from "../../../package.json";

class App extends Component {
  componentDidMount() {
    console.disableYellowBox = true;
    console.info('Starting App');

    setTimeout(SplashScreen.close, 100,
      { animationType: SplashScreen.animationType.scale, duration: 0, delay: 0 }
    );

  }
  
  
  render() {
    let j = json;
    return (
      <View style={{height: "90%", top: "5%"}}>
        <ScrollView style={{ padding: 10 }} showsVerticalScrollIndicator>
          {/* <ScrollView style={{width="100%"}}> */}
            <StatusBar
              backgroundColor="rgba(0,0,0,0)"
              translucent
              barStyle="light-content"
            />
            
            <Title value="Package JSON" />
            
            <Label name="App Name" value={json.name} />
            <Label name="Version" value={json.version} />
            <Separator height={20} />

            <MultiLabel title="Dependencies" object={json.dependencies} />
            <MultiLabel title="Dev Dependencies" object={json.devDependencies} />

            <Separator height={20} style={{backgroundColor:'transparent'}} />

          {/* </ScrollView> */}
        </ScrollView>
      </View>
    );
  }
}

function Separator( { height=20, width=80, style={} } ) {
  return (
    <View style={{ height: 1, backgroundColor: 'black', width: `${width}%`, marginVertical: Math.round(height/2), ...style }} />
  )
}

function MultiLabel({title, object}) {
  let renderedItems = [];
  for (let prop in object) {
    const value = object[prop];
    renderedItems.push(<Label key={`${prop}_${value}`} name={prop}  value={value} />)
  }

  return (
    <View style={{marginTop: 30}}>
      <Label name={title} value="" style={{marginBottom: 10}} />
      <Separator width={50} />
      <View style={{}}>
        {renderedItems}
      </View>
    </View>
  )
}

function Label({name, value, style}) {
  const size1 = 15;
  const size2 = 15;

  return (
    <Text style={{fontWeight: 'bold', fontSize: size1, ...style}}>{name}:
      <Text style={{fontWeight: 'normal', fontSize: size2}}> {value}</Text>
    </Text>
  )
}

function Title({value}) {
  return <Text style={{fontWeight: 'bold', fontSize: 20, marginBottom: 20}}>{`${value}:`}</Text>
}

export default App;

