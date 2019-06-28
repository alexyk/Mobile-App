import { Picker, Text, TextInput, View } from 'react-native';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import styles from './styles';

export default class GuestFormRow extends Component {
    static propTypes = {
        onFirstNameChange: PropTypes.func.isRequired,
        onLastNameChange: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            title: 'Mr',
            firstName: '',
            lastName: ''
        }

        this.onGenderChange = this.onGenderChange.bind(this);
    }
    
    componentDidMount() {
        this.setState({ ...this.props.guest });
    }

    onGenderChange = (value, index) => {
        this.setState({ title: value });
    }

    _renderGender() {
        return (
            <View style={styles.genderFlex}>
                <View style={[styles.gender]}>
                    <Picker 
                        selectedValue={this.state.title}
                        style={{ height: '100%', width: '100%'}}
                        itemStyle={{backgroundColor: '#fff', height: '100%', fontFamily: 'FuturaStd-Light', fontSize:17}}
                        onValueChange={this.onGenderChange}>
                        <Picker.Item label="Mr" value="Mr" />
                        <Picker.Item label="Mrs" value="Mrs" />
                    </Picker>
                </View>
            </View>
        )
    }

    _renderFirstName() {
        const { onFirstNameChange, itemIndex } = this.props;
        const { firstName } = this.state;

        return (
            <View style={styles.firstNameFlex}>
                <TextInput
                    style={[styles.formField]}
                    onChangeText={(text) => {
                        onFirstNameChange(itemIndex, text);
                        this.setState({ firstName: text });
                    }}
                    placeholder={itemIndex == 0 ? "First Name" : "Optional"}
                    underlineColorAndroid="#fff"
                    value={firstName}
                />
            </View>
        )
    }

    _renderLastName() {
        const { onLastNameChange, itemIndex } = this.props;
        const { lastName } = this.state;
        
        return (
            <View style={styles.lastNameFlex}>
                <TextInput
                    style={styles.formField}
                    onChangeText={(text) => {
                        onLastNameChange(itemIndex, text);
                        this.setState({ lastName: text });
                    }}
                    placeholder={itemIndex == 0 ? "Last Name" : "Optional"}
                    underlineColorAndroid="#fff"
                    value={lastName}
                />
            </View>
        )
    }

    render() {
        const key = this.props.guest.key;
        const no = parseInt(key)+1;

        return (
            
            <View style={styles.guestInfoWrapper} key={key}>

                {/* <ScrollView> */}
                    
                <Text style={styles.labelGuest}>Guest {no}</Text>
                <View style={styles.inputFieldsView}>
                    { this._renderGender() }
                    { this._renderFirstName() }
                    { this._renderLastName() }
                </View>
                    {/* </KeyboardAvoidingView> */}
                {/* </ScrollView> */}
            
               
                
            </View>
        )
    }
}
