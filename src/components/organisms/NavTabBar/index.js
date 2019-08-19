import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import styles from './styles';
import SplashScreen from 'react-native-smart-splash-screen';
import NavButton from '../../atoms/NavButton'
import Separator from '../../atoms/Separator';
import { getSafeBottomOffset } from '../../../utils/designUtils';


export default class NavTabBar extends Component {
    static propTypes = {
        navigation: PropTypes.shape({
            navigate: PropTypes.func,
            state: PropTypes.shape({
                index: PropTypes.number,
                routes: PropTypes.arrayOf(PropTypes.shape({
                    key: PropTypes.string
                }))
            })
        }),
    }

    static defaultProps = {
        navigation: {
            navigate: () => {},
            state: {
                index: 1,
                routes: []
            }
        },
    }

    componentWillMount() {
        //const { currency } = this.props.paymentInfo;
        //console.log("Nav - componentDidMount", currency);
        SplashScreen.close({
            animationType: SplashScreen.animationType.scale,
            duration: 0,
            delay: 0
        });
    }

    render() {
        const { navigate, state } = this.props.navigation;
        const { index, routes } = state;
        const active = routes[index].key;

        // return (
        //     <View style={{width:"100%", height:50, backgroundColor:'red', justifyContent: 'center', alignItems: 'center'}}>
        //         <Text>Hello there - I am the navigator</Text>
        //     </View>
        // )

        const commonProps = {active, navigate};

        return (
            <View>
                <View style={styles.container}>
                    <NavButton {...commonProps} name={'PROFILE'}   icon={'user'} />
                    <NavButton {...commonProps} name={'MESSAGES'}  icon={'comment'} />
                    <NavButton {...commonProps} name={'MY_TRIPS'}  icon={'suitcase'} />
                    <NavButton {...commonProps} name={'FAVORITES'} icon={'heart'} />
                    <NavButton {...commonProps} name={'EXPLORE'}   icon={'search'} />
                </View>
                <Separator height={getSafeBottomOffset()} extraStyle={{backgroundColor:'#EEE'}} />
            </View>
        );
    }
}

