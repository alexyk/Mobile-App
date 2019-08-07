import { AsyncStorage, Clipboard, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Image from 'react-native-remote-svg';
import Toast from 'react-native-easy-toast'
import { Wallet } from '../../../services/blockchain/wallet';
import SingleSelectMaterialDialog from '../../atoms/MaterialDialog/SingleSelectMaterialDialog'
import ProfileWalletCard from  '../../atoms/ProfileWalletCard'
import { setCurrency } from '../../../redux/action/Currency'
import styles from './styles';
import { rlog } from '../../../config-debug';
import requester from '../../../initDependencies';
import { setLoginDetails } from '../../../redux/action/userInterface';
import { WALLET_REFRESH_TIMEOUT } from '../../../config-settings';


// TODO: Finish wallet refreshing (see this._isWalletTimeoutEnabled usage)
// Currently refreshed when switching to this tab 'Profile' from bottom navigation bar
const BASIC_CURRENCY_LIST = ['EUR', 'USD', 'GBP'];
class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {},
            locBalance: -1,
            ethBalance: -1,
            currency: props.currency,
            currencySign: props.currencySign,
            currencySelectionVisible: false
        }

        this._isWalletTimeoutEnabled = false;

        this.refreshWalletFromServer = this.refreshWalletFromServer.bind(this);
        this.processWalletError = this.processWalletError.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
    }

    async componentDidMount() {
        this.listListener = [
            this.props.navigation.addListener('didFocus', () => {
              this.refreshWalletFromServer();
              if (this._isWalletTimeoutEnabled) {
                  this.startRefreshWalletTimer();
              }
            }),
            this.props.navigation.addListener('willBlur', () => {
              this.stopRefreshWalletTimer();
            })
        ];
    }

    componentWillUnmount() {
        this.stopRefreshWalletTimer('will unmount');

       // Now remove listeners here
       this.listListener.forEach( item => item.remove() )
     }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.currency != prevProps.currency) {
            this.setState({
                currency: this.props.currency, 
                currencySign:this.props.currencySign});
        }
    }

    startRefreshWalletTimer() {
        this.refreshId = setInterval(() => {
            this.refreshWalletFromServer();
        }, WALLET_REFRESH_TIMEOUT * 1000);
    }

    stopRefreshWalletTimer() {
        if (this.refreshId != -1) {
            clearInterval(this.refreshId);
            this.refreshId = -1;
        }
    }

    refreshWalletFromServer() {
        // Set wallet state as 'loading' (has locAddress but locBalance is -1)
        // For details - see ProfileWalletCard._renderWalletContent()
        this.setState({locBalance:-1});

        requester
            .getUserInfo()
            .then((res) => {
                if (res && res.body) {
                    res.body
                        .then((data) => {
                            const { locAddress } = data;
                            this.props.setLoginDetails({locAddress});
                            this.onRefresh();
                        })
                        .catch(error => this.processWalletError(error));
                } else {
                    this.processWalletError();
                }
            })
            .catch(error => this.processWalletError(error));
    }

    processWalletError(error) {
        this.props.setLoginDetails({locAddress: 'connectionError'});
    }

    async onRefresh() {
        const { locAddress } = this.props.loginDetails;

        rlog('wallet-refresh',`refreshing with address ${locAddress}`, locAddress)
        
        if (locAddress !== null && locAddress !== '') {
            Wallet.getBalance(locAddress).then(x => {
                const ethBalance = x / (Math.pow(10, 18));
                this.setState({ ethBalance: ethBalance });
            });
            Wallet.getTokenBalance(locAddress).then(y => {
                const locBalance = y / (Math.pow(10, 18));
                this.setState({ locBalance: locBalance });
            });
        }
    }

    onCurrency = () => {
        this.setState({ currencySelectionVisible: true });
    }

    updateGender = (gender) => {
        this.setState({
            info: {
                ...this.state.info,
                gender: gender,
            }
        })
    }

    logout = () => {
        const nestedNavigation = NavigationActions.navigate({
            routeName: 'Welcome',
            action: NavigationActions.navigate({routeName: "WELCOME_TRIPS"})
        });
        this.props.navigation.dispatch(nestedNavigation);

		let resetAction = StackActions.reset({
			index: 0,
			actions: [
				NavigationActions.navigate({routeName: 'Welcome'})
			]
		});
        this.props.navigation.dispatch(resetAction);
        AsyncStorage.getAllKeys().then(keys => AsyncStorage.multiRemove(keys));
    }

    navigateToPaymentMethods = () => {
        this.props.navigation.navigate('PaymentMethods', {});
    }

    createWallet = () => {
        const {navigate} = this.props.navigation;
        navigate("CreateWallet");
    }

    showToast = () => {
        this.refs.toast.show('This feature is not enabled yet in the current alpha version.', 1500);
    }

    onSendToken = () => {
        const { locBalance, ethBalance } = this.state;
        const { locAddress } = this.props;
        const { navigate } = this.props.navigation;

        if (locAddress === undefined || locAddress === null || locAddress === "") {
            this.refs.toast.show('Please create LOC wallet before sending token.', 1500);
            return;
        }
        navigate('SendToken', { locBalance: locBalance.toFixed(6), ethBalance: parseFloat(ethBalance).toFixed(6)});
    }

    _renderWallet(locBalance, locAddress, ethBalance) {
        const hasWallet = (locAddress != null && locAddress != '')

        return (
            <View>
                <ProfileWalletCard
                    locAddress = { locAddress }
                    locBalance = { locBalance }
                    ethBalance = { ethBalance }
                    createWallet = { this.createWallet }/>

                { (hasWallet) &&
                    <TouchableOpacity onPress={() => { Clipboard.setString(locAddress) }}>
                        <View style={styles.copyBox}>
                            <Text style={styles.copyText}>Copy your wallet address to clipboard</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    render() {
        const { currency, locBalance, ethBalance } = this.state;
        const { locAddress } = this.props.loginDetails;
        const { navigate } = this.props.navigation;

        //console.log("profile locAddress: ", locAddress);
        //console.log("profile currency: ", currency);

        return (
            <View style={styles.container}>
                <Toast
                    ref="toast"
                    style={{ backgroundColor: '#DA7B61', top: 500 }}
                    position='middle'
                    positionValue={100}
                    fadeInDuration={500}
                    fadeOutDuration={500}
                    opacity={1.0}
                    textStyle={{ color: 'white', fontFamily: 'FuturaStd-Light' }}
                />
                <ScrollView showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
                    { this._renderWallet(locBalance, locAddress, ethBalance) }

                    <View>
                        <TouchableOpacity onPress={() => navigate('SimpleUserProfile')} style={styles.navItem}>
                            <Text style={styles.navItemText}>View Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigate('EditUserProfile', { updateGender: this.updateGender })} style={styles.navItem}>
                            <Text style={styles.navItemText}>Edit Profile</Text>
                            <Image resizeMode="stretch" source={require('../../../assets/png/Profile/icon-user.png')} style={styles.navIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigate('Notifications')} style={styles.navItem}>
                            <Text style={styles.navItemText}>Notifications</Text>
                            <Image resizeMode="stretch" source={require('../../../assets/png/Profile/icon-bell.png')} style={styles.navIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToPaymentMethods} style={styles.navItem}>
                            <Text style={styles.navItemText}>Payment Methods</Text>
                            <Image resizeMode="stretch" source={require('../../../assets/png/Profile/icon-payment.png')} style={styles.navIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.onCurrency} style={styles.navItem}>
                            <Text style={styles.navItemText}>Currency</Text>
                            <Text style={styles.navCurrency}>{currency}</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={this.showToast} style={styles.navItem}>
                            <Text style={styles.navItemText}>Switch to Hosting</Text>
                            <Image resizeMode="stretch" source={require('../../../assets/png/Profile/icon-switch.png')} style={styles.navIcon} />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={this.onSendToken} style={styles.navItem}>
                            <Text style={styles.navItemText}>Send Tokens</Text>
                            <Image resizeMode="stretch" source={require('../../../assets/png/Profile/icon-switch.png')} style={styles.navIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.logout} style={styles.navItem}>
                            <Text style={styles.navItemText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>

                <SingleSelectMaterialDialog
                    title = { 'Select Currency' }
                    items = { BASIC_CURRENCY_LIST.map((row, index) => ({ value: index, label: row })) }
                    visible = { this.state.currencySelectionVisible }
                    onCancel = { () =>this.setState({ currencySelectionVisible: false }) }
                    onOk = { result => {
                        //console.log("select country", result);
                        this.setState({ currencySelectionVisible: false });
                        this.props.setCurrency({currency: result.selectedItem.label});
                        // this.props.actions.getCurrency(result.selectedItem.label);
                    }}
                />
            </View>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        loginDetails: state.userInterface.login,
        allState: state
    };
}

const mapDispatchToProps = dispatch => ({
    setCurrency: bindActionCreators(setCurrency, dispatch),
    setLoginDetails: bindActionCreators(setLoginDetails, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
