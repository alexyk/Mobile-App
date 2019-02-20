import { StyleSheet } from 'react-native';

export const commonStyles = {
    hotelImageCommon: {
        borderRadius: 10,
        height: 150
    },
    hotelImageContainerCommon: {
        marginTop: 10,
        marginBottom: 5,
    },
    fontsCommon: {
        fontFamily: 'FuturaStd-Medium',
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#f0f1f3',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 40,
    },
    placeholderImageView: {
        marginTop: 40
    },
    placeholderImage: {
        width: 135,
        height: 135,
        marginTop: 75
    },
    hotelImage: {
        ...commonStyles.hotelImageCommon
    },
    hotelImageNoImage: {
        height: 150,
        width: "100%",
        alignContent: 'center',
        flexDirection: 'column'
    },
    hotelImageContainerNoImage: {
        ...commonStyles.hotelImageContainerCommon,
        ...commonStyles.hotelImageCommon,
        borderColor: 'black',
        alignItems: 'center',
        backgroundColor: "#DADADA",
        justifyContent: 'center'
    },
    hotelImageContainer: {
        ...commonStyles.hotelImageContainerCommon,
        height: 150,
        justifyContent: 'flex-start',
    },
    hotelBookingStatusContainer:{
        marginTop: 10,
        marginBottom: 10
    },
    searchAndPickWrapView:{
        width: '100%',
        marginTop: 20,
        marginBottom:10
    },
    searchView: {
        paddingHorizontal: 15,
        backgroundColor: '#f0f1f3',
    },

    // texsts
    txtHotelNoImage: {
        fontSize: 22,
        color: '#AAA',
    },
    textBookingStatus: {
        ...commonStyles.fontsCommon,
        fontSize: 16
    },
    textBookingId: {
        ...commonStyles.fontsCommon,
        fontSize: 16
    },
    title: {
        ...commonStyles.fontsCommon,
        fontSize: 22,
        color: '#000',
        marginLeft: 20,
        marginTop: 10
    },
    subtitle: {
        ...commonStyles.fontsCommon,
        fontSize: 16,
        // marginRight: 10,
        color: '#000'
    },
    subtext: {
        ...commonStyles.fontsCommon,
        fontSize: 15,
        marginTop: 5,
        color: '#000'
    },
    subtext1: {
        ...commonStyles.fontsCommon,
        fontSize: 13,
        marginTop: 5,
        color: '#000'
    },
    hoteltext: {
        ...commonStyles.fontsCommon,
        fontSize: 12,
        color: '#000'
    },
    buttonExplore: {
        backgroundColor: '#D87A61',
        paddingHorizontal: 70,
        paddingVertical: 12.5,
        marginTop: 90
    },
    exploreBtnText: {
        ...commonStyles.fontsCommon,
        fontSize: 17,
        color: '#fff'
    },
    btn_backImage:{
        height: 28,
        width: 28,
        marginTop: 44,
        marginLeft: 16
      },
    btn_ImageNumber:{
        height: 58,
        width: 58,
        marginTop: 34,
        marginLeft: 6
      },
      senderImage:{
        height: 50,
        width: 50,
        borderRadius: 25,
        borderColor: 'white',
        borderWidth: 1,
        position: 'absolute',
      },
      flatList:{
        width : '100%',
    },
    List:{
        marginLeft: 4

    },
    img_round:{
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 5,
        height:47,
        width: 47,
        borderRadius: 23.5,
        backgroundColor:'#D87A61',
        flexDirection : 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    img_round_text:{
        color : 'white',
        textAlign: 'center'
    },
    innertext:{
        color: '#fff',
        fontSize: 30,
        marginTop: 5
    },
    Listcontainer:{
        marginBottom: 30
       // marginTop :30
    },
    chatToolbar: {
        alignSelf: 'flex-start',
    },
    imageViewWrapper: {
        position: 'relative',
    },
    flatListMainView : {width: '100%', flex: 1, flexDirection: 'row'},
    flatListDataView : {flex: 1, marginRight:15},
    flatListTitleView : {marginTop: 0},
    flatListBottomView : {flex: 1, flexDirection: 'row'},
    flatListUserProfileView : {height: 50, width:50, position: "absolute", bottom: 50, right: 5}

});

export default styles;
