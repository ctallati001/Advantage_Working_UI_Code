var myApp = angular.module('myApp');

//
//myApp.directive('fileModel', [ '$parse', function($parse) {
//	return {
//		restrict : 'A',
//		link : function(scope, element, attrs) {
//			var model = $parse(attrs.fileModel);
//			var modelSetter = model.assign;
//
//			element.bind('change', function() {
//				scope.$apply(function() {
//					modelSetter(scope, element[0].files[0]);
//				});
//			});
//		}
//	};
//} ]);
//
//myApp.service('ArchiveService', [ '$http', '$rootScope', function($http, $rootScope) {
//	this.search = function(name, date) {
//		$http.get("http://localhost:8080/archive/documents", {
//			params : {
//				person : name,
//				date : date
//			}
//		}).success(function(response) {
//			$rootScope.metadataList = response;
//		}).error(function() {
//		});
//	}
//}]);
//
//myApp.service('fileUpload', ['$http','ArchiveService', function($http, ArchiveService) {
//	this.uploadFileToUrl = function(uploadUrl, file, name, date) {
//		var fd = new FormData();
//		fd.append('file', file);
//		fd.append('person', name);
//		fd.append('date', date);
//		$http.post(uploadUrl, fd, {
//			transformRequest : angular.identity,
//			headers : {
//				'Content-Type' : undefined
//			}
//		}).success(function() {
//			ArchiveService.search(null, null);
//		}).error(function() {
//		});
//	}
//} ]);

var fileObject = {};
var fileName = null;
myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                	scope.file = element[0].files[0];
                	debugger
                	fileObject = scope.file;
                	sessionStorage.setItem('myFile',JSON.stringify(element[0].files[0]));
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

myApp.service('fileUpload', ['$http',function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .then(function(response){
        	fileName = response.data.fileName.toString().replace('[','').replace(']','');
        	console.log('success'+response);
        });
    }
}]);


