// aya asly & sewar khateeb
/* date: 3.4.2024 */
// the extensions that the code imports: Ejs , Express Js
// This project presents a dynamic site for 4 animal profiles:

var express = require('express');
var app = express();
const fs = require('fs');
const path = require('path');
app.use(express.json());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// 1
/**
 * Parses key-value pairs from a given text by splitting it.
 * @param {string} text - The text to parse.
 * @returns {Array} An array of key-value pairs extracted from the text.
 */
function parseKeyValuePairs(text) {
    const lines = text.split('\n');// split the text into a lines
    const keyValuePairs = []; // An array that contains the first key, then the value of the key. which is in bio  

    lines.forEach(line => {
        const [key, value] = line.split(/:(?!\/\/)/);  // we need to split according to: but we need to notice that there are links and within the links there is also: therefor we will use according to (/:(?!\/\/)/) 
        if (key && value) {
            keyValuePairs.push({key: key.trim(), value: value.trim()}); //trim remove empty space from the string
        }
    });
// In this function we used chatgpt a bit
    return keyValuePairs;
}

//2
/**
 * Gets the list of folders in the 'public' directory that contain a 'profile.png' image.
 * @returns {Array} An array of objects containing the folder name and the path to the profile image.
 *                  Returns null if an error occurs.
 */
function getProfileImages() {
    const publicPath = path.join(__dirname, 'public');
    const CSS_FOLDER = 'css';

    try {
    const dogFolders = [];
    fs.readdirSync(publicPath, {withFileTypes: true})
       .filter(item => item.isDirectory()) // Filter out non-directory files
          .forEach(item => { dogFolders.push(item.name); });   //   and push their names to the 'dogFolders' array
        //    so "dogFolders" give me  ['jessy', 'liviling', 'mickey' ...]
        
        
        const profiles = [];   //  the array of folder that return names and profile image paths
        dogFolders.filter(dogFolder => dogFolder !== CSS_FOLDER) //must to filter out the 'css' folder, because the css is existing in separate folder
          .forEach(dogFolder => {
              const profileImagePath = path.join(dogFolder, 'profile.png');      // Construct the profile image path using the folder name
              profiles.push({ name: dogFolder, profileImage: profileImagePath });    // Create a profile object with name and profileImage properties and push it to the profiles array

          });


        // 
        return profiles;  } 
        catch (error) {
        console.error('Error:', error);
        return null;}}




//3
/**
 * Retrieves information about an animal based on its ID.
 * @param {string} id - The ID/NAME of the animal.
 * @returns {Object} An object containing information about the animal, including its name, title, bio, image files, and endorsements.
 *                        Returns null if an error occurs.
 */
function getAnimalInfo(id) {
    const PRIVATE_FOLDER = 'private';
    const PUBLIC_FOLDER = 'public';

    const privatePath = path.join(__dirname, PRIVATE_FOLDER, id);
    const publicPath = path.join(__dirname, PUBLIC_FOLDER, id);

    try {
        const title = fs.readFileSync(path.join(privatePath, 'title.txt'), 'utf8').split('\n');
        const bio = fs.readFileSync(path.join(privatePath, 'bio.txt'), 'utf8');
        const parsedBio = parseKeyValuePairs(bio);
        const files = fs.readdirSync(publicPath);  //  Read the contents/txts of the 'publicPath' directory synchronously and store the result in the 'files' variable
      
        const imageFiles = [];
            files.filter(file => file.endsWith('.png')).forEach(file => { // It means to do FILTER and it will give me the files found in PNG
                imageFiles.push(id + '/' + file);  //   For each file give me the : id and the file
                            // for example : jessy/profile.png

            });
            
            // 
        const textFiles = fs.readdirSync(privatePath) // Read the contents of the 'privatePath' directory synchronously and store the list of files in 'textFiles'.
         .filter(file => file.startsWith('text') && file.endsWith('.txt')); // Give me the files that start with text and their ending .txt
       
         const endorsementFilesData = [];
        textFiles.forEach(file => { // Read the file, split it by lines, and push it to the endorsementFilesData array
            endorsementFilesData.push(fs.readFileSync(path.join(privatePath, file), 'utf8').split('\n'));
      // In the "endorsement", files are read and split by lines to extract the author's name and endorsement text
    });
        const endorsement = [];  // new array of endorsement objects, each containing the text and name of the author
        endorsementFilesData.forEach(fd => endorsement.push(
            {
                text: fd[0], // This is the first line in the text
                name: fd[1] // This is the second line in the text - name of the author
            }
        ));

        // return object
        return {
            name: id,
            title: title,
            bio: parsedBio,
            files: imageFiles,
            endorsement: endorsement
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

app.get('/profile', function (req, res) {
    const animId = req.query.id; //take the id of the animal from the parameter

    const animInfo = getAnimalInfo(animId); // get animal info

    const profiles = getProfileImages();// get all profiles (link to profiles)

    res.render('profile', {
        animInfo,
        profiles
    });
});

app.listen(3000);
console.log('Server is listening on port 3000');
