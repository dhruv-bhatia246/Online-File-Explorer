const calculateSizeF = (stats)=>{
    let filesizeBytes = stats.size;
    const units = 'BKMGT';
    let resultUnit = units[Math.floor(Math.log10(filesizeBytes)/3)];
    const index = Math.floor(Math.log10(filesizeBytes)/3);
    let final = (filesizeBytes/Math.pow(1000,index)).toFixed(1);
    const fileSizeHuman = `${final}${resultUnit}`;

    return [fileSizeHuman,filesizeBytes];
};

module.exports = calculateSizeF;