myApp.controller('mainCtrl', mainCtrl);
mainCtrl.$inject = ['$scope', '$rootScope', '$location', '$timeout','$filter', '$window','$http','$q', 'fileUpload'];
function mainCtrl($scope, $rootScope, $location, $timeout, $filter,$window, $http,$q,fileUpload) {
    $scope.loading = true;
    $scope.showDetails = false;
    $scope.flag=false;
    $scope.records=[];
    $scope.exportData=[];
    $scope.statusTypeDep = true;
    
    $scope.prefinit = function() {
        if ($scope.intervalObj)
            $interval.cancel($scope.intervalObj);
    }
    
    $scope.dataUpload = true;
    $scope.errVisibility = false;
    
    
    $scope.processData = function(allText) {
		// split content based on new line
		var allTextLines = allText.split(/\r\n|\n/);
		var headers = allTextLines[0].split(',');
		var lines = [];

		for ( var i = 0; i < allTextLines.length; i++) {
			// split content based on comma
			var data = allTextLines[i].split(',');
			if (data.length == headers.length) {
				var tarr = [];
				for ( var j = 0; j < headers.length; j++) {
					tarr.push(data[j]);
				}
				lines.push(tarr);
			}
		}
		$scope.data = lines;
	};
    
    $scope.uploadFile = function(){
    	console.log('---scope.file---'+fileObject);
        var file = fileObject;
        console.log('file is ' +file);
        console.dir(file);
        
        $http.get('/angular/sample.csv').then(function(response){
        	$scope.processData(response);
        });
        var uploadUrl = "/elastic/fileUpload";
        fileUpload.uploadFileToUrl(file, uploadUrl);
    };
    
//    $scope.uploadFile = function() {
//		var file = $scope.myFile;
//		var name = $scope.name;
//		var date = $scope.date;
//		console.log('file is ' + JSON.stringify(file));
//		var uploadUrl = "/elastic/fileUpload";
//		fileUpload.uploadFileToUrl(uploadUrl, file, name, date);
//	};
    
//    $scope.uploadFile = function(){
//        var file = $scope.myFile;
//        console.log('file is ' );
//        console.dir(file);
//         var uploadUrl = "/elastic/fileUpload";
//          fileUpload.uploadFileToUrl(file, uploadUrl).then(function(result){
//          $scope.errors = fileUpload.getResponse();
//          console.log($scope.errors);
//          $scope.errVisibility = true;
//          }, function(error) {
//          alert('error');
//          })
//   };

    $scope.resultinit = function() {
        if ($scope.intervalObj)
            $interval.cancel($scope.intervalObj);
    }
    
    var numDaysBetween = function(d1, d2) {
    	  var diff = d1.getTime() - d2.getTime();
    	  return diff / (1000 * 60 * 60 * 24);
    	};
    	
    $scope.initFunc = function() {
    	var mnParam = document.getElementById("ajaxSearchMn").value;
    	var param = document.getElementById("ajax").value;
    	
    	var idVal = null;
    	if (document.getElementById("ajaxSearch") !== null) {
    		idVal = document.getElementById("ajaxSearch").value;
    		//$('#data').submit(function(e){
    	           var ks = $('#ajaxSearch').val().split(/\r?\n/);
    	           //e.preventDefault();
    	           //alert(ks[0]);
    	           $.each(ks, function(k){
    	             // alert(k);
    	           });
    	        //});
    	}
    	//var idVal = document.getElementById("ajaxSearch").value;
    	
    	console.log('---in the View'+$scope.radioDays);
    	if($scope.statusType !== undefined || $scope.statusTypeExp !== undefined) {
    		if ($("input[name='radioDays']:checked").val() === undefined || $("input[name='radioDays']:checked").val() === null) {
    			alert('Kindly check the Tenure of Eol / Expired');
    			return false;
    		} else {
    			
    			$scope.radioDays = $("input[name='radioDays']:checked").val();
    		}
    		
    	}
    	

    	
    	var paramValue = idVal;
    	
    	if (fileName !== undefined && fileName !== null && fileName.length > 0) {
    		
    		paramValue = fileName;
    	}
    	  $http.get("/elastic/getFilterData?paramMnp="+mnParam+"&param="+param+"&paramValue="+paramValue+"&paramFile="+fileName)
    	  .then(function(response){
    		  console.log("----response data--"+response.data);
    		  $scope.details = response.data;
    		  $scope.gridData = [];
    		  if ($scope.details.hits !== undefined) {
    			  $scope.gridData = $scope.details.hits.hits;
    			  $("#bestHtml5Grid").empty();
    	        	$("#bestHtml5Grid").load();
    			  var eGridDiv = document.querySelector('#bestHtml5Grid');
    		        new agGrid.Grid(eGridDiv, gridOptions);
    		        $scope.rowData = [];
    		        //$scope.statusTypeDep = $("input[name='radioDays']:checked").val();
    		        $rootScope.gridData = $scope.rowData;
    		        gridOptions.api.setRowData($scope.rowData);
    		        var priorDate = new Date();
		        	priorDate.setDate(priorDate.getDate() + parseInt($scope.radioDays));
		        	
   		        if ($scope.statusType !== undefined && $scope.statusType === true) {
    		        	console.log('---in the View'+$scope.radioDays);
    		        	var today = new Date()
    		        	
    		        	console.log('----today---'+today);
    		        	console.log('----priorDate---'+priorDate);
    		        	
    		        	if ($scope.radioDays !== undefined && parseInt($scope.radioDays) === 120) {
    		        		$scope.startDate = document.getElementById("startDate").value;
    		        		$scope.endDate = document.getElementById("endDate").value;
    		        		for (var h=0;h<$scope.gridData.length;h++) {
    	    		        	$scope.rowDataObj = $scope.gridData[h];
    	    		        	$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
    	    		        	if ($scope.gridData[h]._source.DepartmentHistory !== undefined && $scope.gridData[h]._source.DepartmentHistory.length > 0 ) {
    	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.DepartmentHistory.length ; depCounter ++) {
    	    		        			if ($scope.gridData[h]._source.DepartmentHistory[depCounter].Status !== undefined && $scope.gridData[h]._source.DepartmentHistory[depCounter].Status === 'Active') {
    	    	    		        		$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
    	    	    		        	}
    	    		        			
    	    		        		}
    	    		        	}
    	    		        	
    	    		        	if ($scope.gridData[h]._source.Contracts !== undefined && $scope.gridData[h]._source.Contracts.length > 0 ) {
    	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.Contracts.length ; depCounter ++) {
    	    		        			if ($scope.gridData[h]._source.Contracts[depCounter].InternalStatus !== undefined && $scope.gridData[h]._source.Contracts[depCounter].InternalStatus === 'Active') {
    	    	    		        		//$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
    	    		        				$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[depCounter].EndDate;
    	    	    		        	}
    	    		        		}
    	    		        	}
    	    		        	
    	    		        	var addColumn = false;
    	    		        	
    	    		        	if ($scope.startDate !== undefined && $scope.endDate !== undefined) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.EOS),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.EOS),priorDate));
    	    		        		if(new Date($scope.startDate) <= new Date($scope.gridData[h]._source.EOS) &&  new Date($scope.endDate) >= new Date($scope.gridData[h]._source.EOS)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if ($scope.startDate !== undefined && $scope.endDate !== undefined) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.LDOS),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.LDOS),priorDate));
    	    		        		if(new Date($scope.startDate) <= new Date($scope.gridData[h]._source.LDOS) && new Date($scope.endDate) >= new Date($scope.gridData[h]._source.LDOS)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if ($scope.startDate !== undefined && $scope.endDate !== undefined) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.EOSWM),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.EOSWM),priorDate));
    	    		        		if(new Date($scope.startDate) <= new Date($scope.gridData[h]._source.EOSWM) && new Date($scope.endDate) >= new Date($scope.gridData[h]._source.EOSWM)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if ($scope.startDate !== undefined && $scope.endDate !== undefined) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.EOCR),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.EOCR),priorDate));
    	    		        		if(new Date($scope.startDate) <= new Date($scope.gridData[h]._source.EOCR) && new Date($scope.endDate) >= new Date($scope.gridData[h]._source.EOCR)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if ($scope.startDate !== undefined && $scope.endDate !== undefined) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.LDOSH),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.LDOSH),priorDate));
    	    		        		if(new Date($scope.startDate) <= new Date($scope.gridData[h]._source.LDOSH) && new Date($scope.endDate) >= new Date($scope.gridData[h]._source.LDOSH)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	
    	    		        	if (addColumn === true) {
    	    		        		var date = new Date($scope.rowDataObj._source.EOLA);
    	    		        		$scope.rowDataObj._source.EOLA = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.DatePurchased);
    	    		        		$scope.rowDataObj._source.DatePurchased = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj.endDate);
    	    		        		$scope.rowDataObj.endDate = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		
    	    		        		var date = new Date($scope.rowDataObj._source.EOS);
    	    		        		$scope.rowDataObj._source.EOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.LDOS);
    	    		        		$scope.rowDataObj._source.LDOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOSWM);
    	    		        		$scope.rowDataObj._source.EOSWM = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOCR);
    	    		        		$scope.rowDataObj._source.EOCR = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.LDOSH);
    	    		        		$scope.rowDataObj._source.LDOSH = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		
    	    		        		$scope.gridData[h]._source.Contracts.sort(function(a, b){
  	    		        			  return a.dateDiff > b.dateDiff;
  	    		        			});
  	    		        		
  	    		        		$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
  	    		        		
    	    		        		
    	    		        		if ($scope.statusTypeDep !== undefined && $scope.statusTypeDep !== null && 
    	    		        				$scope.statusTypeDep === true){
    	    		        			if ($scope.rowDataObj._source.AssetStatus !== undefined && $scope.rowDataObj._source.AssetStatus !== 'Deprecated') {
    	    		        				$scope.rowData.push($scope.rowDataObj);
    	    		        			}
    	    		        		} else {
    	    		        			$scope.rowData.push($scope.rowDataObj);
    	    		        		}
    	    		        		
    	    		        	}
    		        		}
    		        		
    		        	} else {
    		        		for (var h=0;h<$scope.gridData.length;h++) {
    	    		        	$scope.rowDataObj = $scope.gridData[h];
    	    		        	$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
    	    		        	if ($scope.gridData[h]._source.DepartmentHistory !== undefined && $scope.gridData[h]._source.DepartmentHistory.length > 0 ) {
    	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.DepartmentHistory.length ; depCounter ++) {
    	    		        			if ($scope.gridData[h]._source.DepartmentHistory[depCounter].Status !== undefined && $scope.gridData[h]._source.DepartmentHistory[depCounter].Status === 'Active') {
    	    	    		        		$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
    	    	    		        		
    	    	    		        	}
    	    		        			
    	    		        		}
    	    		        	}
    	    		        	if ($scope.gridData[h]._source.Contracts !== undefined && $scope.gridData[h]._source.Contracts.length > 0 ) {
    	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.Contracts.length ; depCounter ++) {
    	    		        			if ($scope.gridData[h]._source.Contracts[depCounter].EndDate !== undefined) {
    	    	    		        		//$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
    	    		        				$scope.gridData[h]._source.Contracts[depCounter].dateDiff = numDaysBetween(new Date($scope.gridData[h]._source.Contracts[depCounter].EndDate),new Date());
    	    	    		        	}
    	    		        		}
    	    		        	}
    	    		        	var addColumn = false;
    	    		        	
    	    		        	if ($scope.gridData[h]._source.EOS !== undefined && $scope.gridData[h]._source.EOS !== null) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.EOS),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.EOS),priorDate));
    	    		        		if(numDaysBetween(new Date($scope.gridData[h]._source.EOS),priorDate) <= parseInt($scope.radioDays)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if ($scope.gridData[h]._source.LDOS !== undefined && $scope.gridData[h]._source.LDOS !== null) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.LDOS),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.LDOS),priorDate));
    	    		        		if(numDaysBetween(new Date($scope.gridData[h]._source.LDOS),priorDate) <= parseInt($scope.radioDays)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if ($scope.gridData[h]._source.EOSWM !== undefined && $scope.gridData[h]._source.EOSWM !== null) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.EOSWM),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.EOSWM),priorDate));
    	    		        		if(numDaysBetween(new Date($scope.gridData[h]._source.EOSWM),priorDate) <= parseInt($scope.radioDays)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if ($scope.gridData[h]._source.EOCR !== undefined && $scope.gridData[h]._source.EOCR !== null) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.EOCR),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.EOCR),priorDate));
    	    		        		if(numDaysBetween(new Date($scope.gridData[h]._source.EOCR),priorDate) <= parseInt($scope.radioDays)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if ($scope.gridData[h]._source.LDOSH !== undefined && $scope.gridData[h]._source.LDOSH !== null) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.LDOSH),priorDate) = '+numDaysBetween(new Date($scope.gridData[h]._source.LDOSH),priorDate));
    	    		        		if(numDaysBetween(new Date($scope.gridData[h]._source.LDOSH),priorDate) <= parseInt($scope.radioDays)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if (addColumn === true) {
    	    		        		var date = new Date($scope.rowDataObj._source.EOLA);
    	    		        		$scope.rowDataObj._source.EOLA = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.DatePurchased);
    	    		        		$scope.rowDataObj._source.DatePurchased = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj.endDate);
    	    		        		$scope.rowDataObj.endDate = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		
    	    		        		var date = new Date($scope.rowDataObj._source.EOS);
    	    		        		$scope.rowDataObj._source.EOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.LDOS);
    	    		        		$scope.rowDataObj._source.LDOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOSWM);
    	    		        		$scope.rowDataObj._source.EOSWM = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOCR);
    	    		        		$scope.rowDataObj._source.EOCR = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.LDOSH);
    	    		        		$scope.rowDataObj._source.LDOSH = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		
    	    		        		
    	    		        		
    	    		        		
    	    		        		//$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
    	    		        		
    	    		        		if ($scope.statusTypeDep !== undefined && $scope.statusTypeDep !== null && 
    	    		        				$scope.statusTypeDep === true){
    	    		        			if ($scope.rowDataObj._source.AssetStatus !== undefined && $scope.rowDataObj._source.AssetStatus !== 'Deprecated') {
    	    		        				$scope.rowData.push($scope.rowDataObj);
    	    		        			}
    	    		        		} else {
    	    		        			$scope.rowData.push($scope.rowDataObj);
    	    		        		}
    	    		        		//$scope.rowData.push($scope.rowDataObj);
    	    		        	}
    	    		   }
    		        		
    		        	}
    		        	 
    		        	
    		        } else if ($scope.statusTypeExp !== undefined && $scope.statusTypeExp === true) {
    		        	console.log('---in the View else '+$scope.radioDays);
    		        	if (parseInt($scope.radioDays) === 120) {
    		        		console.log("if condition");
    		        		for (var h=0;h<$scope.gridData.length;h++) {
    	    		        	$scope.rowDataObj = $scope.gridData[h];
    	    		        	$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
    	    		        	var date = new Date($scope.rowDataObj._source.DatePurchased);
	    		        		$scope.rowDataObj._source.DatePurchased = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    		        		var date = new Date($scope.rowDataObj.endDate);
	    		        		$scope.rowDataObj.endDate = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    		        		
	    		        		var date = new Date($scope.rowDataObj._source.EOS);
	    		        		$scope.rowDataObj._source.EOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    		        		var date = new Date($scope.rowDataObj._source.LDOS);
	    		        		$scope.rowDataObj._source.LDOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    		        		var date = new Date($scope.rowDataObj._source.EOSWM);
	    		        		$scope.rowDataObj._source.EOSWM = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    		        		var date = new Date($scope.rowDataObj._source.EOCR);
	    		        		$scope.rowDataObj._source.EOCR = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    		        		var date = new Date($scope.rowDataObj._source.LDOSH);
	    		        		$scope.rowDataObj._source.LDOSH = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    		        		if ($scope.gridData[h]._source.DepartmentHistory !== undefined && $scope.gridData[h]._source.DepartmentHistory.length > 0 ) {
    	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.DepartmentHistory.length ; depCounter ++) {
    	    		        			if ($scope.gridData[h]._source.DepartmentHistory[depCounter].Status !== undefined && $scope.gridData[h]._source.DepartmentHistory[depCounter].Status === 'Active') {
    	    	    		        		$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
    	    	    		        	}
    	    		        			
    	    		        		}
    	    		        	}
	    		        		
	    		        		if ($scope.gridData[h]._source.Contracts !== undefined && $scope.gridData[h]._source.Contracts.length > 0 ) {
    	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.Contracts.length ; depCounter ++) {
    	    		        			if ($scope.gridData[h]._source.Contracts[depCounter].EndDate !== undefined) {
    	    	    		        		//$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
    	    		        				$scope.gridData[h]._source.Contracts[depCounter].dateDiff = numDaysBetween(new Date($scope.gridData[h]._source.Contracts[depCounter].EndDate),new Date());
    	    	    		        	}
    	    		        		}
    	    		        	}
	    		        		var addColumn = false;
    	    		        	if ($scope.startDate !== undefined && $scope.endDate !== undefined) {
    	    		        		console.log('numDaysBetween(new Date($scope.gridData[h]._source.LDOSH),priorDate) = '+numDaysBetween(new Date($scope.rowDataObj.endDate),priorDate));
    	    		        		if(new Date($scope.startDate) <= new Date($scope.rowDataObj.endDate) && new Date($scope.endDate) >= new Date($scope.rowDataObj.endDate)){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if (addColumn === true) {
    	    		        		var date = new Date($scope.rowDataObj._source.EOLA);
    	    		        		$scope.rowDataObj._source.EOLA = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.DatePurchased);
    	    		        		$scope.rowDataObj._source.DatePurchased = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj.endDate);
    	    		        		$scope.rowDataObj.endDate = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		
    	    		        		var date = new Date($scope.rowDataObj._source.EOS);
    	    		        		$scope.rowDataObj._source.EOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.LDOS);
    	    		        		$scope.rowDataObj._source.LDOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOSWM);
    	    		        		$scope.rowDataObj._source.EOSWM = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOCR);
    	    		        		$scope.rowDataObj._source.EOCR = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.LDOSH);
    	    		        		$scope.rowDataObj._source.LDOSH = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		
    	    		        		
  	    		        		
  	    		        		$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
  	    		        		
    	    		        		
    	    		        		if ($scope.statusTypeDep !== undefined && $scope.statusTypeDep !== null && 
    	    		        				$scope.statusTypeDep === true){
    	    		        			if ($scope.rowDataObj._source.AssetStatus !== undefined && $scope.rowDataObj._source.AssetStatus !== 'Deprecated') {
    	    		        				$scope.rowData.push($scope.rowDataObj);
    	    		        			}
    	    		        		} else {
    	    		        			$scope.rowData.push($scope.rowDataObj);
    	    		        		}
    	    		        		//$scope.rowData.push($scope.rowDataObj);
    	    		        	}
    		        		}
	    		        	
    		        		
    		        	} else {
    		        		for (var h=0;h<$scope.gridData.length;h++) {
    	    		        	$scope.rowDataObj = $scope.gridData[h];
    	    		        	$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
    	    		        	console.log("dept checks");
    	    		        	if ($scope.gridData[h]._source.DepartmentHistory !== undefined && $scope.gridData[h]._source.DepartmentHistory.length > 0 ) {
    	    		        		console.log("DepartmentHistory");
    	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.DepartmentHistory.length ; depCounter ++) {
    	    		        			console.log("value: "+$scope.gridData[h]._source.DepartmentHistory[depCounter].Department);
    	    		        			if ($scope.gridData[h]._source.DepartmentHistory[depCounter].Status !== undefined && $scope.gridData[h]._source.DepartmentHistory[depCounter].Status == "Active") {
    	    		        				$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
    	    	    		        		$scope.rowDataObj.DateActive = $scope.gridData[h]._source.DepartmentHistory[depCounter].DateActive;
    	    	    		        		$scope.rowDataObj.Status = $scope.gridData[h]._source.DepartmentHistory[depCounter].Status;
    	    	    		        		
    	    	    		        	}
    	    		        			
    	    		        		}
    	    		        	}
    	    		        	
    	    		        	if ($scope.gridData[h]._source.Contracts !== undefined && $scope.gridData[h]._source.Contracts.length > 0 ) {
    	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.Contracts.length ; depCounter ++) {
    	    		        			if ($scope.gridData[h]._source.Contracts[depCounter].InternalStatus !== undefined && $scope.gridData[h]._source.Contracts[depCounter].InternalStatus == 'Active') {
    	    		        				//$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
    	    		        				$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[depCounter].EndDate;
    	    		        				
    	    	    		        	}
    	    		        		}
    	    		        	}
    	    		        	
    	    		        	var addColumn = false;
    	    		        	
    	    		        	if ($scope.rowDataObj.endDate!== undefined && $scope.rowDataObj.endDate!== null) {
    	    		        		console.log('numDaysBetween(new Date($scope.rowDataObj.endDate),priorDate) = '+numDaysBetween(new Date($scope.rowDataObj.endDate),priorDate));
    	    		        		if(-parseInt($scope.radioDays) >= numDaysBetween(new Date($scope.rowDataObj.endDate),priorDate) && numDaysBetween(new Date($scope.rowDataObj.endDate),priorDate) <= 0){
    	    		        			addColumn = true;
    	    		        		}
    	    		        	}
    	    		        	if (addColumn === true) {
    	    		        		var date = new Date($scope.rowDataObj._source.EOLA);
    	    		        		$scope.rowDataObj._source.EOLA = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.DatePurchased);
    	    		        		$scope.rowDataObj._source.DatePurchased = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOS);
    	    		        		$scope.rowDataObj._source.EOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.LDOS);
    	    		        		$scope.rowDataObj._source.LDOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOSWM);
    	    		        		$scope.rowDataObj._source.EOSWM = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.EOCR);
    	    		        		$scope.rowDataObj._source.EOCR = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj._source.LDOSH);
    	    		        		$scope.rowDataObj._source.LDOSH = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		var date = new Date($scope.rowDataObj.endDate);
    	    		        		$scope.rowDataObj.endDate = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    	    		        		
