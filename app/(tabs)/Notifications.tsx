import { Text, View, ScrollView } from "react-native"; // importing commonly used components from "react-native" library
import { Link } from "expo-router"; // importing the Link component from expo router library

export default function Notifications() {
    // Creates an exportable functional object for this main .tsx file

    const CATEGORY_PILLS = [
  {
    title: 'First Item',
  },
  {
   title: 'Second Item',
  },
  {
    title: 'Third Item',
  },
];

    return (
        <View className="tabBody" id="notificationTabBody">
            
            <View>
                {/* <FlatList horizontal renderItem={
                    <Text>Hello</Text>
                }/> */}
            <ScrollView horizontal showsVerticalScrollIndicator={false}>
                    <Text style={{padding:15}}>Category1</Text>
                    <Text style={{padding:15}}>Category2</Text>
                    <Text style={{padding:15}}>Category3</Text>
                    <Text style={{padding:15}}>Category4</Text>
                    <Text style={{padding:15}}>Category5</Text>
                    <Text style={{padding:15}}>Category6</Text>
                    <Text style={{padding:15}}>Category7</Text>
            </ScrollView>

            <ScrollView style={{
                            padding:15, 
                            alignContent:"center",
                            borderColor: 'black',
                            alignSelf: 'stretch',
                            

                        }}
                        showsVerticalScrollIndicator={true}>
                    <Text style={{padding:15}}>Notification 1</Text>
                    <Text style={{padding:15}}>Notification 2</Text>
                    <Text style={{padding:15}}>Notification 3</Text>
                    <Text style={{padding:15}}>Notification 4</Text>
                    <Text style={{padding:15}}>Notification 5</Text>
                    <Text style={{padding:15}}>Notification 6</Text>
                    <Text style={{padding:15}}>Notification 7</Text>
                    <Text style={{padding:15}}>Notification 1</Text>
                    <Text style={{padding:15}}>Notification 2</Text>
                    <Text style={{padding:15}}>Notification 3</Text>
                    <Text style={{padding:15}}>Notification 4</Text>
                    <Text style={{padding:15}}>Notification 5</Text>
                    <Text style={{padding:15}}>Notification 6</Text>
                    <Text style={{padding:15}}>Notification 7</Text>
            </ScrollView>

            </View>




        </View>
        
    )
}