import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    } from 'react-native';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setDatesAndGuestsData } from '../../../redux/action/userInterface'
import PropTypes from 'prop-types';
import Toast from 'react-native-easy-toast';
import CloseButton from '../../atoms/CloseButton';
import GuestRow from '../../molecules/GuestRow';
import styles from './styles';


class Guests extends Component {
    static propTypes = {
        navigation: PropTypes.shape({
            navigate: PropTypes.func
        })
    }

    static defaultProps = {
        navigation: {
            navigate: () => {}
        }
    }

    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.onDone = this.onDone.bind(this);
        this.onPersonChange = this.onPersonChange.bind(this);
        const {adults, children} = this.props.datesAndGuestsData;
        this.state = {
            adults,
            children
        };
    }

    onPersonChange(type, value) {
        this.setState((prevState) => ({
            [type]: value
        }))
    }

    onClose() {
      this.props.navigation.goBack();
    }

    onDone() {
        if (this.state.adults === 0){
            this.refs.toast.show('You cannot book without adult.', 1500);
            return;
        }
        if (this.props.navigation.state.params && this.props.navigation.state.params.updateData) {
            this.props.navigation.state.params.updateData(this.state);
        }
        this.props.navigation.goBack();
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
              <CloseButton onPress={this.onClose}/>
              <View style={styles.bodyRows}>
                <GuestRow title={"Adults"} count={this.state.adults} type={"adults"} onChanged={this.onPersonChange}/>
                <GuestRow title={"Children"} subtitle={"Age 0-17"} count={this.state.children} type={"children"} onChanged={this.onPersonChange}/>
              </View>
              <View style={styles.bottomView}>
                <TouchableOpacity style={styles.doneButtonView} onPress={this.onDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <Toast
                    ref="toast"
                    style={{ backgroundColor: '#DA7B61' }}
                    position='bottom'
                    positionValue={150}
                    fadeInDuration={500}
                    fadeOutDuration={500}
                    opacity={1.0}
                    textStyle={{ color: 'white', fontFamily: 'FuturaStd-Light' }}
                />
            </View>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        datesAndGuestsData: state.userInterface.datesAndGuestsData,
    };
}

const mapDispatchToProps = dispatch => ({
    setDatesAndGuestsData: bindActionCreators(setDatesAndGuestsData, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Guests);