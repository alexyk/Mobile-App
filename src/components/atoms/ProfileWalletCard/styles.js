import { StyleSheet } from 'react-native';
import { SCREEN } from '../../../utils/designUtils';

export const walletBoxHeight = 190;

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
    loaderBox: {
        position:'absolute',
        width: SCREEN.W - 30,
        backgroundColor: '#000000BD',
        marginTop: 20,
        marginLeft: 15,
        borderRadius: 10,
        height: walletBoxHeight + 20,
        justifyContent: 'center',
        alignItems: 'center'
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
        marginTop: 10,
        marginHorizontal: 20,
        textAlign: 'center',
        fontSize: 16,
        color: '#fff',
        fontFamily: 'FuturaStd-Light'
    },
    createWallet: {
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

    refreshBalance: {
        position: 'absolute',
        bottom: 5,
        right: 20,
        width: 30,
        height: 30,
        borderRadius: 50,
        backgroundColor: '#000f',
        alignItems: 'center',
        justifyContent: 'center'
    },
    
    copyBox: {
        backgroundColor: '#fff',
        marginLeft: 40,
        marginRight: 40,
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    copyText: {
        fontFamily: 'FuturaStd-Light',
        fontSize: 13,
        color: '#000'
    }
});

export default styles;
