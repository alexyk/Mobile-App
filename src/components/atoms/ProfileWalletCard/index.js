import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { View, Text, TouchableOpacity } from 'react-native';
import Image from 'react-native-remote-svg';
import PropTypes from 'prop-types';
import VersionText from '../../atoms/VersionText'
import LTIcon from '../LTIcon';
import LTSmallLoader from '..//LTSmallLoader';
import styles, { walletBoxHeight } from './styles';

import { WALLET_STATE } from '../../../redux/enum';
import { WALLET_REFRESH_TIMEOUT } from '../../../config-settings';
import { setWalletData } from '../../../redux/action/userInterface';
import { validateLOCAddress } from '../../../utils/validation';
import { Wallet } from '../../../services/blockchain/wallet';
import { CurrencyConverter } from '../../../services/utilities/currencyConverter'
import requester from '../../../initDependencies';
import { isNumber } from '../../screens/utils';

const DEFAULT_CRYPTO_CURRENCY = 'EUR';


// TODO: Finish wallet refreshing (see this._isWalletTimeoutEnabled usage)
// Currently refreshed when switching to this tab 'Profile' from bottom navigation bar
class ProfileWalletCard extends Component {
    constructor(props) {
        super(props);

        this._isWalletTimeoutEnabled = false;
        this._refreshId = -1;
        this._tempBalance = {}; // used for quick reference avoiding effects of cache being async

        this.refreshWalletFromServer = this.refreshWalletFromServer.bind(this);
        this.processWalletError = this.processWalletError.bind(this);
        this.refreshWalletBalance = this.refreshWalletBalance.bind(this);
    }

    componentWillUnmount() {
        this.stopRefreshWalletTimer();

       // Now remove listeners here
       this.listListener.forEach( item => item.remove() )
     }


