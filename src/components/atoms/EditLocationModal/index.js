import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import PropTypes from "prop-types";
import RNPickerSelect from "react-native-picker-select";
import styles from "./styles";
import requester from "../../../initDependencies";
import { serverRequest } from "../../../services/utilities/serverUtils";
import { getObjectFromPath, isArray, isNumber } from "js-tools";

class EditLocationModal extends Component {
  static propTypes = {
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    countries: PropTypes.array,
    countryId: PropTypes.number,
    countryState: PropTypes.object,
    cities: PropTypes.array,
    cityId: PropTypes.number
  };

  static defaultProps = {
    onSave: () => {},
    onCancel: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      countries: [],
      countryStates: [],
      country: null,
      countryState: null,
      lastCountry: null,
      // cities: [],
      // selectedCountryId: null,
      // selectedCountryName: '',
      // selectedCityId: null,
      // selectedCityName: '',
      // selectedStateId: '',
      hasCountryState: false
    };

    this.onCountrySelected = this.onCountrySelected.bind(this);
  }

  componentWillMount() {
    let { country, countries, countryState } = this.props;

    let hasCountryState = this.hasCountryState(country);
    countries = countries.map(item => ({ label: item.name, value: item }));

    this.setState({
        countries, hasCountryState, country, countryState,
        // selectedCityId: this.props.city==null? null: this.props.city.id,
        // selectedCountryId: this.props.country==null? null : this.props.country.id,
        // selectedCountryName: this.props.country==null? null : this.props.country.name,
        // selectedStateId: this.props.countryState==null? null : this.props.countryState.id,
      },
      () => this.setCountryStates()
    );

    // if (this.props.country != null){
    //     this.getCities(this.props.country.id );
    // }
  }

  hasCountryState(country) {
    if (country === undefined || country === null) {
      return false;
    }

    return ["Canada", "India", "United States of America"].includes(
      country.name
    );
  };

  processStates(states, extraData={}) {
    let countryStates = [];

    states.forEach((item, i) => {
      countryStates.push({
        label: item.name,
        value: item
      });
    });

    this.setState({countryStates, ...extraData});    
  }

  setCountryStates() {
    let { countryState, countryStates, country, lastCountry, hasCountryState: hasCountryStateFromState } = this.state;

    const hasStates = (hasCountryStateFromState || hasCountryState);
    const statesNeedUpdate = (!lastCountry || !countryStates || countryStates.length == 0);

    if (hasStates && statesNeedUpdate) {
      serverRequest(this, requester.getStates, [country.id],
        (data) => {
          if (isNumber(getObjectFromPath(countryState, "id"))) {
            const selected = data.filter(item => item.id == countryState.id);
            if (isArray(selected) && selected.length == 1) {
              countryState = selected[0];
            }
          }
          
          this.processStates(data, {countryState, lastCountry: country});
        }
      );
    }

  };

  onCountrySelected(value) {
    // this.setState({
    //     selectedCountryId: value,
    //     selectedCityId: null,
    // });
    // this.getCities(value);
    const hasCountryState = this.hasCountryState(value);
    
    this.setState({
      // countryId: value.id,
      // countryName: value.name,
      country: value != null && value != 0 ? value : null,
      countryStates: [],
      hasCountryState: hasCountryState,
      countryState: null
    });

    if (hasCountryState) {
      this.setCountryStates();
    }
  };

  // onCountrySelected = (value) => {
  //     const hasCountryState = this.hasCountryState(value);
  //     this.setState({
  //         // countryId: value.id,
  //         // countryName: value.name,
  //         country: value != 0 ? value : undefined,
  //         countryStates: [],
  //         hasCountryState: hasCountryState,
  //         countryState: '',
  //     });

  //     if (hasCountryState) {
  //         requester.getStates(value.id).then(res => {
  //             res.body.then(data => {
  //                 //console.log("countryStates", data);
  //                 this.setCountryStates(data);
  //             });
  //         });
  //     }
  // }

  // getCities(countryId) {
  //     cityArr = [];
  //     // requester.getCities(countryId, false).then(res => {
  //     //     res.body.then(data => {
  //     //         if (data.content.length > 0) {
  //     //             data.content.map((item, i) => {
  //     //                 cityArr.push({ 'label': item.name, 'value': item.id })
  //     //             })
  //     //             this.setState({
  //     //                 cities: cityArr,
  //     //                 selectedCityId: this.state.selectedCityId == null ? cityArr[0].value : this.state.selectedCityId,
  //     //             })
  //     //         }
  //     //     });
  //     // }).catch(err => {
  //     //     //console.log('error: ', err);
  //     // });
  // }

  render() {
    const { countries, countryState, countryStates, country, hasCountryState } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Edit Location</Text>
          {/* <View style={{flex: 1}}> */}
          <RNPickerSelect
            items={countries}
            placeholder={{
              label: "Choose your location",
              value: null
            }}
            onValueChange={value => this.onCountrySelected(value)}
            style={{ ...pickerSelectStyles }}
            value={country}
          />
          {hasCountryState && (
            <RNPickerSelect
              items={countryStates}
              placeholder={{
                label: "Choose your State",
                value: 0
              }}
              onValueChange={value => {
                this.setState({
                  countryState: value
                });
              }}
              style={{ ...pickerSelectStyles }}
              value={countryState}
            ></RNPickerSelect>
          )}
          {/* {this.state.selectedCityId !== null && this.state.cities.length > 0 &&
                        <RNPickerSelect
                            items={this.state.cities}
                            placeholder={{
                                label: 'Choose your city',
                                value: null,
                            }}
                            onValueChange={(value) => {
                                index = _.findIndex(this.state.cities, function (o) {
                                    return o.value == value;
                                })
                                this.setState({
                                    selectedCityName: this.state.cities[index].label,
                                    selectedCityId: value,
                                });
                            }}
                            style={{ ...pickerSelectStyles }}
                            value={this.state.selectedCityId}
                        />
                    } */}
          {/* </View> */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => {
                // cId = this.state.selectedCityId
                // index = _.findIndex(this.state.cities, function (o) {
                //     return o.value == cId;
                // })
                // city = {
                //     id: this.state.selectedCityId,
                //     name: this.state.cities[index].label == null ? this.state.cities[0].label : this.state.cities[index].label,
                // }
                // city = null;
                // country = {
                //     id: this.state.country.id,
                //     name: this.state.country.name
                // }
                this.props.onSave(this.state.country, this.state.countryState);
              }}
            >
              <View style={styles.SaveButton}>
                <Text style={styles.buttonTitle}> Save </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.props.onCancel();
              }}
            >
              <View style={styles.CancelButton}>
                <Text style={styles.buttonTitle}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    backgroundColor: "white",
    color: "black"
  }
});

export default EditLocationModal;
