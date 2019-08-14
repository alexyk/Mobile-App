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
import ChildrenView from '../../molecules/ChildrenView';
import styles from './styles';
import { prepareChildrenAgeValue, updateChildAgesCache, INVALID_CHILD_AGE } from './utils';
import Separator from '../../atoms/Separator';
import { getSafeBottomOffset } from '../../../utils/designUtils';


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
        
        const { adults, children, childrenAgeValues, rooms } = this.props.datesAndGuestsData;
        
        this.state = {
            adults,
            children,
            rooms,
            childrenAgeValues: childrenAgeValues.concat()
        };
        this._childAgesCached = childrenAgeValues.concat();

        this.onClose = this.onClose.bind(this);
        this.onDone = this.onDone.bind(this);
        this.onCountChange = this.onCountChange.bind(this);
        this.onChildChange = this.onChildChange.bind(this);
    }


    onCountChange(type, count) {
        if (type == 'children') {
            const childrenAgeValues = prepareChildrenAgeValue(count, this._childAgesCached);
            updateChildAgesCache(count, this._childAgesCached);

            this.setState( {[type]: count, childrenAgeValues} );
        } else {
            this.setState( {[type]: count} );
        }
    }

    onChildChange(index, age) {        
        const { childrenAgeValues } = this.state;
        let newValue = [...childrenAgeValues];
        newValue[index] = age;
        updateChildAgesCache(newValue, this._childAgesCached);
        
        this.setState( {childrenAgeValues: newValue} );
    }

    onClose() {
        this.props.navigation.goBack();
    }

    onDone() {
        const { adults, childrenAgeValues } = this.state;
        const { params } = this.props.navigation.state;
        if (adults === 0){
            this.refs.toast.show('You cannot book without adult.', 1500);
            return;
        }

        let allChildrenHaveAge = true;
        for (let item of childrenAgeValues) {
            if (item == INVALID_CHILD_AGE) {
                allChildrenHaveAge = false;
                break;
            }
        }
        if (!allChildrenHaveAge) {
            this.refs.toast.show('Please select the age of each of the children.', 1500);
            return;
        }
        
        if (params && params.updateData) {
            params.updateData(this.state);
        }
        this.props.navigation.goBack();
    }

    render() {
        const { childrenAgeValues, children, adults, rooms } = this.state;

        return (
            <View style={styles.container}>
              <CloseButton onPress={this.onClose}/>
              <View style={styles.bodyRows}>
                <GuestRow title={"Adults"}   min={1} max={10} count={adults}     type={"adults"}     onChanged={this.onCountChange} />
                <GuestRow title={"Rooms"}    min={1} max={5}  count={rooms}      type={"rooms"}      onChanged={this.onCountChange} />
                <Separator isHR height={1} extraStyle={{backgroundColor: '#0002'}} />
                <GuestRow title={"Children"} min={0} max={10} count={children}   type={"children"}   onChanged={this.onCountChange} subtitle={"Age 0-17"} />
                <ChildrenView count={children} childrenAgeValues={childrenAgeValues} onChildChange={this.onChildChange} />
              </View>
              <View style={styles.bottomView}>
                <TouchableOpacity style={styles.doneButtonView} onPress={this.onDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              <Separator height={getSafeBottomOffset()} />
              
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

const mapStateToProps = (state) => {
    return {
        datesAndGuestsData: state.userInterface.datesAndGuestsData,
    };
}

const mapDispatchToProps = dispatch => ({
    setDatesAndGuestsData: bindActionCreators(setDatesAndGuestsData, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Guests);