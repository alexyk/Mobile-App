import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, SafeAreaView} from 'react-native';
import Image from 'react-native-remote-svg';
import styles, {orderbyPickerSelectStyles,priceMultiSliderStyle} from './styles';
import PropTypes from 'prop-types';
import CheckBox from 'react-native-checkbox';
import RNPickerSelect from 'react-native-picker-select';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import LTLoader from '../../../molecules/LTLoader';
import { setIsApplyingFilter } from '../../../../redux/action/userInterface'
import { log } from '../../../../config-debug'


class HotelFilters extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func
    }),
  }
  static defaultProps = {
    navigation: {
      navigate: () => {}
    },
  }

  constructor(props) {
    super(props);

    const { params } = this.props.navigation.state;
    //log('HOTELS-FILTER',`See filter params, priceRange: ${params.priceRange}`, params)
		
    this.state = {
      isHotelSelected: true,
      selectedRating: 4,
      showUnAvailable: false,
      nameFilter: params.nameFilter,
      count: {
        beds: 2,
        bedrooms: 0,
        bathrooms: 0
      },
      rooms : [{ adults: 2, children: [] }],
      orderBy: params.orderBy,
      selectedRating: [false,false,false,false,false],
      priceItems: [
        {
          label: 'Rank',
          value: 'rank,desc'
        },
        {
          label: 'Lowest price',
          value: 'priceForSort,asc'
        },
        {
          label: 'Highest price',
          value: 'priceForSort,desc'
        }
      ]
    }
    this.preparePriceValues(params)
    this.state.selectedRating = params.selectedRating
    this.state.showUnAvailable = params.showUnAvailable
    this.state.nameFilter = params.nameFilter
    //this.state.count = params.count
    
    this.onPriceValuesChange = this.onPriceValuesChange.bind(this);
  }

  preparePriceValues(params) {
    let {0:min, 1:max} = params.priceRange;
    if (min>max) {max = min, min = 0}
    let {0:price1, 1:price2} = params.priceRangeSelected;
    price1 = Math.round(price1)
    price2 = Math.round(price2)
    if (price1>price2) {price1 = min, price2 = max}
    this.optionsArray = [];
    min = Math.round(min)
    max = Math.trunc(max) + 1
    for (let n=min; n<max; n++) {
      this.optionsArray.push(n)
    }
    this.optionsArray.push(max)
    
    this.priceMin = min;
    this.priceMax = max;
    this.state.priceRange = [price1, price2];
  }

  componentWillReceiveProps(nextProps) {
    // go back to previous screen when isLoading is false and was true
    /* const prevIsLoading = this.props.isLoading;
    const isLoadingChangedToTrue = (prevIsLoading && !nextProps.isLoading)
    if (isLoadingChangedToTrue) {
      this.props.navigation.goBack();
    } */
    
    // console.tron.log('Will receive props', {nextProps,prevProps:this.props})
  }

  handleRatingChange(index, status){
    //console.log(status);
    const items = this.state.selectedRating;
    items[index] = status;

    // update state
    this.setState({
      items,
    });
  }

  onPriceValuesChange({0:min,1:max}) {
    //log('multi-slider',`onPriceValuesChange   min:${min}/${typeof(min)} max:${max}/${typeof(max)}`, {min,max})
  }

  multiSliderValuesChange = (values) => {
    this.setState({
      priceRange: values,
    });
    }

  addCount(type) {
    let count = Object.assign({}, this.state.count);
    if(type === 0) {
      count.beds++;
      this.setState({
        count
      });
    } else if(type === 1) {
      count.bedrooms++;
      this.setState({
        count
      });
    } else if(type === 2) {
      count.bathrooms++;
      this.setState({
        count
      });
    }
  }

  subtractCount(type) {
    let count = Object.assign({}, this.state.count);
    if(type === 0) {
      if(count.beds === 0) return;
      count.beds--;
      this.setState({
        count
      });
    } else if(type === 1) {
      if(count.bedrooms === 0) return;
      count.bedrooms--;
      this.setState({
        count
      });
    } else if(type === 2) {
      if(count.bathrooms === 0) return;
      count.bathrooms--;
      this.setState({
        count
      });
    }
  }

  onBackPress = () => {
    this.props.navigation.goBack();
  }

  onFilter = () => {
    this.props.setIsApplyingFilter(true);
    this.props.navigation.goBack();
    
    const func = this.props.navigation.state.params.updateFilter;
    const state = this.state;
    setTimeout(
    	() => func(state, true),
    	300
    )
  }

  renderBackButton() {
    return (
      <View style={styles.backButton}>
        <TouchableOpacity onPress={this.onBackPress}>
          <Image style={styles.btn_backImage} source={require('../../../../assets/close.png')}/>
        </TouchableOpacity>
        <Text style={styles.titleText}>Filters</Text>
      </View>
    )
  }

  renderHeaderIcon() {
    return (
      <View style={styles.residenceView}>
        <TouchableOpacity style={[styles.residence, this.state.isHotelSelected? styles.selected: '']}>
          {
            this.state.isHotelSelected &&
            <Image source={require('../../../../assets/png/Filters/check.png')} style={styles.tick}/>
          }
          <Image source={require('../../../../assets/png/Filters/hotel.png')} style={styles.headerIcons}/>
        </TouchableOpacity>
        <Text style={styles.residenceType}>Hotel</Text>
      </View>
    )
  }

  renderFilterByName() {
    return (
      <View style={styles.filterComponentHorizontalContainer}>
        <View style= {this.state.isHotelSelected ? styles.nameView :styles.emptyPricingView}>
          <Text style={styles.pricingText}>Name</Text>
        </View>
        <TextInput
          value={this.state.nameFilter}
          ref={(i) => { this.input = i; }}
          underlineColorAndroid={'transparent'}
          onChangeText={(text) => this.setState({nameFilter: text})}
          style={styles.nameTextInput}
        />
      </View>
    )
  }

  renderFilterAvailability() {
    return (
      <View style={styles.filterComponentHorizontalContainer}>
        <View style= {this.state.isHotelSelected ? styles.pricingView :styles.emptyPricingView}>
          <Text style={styles.pricingText}>Availability</Text>
        </View>
        <CheckBox
          checkboxStyle={{height: 15, width: 15, marginLeft: 15}}
          label='Show Unavailable'
          checked={this.state.showUnAvailable}
          onChange={(checked) => this.setState({showUnAvailable: !checked})}
        />
      </View>
    )
  }

  renderFilterOrderBy() {
    return (
      <View style={styles.filterComponentHorizontalContainer}>
        <View style= {this.state.isHotelSelected ? styles.orderByTitle :styles.emptyPricingView}>
          <Text style={styles.pricingText}>Order By</Text>
        </View>
        <View style={styles.orderyByPickerWrap}>
            <RNPickerSelect
                items={this.state.priceItems}
                onValueChange={(value) => {
                    this.setState({orderBy: value})
                }}
                value={this.state.orderBy}
                style={orderbyPickerSelectStyles}
            />
        </View>
      </View>
    )
  }

  renderFilterStars() {
    return (
      <View style={styles.starRatingView}>
      
        <Text style={styles.starRatingText}>Star Rating</Text>
        
        <View style={styles.starView}>
          <TouchableOpacity style={[styles.starBox, this.state.selectedRating[0] === true ? styles.activeRating: '']} 
            onPress={() => this.handleRatingChange(0, this.state.selectedRating[0] ? false : true)}>
            <Text style={[styles.ratingNumber, this.state.selectedRating[0] === true ? styles.activeRatingText: '']}>1</Text>
            <Image source={require('../../../../assets/png/empty-star.png')} style={styles.star}/>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.starBox, this.state.selectedRating[1] === true ? styles.activeRating: '']} 
          onPress={() => this.handleRatingChange(1, this.state.selectedRating[1] ? false : true)}>
            <Text style={[styles.ratingNumber, this.state.selectedRating[1] === true ? styles.activeRatingText: '']}>2</Text>
            <Image source={require('../../../../assets/png/empty-star.png')} style={styles.star}/>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.starBox, this.state.selectedRating[2] === true ? styles.activeRating: '']} 
          onPress={() => this.handleRatingChange(2, this.state.selectedRating[2] ? false : true)}>
            <Text style={[styles.ratingNumber, this.state.selectedRating[2] === true ? styles.activeRatingText: '']}>3</Text>
            <Image source={require('../../../../assets/png/empty-star.png')} style={styles.star}/>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.starBox, this.state.selectedRating[3] === true ? styles.activeRating: '']} 
          onPress={() => this.handleRatingChange(3, this.state.selectedRating[3] ? false : true)}>
            <Text style={[styles.ratingNumber, this.state.selectedRating[3] === true ? styles.activeRatingText: '']}>4</Text>
            <Image source={require('../../../../assets/png/empty-star.png')} style={styles.star}/>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.starBox, this.state.selectedRating[4] === true ? styles.activeRating: '']} 
          onPress={() => this.handleRatingChange(4, this.state.selectedRating[4] ? false : true)}>
            <Text style={[styles.ratingNumber, this.state.selectedRating[4] === true ? styles.activeRatingText: '']}>5</Text>
            <Image source={require('../../../../assets/png/empty-star.png')} style={styles.star}/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderFilterPricing() {
    const {0:min,1:max} = [this.state.priceRange[0], this.state.priceRange[1]]
    return (
      <View>
        <View style= {this.state.isHotelSelected ? styles.pricingView :styles.emptyPricingView}>
          <Text style={styles.pricingText}>Pricing</Text>
          <CheckBox
            checkboxStyle={{height: 15, width: 15, marginLeft: 15}}
            label='Show Unavailable'
            checked={this.state.showUnAvailable}
            onChange={(checked) => this.setState({showUnAvailable: !checked})}
           />
        </View>
        
        <View style={{flex:1, flexDirection: 'column', alignItems: 'center'}}>
          <View style={{width: '80%', flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>{this.props.currencySign} {this.state.priceRange[0]}</Text>
            <Text>{this.props.currencySign} {this.state.priceRange[1]}</Text>
          </View>
          <MultiSlider
            selectedStyle = {{backgroundColor: '#cc8068',}}
            unselectedStyle = {{backgroundColor: 'silver',}}
            values = {[min,max]}
            optionsArray = {this.optionsArray}
            markerStyle={priceMultiSliderStyle.markerStyle}
            pressedMarkerStyle={priceMultiSliderStyle.pressedMarkerStyle}
            touchDimensions={{height: 70,width: 70,borderRadius: 15,slipDisplacement: 200}}
            onValuesChange={this.onPriceValuesChange}
            onValuesChangeFinish={this.multiSliderValuesChange}
          />
          {/* <View style={{width: '80%', flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>{this.props.currencySign} 0</Text>
            <Text>{this.props.currencySign} 5000</Text>
          </View> */}
        </View>
      </View>
    )
  }

  renderSeparator() {
      return(
          <View style={styles.separator} />
      )
  }

  renderApplyButton() {
      return (
        <TouchableOpacity onPress={this.onFilter}>
            <View style={styles.searchButtonView}>
            <Text style={styles.searchButtonText}>Apply Filters</Text>
            </View>
        </TouchableOpacity>
      )
  }

  render() {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          { this.renderBackButton() }

          <ScrollView>
            <View style={{height: '100%',}}>
              { this.renderHeaderIcon()           }

              { this.renderFilterByName()         }
              { this.renderSeparator()            }

              {/* { this.renderFilterAvailability()   } */}
              {/* { this.renderSeparator()            } */}

              { this.renderFilterOrderBy()        }
              { this.renderSeparator()            }

              { this.renderFilterStars()          }
              { this.renderSeparator()            }

              { this.renderFilterPricing()        }

              { this.renderApplyButton()          }
            </View>
          </ScrollView>
          {/* <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.doneButton} onPress={this.onSearchPress.bind(this)}>
              <Text style={styles.doneButtonText}>Show Hotels</Text>
            </TouchableOpacity>
          </View> */}
        
        <LTLoader isLoading={this.props.isApplyingFilter} 
          style={{height:'80%', marginTop:'20%'}}
        />
          
        </View>
      </SafeAreaView>
    )
  }

  onSearchPress(){
    const { params } = this.props.navigation.state;

    var countArray = []
    var counts = {};
    var arrayRooms = new Array(this.state.count.bedrooms);
    if (params.adults < this.state.count.bedrooms){
      alert('Adults are less than rooms selected');
    }
    else {
      var j = 0;
      while(params.adults != 0){
        arrayRooms.push(
          j
        );
        params.adults -= 1
        j += 1
        if (j == this.state.count.bedrooms){
          j = 0
        }
      }
      arrayRooms = arrayRooms.filter(function(n){ return n != undefined }); 
      for (var i = 0; i < arrayRooms.length; i++) {
        var num = arrayRooms[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
      }
      this.state.rooms = []
      for (var k = 0; k < this.state.count.bedrooms; k++){
        this.state.rooms.push(
          { adults: counts[k], children: [] }
        )
      }
    }
    
    //console.log(this.state.rooms);
    this.props.navigation.navigate('WebviewScreen', {
      searchedCity: params.search, 
      searchedCityId: 72, 
      checkInDate : params.checkInDate, 
      checkOutDate : params.checkOutDate, 
      guests: params.guests, 
      children: params.children, 
      //these props are for parameters in the next class
      regionId: params.regionId,
      currency: params.currency,
      checkOutDateFormated: params.checkOutDateFormated,
      checkInDateFormated: params.checkInDateFormated, 
      roomsDummyData: encodeURI(JSON.stringify(this.state.rooms))
    });
  }
}

let mapStateToProps = (state) => {
  return {
    currency: state.currency.currency,
    currencySign: state.currency.currencySign,
    isApplyingFilter: state.userInterface.isApplyingFilter
  };
}

const mapDispatchToProps = dispatch => ({
  setIsApplyingFilter: bindActionCreators(setIsApplyingFilter, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(HotelFilters);