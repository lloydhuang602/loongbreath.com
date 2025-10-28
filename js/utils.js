var utils={};

utils.post=function(url,data,successCallback){
    var param=new URLSearchParams();
    for(var key in data) param.append(key,data[key]);
    axios.post(url,param).then(function(res){
        if(res.data.errorCode!=-1) return swal({title:res.data.message,icon:"error",button:"好的"});
        successCallback && successCallback(res.data.data);
    }).catch(function(error){console.log(error);});
};