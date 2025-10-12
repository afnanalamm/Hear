import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Button,
	FlatList,
	Image,
	SafeAreaView,
	StyleSheet,
	Text,
	View
} from 'react-native';

const imgDir = FileSystem.StorageAccessFramework ? '' : (FileSystem as any).documentDirectory + 'images/';

export default function App() {
	const [uploading, setUploading] = useState(false);
	const [images, setImages] = useState<string[]>([]);

	// Ensure images directory exists
	const ensureDirExists = async () => {
		// @ts-ignore
		const dirInfo = await (FileSystem as any).getInfoAsync(imgDir);
		if (!dirInfo.exists) {
			// @ts-ignore
			await (FileSystem as any).makeDirectoryAsync(imgDir, { intermediates: true });
		}
	};

	// Load images from file system
	const loadImages = async () => {
		await ensureDirExists();
		// @ts-ignore
		const files = await (FileSystem as any).readDirectoryAsync(imgDir);
		if (files.length > 0) {
			setImages(files.map((f: string) => imgDir + f));
		}
	};

	// Save image to file system
	const saveImage = async (uri: string) => {
		await ensureDirExists();
		const filename = new Date().getTime() + '.jpeg';
		const dest = imgDir + filename;
		// @ts-ignore
		await (FileSystem as any).copyAsync({ from: uri, to: dest });
		setImages([...images, dest]); 
		// Update state with new image. Use spread operator to avoid overwriting. 
		// This works because setState replaces the state, it doesn't append to it. 
		// This works by creating a new array that contains all the previous images plus the new one. 
		// The spread operator (...) is used to spread the elements of the previous images array into the new array, 
		// Spreading means taking all the elements from an array and putting them into another array or function call. 
		// In this case, it takes all the elements from the images array and puts them into the new array, followed by the new image (dest).
	};

	// Upload image to server
	const uploadImage = async (uri: string) => {
		setUploading(true);

		// @ts-ignore
		await (FileSystem as any).uploadAsync('http://192.168.1.52:8888/upload.php', uri, {
			httpMethod: 'POST',
			uploadType: (FileSystem as any).FileSystemUploadType ? (FileSystem as any).FileSystemUploadType.MULTIPART : 'MULTIPART',
			fieldName: 'file'
		});

		setUploading(false);
	};

	// Delete image from file system
	const deleteImage = async (uri: string) => {
		// @ts-ignore
		await (FileSystem as any).deleteAsync(uri);
		setImages(images.filter((i: string) => i !== uri));
	};

	// Select image from library or camera
	const selectImage = async (useLibrary: boolean) => {
		let result: ImagePicker.ImagePickerResult;
		const options: any = {
			mediaTypes: ['photo'],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.75
		};

		if (useLibrary) {
			result = await ImagePicker.launchImageLibraryAsync(options);
		} else {
			await ImagePicker.requestCameraPermissionsAsync();
			result = await ImagePicker.launchCameraAsync(options);
		}

		// Save image if not cancelled
		if (!result.canceled) {
			saveImage(result.assets[0].uri);
		}
	};

	// Render image list item
	const renderItem = ({ item }: { item: string }) => {
		const filename = item.split('/').pop();
		return (
			<View style={{ flexDirection: 'row', margin: 1, alignItems: 'center', gap: 5 }}>
				<Image style={{ width: 80, height: 80 }} source={{ uri: item }} />
				<Text style={{ flex: 1 }}>{filename}</Text>
				<Ionicons.Button name="cloud-upload" onPress={() => uploadImage(item)} />
				<Ionicons.Button name="trash" onPress={() => deleteImage(item)} />
			</View>
		);
	};

	useEffect(() => {
		loadImages();
	}, []);

	return (
		<SafeAreaView style={{ flex: 1, gap: 20 }}>
			<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 20 }}>
				<Button title="Photo Library" onPress={() => selectImage(true)} />
				<Button title="Capture Image" onPress={() => selectImage(false)} />
			</View>

			<Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '500' }}>My Images</Text>
			<FlatList data={images} renderItem={renderItem} />

			{uploading && (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: 'rgba(0,0,0,0.4)',
							alignItems: 'center',
							justifyContent: 'center'
						}
					]}
				>
					<ActivityIndicator color="#fff" animating size="large" />
				</View>
			)}
		</SafeAreaView>
	);
}