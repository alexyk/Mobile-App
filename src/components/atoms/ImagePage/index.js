import React, {Component} from 'react';
import {
  View,
  Modal,
  StatusBar
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Header from './viewer-header';
import Carousel from './carousel';
import TouchableImage from './touchable-image';
import PropTypes from 'prop-types';
import { DEFAULT_HOTEL_PNG } from '../../../config-settings';
import { imgHost } from '../../../config';


export default class ImageCarousel extends Component {

  static propTypes = {
    // indicatorAtBottom: PropTypes.boolean,
    // indicatorOffset: PropTypes.number,
    // images: [],
    // renderHeader: PropTypes.func,
    // renderFooter: PropTypes.func,
  }

  static defaultProps = {
    indicatorAtBottom: false,
    indicatorOffset: 0,
    images: [],
    renderHeader: ([], number) => {},
    renderFooter: ([], number) => {},
  }


  constructor(props) {
    super(props);

    const imageUrls = props.images.map((img, index) => {
      let resultImage = img;
      
      if (img.uri) {
        const url = img.uri;
        resultImage = { ...img, url };
      }

      console.log(`[ImagePage] Image ${index}`, {from:img,to:resultImage})

      return resultImage;
    })

    this.state = {
      showModal: false,
      imageIndex: 0,
      fromCarousel: false,
      imageUrls
    };
  }


  componentDidCatch(error) {
    console.warn(`[ImagePage] caught: ${error.message}, this: ${this}`,{error});
  }


  _onPressImg = (i) => {
    this.setState({
      showModal: true,
      imageIndex: i,
    });
  }


  _updateIndex = (i, fromCarousel) => {
    this.setState({
      imageIndex: i,
      fromCarousel,
    });
  }

  _closeModal = () => {
    this.setState({
      showModal: false,
    });
  }

  _onScroll = () => {
      this.scrolling = true;
  }

  _setScrollFalse = () => {
      this.scrolling = false;
  }

  _setPageChange = (activeIndex) => {
    this._setScrollFalse();
    this._updateIndex(activeIndex, true);
  }


  _renderStatusbar(showModal) {
    return (showModal && 
      <StatusBar
          backgroundColor="#000"
          barStyle="light-content"
      />
    )
  }


  _renderModal(showModal,imageIndex) {
    return (
      <Modal
        onRequestClose={this._closeModal}
        visible={showModal}
        transparent={true}>
        <ImageViewer
          renderHeader={() => <Header onClose={() => this._closeModal()}/>}
          onChange={this._updateIndex}
          saveToLocalByLongPress={false}
          imageUrls={this.state.imageUrls}
          failImageSource={{uri:`${imgHost + DEFAULT_HOTEL_PNG}`}}
          index={imageIndex}/>
      </Modal>
    )
  }
  
  
  _renderCarousel(images, indicatorOffset, indicatorAtBottom, fromCarousel, imageIndex, rest) {
    let extraPadding = {};

    if (
      (indicatorAtBottom === undefined || indicatorAtBottom)
        && indicatorOffset < 0)
    {
      extraPadding = {paddingBottom: -indicatorOffset};
    } else if (!indicatorAtBottom && indicatorOffset < 0) {
      extraPadding = {paddingTop: -indicatorOffset};
    }

    return (
      <View style={[extraPadding, {flex:1}]}>
        <Carousel
          {...rest}
          delay = {this.props.delay}
          contentContainer={{flex:1}}
          indicatorOffset={indicatorOffset}
          indicatorAtBottom={indicatorAtBottom}
          initialPage={imageIndex}
          fromCarousel={fromCarousel}
          onPageChange={this._setPageChange}
          onScroll={this._onScroll}
          onScrollBegin={this._setScrollFalse}
          >
          {
            /* this.scrolling prevent trigger onPress while is scrolling */
            images.map((img, i) => {
              return (
                <View key={`image_container_${i}`}>
                  <TouchableImage
                    style={{width:this.props.width, height:this.props.height}}
                    image={img}
                    onPress={this.scrolling ? () => {} : () => this._onPressImg(i)}
                    />
                </View>
              );
            })
          }
        </Carousel>
      </View>
    )
  }


  render() {
    const {images, renderHeader, renderFooter,
      indicatorAtBottom, indicatorOffset, ...rest} = this.props;
    const {showModal, imageIndex, fromCarousel} = this.state;


    return (
      <View style={{flex:1}} key={`image_${imageIndex}`} >

        { this._renderStatusbar(showModal) }

        { this._renderModal(showModal, imageIndex) }

        { renderHeader(images[imageIndex], imageIndex) }

        { this._renderCarousel(images, indicatorOffset, indicatorAtBottom, fromCarousel, imageIndex, rest) }

        { renderFooter(images[imageIndex], imageIndex) }
      </View>
    );
  }
}
