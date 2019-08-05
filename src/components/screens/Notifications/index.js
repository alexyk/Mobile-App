import { ScrollView, Text, View } from 'react-native';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-native-customisable-switch';
import BackButton from '../../atoms/BackButton';
import styles from './styles';
import { userInstance } from '../../../utils/userInstance';
import LTIcon from '../../atoms/LTIcon';

class Notifications extends Component {
    state = {
        recieveEmailMessage: false,
        recieveTextMessage: true,
        recievePushNotificationMessages: true,
        recieveEmail: true,
        recieveText: true,
        recievePushNotification: true,
        checkZIndex: 1 // zIndex of switchCheckView
    }

    async componentDidMount(){
        let messageEmail = await userInstance.getMessageEmailNotification();
        let messageText = await userInstance.getMessageTextNotification();
        let messagePush = await userInstance.getMessagePushNotification();

        let reminderEmail = await userInstance.getReminderEmailNotification();
        let reminderText = await userInstance.getReminderTextNotification();
        let reminderPush = await userInstance.getReminderPushNotification();
        
        this.setState({
            recieveEmailMessage: messageEmail,
            recieveTextMessage: messageText,
            recievePushNotificationMessages: messagePush,
            recieveEmail: reminderEmail,
            recieveText: reminderText,
            recievePushNotification: reminderPush,
        });
    }

    renderSwitchIcon(isSwitched) {
        return (
            isSwitched ?
                <View style={[styles.switchCheckView, { zIndex: checkZIndex }]}>
                    <LTIcon textStyle={styles.switchCheckText} name={'check'} />
                </View>
                :
                <View style={[styles.switchUnCheckView, { zIndex: checkZIndex }]}>
                    <LTIcon textStyle={styles.unSwitchCheckText} name={'times'} />
                </View>
        )
    }