    componentDidMount() {
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


    processWalletError(error) {
        this.props.setWalletData({walletState: WALLET_STATE.CONNECTION_ERROR});
    }

    refreshWalletFromServer() {
        // Skip asking for wallet address if already loaded
        // Directly refresh balance instead
        const { isFirstLoading, skipLOCAddressRequest } = this.props.walletData;
        if (!isFirstLoading || skipLOCAddressRequest) {
            this.refreshWalletBalance();
            return;
        }

        requester
            .getUserInfo()
            .then((res) => {
                if (res && res.body) {
                    res.body
                        .then((data) => {
                            const { locAddress } = data;
                            const locAddressValidationResult = validateLOCAddress(locAddress);
                            
                            switch (locAddressValidationResult) {

                                case -1:
                                    this.props.setWalletData({locAddress, walletState: WALLET_STATE.NONE});
                                    break;

                                case 0:
                                    this.props.setWalletData({locAddress, walletState: WALLET_STATE.INVALID});
                                    break;

                                case 1:
                                    this.props.setWalletData({locAddress, walletState: WALLET_STATE.LOADING});
                                    this.refreshWalletBalance();
                                    break;

                            }
                            
                        })
                        .catch(error => this.processWalletError(error));
                } else {
                    this.processWalletError();
                }
            })
            .catch(error => this.processWalletError(error));
    }

    refreshWalletBalance() {
        const { locAddress } = this.props.loginDetails;
        this._tempBalance = {};
        
        if (locAddress !== null && locAddress !== '') {
            Wallet
                .getBalance(locAddress)
                .then(x => {
                    const ethBalance = x / (Math.pow(10, 18));
                    this.checkBalance({ ethBalance });
                });

            Wallet
                .getTokenBalance(locAddress)
                .then(y => {
                    const locBalance = y / (Math.pow(10, 18));
                    this.checkBalance({ locBalance });
                });
        }
    }

    checkBalance(newData) {
        Object.assign(this._tempBalance, newData);

        const { locBalance, ethBalance } = this._tempBalance;

        if (isNumber(locBalance) && isNumber(ethBalance)) {
            this.props.setWalletData({
                ethBalance, locBalance,
                walletState: WALLET_STATE.READY
            });
        }
     }


    startRefreshWalletTimer() {
        this._refreshId = setInterval(() => {
            this.refreshWalletFromServer();
        }, WALLET_REFRESH_TIMEOUT * 1000);
    }

    stopRefreshWalletTimer() {
        if (this._refreshId != -1) {
            clearInterval(this._refreshId);
            this._refreshId = -1;
        }
    }

    createWallet = () => {
        const {navigate} = this.props.navigation;
        navigate("CreateWallet");
    }

    _renderLogoBackground() {
        return (
            <Image
                source={require('../../../assets/splash.png')}
                style={styles.logoBackground} />
        )
    }


    _renderLogo() {
        return (
            <Image
                source={require('../../../assets/splash.png')}
                style={styles.logo} />
        )
    }

    _renderMessage(message) {
        return (
            <View style={{ width: '100%', height: walletBoxHeight, alignItems: 'center', justifyContent: 'flex-start',paddingBottom: 5}}>
                { this._renderLogo() }
                { this._renderLogoBackground() }
                <Text style={styles.messageText}>{message}</Text>
            </View>
        )
    }


    _renderAppVersion() {
        return (
            <VersionText color={'white'} size={9} 
                style={{position: 'absolute', backgroundColor: 'transparent', top: 10}}
                textStyle={{textAlign: 'right'}}
            />
        )
    }


    _renderWalletContent() {
        const { exchangeRates, locAmounts, currency, currencySign } = this.props;
        const { locAddress } = this.props.loginDetails;
        const { walletState, locBalance, ethBalance, isFirstLoading } = this.props.walletData;

        const fiat = exchangeRates.currencyExchangeRates && CurrencyConverter.convert(exchangeRates.currencyExchangeRates, DEFAULT_CRYPTO_CURRENCY, currency, exchangeRates.locRateFiatAmount);
        let locAmount = locAmounts.locAmounts[exchangeRates.locRateFiatAmount] && locAmounts.locAmounts[exchangeRates.locRateFiatAmount].locAmount;
        if (!locAmount) {
            locAmount = exchangeRates.locRateFiatAmount / exchangeRates.locEurRate;
        }
        const locRate = fiat / locAmount;
        const price = locBalance * locRate;
        let displayPrice = currencySign;
        if (locBalance == 0 || price != 0) {
            displayPrice += " " + price.toFixed(2);
        }
        
        let result = null;

        // first priority cases - lost connection / errors
        switch (walletState) {
            case WALLET_STATE.INVALID:
                result = this._renderMessage('Error occurred while reading wallet data. Please report to support.');
                break;

            case WALLET_STATE.CONNECTION_ERROR:
                result = this._renderMessage('Connection error while getting wallet ...');
                break;
        }
        if (result != null) {
            return result;
        }


        // ui cases
        const uiState = (isFirstLoading ? walletState : WALLET_STATE.READY);
        const isReloading = (isFirstLoading && walletState != WALLET_STATE.READY);

        switch (uiState) {

            case WALLET_STATE.NONE:
                result = this._renderMessage(`Please click the button to create your LOC Wallet!`);
                break;        
                    
            case WALLET_STATE.CREATING:
                result = this._renderMessage('Creating wallet ...');
                break;
                        
            case WALLET_STATE.CHECKING:
                result = this._renderMessage('Checking for wallet ...');
                break;
                        
            case WALLET_STATE.LOADING:                
                result = this._renderMessage('Refreshing wallet data ...');
                break;

            case WALLET_STATE.READY:                
                result = (
                    <View style={{height: walletBoxHeight}}>
                        { this._renderLogo() }
                        { this._renderLogoBackground() }
        
                        <Text style={styles.balanceLabel}>Current Balance</Text>
                        <View style={{ width: '100%' }}>
                            <Text style={styles.balanceText}>{locBalance.toFixed(6)} LOC / {displayPrice}</Text>
                        </View>
                        <Text style={styles.balanceLabel}>ETH Balance</Text>
                        <View style={{ width: '100%' }}>
                            <Text style={styles.balanceText}>
                                {parseFloat(ethBalance).toFixed(6)}
                            </Text>
                        </View>
        
                        <View style={{ width: '100%' }}>
                            <Text style={styles.locAddress}>{`${locAddress}`}</Text>
                        </View>

                        {isReloading &&
                            <LTSmallLoader style={{position:'absolute', right: 100, top: 140}} />
                        }
                    </View>
                );
                break;

        }

        return result;
    }


    _renderCreateWalletButton(walletState, createWallet) {
        const isButtonEnabled = ( walletState == WALLET_STATE.NONE );

        return (
            (isButtonEnabled) &&
            (
                <TouchableOpacity onPress={createWallet} style={styles.addMore}>
                    <LTIcon size={24} name={'plus'} style={{color: '#FFF7'}} />
                </TouchableOpacity>
            )

        )
    }


    render() {
        return (
            <View style={styles.cardBox}>
 
                { this._renderAppVersion() }

                { this._renderWalletContent() }

                { this._renderCreateWalletButton() }

            </View>
        );
    }
}

ProfileWalletCard.propTypes = {
    createWallet: PropTypes.func,
    navigation: PropTypes.object
};

ProfileWalletCard.defaultProps = {
    createWallet: () => {},
    navigation: null
};

const mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        
        locAmounts: state.locAmounts,
        exchangeRates: state.exchangeRates,

        loginDetails: state.userInterface.loginDetails,
        walletData: state.userInterface.walletData
    };
}

const mapDispatchToProps = dispatch => ({
    setWalletData: bindActionCreators(setWalletData, dispatch),
})


export default connect(mapStateToProps, mapDispatchToProps)(ProfileWalletCard);
