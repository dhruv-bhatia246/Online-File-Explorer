const url = require('url');
const path = require('path');
const fs = require('fs');

//File imports
const buildBreadCrumb = require('./breadcrumb.js');
const buildMainContent = require('./maincontent.js');
const getMimeType = require('./getMimeType.js');

// static base path: location of static folder in local machine
const staticBasePath = path.join(__dirname, "..", "static");

const respond = (request, response) => {
    // response.write("respond fired!");
    let pathname = url.parse(request.url, true).pathname;
    if (pathname === '/favicon.ico')
        return false;

    pathname = decodeURIComponent(pathname);

    const fullStaticPath = path.join(staticBasePath, pathname);

    fs.existsSync(fullStaticPath);
    if (!fs.existsSync(fullStaticPath)) {
        console.log(`${fullStaticPath} does not exist`);
        response.write("404: File not found!");
        response.end();
        return false;
    }
    let stats;
    try {
        stats = fs.lstatSync(fullStaticPath);
    } catch (err) {
        console.log(`latatSync Error : ${err}`);
    }

    if (stats.isDirectory()) {
        let data = fs.readFileSync(path.join(staticBasePath, "../static/files/index.html"), 'utf-8');

        //page title
        let pathElements = pathname.split('/');
        pathElements = pathElements.filter(elements => (elements !== ''));
        let folderName = pathElements[0];
        if(folderName === undefined){
            folderName = 'Home';
        }
        data = data.replace('page_title', folderName);

        const breadcrumb = buildBreadCrumb(pathname);
        data = data.replace('pathname', breadcrumb);

        const mainContent = buildMainContent(fullStaticPath, pathname);

        data = data.replace('mainContent', mainContent);
        response.statusCode = 200;
        response.write(data);
        return response.end();
    }

    if (!stats.isFile()) {
        response.statusCode = 401;
        response.write("401: Access Denied!");
        console.log('Not a file!');
        return response.end();
    }

    //File details
    const fileDetails = {};

    //Extension of file
    fileDetails.extName = path.extname(fullStaticPath);

    //file size
    let stat;
    try {
        stat = fs.lstatSync(fullStaticPath);
    } catch (err) {
        console.log(`Error : ${Error}`);
    }
    fileDetails.size = stat.size;

    //File mime type
    getMimeType(fileDetails.extName)
        .then(mime => {
            //store headers here
            let head = {};
            let options = {};

            //response status code
            let statusCode = 200;

            //content type
            head[`Content-type`] = mime;
            head[`Content-Disposition`] = `filename=${fileDetails.name}`;

            //pdf file? -> Display in browser
            if (fileDetails.extName === '.pdf') {
                head[`Content-Disposition`] = `inline;filename=${fileDetails.name}`;
            }

            //audio/video? -> Send data in chunks
            if (RegExp(`audio`).test(mime) || RegExp(`video`).test(mime)) {
                //header
                head[`Accept-Ranges`] = `bytes`;

                const range = request.headers.range;

                if (range) {
                    const start_end = range.replace(/bytes=/, "").split('-');
                    const start = parseInt(start_end[0]);
                    
                    // console.log(start);
                    const end = start_end[1] ? parseInt(start_end[1]) : fileDetails.size-1;

                    //headers
                    //content range
                    head[`Content-range`] = `bytes ${start}-${end}/${fileDetails.size}`;

                    //content length
                    head[`Content-length`] = end - start + 1;
                        statusCode = 206;

                    options = {start,end};
                }
            }

            const fileStream = fs.createReadStream(fullStaticPath, options);

            //Stream chunks of data
            response.writeHead(statusCode, head);
            fileStream.pipe(response);

            fileStream.on('close', () => {
                return response.end();
            });
            fileStream.on('error', () => {
                response.statusCode = 404;
                console.log(error.code);
                response.write(`404: Filestream Error!`);
                return response.end();
            });
        })
        .catch(err => {
            response.statusCode = 500;
            response.write('500: Internal Server Error');
            console.log(`Promise Error: ${err}`);
            return response.end();
        })
}

module.exports = respond;