    render() {
        const { navigate } = this.props.navigation;
        const {
            recieveEmailMessage, recieveTextMessage, recievePushNotificationMessages, recieveEmail, recieveText,
            recievePushNotification, checkZIndex
        } = this.state;
        return (
            <View style={styles.container}>

                <View style={styles.heading}>

                    <BackButton onPress={() => navigate('PROFILE')} />

                    <View><Text style={styles.titleText}>Notifications</Text></View>

                </View>

                <ScrollView showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>

                    <View>

                        <View style={styles.navItem}>
                            <View>
                                <Text style={styles.navItemText}>Messages</Text>
                                <Text style={styles.navText}>Receive messages from hotels and guests</Text>
                            </View>
                        </View>


                        <View style={styles.navItem}>
                            <Text style={styles.navItemText}>Email</Text>

                            <View>
                                { this.renderSwitchIcon(recieveEmailMessage) }                            
                                {/* if you want to solve cross appearing above switch you need to set checkZIndex to 0 */}
                                <Switch
                                    value={recieveEmailMessage}
                                    onChangeValue={() => {
                                        userInstance.setMessageEmailNotification(!recieveEmailMessage)
                                        this.setState({ recieveEmailMessage: !recieveEmailMessage });
                                        setTimeout(() => this.setState({ checkZIndex: 1 }), 150);
                                    }}
                                    activeTextColor="#FFF"
                                    activeBackgroundColor="#DA7B61"
                                    inactiveBackgroundColor="#f0f1f3"
                                    switchWidth={62}
                                    switchBorderColor={recieveEmailMessage ? '#e4a193' : '#cccccc'}
                                    switchBorderWidth={1}
                                    buttonWidth={30}
                                    buttonHeight={30}
                                    buttonBorderRadius={15}
                                    buttonBorderColor="#fff"
                                    buttonBorderWidth={0}
                                    animationTime={this.animationTime}
                                    padding={false}
                                />
                            </View>

                        </View>


                        <View style={styles.navItem}>
                            <Text style={styles.navItemText}>Text Message</Text>
                            <View>
                                { this.renderSwitchIcon(recieveTextMessage) }
                                <Switch
                                    value={recieveTextMessage}
                                    onChangeValue={() => {
                                        userInstance.setMessageTextNotification(!recieveTextMessage)
                                        this.setState({ recieveTextMessage: !recieveTextMessage });
                                        setTimeout(() => this.setState({ checkZIndex: 1 }), 150);
                                    }}
                                    activeTextColor="#FFF"
                                    activeBackgroundColor="#DA7B61"
                                    inactiveBackgroundColor="#f0f1f3"
                                    switchWidth={62}
                                    switchBorderColor={recieveTextMessage ? '#e4a193' : '#cccccc'}
                                    switchBorderWidth={1}
                                    buttonWidth={30}
                                    buttonHeight={30}
                                    buttonBorderRadius={15}
                                    buttonBorderColor="#fff"
                                    buttonBorderWidth={0}
                                    animationTime={this.animationTime}
                                    padding={false}
                                />
                            </View>
                        </View>


                        <View style={styles.navItem}>


                            <Text style={styles.navItemText}>Push Notifications{'\n'}{'\n'}<Text style={styles.navText}>To your mobile or tablet device </Text></Text>

                            <View>
                                { this.renderSwitchIcon(recievePushNotificationMessages) }
                                <Switch
                                    value={recievePushNotificationMessages}
                                    onChangeValue={() => {
                                        userInstance.setMessagePushNotification(!recievePushNotificationMessages)
                                        this.setState({ recievePushNotificationMessages: !recievePushNotificationMessages });
                                        setTimeout(() => this.setState({ checkZIndex: 1 }), 150);
                                    }}
                                    activeTextColor="#FFF"
                                    activeBackgroundColor="#DA7B61"
                                    inactiveBackgroundColor="#f0f1f3"
                                    switchWidth={62}
                                    switchBorderColor={recievePushNotificationMessages ? '#e4a193' : '#cccccc'}
                                    switchBorderWidth={1}
                                    buttonWidth={30}
                                    buttonHeight={30}
                                    buttonBorderRadius={15}
                                    buttonBorderColor="#fff"
                                    buttonBorderWidth={0}
                                    animationTime={this.animationTime}
                                    padding={false}
                                />
                            </View>

                        </View>


                        <View style={styles.navItem}>
                            <View>
                                <Text style={styles.navItemText}>Reminders & Suggestions</Text>
                                <Text style={styles.navText}>
                                    Receive reminders, helpful tips to improve your trip and other messages
                                    related to your activites on Locktrip.
                                </Text>
                            </View>
                        </View>
                        <View style={styles.navItem}>
                            <Text style={styles.navItemText}>Email</Text>
                            <View>
                                { this.renderSwitchIcon(recieveEmail) }
                                <Switch
                                    value={recieveEmail}
                                    onChangeValue={() => {
                                        userInstance.setReminderEmailNotification(!recieveEmail)
                                        this.setState({ recieveEmail: !recieveEmail });
                                        setTimeout(() => this.setState({ checkZIndex: 1 }), 150);
                                    }}
                                    activeTextColor="#FFF"
                                    activeBackgroundColor="#DA7B61"
                                    inactiveBackgroundColor="#f0f1f3"
                                    switchWidth={62}
                                    switchBorderColor={recieveEmail ? '#e4a193' : '#cccccc'}
                                    switchBorderWidth={1}
                                    buttonWidth={30}
                                    buttonHeight={30}
                                    buttonBorderRadius={15}
                                    buttonBorderColor="#fff"
                                    buttonBorderWidth={0}
                                    animationTime={this.animationTime}
                                    padding={false}
                                />
                            </View>
                        </View>

                        <View style={styles.navItem}>
                            <Text style={styles.navItemText}>Text Message</Text>
                            <View>
                                { this.renderSwitchIcon(recieveText) }
                                <Switch
                                    value={recieveText}
                                    onChangeValue={() => {
                                        userInstance.setReminderTextNotification(!recieveText)
                                        this.setState({ recieveText: !recieveText });
                                        setTimeout(() => this.setState({ checkZIndex: 1 }), 150);
                                    }}
                                    activeTextColor="#FFF"
                                    activeBackgroundColor="#DA7B61"
                                    inactiveBackgroundColor="#f0f1f3"
                                    switchWidth={62}
                                    switchBorderColor={recieveText ? '#e4a193' : '#cccccc'}
                                    switchBorderWidth={1}
                                    buttonWidth={30}
                                    buttonHeight={30}
                                    buttonBorderRadius={15}
                                    buttonBorderColor="#fff"
                                    buttonBorderWidth={0}
                                    animationTime={this.animationTime}
                                    padding={false}
                                />
                            </View>
                        </View>


                        <View style={styles.navItem}>


                            <Text style={styles.navItemText}>Push Notifications{'\n'}{'\n'}<Text style={styles.navText}>To your mobile or tablet device </Text></Text>

                            <View>
                                { this.renderSwitchIcon(recievePushNotification) }
                                <Switch
                                    value={recievePushNotification}
                                    onChangeValue={() => {
                                        userInstance.setReminderPushNotification(!recievePushNotification)
                                        this.setState({ recievePushNotification: !recievePushNotification });
                                        setTimeout(() => this.setState({ checkZIndex: 1 }), 150);
                                    }}
                                    activeTextColor="#FFF"
                                    activeBackgroundColor="#DA7B61"
                                    inactiveBackgroundColor="#f0f1f3"
                                    switchWidth={62}
                                    switchBorderColor={recievePushNotification ? '#e4a193' : '#cccccc'}
                                    switchBorderWidth={1}
                                    buttonWidth={30}
                                    buttonHeight={30}
                                    buttonBorderRadius={15}
                                    buttonBorderColor="#fff"
                                    buttonBorderWidth={0}
                                    animationTime={this.animationTime}
                                    padding={false}
                                />
                            </View>

                        </View>

                    </View>
                </ScrollView>
            </View>
        );
    }
}

Notifications.propTypes = {
    // start react-navigation props
    navigation: PropTypes.object.isRequired
};

export default Notifications;
