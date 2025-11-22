import React from "react";
import { Text, View, ScrollView, StyleSheet } from "react-native";

function CategoryPill({ title }: { title: string }) {
    return <Text style={styles.pillText}>{title}</Text>;
}
function NotificationItem({ text }: { text: string }) {
    return <Text style={styles.notificationText}>{text}</Text>;
}
export default function Notifications() {
    const CATEGORY_PILLS = [];
    for (let index = 0; index < 10; index++) {
        CATEGORY_PILLS.push({ title: `Category ${index + 1}` })
    }
    const NOTIFICATIONS = [];
        for (let index = 0; index < 15; index++) {
            NOTIFICATIONS.push(`Notification ${index + 1}`);                    
    }

    return (
        <View style={styles.tabBody} id="notificationTabBody">
            <View style={styles.container}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}
                >
                    {CATEGORY_PILLS.map((pill, idx) => (
                        <CategoryPill key={idx} title={pill.title} />))}
                </ScrollView>
                <ScrollView
                    style={styles.notificationsScroll}
                    showsVerticalScrollIndicator={true}
                >
                    {
                    NOTIFICATIONS.map((n, i) => (
                        <NotificationItem key={i} text={n} />))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabBody: {
        flex: 1,
        backgroundColor: "#fff",},
    container: {
        flex: 1,},
    categoryScrollContent: {
        alignItems: "center",
        paddingVertical: 8,},
    pillText: {
        padding: 15,},
    notificationsScroll: {
        padding: 15,
        alignContent: "center",
        borderColor: "black",
        alignSelf: "stretch",},
    notificationText: {
        padding: 15,
    },
});