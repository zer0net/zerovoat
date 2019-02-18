window.fileHelpers = (function(){

  function getFileToItemQuery(fileToItemId){
    let q = "SELECT * FROM file_to_item AS fti WHERE fti.file_to_item_id='"+fileToItemId+"'";
    return q;
  }

  function getFileQuery(fileId){
    let q = "SELECT f.*, j.* "
    q += "FROM file f ";
    q += "LEFT JOIN json AS j ON f.json_id=j.json_id ";
    q += "WHERE f.file_id='"+fileId+"'";
    return q;
  }

  function determineFileMediaType(fileType){
    let mt;
    if (fileType === 'jpg' ||
        fileType === 'png' ||
        fileType === 'jpeg' ||
        fileType === 'gif'){
      mt = 'image';
    } else if (fileType === 'avi' || 
               fileType === 'mpeg' || 
               fileType === 'webm' || 
               fileType === 'ogg' ||
               fileType === 'mp4') {
      mt = 'video';
    } else if (fileType === 'mp3' || 
               fileType === 'wav'){
      mt = 'audio';
    }
    return mt;
  }

  function generateValidFileName(fileName){
    const fname = fileName.replace(/[^\x20-\x7E]+/g, this.generateRandomChar()).replace(/ /g,'_').replace(/[&\/\\#,+()$~%'":*?!<>|{}\[\]]/g, this.generateRandomChar());
    return fname;
  }

  function generateRandomChar(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 1; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  function getItemFilePiecesInfo(res){
    const pieceStandardSize = 1048576;
    let pieceInfo = [];
    for (var i = 0; i < res.pieces; i++){
      let piece = {}
      piece.index = i;
      piece.start = piece.index * pieceStandardSize;
      piece.end = (piece.index + 1) * pieceStandardSize;
      if (i < res.pieces_downloaded) {
        piece.state = 'complete';
      } else if (i === res.pieces_downloaded) {
        piece.state = 'downloading';
      }
      pieceInfo.push(piece);
    }
    return pieceInfo;
  }

  return {
    getFileToItemQuery,
    getFileQuery,
    determineFileMediaType,
    generateValidFileName,
    generateRandomChar,
    getItemFilePiecesInfo
  }
}())
