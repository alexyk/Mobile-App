import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View, ListView, Platform } from 'react-native';
import { material } from 'react-native-typography';
import MaterialDialog from './MaterialDialog';

import colors from './colors';
import { FlatList } from 'react-native-gesture-handler';

export default class SingleSelectMaterialDialog extends Component {
  constructor(props) {
    super(props);

    let { items, selected } = props;
    let selectedIndex = items.findIndex(item => item.label === selected);
    this.state = { selectedIndex };

    this.renderItem = this.renderItem.bind(this);
  }

  onRowPress(index) {
    const { items } = this.props;

    this.setState({ selectedIndex: index });
    this.props.onOk( { selectedItem: items[index] } );
  }

  renderItem({item, index}) {
    const isSelected = (index == this.state.selectedIndex);

    return (
      <TouchableOpacity key={item.value} onPress={() => this.onRowPress(index)}>
        <View style={isSelected ? styles.rowContainerSelected : styles.rowContainer}>
          {/* <View style={styles.iconContainer}>
            <Icon
              name={row.selected ? 'radio-button-checked' : 'radio-button-unchecked'}
              color={this.props.colorAccent}
              size={24}
            />
          </View> */}
          <Text style={[material.subheading, {fontSize:15}]}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    const {
      title, titleColor, colorAccent, visible, scrolled, onCancel, items
    } = this.props;
    const { selectedIndex } = this.state;

    return (
      <MaterialDialog
        title={title}
        titleColor={titleColor}
        colorAccent={colorAccent}
        visible={visible}
        scrolled={scrolled}
        onCancel={onCancel}
      >
        <FlatList data={items} renderItem={this.renderItem} />
      </MaterialDialog>
    );
  }
}

const styles = StyleSheet.create({
  rowContainer: {
    height: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  rowContainerSelected: {
    height: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#5555'
  },
  iconContainer: {
    marginRight: 16,
  },
});

SingleSelectMaterialDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedItem: PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
  }),
  title: PropTypes.string,
  titleColor: PropTypes.string,
  colorAccent: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  cancelLabel: PropTypes.string,
  okLabel: PropTypes.string,
  scrolled: PropTypes.bool,
};

SingleSelectMaterialDialog.defaultProps = {
  selectedItem: undefined,
  title: undefined,
  titleColor: undefined,
  colorAccent: colors.androidColorAccent,
  cancelLabel: undefined,
  okLabel: undefined,
  scrolled: false,
};
