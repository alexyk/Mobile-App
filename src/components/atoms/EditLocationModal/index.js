import React, { Component } from 'react';
import { TextInput, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import _ from 'lodash';
import { getCities } from '../../../utils/requester';
import RNPickerSelect from 'react-native-picker-select';
import PropTypes from 'prop-types';
import styles from './styles';

class EditLocationModal extends Component {
    static propTypes = {
        onSave: PropTypes.func,
        onCancel: PropTypes.func,
        countries: PropTypes.array,
        countryId: PropTypes.number,
        cities: PropTypes.array,
        cityId: PropTypes.number,
    }

    static defaultProps = {
        onSave: () => {},
        onCancel: () => {},
    }

    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            cities: [],
            selectedCountryId: null,
            selectedCountryName: '',
            selectedCityId: null,
            selectedCityName: '',
        };
        this.getCities = this.getCities.bind(this);
    }

    componentWillMount() {
        countryArr = [];
        this.props.countries.map((item, i) => {
            countryArr.push({ 'label': item.name, 'value': item.id })
        });
        this.setState({
            countries: countryArr,
            selectedCityId: this.props.city.id,
            selectedCountryId: this.props.country.id,
            selectedCountryName: this.props.country.name,
        });

        this.getCities(this.props.country.id);
    }

    getCities(countryId) {
        cityArr = [];
        getCities(countryId, false).then(res => {
            if(res.content.length > 0) {
                res.content.map((item, i)=>{
                    cityArr.push({'label': item.name, 'value': item.id})
                })
                this.setState({
                    cities: cityArr,
                    selectedCityId: this.state.selectedCityId==null? cityArr[0].value: this.state.selectedCityId,
                })
                
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Edit Location</Text>
                    {/* <View style={{flex: 1}}> */}
                        <RNPickerSelect
                            items={this.state.countries}
                            placeholder={{
                                label: 'Choose your location',
                                value: null,
                            }}
                            onValueChange={(value) => {
                                this.setState({
                                    selectedCountryId: value,
                                    selectedCityId: null,
                                });
                                this.getCities(value);
                            }}
                            value={this.state.selectedCountryId}
                        />
                        {this.state.selectedCityId!==null && this.state.cities.length>0 &&
                            <RNPickerSelect
                                items={this.state.cities}
                                placeholder={{
                                    label: 'Choose your city',
                                    value: this.state.selectedCityId,
                                }}
                                onValueChange={(value) => {
                                    this.setState({
                                        selectedCityName: this.state.cities[index].label,
                                        selectedCityId: value,
                                    });
                                }}
                                value={this.state.selectedCityId}
                            />
                        }
                    {/* </View> */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={() => {
                                cId = this.state.selectedCityId
                                index = _.findIndex(this.state.cities, function(o){
                                    return o.value == cId;
                                })
                                city = {
                                    id: this.state.selectedCityId,
                                    name: this.state.cities[index].label==null? this.state.cities[0].label: this.state.cities[index].label,
                                }
                                country = {
                                    id: this.state.selectedCountryId,
                                    name: this.state.selectedCountryName
                                }
                                this.props.onSave(this.state.selectedCountryId==null? 0: country, city);
                            }}>
                            <View style={styles.SaveButton}>
                                <Text style={styles.buttonTitle}> Save </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.onCancel();
                            }}>
                            <View style={styles.CancelButton}>
                                <Text style={styles.buttonTitle}>Cancel</Text>
                            </View>
                        </TouchableOpacity>
                    </View>    
                </View>
            </View>
        )
    }
}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        // fontSize: 16,
        // paddingTop: 13,
        // paddingHorizontal: 10,
        // paddingBottom: 12,
        // borderWidth: 1,
        // borderColor: 'gray',
        // borderRadius: 4,
        // backgroundColor: 'white',
        // color: 'black',
    },
});

export default EditLocationModal;