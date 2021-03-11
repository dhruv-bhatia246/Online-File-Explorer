const path = require('path');

const buildBreadCrumb = pathname => {
    const pathParts = pathname.split('/').filter(element => (element !== ""));

    let breadcrumb = `<li class="breadcrumb-item"><a href = "/">Home</a></li>`;
    
    let link = "/";
    pathParts.forEach((item,index) => {
        link = path.join(link,item);

        if(index !== pathParts.length - 1){
            breadcrumb+= `<li class="breadcrumb-item"><a href = "${link}">${item}</a></li>`;
        }
        else{
            breadcrumb+= `<li class="breadcrumb-item">${item}</li>`;
        }
    });
    return breadcrumb;
}

module.exports = buildBreadCrumb;