const path = require('path');
const fs = require('fs');
const calculateSizeD = require('./calculateSizeD.js');
const calculateSizeF = require('./calculateSizeF.js');

const buildMainContent = (fullStaticPath, pathname) => {

    let mainContent='';
    let items;
    //looping the elements of the folder
    try{
        items = fs.readdirSync(fullStaticPath);
    }
    catch(err){
        console.log(`Directory read error: ${err}`);
        return `<div class="alert alert-danger">Internal server error</div>`;
    }

    //remove file explorer files
    items = items.filter(element => element !== 'files');

    //getting the following elements for each item
    items.forEach(item => {
        //link
        const link = path.join(pathname, item);

        //icon
        let icon;
        let stats;
        let itemsize;
        let itemsizebytes;
        let itemFullStaticPath;
        let timeStamp;
        let date;
        try{

            itemFullStaticPath = path.join(fullStaticPath,item)
            stats = fs.statSync(itemFullStaticPath);
            timeStamp = parseInt(stats.mtimeMs);
            //date modified
            date = new Date(timeStamp)
            date = date.toLocaleString();
        }
        catch(err){
            console.log(`statSync error: ${error}`);
            mainContent = `<div class="alert alert-danger">Internal server error</div>`;
            return false;
        }
        //icon
        if(stats.isDirectory()){
            icon = '<ion-icon name="folder"></ion-icon>';
            //size
            [itemsize, itemsizebytes] = calculateSizeD(itemFullStaticPath);

        }else if(stats.isFile()){
            icon = '<ion-icon name="document"></ion-icon>';
            //size
            [itemsize,itemsizebytes] = calculateSizeF(stats);
        }

        mainContent += `<tr data-name="${item}" data-size="${itemsizebytes}">
        <td>${icon}<a href="${link}" target='${stats.isFile()?"_blank":""}' >${item}</a></td>
        <td>${itemsize}</td>
        <td>${date}</td>
        </tr>`;
    });

    return mainContent;
};

module.exports = buildMainContent;