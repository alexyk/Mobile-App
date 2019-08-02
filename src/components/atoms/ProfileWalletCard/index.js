import React, {Component} from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import Image from 'react-native-remote-svg';
import PropTypes from 'prop-types';


import { CurrencyConverter } from '../../../services/utilities/currencyConverter'

import styles from './styles';

import VersionText from '../../atoms/VersionText'

const DEFAULT_CRYPTO_CURRENCY = 'EUR';

class ProfileWalletCard extends Component {
    constructor(props) {
        super(props);

        this.state = { isEmpty: true };
        setTimeout(()=> this.setState({isEmpty:false}), 100);
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
            <View style={{ width: '100%', height: 180, alignItems: 'center', justifyContent: 'flex-start',paddingBottom: 5}}>
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


    _renderWalletContent(isWalletReady, isEmpty, walletExists, walletAddress, locBalance, ethBalance, displayPrice) {
        if (isEmpty) {
            return this._renderMessage('')
        }

        const fullBody = (
            <View>
                { this._renderLogo() }
                { this._renderLogoBackground() }

                <Text style={styles.balanceLabel}>Current Balance</Text>
                <View style={{ width: '100%' }}>
                    <Text style={styles.balanceText}>{locBalance.toFixed(6)} LOC / {displayPrice}</Text>
                </View>
                <Text style={styles.balanceLabel}>ETH Balance</Text>
                <View style={{ width: '100%' }}>
                    <Text style={styles.balanceText}>{parseFloat(ethBalance).toFixed(6)}</Text>
                </View>

                <View style={{ width: '100%' }}>
                    <Text style={styles.walletAddress}>{walletAddress}</Text>
                </View>
            </View>
        );
        const loadingBody = this._renderMessage('Loading wallet ...');
        const noWalletBody = this._renderMessage(`Please click the button to create your LOC Wallet!`);
        let result = null;

        if (walletExists && isWalletReady) {
            result = fullBody;
        } else if (walletExists) {
            result = loadingBody;
        } else {
            result = noWalletBody;
        }

        return result;
    }


    _renderCreateWalletButton(walletExists, isEmpty, createWallet) {
        return (
            (!walletExists && !isEmpty) &&
            (
                <TouchableOpacity onPress={createWallet} style={styles.addMore}>
                    <FontAwesomeIcon size={24} icon={faPlus} style={{color: '#FFF7'}} />
                </TouchableOpacity>
            )

        )
    }


    render() {
        const {currency, exchangeRates, locAmounts, currencySign, createWallet} = this.props;
        const { isEmpty } = this.state;
        
        const fiat = exchangeRates.currencyExchangeRates && CurrencyConverter.convert(exchangeRates.currencyExchangeRates, DEFAULT_CRYPTO_CURRENCY, currency, exchangeRates.locRateFiatAmount);
        let locAmount = locAmounts.locAmounts[exchangeRates.locRateFiatAmount] && locAmounts.locAmounts[exchangeRates.locRateFiatAmount].locAmount;
        if (!locAmount) {
            locAmount = exchangeRates.locRateFiatAmount / exchangeRates.locEurRate;
        }
        let locRate = fiat / locAmount;

        const {walletAddress, locBalance, ethBalance} = this.props;
        const isWalletReady = (walletAddress && locBalance != -1 && ethBalance != -1);
        const walletExists = (walletAddress != null && walletAddress != '');

        let price = locBalance * locRate;
        let displayPrice = currencySign;
        if (locBalance == 0 || price != 0)
            displayPrice += " " + price.toFixed(2);

        return (
            <View style={styles.cardBox}>
 
                { this._renderAppVersion() }

                { this._renderWalletContent(isWalletReady, isEmpty, walletExists, walletAddress, locBalance, ethBalance, displayPrice) }

                { this._renderCreateWalletButton(walletExists, isEmpty, createWallet) }

            </View>
        );
    }
}

ProfileWalletCard.propTypes = {
    walletAddress: PropTypes.string,
    locBalance: PropTypes.number,
    ethBalance: PropTypes.number,
    createWallet: PropTypes.func
};

ProfileWalletCard.defaultProps = {
    walletAddress: "",
    locBalance: 0.0,
    ethBalance: 0.0,
    createWallet: () => {}
};

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        
        locAmounts: state.locAmounts,
        exchangeRates: state.exchangeRates,
    };
}

export default connect(mapStateToProps, null)(ProfileWalletCard);
