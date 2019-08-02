import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Text, View, FlatList,TouchableOpacity, ProgressBarAndroid } from 'react-native';
import Image from 'react-native-remote-svg';

import styles from './styles';
import LTIcon from '../../atoms/LTIcon';

class Favorites extends Component {
    state = {
        isLoading: true,
    };

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

    constructor() {
        super();
    }

    componentDidMount() {

    }

    goToSingleWishList(){
        this.props.navigation.navigate('SingleWishlist');
    }

    renderProgressBar(){
        return(
            <View style={[styles.container,{justifyContent: "center", alignItems: "center"}]}>
                <ProgressBarAndroid
                    styleAttr="Inverse"
                    color="#cc8068" />
            </View>
        );
    }

    renderNoWishList(){
        const { navigate } = this.props.navigation;
        return(
            <View style={styles.container}>
                <View style={styles.placeholderImageView}>
                    <Image
                        style={styles.placeholderImage}
                        source={require('../../../assets/placeholder_favorites.png')}
                    />
                </View>
                <Text style={styles.title}>You don't have any added destinations yet.</Text>
                <Text style={styles.subtext}>Explore thousands of locations and add your favourites here.</Text>
                <TouchableOpacity onPress={this.onStartExploring} style={styles.buttonExplore}>
                    <Text style={styles.exploreBtnText}>Discover your next experience</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderWishList(){
        const { navigate } = this.props.navigation;
        return(
            <View style={styles.container}>
                <View style={styles.chatToolbar}>
                    <Text style={styles.title}>Wishlists</Text>
                </View>
                <View style={{width: '100%'}}>
                   <FlatList style={styles.flatList}
                    data="none"
                    renderItem={
                        ({item}) =>
                            <TouchableOpacity onPress={() => this.goToSingleWishList()} style={{flexDirection:'column', alignItems: 'center', marginTop: 10, marginBottom: 10}}>
                                <Image
                                    style={styles.placeholderImage}
                                    source={require('../../../assets/temple/overview.jpg')}
                                />
                                <View style={{flexDirection:'column', alignItems: 'flex-start', width:'90%'}}>
                                    <Text style={styles.subtitle}>Summer </Text>
                                    <LTIcon textStyle={[styles.subtitle,{fontSize: 8}]} name={'circle'} />
                                    <Text  style={styles.subtext}> 4 Listings </Text>
                                </View>
                            </TouchableOpacity>
                        }
                    />
                </View>
            </View>
        );
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={{flex: 1}}>
                {/* {this.state.isLoading && this.renderProgressBar()} */}
                {this.renderNoWishList()}
            </View>
        )
    }
    onStartExploring = () =>{
        this.props.navigation.navigate('EXPLORE');
    }
    onBackPress = () => {
        this.props.navigation.navigate('EXPLORE');
    }
}

export default Favorites;
