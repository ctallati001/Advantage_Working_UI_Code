package com.dd.advantage.controller;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.dd.advantage.llelastic.NetClientGet;


@RestController
@RequestMapping("/elastic")
@CrossOrigin("*")
public class ElasticController {

	//@Value
	//private String elasticURL;
	@RequestMapping(value="/getFilterData",method = RequestMethod.GET)
	@ResponseBody
	public String getFilterData(@RequestParam("param") String param,
			@RequestParam("paramValue") String paramValue,@RequestParam("paramMnp") String paramMnp,
			@RequestParam("paramFile") String paramFile)throws Exception {
		NetClientGet ncG = new NetClientGet();
		String arr[] = new String[3];
		param = param.replaceAll("null", "").replaceAll("undefined", "");
		paramValue = paramValue.replaceAll("null", "").replaceAll("undefined", "");
		paramMnp = paramMnp.replaceAll("null", "").replaceAll("undefined", "");
		String responseObj = "";
		JSONArray jsonArr = new JSONArray();
		if (paramValue != null && paramValue.contains(",")) {
			arr[0] = param;
			arr[1] = paramValue;
			arr[2] = paramMnp;
			responseObj = getCommaSepratedData(arr);
			
		} else {
			arr[0] = param;
			arr[1] = paramValue;
			arr[2] = paramMnp;
			String url = "http://192.168.0.8:9200/asset-dev/doc/_search";
			responseObj = ncG.main(arr,url,"all");
		}
		
		return  responseObj;
	}
	
	public String getCommaSepratedData (String[] arr) throws JSONException {
		NetClientGet ncG = new NetClientGet();
		arr[0] = arr[0].replaceAll("null", "").replaceAll("undefined", "");
		String paramValue = arr[1].replaceAll("null", "").replaceAll("undefined", "");
		String paramMnp = arr[2].replaceAll("null", "").replaceAll("undefined", "");
		String responseObj = "";
		JSONArray jsonArr = new JSONArray();
		String []array = paramValue.split(",");
		for (int counter  = 0 ; counter < array.length ; counter++) {
			
			arr[1] = array[counter];
			arr[2] = paramMnp;
			String url = "http://192.168.0.8:9200/asset-dev/doc/_search";
			responseObj = ncG.main(arr,url,"all");
			JSONObject jsonObj = new JSONObject(responseObj);
			JSONArray jsonArrObj = jsonObj.getJSONObject("hits").getJSONArray("hits");
			for (int jsonCounter = 0 ; jsonCounter < jsonArrObj.length() ; jsonCounter ++) {
				jsonArr.put(jsonArrObj.get(jsonCounter));
				
			}
		}
		
		String jsonObject = "{\"hits\":{\"hits\":"+jsonArr.toString()+"}}";
		System.out.println("finalObject = "+jsonObject);
		
		return jsonObject;
	}
	
	@RequestMapping(value="/getFilters",method = RequestMethod.GET)
	@ResponseBody
	public String getFiletrs() throws Exception {
		NetClientGet ncG = new NetClientGet();
		String arr[] = new String[3];
		String url = "http://192.168.0.8:9200/asset-dev/";
		String responseObj = ncG.main(arr,url,"");
		return  responseObj;
	}
	
	@RequestMapping(value="/add",method = RequestMethod.POST)
	@ResponseBody
	public String addFilters(@RequestBody String object) throws Exception {
		NetClientGet ncG = new NetClientGet();
		String arr[] = new String[3];
		String url = "http://192.168.0.8:9200/asset-dev/";
		String responseObj = ncG.main(arr,url,"");
		return  responseObj;
		
	}
	
	@RequestMapping(value="/edit",method = RequestMethod.POST)
	@ResponseBody
	public String editFilters(@RequestBody String object) throws Exception {
		NetClientGet ncG = new NetClientGet();
		String arr[] = new String[3];
		String url = "http://192.168.0.8:9200/asset-dev/";
		String responseObj = ncG.main(arr,url,"");
		return  responseObj;
		
	}
	
	@RequestMapping(value="/nestedFilters",method = RequestMethod.POST)
	@ResponseBody
	public String nestedFilters(@RequestBody String object) throws Exception {
		NetClientGet ncG = new NetClientGet();
		String arr[] = new String[3];
		String url = "http://192.168.0.8:9200/asset-dev/";
		String responseObj = ncG.main(arr,url,"");
		return  responseObj;
		
	}
	
	@RequestMapping(value = "/fileUpload", method = RequestMethod.POST)
	public String continueFileUpload(HttpServletRequest request, HttpServletResponse response){
	        MultipartHttpServletRequest mRequest;
	String filename = "upload.csv";
	String fileData = "C:/SFTP_Root/" + filename;
	ArrayList<String> arrList = new ArrayList<String>();
	try {
	   mRequest = (MultipartHttpServletRequest) request;
	   mRequest.getParameterMap();
	   Iterator<String> itr = mRequest.getFileNames();
	   
	   while (itr.hasNext()) {
	        MultipartFile mFile = mRequest.getFile(itr.next());
	        String fileName = mFile.getOriginalFilename();
	        System.out.println(fileName);
	        java.nio.file.Path path = Paths.get(fileData);
	        Files.deleteIfExists(path);
	        InputStream in = mFile.getInputStream();
	        Files.copy(in, path);
	        String line = "";
	        String cvsSplitBy = ",";
	      
	        try (BufferedReader br = new BufferedReader(new FileReader(fileData))) {

	            while ((line = br.readLine()) != null) {

	            	arrList.add(line);
	                System.out.println("line = "+line);

	            }
	            //String arr[]
	            //responseObj = getCommaSepratedData(arr);
	            
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
	 }
	   } catch (Exception e) {
	        e.printStackTrace();
	   }
	return "{\"fileName\":\""+arrList.toString()+"\"}";
	}
}
