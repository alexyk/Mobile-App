import React, {Component} from 'react'
import {
  View,
  Text
} from 'react-native'
import HTMLView from 'react-native-htmlview'
import styles, { htmlViewStyleSheet } from './styles'

export default class BookingSteps extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const { items, selectedIndex } = this.props;
    const count = items.length;
    let htmlContent = '<body>';

    items.forEach( (text,index) => {
      const arrow = (index < count-1 ? ' -> ' : '');
      if (index == selectedIndex) {
        htmlContent += `<b>${text}</b>`;
      } else {
        htmlContent += `${text}`;
      }
      htmlContent += arrow;
    })
    htmlContent += '</body>';

    return <HTMLView value={htmlContent} stylesheet={htmlViewStyleSheet} style={styles.main} />
  }



  renderAlt() {
    const { items, selectedIndex } = this.props;
    const count = items.length;
    const textStyleNormal = {fontWeight: 'bold'};
    const textStyleSelected = {fontWeight: 'normal'};

    return (
      <View style={{width: '100%',
        flexDirection:'row',justifyContent:'flex-start',alignItems:'center',
        paddingHorizontal: 15, 
        // borderWidth: 2,  borderRadius: 10, borderColor: '#0001',
        borderBottomWidth: 1, borderTopWidth: 1,
        backgroundColor: '#5552'
      }}>
        { items.map( (text,index) => {
            return [
              <Text style={index == selectedIndex ? textStyleSelected : textStyleNormal}>{text}</Text>,
              <Text>{index < count-1 ? ' -> ' : ''}</Text>
            ]
          })
        }
      </View>
    )
  }
}