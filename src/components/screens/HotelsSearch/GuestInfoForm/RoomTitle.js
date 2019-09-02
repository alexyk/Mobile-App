import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Separator from '../../../atoms/Separator';
import { commonText } from '../../../../common.styles';


const RoomTitle = (props) => {
    const { roomIndex } = props;

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>Room {roomIndex+1}</Text>
            <Separator isHR height={2} />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 40
  },
  titleText: {
    ...commonText,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: "bold"
  },
})


export default RoomTitle;