//    	    		        		$scope.gridData[h]._source.Contracts.sort(function(a, b){
//  	    		        			  return a.dateDiff > b.dateDiff;
//  	    		        			});
  	    		        		
  	    		        		//$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
  	    		        		
  	    		        		
    	    		        		if ($scope.statusTypeDep !== undefined && $scope.statusTypeDep !== null && 
    	    		        				$scope.statusTypeDep === true){
    	    		        			if ($scope.rowDataObj._source.AssetStatus !== undefined && $scope.rowDataObj._source.AssetStatus !== 'Deprecated') {
    	    		        				$scope.rowData.push($scope.rowDataObj);
    	    		        			}
    	    		        		} else {
    	    		        			$scope.rowData.push($scope.rowDataObj);
    	    		        		}
    	    		        	}
    	    		        }
    		        		
    		        	}
    		        	 
    		        } else { console.log("final else");
    		        	for (var h=0;h<$scope.gridData.length;h++) {
	    		        	$scope.rowDataObj = $scope.gridData[h];
	    		        	$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
	    		        	var date = new Date($scope.rowDataObj._source.EOLA);
	    		        	$scope.rowDataObj._source.EOLA = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    		        	var date = new Date($scope.rowDataObj._source.DatePurchased);
    		        		$scope.rowDataObj._source.DatePurchased = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    		        		var date = new Date($scope.rowDataObj.endDate);
    		        		$scope.rowDataObj.endDate = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    		        		
    		        		var date = new Date($scope.rowDataObj._source.EOS);
    		        		$scope.rowDataObj._source.EOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    		        		var date = new Date($scope.rowDataObj._source.LDOS);
    		        		$scope.rowDataObj._source.LDOS = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    		        		var date = new Date($scope.rowDataObj._source.EOSWM);
    		        		$scope.rowDataObj._source.EOSWM = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    		        		var date = new Date($scope.rowDataObj._source.EOCR);
    		        		$scope.rowDataObj._source.EOCR = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    		        		var date = new Date($scope.rowDataObj._source.LDOSH);
    		        		$scope.rowDataObj._source.LDOSH = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    		        		var date = new Date($scope.rowDataObj.DateActive);
    		        		$scope.rowDataObj.DateActive = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
    		        		
    		        		if ($scope.gridData[h]._source.DepartmentHistory !== undefined && $scope.gridData[h]._source.DepartmentHistory.length > 0 ) {
	    		        		console.log("DepartmentHistory");
	    		        		for (var depCounter = 0 ; depCounter < $scope.gridData[h]._source.DepartmentHistory.length ; depCounter ++) {
	    		        			console.log("value1: "+$scope.gridData[h]._source.DepartmentHistory[depCounter].Department);
	    		        			
	    		        			if ($scope.gridData[h]._source.DepartmentHistory[depCounter].Status !== undefined && $scope.gridData[h]._source.DepartmentHistory[depCounter].Status == "Active") {
	    		        				$scope.rowDataObj.Department = $scope.gridData[h]._source.DepartmentHistory[depCounter].Department;
	    	    		        		$scope.rowDataObj.DateActive = $scope.gridData[h]._source.DepartmentHistory[depCounter].DateActive;
	    	    		        		$scope.rowDataObj.Status = $scope.gridData[h]._source.DepartmentHistory[depCounter].Status;
	    	    		        		var date = new Date($scope.rowDataObj.DateActive);
	    	    		        		$scope.rowDataObj.DateActive = date.toLocaleDateString("en-au", {year: "numeric", month: "short",day: "numeric"}).replace(/\s/g,'-').replace(".","");
	    	    		        		
	    	    		        	}
	    		        			
	    		        		}
	    		        	}
    		        		
    		        		
    		        		//console.log($scope.gridData[h]._source.DepartmentHistory);
    		        		
    		        		//copy paste all other columns similar like above //
	    		        	
    		        		$scope.gridData[h]._source.Contracts.sort(function(a, b){
  		        			  return a.dateDiff > b.dateDiff;
  		        			});
  		        		
  		        		$scope.rowDataObj.endDate = $scope.gridData[h]._source.Contracts[0].EndDate;
  		        		
    		        		
    		        		if ($scope.statusTypeDep !== undefined && $scope.statusTypeDep !== null && 
    		        				$scope.statusTypeDep === true){
    		        			if ($scope.rowDataObj._source.AssetStatus !== undefined && $scope.rowDataObj._source.AssetStatus !== 'Deprecated') {
    		        				$scope.rowData.push($scope.rowDataObj);
    		        			}
    		        		} else {
    		        			$scope.rowData.push($scope.rowDataObj);
    		        		}
	    		        	//$scope.rowData.push($scope.rowDataObj);
	    		        }	
    		        } 
   		            $rootScope.gridData = $scope.rowData;
    		        gridOptions.api.setRowData($scope.rowData);
    			  console.log('----array Data'+$scope.rowData);
    		  }
    		  }).then(function(){
    			  console.log("---Post Login --");
    			  
    		  });
    	   
    	     ///////////
    	 
    }
    $http.get("/elastic/getFilters")
	  .then(function(response){
		  console.log("----response data--"+response.data);
		  $scope.detailsFilters = [];
		  if (response.data !== undefined) {
			  var detailsFilters = Object.keys(response.data['asset-dev'].mappings.doc.properties);
		  }
		  $scope.detailsFilters = [];
		  detailsFilters.forEach(function(data){
			if (data === 'SerialNumber' || data === 'PartNum' ) {
				$scope.detailsFilters.push(data);
			}  
			$scope.detailsFilters.push("ContractNumber");
		  });
		 console.log('----array Data'+$scope.detailsFilters);
		  
		  }).then(function(){
			  console.log("---Post Login --");
		  });
    
    $scope.radioDisplay = false;
    $scope.getRadioDisplay = function () {
    	
    	console.log("--form.statusType -- "+$scope.statusType);
    	console.log("-- form.statusTypeExp -- "+$scope.statusTypeExp);
    	if ($scope.statusType === true  || $scope.statusTypeExp === true) {
    		
    		$scope.radioDisplay = true;
    	}
    	if ($scope.statusType === false && $scope.statusTypeExp === false) {
    		
    		$scope.radioDisplay = false;
    	}
    }
    $scope.textSearch = 'input';
    
   
    $scope.formData = {}; 
    $scope.selectedRow = {'name':'--Select--'};
    
    $scope.items = [{
        'name': 'EOL' , 'color':'blue'
    }, {
        'name': 'Expired/Expiring' ,'color':'orange'
    }, {
        'name': 'EOL & Expired' , 'color':'red'
    }];
       
    
    $scope.getSelectItems = function(item) {
    	$scope.selectedRow = item;
    	
    }
    var btBringGridBack;
    var btDestroyGrid;
    
    function modelUpdated() {
        var model = gridOptions.api.getModel();
        var totalRows = model.getTopLevelNodes().length;
        var processedRows = model.getRowCount();
        var eSpan = document.querySelector('#rowCount');
        eSpan.innerHTML = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
    };

    // wait for the document to be loaded, otherwise
    // ag-Grid will not find the div in the document.
    document.addEventListener("DOMContentLoaded", function () {
        btBringGridBack = document.querySelector('#btBringGridBack');
        btDestroyGrid = document.querySelector('#btDestroyGrid');

        // this example is also used in the website landing page, where
        // we don't display the buttons, so we check for the buttons existance
        if (btBringGridBack) {
            btBringGridBack.addEventListener('click', onBtBringGridBack);
            btDestroyGrid.addsventListener('click', onBtDestroyGrid);
        }

        addQuickFilterListener();
        onBtBringGridBack();
    });
    
    function addQuickFilterListener() {
        var eInput = document.querySelector('#quickFilterInput');
        eInput.addEventListener("input", function () {
            var text = eInput.value;
            gridOptions.api.setQuickFilter(text);
        });
    }

    function onBtBringGridBack() {
        var eGridDiv = document.querySelector('#bestHtml5Grid');
        new agGrid.Grid(eGridDiv, gridOptions);
        if (btBringGridBack) {
            btBringGridBack.disabled = true;
            btDestroyGrid.disabled = false;
        }
        // createRowData is available in data.js
        gridOptions.api.setRowData($scope.records.data );
   
    }


    
   
   // 
    $scope.ExpiredLst = [
        { id: 'r1', name: '30 Days' },
        { id: 'r2', name: '90 Days' },
        { id: 'r3', name: 'Specific Date' }];
    
    
    $scope.ChangeValue=function()
    {
    	
    	if($scope.itemid=='r3')
    		{
    		$scope.flag=true;
    		}
    	else
    		{
    		$scope.flag=false;
    		}
    }
    $scope.funVal=function()
    {
    		alert('Expired - Specific Date');
    		
    }
    
    //$scope.exportData=;
    
   $scope.exportAssetsExcel=function(){
    	
    	
    	$scope.exportData=$scope.records;
    	
    	    	
    }
   
   $scope.getCellFormatDate = function(dt)
   {
   $scope.dtFormated = dt |'date:\'yyyy-MM-dd\'';
   return $scope.dtFormatted;
   };
   
    $scope.JSONToCSVConvertor=function (JSONData, ReportTitle, ShowLabel) {
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        
        var CSV = '';    
        //Set Report title in first row or line
        
        CSV += ReportTitle + '\r\n\n';

        //This condition will generate the Label/Header
        if (ShowLabel) {
            var row = "";
            
            //This loop will extract the label from 1st index of on array
            for (var index in arrData[0]) {
                
                //Now convert each value to string and comma-seprated
                row += index + ',';
            }

            row = row.slice(0, -1);
            
            //append Label row with line break
            CSV += row + '\r\n';
        }
        
        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            
            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '",';
            }

            row.slice(0, row.length - 1);
            
            //add a line break after each row
            CSV += row + '\r\n';
        }

        if (CSV == '') {        
            alert("Invalid data");
            return;
        }   
        
        //Generate a file name
        var fileName = "MyReport_";
        //this will remove the blank-spaces from the title and replace it with an underscore
        fileName += ReportTitle.replace(/ /g,"_");   
        
        //Initialize file format you want csv or xls
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        
        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension    
        
        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");    
        link.href = uri;
        
        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";
        
        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    
    
    /*var columnDefs = [
        {headerName: "id", field: "id", width: 150},
        {headerName: "assetId", field: "assetId", width: 90},
        {headerName: "endDate", field: "endDate", width: 120},
        {headerName: "endofLife", field: "endofLife", width: 120}},
        {headerName: "endofSale", field: "endofSale", width: 90},
        {headerName: "eolAnnoucement", field: "eolAnnoucement", width: 110},
        {headerName: "install", field: "install", width: 110},
        {headerName: "installDate", field: "installDate", width: 100},
        {headerName: "manufactureNo", field: "manufactureNo", width: 100},
        {headerName: "poNumber", field: "poNumber", width: 100},
        {headerName: "serialNo", field: "serialNo", width: 100}
    ];*/
    var columnDefs = [
        //{headerName: "id", field: "id", width: 150},
        {headerName: "Asset ID", field: "_source.AssetID", 
        	width: 140,headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: true,suppressMovable: true},
        {headerName: "Parent ID", field: "_source.ParentID"},
        {headerName: "ParentAsset ID", field: "_source.ParentAssetID"},
        {headerName: "Asset Status", field: "_source.AssetStatus"},
        {headerName: "Buyer ID", field: "_source.BuyerID"},
        {headerName: "Buyer VRoot", field: "_source.BuyerVRoot"},
        {headerName: "BuyerDUNS", field: "_source.BuyerDUNS"},
        {headerName: "Buyer Name", field: "_source.BuyerName"},
        {headerName: "Manufacturer", field: "_source.Manufacturer"},
        {headerName: "Part Num", field: "_source.PartNum"},
        {headerName: "Description", field: "_source.Description"},
        {headerName: "Serial Number", field: "_source.SerialNumber"},
        {headerName: "List Price", field: "_source.ListPrice"},
        {headerName: "Sell Price", field: "_source.SellPrice"},
        {headerName: "Quote Number", field: "_source.QuoteNumber"},
        {headerName: "Quote Name", field: "_source.QuoteName"},
        {headerName: "PO Number", field: "_source.PONumber"},
        {headerName: "SO Number", field: "_source.SONumber"},
        {headerName: "Invoice Number", field: "_source.InvoiceNumber"},
        {headerName: "Date Purchased", field: "_source.DatePurchased" ,type: 'date'},
        {headerName: "Vendor", field: "_source.Vendor"},
        {headerName: "Vendor PO Number", field: "_source.VendorPONumber"},
        {headerName: "Ship To Email", field: "_source.ShipToEmail"},
        {headerName: "Current Owner Email", field: "_source.CurrentOwnerEmail"},
        {headerName: "MAC Address", field: "_source.MACAddress"},
        {headerName: "IP Address", field: "_source.IPAddress"},
        {headerName: "EOLA", field: "_source.EOLA"},
        {headerName: "EOS", field: "_source.EOS"},
        {headerName: "LDOS", field: "_source.LDOS"},
        {headerName: "EOSWM", field: "_source.EOSWM"},
        {headerName: "EOCR", field: "_source.EOCR"},
        {headerName: "LDOSH", field: "_source.LDOSH"},
        {headerName: "endDate", field: "endDate"},
        {headerName: "DepartmentHistory:Department", field: "Department"},
        {headerName: "DepartmentHistory:Status", field: "Status"},
        {headerName: "DepartmentHistory:DateActive", field: "DateActive"}
    ];


    var gridOptions = {
    		enableSorting: true,
    	    enableFilter: true,
    	    suppressRowClickSelection: true,
    	    groupSelectsChildren: true,
    	    debug: true,
    	    rowSelection: 'multiple',
    	    enableColResize: true,
    	    rowGroupPanelShow: 'always',
    	    pivotPanelShow: 'always',
    	    enableRangeSelection: true,
    	    columnDefs: columnDefs,
    	    pagination: true,
    	    defaultColDef:{
    	        editable: true,
    	        enableRowGroup:true,
    	        enablePivot:true,
    	        enableValue:true
    	    }
    };
    function getDisplayedRowAtIndex() {
        var rowNode = gridOptions.api.getDisplayedRowAtIndex(0);
        console.log('getDisplayedRowAtIndex(0) => ' + nodeToString(rowNode));
    }

    function getDisplayedRowCount() {
        var count = gridOptions.api.getDisplayedRowCount();
        console.log('getDisplayedRowCount() => ' + count);
    }

    function printAllDisplayedRows() {
        var count = gridOptions.api.getDisplayedRowCount();
        console.log('## printAllDisplayedRows');
        for (var i = 0; i<count; i++) {
            var rowNode = gridOptions.api.getDisplayedRowAtIndex(i);
            console.log('row ' + i + ' is ' + rowNode.data.athlete);
        }
    }

    function printPageDisplayedRows() {
        var rowCount = gridOptions.api.getDisplayedRowCount();
        var lastGridIndex = rowCount - 1;
        var currentPage = gridOptions.api.paginationGetCurrentPage();
        var pageSize = gridOptions.api.paginationGetPageSize();
        var startPageIndex = currentPage * pageSize;
        var endPageIndex = ((currentPage + 1) * pageSize) - 1;

        if (endPageIndex > lastGridIndex) {
            endPageIndex = lastGridIndex;
        }

        console.log('## printPageDisplayedRows');
        for (var i = startPageIndex; i<=endPageIndex; i++) {
            var rowNode = gridOptions.api.getDisplayedRowAtIndex(i);
            console.log('row ' + i + ' is ' + rowNode.data.athlete);
        }
    }

    function nodeToString(rowNode) {
        return rowNode.data.athlete + ' ' + rowNode.data.year;
    }

    // setup the grid after the page has finished loading
    /*document.addEventListener('DOMContentLoaded', function() {
    	console.log('$scope.records.data >> '+ $scope.records.data);
        var gridDiv = document.querySelector('#bestHtml5Grid');
        new agGrid.Grid(gridDiv, gridOptions);

        gridOptions.api.setRowData($scope.records.data);
       
    });*/
    $scope.displayGrid='false';
    $scope.viewAllAssets = function(typeBtn){
    	
    	 $scope.initFunc();
//debugger;
    	//alert(typeBtn);
    	$scope.dateVal=[];
    	$scope.dateVal.push(typeBtn);
    	if($scope.itemid=='r1' || $scope.itemid=='r2')
    	{
    		var today = new Date();
    		var ddd1 = today.getDate();
        	var mm1 = today.getMonth() + 1;
        	var y1 = today.getFullYear();

        	var someFormattedDate1 = ddd1 + '/'+ mm1+ '/'+ y1;
        	$scope.dateVal.push(someFormattedDate1);
        	$scope.dateVal.push($scope.itemid);

    	}
    	if($scope.itemid=='r3')
    	{
    	//	debugger;
    		console.log($scope.formData.fromdate+"------------------------"+$scope.formData.todate);
    		var today1 = $scope.formData.fromdate;
    		var ddd = today1.getDate();
        	var mm = today1.getMonth() + 1;
        	var y = today1.getFullYear();

        	var startFormattedDate = ddd + '/'+ mm+ '/'+ y;
        	
        	var today2 = $scope.formData.todate;
    		var ddd2 = today2.getDate();
        	var mm2 = today2.getMonth() + 1;
        	var y2 = today2.getFullYear();

        	var endFormattedDate = ddd2 + '/'+ mm2+ '/'+ y2;
        	console.log(startFormattedDate+"------------------------"+endFormattedDate);
    		$scope.dateVal.push(startFormattedDate);
    		$scope.dateVal.push(endFormattedDate);
    		
    	}
    	//alert($scope.endType);
    	$scope.dateVal.push($scope.endType);
    	/*if(typeBtn=='all')
    		{$scope.dateVal.length = 0;
    		$scope.dateVal.push(typeBtn);
    		$scope.dateVal.push(typeBtn);
    		$scope.dateVal.push(typeBtn);
    		
    		} 
    	*/
    	$scope.displayGrid='true';
    	console.log($scope.dateVal);
    	$http.post('/asset/getlistByDate', $scope.dateVal)
    	.then(function(success) {
    		$scope.records=success;	
    		console.log(success.data);
    		
    		$("#bestHtml5Grid").empty();
        	$("#bestHtml5Grid").load();
    //debugger;
        	
        	 var gridDiv = document.querySelector('#bestHtml5Grid');
            new agGrid.Grid(gridDiv, gridOptions);
        	//onBtBringGridBack();
             gridOptions.api.setRowData($scope.records.data);
             $("#bestHtml5Grid").load();
            
    	  });
    
    	
    	
    	if(!$scope.showDetails){
    		$scope.showDetails = true;
    		
    	}
    	
    };
    



}
