import {
  AsyncStorage,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";

import BackButton from "../../atoms/BackButton";
import DateTimePicker from "react-native-modal-datetime-picker";
import EditAboutModal from "../../atoms/EditAboutModal";
import EditGenderModal from "../../atoms/EditGenderModal";
import EditLanguageModal from "../../atoms/EditLanguageModal";
import EditLocationModal from "../../atoms/EditLocationModal";
import EditNameModal from "../../atoms/EditNameModal";
import EditPhoneModal from "../../atoms/EditPhoneModal";
import EditSchoolModal from "../../atoms/EditSchoolModal";
import EditWorkModal from "../../atoms/EditWorkModal";
import Footer from "../../atoms/Footer";
import Image from "react-native-remote-svg";
import ImagePicker from "react-native-image-picker";
import ImageResizer from "react-native-image-resizer";
import PropTypes from "prop-types";
import UserPropertyItemTypeInfo from "../../atoms/UserPropertyItemTypeInfo";
import requester from "../../../initDependencies";
import _ from "lodash";
import styles from "./styles";
import { apiHost, domainPrefix, imgHost, PUBLIC_URL } from "../../../config";
import LTLoader from "../../molecules/LTLoader";
import { serverRequest } from "../../../services/utilities/serverUtils";
import { TIME_FORMATS } from "../../../config-settings";
import { bindActionCreators } from "redux";
import { setLoginDetails } from "../../../redux/action/userInterface";
import MessageDialog from "../../molecules/MessageDialog";

class EditUserProfile extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func
    })
  };

  static defaultProps = {
    navigation: {
      navigate: () => {}
    }
  };

  constructor(props) {
    super(props);


    const { loginDetails } = props;
    const { birthday, profileImage, preferredCurrency, preferredLanguage } = loginDetails;

    let day = "00";
    let month = "00";
    let year = "0000";
    if (birthday !== null) {
      let asMoment = moment.utc(parseInt(birthday));
      day = asMoment.format("DD");
      month = asMoment.format("MM");
      year = asMoment.format("YYYY");
    }

    this.state = {
      avatarSource: null,
      modalVisible: false,
      isDateTimePickerVisible: false,
      showProgress: false,
      image: profileImage,
      preferredCurrency: preferredCurrency == null ? 0 : preferredCurrency.id,
      preferredLanguage: preferredLanguage == null ? "English" : preferredLanguage,
      day, month, year,
      ...loginDetails,
      hasChanged: false
    };

    this._modalVisibleBeforeMessage = null;

    this.showMessage = this.showMessage.bind(this);
    this.onHideMessage = this.onHideMessage.bind(this);
    this.onPhoto = this.onPhoto.bind(this);
    this.onEditName = this.onEditName.bind(this);
    this.onAbout = this.onAbout.bind(this);
    this.onGender = this.onGender.bind(this);
    this.onBirthDate = this.onBirthDate.bind(this);
    this.onEmail = this.onEmail.bind(this);
    this.onPhone = this.onPhone.bind(this);
    this.onLocation = this.onLocation.bind(this);
    this.onSchool = this.onSchool.bind(this);
    this.onWork = this.onWork.bind(this);
    this.onLanguage = this.onLanguage.bind(this);
    this.onSaveName = this.onSaveName.bind(this);
    this.onSaveAbout = this.onSaveAbout.bind(this);
    this.onSaveGender = this.onSaveGender.bind(this);
    this.onSavePhone = this.onSavePhone.bind(this);
    this.onSaveLocation = this.onSaveLocation.bind(this);
    this.onSaveSchool = this.onSaveSchool.bind(this);
    this.onSaveWork = this.onSaveWork.bind(this);
    this.onSaveLanguage = this.onSaveLanguage.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.showModal = this.showModal.bind(this);
    this.showDateTimePicker = this.showDateTimePicker.bind(this);
    this.hideDateTimePicker = this.hideDateTimePicker.bind(this);
    this.handleDatePicked = this.handleDatePicked.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.onBackPress = this.onBackPress.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.countries != prevProps.countries) {
      this.setState({
        countries: this.props.countries
      });
    }
  }

  upperFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  showMessage(title, text, code="message", stylePreset=null) {
    let { modalView, modalVisible } = this.state;

    if (modalView && modalVisible) {
      this._modalVisibleBeforeMessage = true;
      this.setState({modalVisible: false});
    }

    MessageDialog.showMessage(title, text, code, stylePreset);
  }

  onHideMessage() {
    if (this._modalVisibleBeforeMessage) {
      this._modalVisibleBeforeMessage = false;
      this.setState({modalVisible: true});
    }
  }

  showModal() {
    return this.state.modalView;
  }

  async onPhoto() {
    let options = {
      title: "Select profile image",
      storageOptions: {
        skipBackup: true,
        path: "/"
      }
    };
    const token_value = await AsyncStorage.getItem(`${domainPrefix}.auth.locktrip`);
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        //console.log('User cancelled image picker');
      } else if (response.error) {
        //console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        //console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({
          showProgress: true
        });
        const { uri, originalRotation } = response;
        let rotation = 0;

        if (originalRotation === 90) {
          rotation = 90;
        } else if (originalRotation === 270) {
          rotation = -90;
        }

        ImageResizer.createResizedImage(uri, 500, 500, "JPEG", 80, rotation)
          .then(({ uri }) => {
            var data = new FormData();
            data.append("image", {
              uri: uri,
              name: "selfie.jpg",
              type: "image/jpg"
            });
            fetch(`${apiHost}users/me/images/upload`, {
              method: "post",
              headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data;",
                Authorization: token_value
              },
              body: data
            })
              .then(res => {
                res
                  .json()
                  .then(data => {
                    this.setState({
                      hasChanged: true,
                      showProgress: false,
                      image: data.thumbnail
                    });
                    this.props.setLoginDetails({profileImage:data.thumbnail});
                  })
                  .catch(err => {
                    //console.log('upload error', err);
                  });
              })
              .catch(err => {
                this.setState({
                  showProgress: false
                });
                //console.log('upload error', err);
              });
          })
          .catch(err => {
            this.setState({
              showProgress: false
            });
            //console.log( err )
          });
      }
    });
  }

  

  onEditName() {
    this.setState({
      modalVisible: true,
      modalView: (
        <EditNameModal
          onSave={(firstName, lastName) => this.onSaveName(firstName, lastName)}
          onCancel={() => this.onCancel()}
          firstName={this.state.firstName}
          lastName={this.state.lastName}
          onRequestClose={() => this.onCancel() }
        />
      )
    });
    this.showModal();
  }

  onAbout() {
    this.setState({
      modalVisible: true,
      modalView: (
        <EditAboutModal
          onSave={about => this.onSaveAbout(about)}
          onCancel={() => this.onCancel()}
          about={this.state.about}
          onRequestClose={() => {
            this.onCancel();
          }}
        />
      )
    });
    this.showModal();
  }

  onGender() {
    const { gender } = this.state;

    this.setState({
      modalVisible: true,
      modalView: (
        <EditGenderModal
          onSave={isFemale => this.onSaveGender(isFemale)}
          onCancel={() => this.onCancel()}
          isFemale={gender == "women" ? true : gender == 'men' ? false : null}
          onRequestClose={() => {
            this.onCancel();
          }}
        />
      )
    });
    this.showModal();
  }

  onBirthDate() {
    this.showDateTimePicker();
  }

  onEmail() {}


  onPhone() {
    this.setState({
      modalVisible: true,
      modalView: (
        <EditPhoneModal
          parent={this}
          showMessage={this.showMessage}
          onSave={pickerData => this.onSavePhone(pickerData)}
          onCancel={() => this.onCancel()}
          phone={this.state.phoneNumber}
          onRequestClose={() => this.onCancel()}
        />
      )
    });
    this.showModal();
  }

  onLocation() {
    const { countries } = this.props;
    const { country, countryState } = this.state;

    this.setState({
      modalVisible: true,
      modalView: (
        <EditLocationModal
          onSave={(country, countryState) => this.onSaveLocation(country, countryState)}
          onCancel={() => this.onCancel()}
          countries={countries}
          country={country}
          countryState={countryState}
          city={this.state.city}
        />
      )
    });

    this.showModal();
  }

  onSchool() {
    this.setState({
      modalVisible: true,
      modalView: (
        <EditSchoolModal
          onSave={school => this.onSaveSchool(school)}
          onCancel={() => this.onCancel()}
          school={this.state.school}
          onRequestClose={() => {
            this.onCancel();
          }}
        />
      )
    });
    this.showModal();
  }

  onWork() {
    this.setState({
      modalVisible: true,
      modalView: (
        <EditWorkModal
          onSave={work => this.onSaveWork(work)}
          onCancel={() => this.onCancel()}
          work={this.state.work}
          onRequestClose={() => {
            this.onCancel();
          }}
        />
      )
    });
    this.showModal();
  }

  onLanguage() {
    this.setState({
      modalVisible: true,
      modalView: (
        <EditLanguageModal
          onSave={language => this.onSaveLanguage(language)}
          onCancel={() => this.onCancel()}
          languageValue={this.state.preferredLanguage}
          onRequestClose={() => {
            this.onCancel();
          }}
        />
      )
    });
    this.showModal();
  }

  onSaveName(firstName, lastName) {
    this.setState({
      hasChanged: true,
      modalVisible: false,
      firstName: firstName,
      lastName: lastName
    });
  }

  onSaveAbout(about) {
    this.setState({
      hasChanged: true,
      modalVisible: false,
      about
    });
  }

  onSaveGender(isFemale) {
    let gender = isFemale ? "women" : "men";
    this.setState({
      hasChanged: true,
      modalVisible: false,
      gender
    });
  }

  onSavePhone(phone) {
    this.setState({
      hasChanged: true,
      modalVisible: false,
      phoneNumber: phone
    });
  }

  onSaveLocation(country, countryState) {
    // index = _.findIndex(this.props.countries, function (o) {
    //     return o.id == country.id;
    // })
    // country.name = this.props.countries[index].name
    this.setState({
      hasChanged: true,
      modalVisible: false,
      country, countryState
    });
  }

  onSaveSchool(school) {
    this.setState({
      hasChanged: true,
      modalVisible: false,
      school: school
    });
  }

  onSaveWork(work) {
    this.setState({
      hasChanged: true,
      modalVisible: false,
      work: work
    });
  }

  onSaveLanguage(language) {
    this.setState({
      hasChanged: true,
      modalVisible: false,
      preferredLanguage: language
    });
  }

  onCancel() {
    this.setState({
      modalVisible: false
    });
  }

  showDateTimePicker() {
    this.setState({ isDateTimePickerVisible: true });
  }

  hideDateTimePicker() {
    this.setState({ isDateTimePickerVisible: false });
  }

  handleDatePicked(date) {
    // here date is selected by the picker in local TZ
    const dateObject = {
      day: date.getDate().toString(),
      month: (date.getMonth()+1).toString(),
      year: date.getFullYear().toString()
    };
    this.setState(dateObject);
    this.hideDateTimePicker();
  }

  updateProfile() {
    this.setState({showProgress: true});

    const { firstName, lastName, phoneNumber, preferredLanguage, gender, locAddress, jsonFile, countryState, day, month, year } = this.state;

    let userInfo = {
      firstName, lastName, phoneNumber, preferredLanguage, gender, locAddress, jsonFile,
      preferredCurrency: parseInt(this.state.preferredCurrency, 10),
      country: parseInt(this.state.country.id, 10),
      countryState: countryState ? parseInt(countryState.id, 10) : "",
      birthday: `${day}/${month}/${year}`
    };

    //console.log("user info", userInfo);

    Object.keys(userInfo).forEach(
      key =>
        (userInfo[key] === null || userInfo[key] === "") && delete userInfo[key]
    );

    serverRequest(this, requester.updateUserInfo, [userInfo],
      (data) => {
        this.props.setLoginDetails(data);
        this.setState({showProgress: false});
      },
      (errorData, errorCode) => {
        this.setState({showProgress: false});
      }
    );
  }

  onBackPress = () => {
    this.props.navigation.goBack();
    this.props.navigation.state.params.updateGender(this.state.gender);
  };

  _renderDateTimePicker(day, month, year, isDateTimePickerVisible) {
    const asMoment = (year && moment.utc(`${day}/${month}/${year}`, TIME_FORMATS.SERVER_BIRTHDAY_UTC));
    let date = (year == "0000" || !year ? new Date() : asMoment.toDate());

    return (
      <DateTimePicker
        datePickerModeAndroid={"default"}
        date={date}
        isVisible={isDateTimePickerVisible}
        onConfirm={this.handleDatePicked}
        onCancel={this.hideDateTimePicker}
      />
    );
  }

  _renderBirthDate() {
    const { day, month, year } = this.state;

    return (
      <UserPropertyItemTypeInfo
        title="Birth date"
        info={year == "0000" ? 'DD/MM/YYYY' : `${day}/${month}/${year}`}
        onPress={this.onBirthDate}
      />

    )
  }


  render() {
    const { day, month, year, isDateTimePickerVisible, gender, country, countryState } = this.state;

    let imageAvatar = "";
    if (this.state.image != "") {
      if (this.state.image.indexOf("images/default.png".toLowerCase()) != -1) {
        imageAvatar = { uri: PUBLIC_URL + "images/default.png" };
      } else {
        imageAvatar = { uri: imgHost + this.state.image };
      }
    }

    let location = (country == null ? "" : country.name);
    if (location && countryState != null && countryState.name) {
      location = `${countryState.name}, ${location}`;
    }


    let genderAsString = (gender == "men" ? "Male" : (this.state.gender == 'women' ? "Female" : '( none selected )'));

    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.titleConatiner}>
            <BackButton style={styles.closeButton} onPress={() => this.onBackPress()} />
            <Text style={styles.title}>Edit Profile</Text>
          </View>
          <TouchableOpacity style={styles.cameraContainer} onPress={this.onPhoto}>
            <Image style={styles.cameraButton} source={require("../../../assets/png/camera.png")} />
          </TouchableOpacity>
        </View>
        <ScrollView showsHorizontalScrollIndicator={false} style={{ width: "100%" }}>
          <View style={styles.body}>
            <View style={styles.avatarWrapper}>
              {imageAvatar == "" ? (
                <Image style={styles.avatar} source={require("../../../assets/temple/user_profile_avatar.png")} />
              ) : (
                <Image style={styles.avatar} source={imageAvatar} />
              )}
            </View>

            <View
              style={[
                styles.lineStyle,
                {
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: 0,
                  marginBottom: 15
                }
              ]}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>
                {this.state.firstName} {this.state.lastName}
              </Text>
              <TouchableOpacity onPress={this.onEditName}>
                <Text style={styles.editButton}>Edit Name</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.lineStyle,
                {
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: 15,
                  marginBottom: 15
                }
              ]}
            />
            {/* <View style={styles.aboutContainer}>
              <Text style={styles.aboutText}>About me</Text>
              <Text style={styles.aboutText}>{this.state.about}</Text>
              <TouchableOpacity onPress={this.onAbout}>
                <Text style={[styles.editButton, { marginTop: 20 }]}>Edit about me</Text>
              </TouchableOpacity>
            </View> */}
            <View
              style={[
                styles.lineStyle,
                {
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: 15,
                  marginBottom: 20
                }
              ]}
            />
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleText}>Private Details</Text>
            </View>

            <UserPropertyItemTypeInfo title="Gender" info={this.upperFirst(genderAsString)} onPress={this.onGender} />
            <View style={styles.lineStyle} />

            { this._renderBirthDate(day, month, year) }
            <View style={styles.lineStyle} />

            <UserPropertyItemTypeInfo title="Email Address" info={this.state.email} onPress={this.onEmail} />
            <View style={styles.lineStyle} />

            <UserPropertyItemTypeInfo title="Phone" info={this.state.phoneNumber} onPress={this.onPhone} />

            <View style={{ marginTop: 15 }} />

            {/* <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleText}>Optional Details</Text>
            </View> */}

            <UserPropertyItemTypeInfo title="Country" info={location} onPress={this.onLocation} />
            <View style={styles.lineStyle} />

            {/* <UserPropertyItemTypeInfo title="School" info={this.state.school} onPress={this.onSchool} /> */}
            {/* <View style={styles.lineStyle} /> */}

            {/* <UserPropertyItemTypeInfo title="Work" info={this.state.work} onPress={this.onWork} /> */}
            {/* <View style={styles.lineStyle} /> */}

            {/* <UserPropertyItemTypeInfo style={{ marginBottom: 15 }} info={this.state.preferredLanguage} title="Languages" onPress={this.onLanguage} /> */}
          </View>
        </ScrollView>
        { this.state.hasChanged &&
            <Footer style={styles.footer} button={"Save"} fullButton={true} onClick={this.updateProfile} />
        }
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          fullScreen={false}
          onRequestClose={() => {
            this.onCancel();
          }}
        >
          {this.showModal()}
        </Modal>
        
        { this._renderDateTimePicker(day, month, year, isDateTimePickerVisible) }

        <LTLoader
          isLoading={this.state.showProgress}
          message="Saving Profile info..."
        />


        <MessageDialog
          parent={this}
          title={this.state.messageTitle}
          message={this.state.dialogMessage}
          isVisible={this.state.messageVisible}
          onHide={this.onHideMessage}
          onCancel={this.onHideMessage}
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginDetails: state.userInterface.loginDetails,
    countries: state.country.countries
  };
};
const mapDispatchToProps = dispatch => ({
  setLoginDetails: bindActionCreators(setLoginDetails, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditUserProfile);
