import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    cardBox: {
        backgroundColor: '#da7b60',
        marginTop: 20,
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 10,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 15
    },
    locAddress: {
        color: '#fff',
        fontFamily: 'FuturaStd-Light',
        fontSize: 11.5,
        marginHorizontal: 20,
        marginTop: 20
    },
    logo: {
        width: 80,
        height: 55,
        borderRadius: 10,
        marginLeft: 10,
        alignSelf: 'flex-start',
    },
    logoBackground: {
        position: 'absolute',
        bottom: 10,
        left: -33,
        opacity: 0.1,
        width: '70%',
        height: '70%'
    },
    balanceLabel: {
        fontSize: 10,
        color: '#fff',
        marginLeft: 20,
        marginTop: 10,
        fontFamily: 'FuturaStd-Light'
    },
    balanceText: {
        fontSize: 18.5,
        color: '#fff',
        marginLeft: 20,
        fontFamily: 'FuturaStd-Medium'
    },
    messageText: {
        marginTop: 20,
        fontSize: 16,
        color: '#fff',
        fontFamily: 'FuturaStd-Light'
    },
    addMore: {
        position: 'absolute',
        bottom: 15,
        right: 20,
        width: 43,
        height: 43,
        borderRadius: 50,
        backgroundColor: '#213742',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    addMorePlus: {
        color: '#fff',
        fontSize: 16
    },
});

export const walletBoxHeight = 190;
export default styles;
