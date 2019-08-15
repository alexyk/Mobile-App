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
import CheckBox from 'react-native-checkbox';
import styles from './styles';
import {
    prepareChildrenAgeValues, updateChildAgesCache, INVALID_CHILD_AGE, prepareInitialRoomsWithChildrenData, updateRoomsWithChildrenData,
    modifyChildAgeInRoom
} from './utils';
import Separator from '../../atoms/Separator';
import ChildrenRooms from '../../molecules/ChildrenRooms';
import { HOTEL_ROOM_LIMITS } from '../../../config-settings';
import { cloneDeep } from 'lodash';


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
            childrenAgeValues: cloneDeep(childrenAgeValues),
            hasChildren: false
        };
        this._childAgesCached = cloneDeep(childrenAgeValues);

        this.onClose = this.onClose.bind(this);
        this.onDone = this.onDone.bind(this);
        this.onCountChange = this.onCountChange.bind(this);
        this.onChildChange = this.onChildChange.bind(this);
        this.onWithChildrenClick = this.onWithChildrenClick.bind(this);
    }


    /**
     * Sets the state of type with the updated value of count
     * @param {String} type One of 'rooms', 'adults' or 'children'
     * @param {Number} count 
     * @param {Number} roomIndex 
     */
    onCountChange(type, count, roomIndex=null) {
        const { childrenAgeValues } = this.state;
        let newValue = count;
        let extraValues = {};
        let newAgeValues;

        switch (type) {
            case 'children':
                // since children are set per room - total children count (newValue) is a sum of count of all rooms
                newValue = 0;
                childrenAgeValues.forEach(item => newValue += item.length);

                // update children count in the room
                newAgeValues = cloneDeep(childrenAgeValues);
                let cached = this._childAgesCached[roomIndex];
                newAgeValues[roomIndex] = prepareChildrenAgeValues(count, cached);
                extraValues = { childrenAgeValues: newAgeValues };

                // update cache
                updateChildAgesCache(roomIndex, count, cached)
                this._childAgesCached[roomIndex] = cached;
                break;
        
            case 'rooms':
                newAgeValues = updateRoomsWithChildrenData(count, childrenAgeValues);
                extraValues = { childrenAgeValues: newAgeValues };
                break;
            case 'adults':
                const { rooms } = this.state;
                if (newValue < rooms) {
                    extraValues = {rooms: newValue};
                }
                break;
        }
        this.setState( {[type]: newValue, ...extraValues} );
    }

    onWithChildrenClick(value) {
        const { rooms } = this.state;
        const childrenAgeValues = prepareInitialRoomsWithChildrenData(rooms, this._childAgesCached)
        for (let roomIndex = 0; roomIndex < rooms; roomIndex++) {
            updateChildAgesCache(roomIndex, 0, this._childAgesCached);
        }
        
        this.setState({
            hasChildren: !value,
            childrenAgeValues
        });
    }

    onChildChange(roomIndex, data) {
        const newValue = modifyChildAgeInRoom(roomIndex, )
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
        const { childrenAgeValues, children, adults, rooms, hasChildren } = this.state;
        const maxRooms = (Math.min(HOTEL_ROOM_LIMITS.MAX.ROOMS, adults));

        return (
            <View style={styles.container}>
              <CloseButton onPress={this.onClose}/>
              <View style={styles.bodyRows}>
                <GuestRow title={"Adults"}   min={HOTEL_ROOM_LIMITS.MIN.ADULTS} max={HOTEL_ROOM_LIMITS.MAX.ADULTS} count={adults}     type={"adults"}     onChanged={this.onCountChange} subtitle={'at least 1 adult per room'} />
                <GuestRow title={"Rooms"}    min={HOTEL_ROOM_LIMITS.MIN.ROOMS}  max={maxRooms}                     count={rooms}      type={"rooms"}      onChanged={this.onCountChange} />
                <CheckBox
                    checkboxStyle={styles.withChildrenCheckbox}
                    label={ 'With Children' }
                    checked={ hasChildren }
                    onChange={this.onWithChildrenClick}
                />
                <Separator isHR={hasChildren} height={1} margin={10} />
                <ChildrenRooms data={{children, childrenAgeValues, rooms}} hasChildren={hasChildren}  onCountChange={this.onCountChange} onChildChange={this.onChildChange} />
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

const mapStateToProps = (state) => {
    return {
        datesAndGuestsData: state.userInterface.datesAndGuestsData,
    };
}

const mapDispatchToProps = dispatch => ({
    setDatesAndGuestsData: bindActionCreators(setDatesAndGuestsData, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Guests);