import {StatusBar} from 'expo-status-bar'
import React from 'react'
import {StyleSheet, Button, Text, View} from 'react-native'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants';

export default function App() {

	const [pushToken, setPushToken] = React.useState(null)

	React.useEffect(() => {
		async function getToken() {
			const pushTokenResponse = await Notifications.getExpoPushTokenAsync()
			const pushToken = pushTokenResponse.data
			console.log('Received push token', pushToken)
			setPushToken(pushToken)
		}
		getToken()

	}, [])


	React.useEffect(() => {
		if (Platform.OS === 'android') {
			Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				enableVibrate: true,
				enableLights: true,
			})
		}

		Notifications.setNotificationHandler({
			//  The function should respond with a behavior object within 3 seconds, otherwise the notification will be discarded.
			// https://docs.expo.io/versions/latest/sdk/notifications/#setnotificationhandlerhandler-notificationhandler--null-void
			// @ts-ignore
			handleNotification: async (notification) => {
				return {
					shouldPlaySound: true,
					shouldSetBadge: true,
					shouldShowAlert: true,
					priority: Notifications.AndroidNotificationPriority.MAX,
				}
			},
			handleSuccess: (_notificationId) => {
			},
			handleError: async (notificationId) => {
				await Notifications.dismissNotificationAsync(notificationId)
			},
		})
	}, [])

	async function sendRemoteNotification() {
		await fetch("https://exp.host/--/api/v2/push/send", {
			"headers": {
				"accept": "application/json",
				"content-type": "application/json",
			},
			"body": `[{\"to\":\"${pushToken}\",\"title\":\"Remote notification\",\"body\":\"Remote notification body\"}]`,
			"method": "POST",
			"credentials": "omit"
		})
	}

	function showLocalNotification() {
		Notifications.scheduleNotificationAsync({
			content: {
				title: 'Local notification',
				body: 'Local notificationbody',
			},
			trigger: null
		})
	}

	return (
		<View style={styles.container}>
			<Button onPress={showLocalNotification} title={"Show local notification"} />
			<Text>{pushToken}</Text>
			<Button onPress={sendRemoteNotification} title={"Send remote notification"} />
			<StatusBar style="auto" />
			<Text>updates manifest field: {JSON.stringify(Constants.manifest.updates)}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
})